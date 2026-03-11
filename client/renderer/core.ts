import { Camera } from "../components/camera.ts";
import { mat4_mul, mat4_perspective, mat4_view } from "./math.ts";

const MAX_SPRITES = 10000;
const VERTS_PER_SPRITE = 6;
const FLOATS_PER_VERT = 9;

export let gl: WebGLRenderingContext;
export let canvas: HTMLCanvasElement;
let program: WebGLProgram;
let buffer: WebGLBuffer;

// const default_camera = new Camera();
// let camera: Camera = default_camera;
//
// let camera_pos_loc: WebGLUniformLocation | null;
// let camera_zoom_loc: WebGLUniformLocation | null;
// let camera_rot_loc: WebGLUniformLocation | null;
// let camera_offset_loc: WebGLUniformLocation | null;

export const projection = new Float32Array(16);
export const view = new Float32Array(16);
export const mvp_matrix = new Float32Array(16);

const vertex_data = new Float32Array(MAX_SPRITES * VERTS_PER_SPRITE * FLOATS_PER_VERT);
let vert_index = 0;

let pos_loc: GLint;
let uv_loc: GLint;
let resolution_loc: WebGLUniformLocation | null;
let texture_loc: WebGLUniformLocation | null;
let mvp_loc: WebGLUniformLocation | null;
let col_diffuse_loc: WebGLUniformLocation | null;

let current_texture: WebGLTexture | null = null;
export let white_tex: WebGLTexture | null = null;

export const camera = {
	x: 3,
	y: 3,
	z: 3,

	pitch: 0,
	yaw: 0,
	roll: 0,

	fov: Math.PI / 3,
	near: 0.1,
	far: 1000,
};

let mode3d = false;
let active_camera = camera;

const vertex_src = `#version 300 es
precision mediump float;
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec4 vertexColor;
out vec2 fragTexCoord;
out vec4 fragColor;
uniform mat4 mvp;

void main() {
	fragTexCoord = vertexTexCoord;
	fragColor = vertexColor;
	gl_Position = mvp*vec4(vertexPosition, 1.0);
}
`;

const fragment_src = `#version 300 es
precision mediump float;
in vec2 fragTexCoord;
in vec4 fragColor;
out vec4 finalColor;
uniform sampler2D texture0;
uniform vec4 colDiffuse;
void main() {
	vec4 texelColor = texture(texture0, fragTexCoord);
	finalColor = texelColor*colDiffuse*fragColor;
}
`;

export function init_window(canvas_element: HTMLCanvasElement) {
	canvas = canvas_element;
	canvas.width = 1800;
	canvas.height = 900;

	const ctx = canvas.getContext("webgl2");
	if (!ctx) {
		throw new Error("WebGL2 not supported");
	}

	gl = ctx;

	program = create_program(vertex_src, fragment_src);

	buffer = gl.createBuffer()!;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	const stride = FLOATS_PER_VERT * 4;

	pos_loc = gl.getAttribLocation(program, "vertexPosition");
	gl.enableVertexAttribArray(pos_loc);
	gl.vertexAttribPointer(pos_loc, 3, gl.FLOAT, false, stride, 0);

	uv_loc = gl.getAttribLocation(program, "vertexTexCoord");
	gl.enableVertexAttribArray(uv_loc);
	gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, stride, 12);

	const color_loc = gl.getAttribLocation(program, "vertexColor");
	gl.enableVertexAttribArray(color_loc);
	gl.vertexAttribPointer(color_loc, 4, gl.FLOAT, false, stride, 20);

	mvp_loc = gl.getUniformLocation(program, "mvp");
	texture_loc = gl.getUniformLocation(program, "texture0");
	col_diffuse_loc = gl.getUniformLocation(program, "colDiffuse");

	gl.useProgram(program);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gl.disable(gl.CULL_FACE);

	create_white_texture();

	update_mvp(canvas.width, canvas.height);
}

export function begin_drawing() {
	update_2d_mvp();
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	vert_index = 0;
}

export function end_drawing() {
	flush_batch();
}

export const ortho_matrix = new Float32Array(16);

export function update_2d_mvp() {
	const w = canvas.width;
	const h = canvas.height;
	const l = 0, r = w, t = 0, b = h, n = -1, f = 1;

	ortho_matrix[0] = 2 / (r - l);
	ortho_matrix[1] = 0;
	ortho_matrix[2] = 0;
	ortho_matrix[3] = 0;

	ortho_matrix[4] = 0;
	ortho_matrix[5] = 2 / (t - b);
	ortho_matrix[6] = 0;
	ortho_matrix[7] = 0;

	ortho_matrix[8] = 0;
	ortho_matrix[9] = 0;
	ortho_matrix[10] = -2 / (f - n);
	ortho_matrix[11] = 0;

	ortho_matrix[12] = -(r + l) / (r - l);
	ortho_matrix[13] = -(t + b) / (t - b);
	ortho_matrix[14] = -(f + n) / (f - n);
	ortho_matrix[15] = 1;
}

export function begin_mode_2d(new_camera: Camera) {
	mode3d = false;

	gl.disable(gl.DEPTH_TEST);

	vert_index = 0;

	update_2d_mvp();
	gl.uniformMatrix4fv(mvp_loc, false, ortho_matrix);
}

export function end_mode_2d() {
	flush_batch();
	// camera = default_camera;
}

export function begin_clip(x: number, y: number, width: number, height: number) {
	gl.enable(gl.SCISSOR_TEST);

	const flipped_y = canvas.height - (y + height);

	gl.scissor(x, flipped_y, width, height);
}

export function end_clip() {
	gl.disable(gl.SCISSOR_TEST);
}

export function clear_background(r: number, g: number, b: number, a = 1) {
	gl.clearColor(r, g, b, a);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

export function flush_batch() {
	if (vert_index === 0 || !current_texture) {
		return;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_data.subarray(0, vert_index), gl.STREAM_DRAW);

	if (mode3d) {
		gl.uniformMatrix4fv(mvp_loc, false, mvp_matrix);
	} else {
		gl.uniformMatrix4fv(mvp_loc, false, ortho_matrix);
	}

	gl.uniform4f(col_diffuse_loc, 1, 1, 1, 1);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, current_texture);
	gl.uniform1i(texture_loc, 0);

	gl.drawArrays(gl.TRIANGLES, 0, vert_index / FLOATS_PER_VERT);

	vert_index = 0;
}

export function push_quad(
	dx: number,
	dy: number,
	dw: number,
	dh: number,
	u0: number,
	v0: number,
	u1: number,
	v1: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	const x2 = dx + dw;
	const y2 = dy + dh;

	let i = vert_index;

	// triangle 1
	vertex_data[i++] = dx;
	vertex_data[i++] = dy;
	vertex_data[i++] = 0;
	vertex_data[i++] = u0;
	vertex_data[i++] = v0;
	vertex_data[i++] = r;
	vertex_data[i++] = g;
	vertex_data[i++] = b;
	vertex_data[i++] = a;

	vertex_data[i++] = x2;
	vertex_data[i++] = dy;
	vertex_data[i++] = 0;
	vertex_data[i++] = u1;
	vertex_data[i++] = v0;
	vertex_data[i++] = r;
	vertex_data[i++] = g;
	vertex_data[i++] = b;
	vertex_data[i++] = a;

	vertex_data[i++] = dx;
	vertex_data[i++] = y2;
	vertex_data[i++] = 0;
	vertex_data[i++] = u0;
	vertex_data[i++] = v1;
	vertex_data[i++] = r;
	vertex_data[i++] = g;
	vertex_data[i++] = b;
	vertex_data[i++] = a;

	// triangle 2
	vertex_data[i++] = x2;
	vertex_data[i++] = dy;
	vertex_data[i++] = 0;
	vertex_data[i++] = u1;
	vertex_data[i++] = v0;
	vertex_data[i++] = r;
	vertex_data[i++] = g;
	vertex_data[i++] = b;
	vertex_data[i++] = a;

	vertex_data[i++] = x2;
	vertex_data[i++] = y2;
	vertex_data[i++] = 0;
	vertex_data[i++] = u1;
	vertex_data[i++] = v1;
	vertex_data[i++] = r;
	vertex_data[i++] = g;
	vertex_data[i++] = b;
	vertex_data[i++] = a;

	vertex_data[i++] = dx;
	vertex_data[i++] = y2;
	vertex_data[i++] = 0;
	vertex_data[i++] = u0;
	vertex_data[i++] = v1;
	vertex_data[i++] = r;
	vertex_data[i++] = g;
	vertex_data[i++] = b;
	vertex_data[i++] = a;

	vert_index = i;
}

export function resize_canvas() {
	const width = self.innerWidth;
	const height = self.innerHeight;

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = canvas.width + "px";
		canvas.style.height = canvas.height + "px";

		gl.viewport(0, 0, width, height);

		gl.useProgram(program);
		// gl.uniform2f(resolution_loc, width, height);
		update_mvp(canvas.width, canvas.height);
	}
}

export function get_current_texture(): WebGLTexture | null {
	return current_texture;
}

export function set_current_texture(texture: WebGLTexture) {
	current_texture = texture;
}

function compile_shader(type: number, src: string) {
	const shader = gl.createShader(type)!;

	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
		throw new Error("Shader compile failed");
	}

	return shader;
}

function create_program(vs_src: string, fs_src: string) {
	const vs = compile_shader(gl.VERTEX_SHADER, vs_src);
	const fs = compile_shader(gl.FRAGMENT_SHADER, fs_src);

	const program = gl.createProgram()!;
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
		throw new Error("Program link failed");
	}

	return program;
}

function create_white_texture() {
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	const white_pixel = new Uint8Array([255, 255, 255, 255]);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, white_pixel);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	white_tex = tex;
}

function update_mvp(width: number, height: number) {
	const l = 0;
	const r = width;
	const b = height;
	const t = 0;
	const n = -1;
	const f = 1;

	mvp_matrix[0] = 2 / (r - l);
	mvp_matrix[1] = 0;
	mvp_matrix[2] = 0;
	mvp_matrix[3] = 0;

	mvp_matrix[4] = 0;
	mvp_matrix[5] = 2 / (t - b);
	mvp_matrix[6] = 0;
	mvp_matrix[7] = 0;

	mvp_matrix[8] = 0;
	mvp_matrix[9] = 0;
	mvp_matrix[10] = -2 / (f - n);
	mvp_matrix[11] = 0;

	mvp_matrix[12] = -(r + l) / (r - l);
	mvp_matrix[13] = -(t + b) / (t - b);
	mvp_matrix[14] = -(f + n) / (f - n);
	mvp_matrix[15] = 1;
}

export function push_cube(
	x: number,
	y: number,
	z: number,
	w: number,
	h: number,
	d: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	set_current_texture(white_tex!);

	const x2 = x + w;
	const y2 = y + h;
	const z2 = z + d;

	const u0 = 0, v0 = 0;
	const u1 = 1, v1 = 1;

	let i = vert_index;

	function v(px: number, py: number, pz: number, u: number, vv: number) {
		vertex_data[i++] = px;
		vertex_data[i++] = py;
		vertex_data[i++] = pz;
		vertex_data[i++] = u;
		vertex_data[i++] = vv;
		vertex_data[i++] = r;
		vertex_data[i++] = g;
		vertex_data[i++] = b;
		vertex_data[i++] = a;
	}

	v(x, y, z2, u0, v0);
	v(x2, y, z2, u1, v0);
	v(x, y2, z2, u0, v1);
	v(x2, y, z2, u1, v0);
	v(x2, y2, z2, u1, v1);
	v(x, y2, z2, u0, v1);

	v(x2, y, z, u0, v0);
	v(x, y, z, u1, v0);
	v(x2, y2, z, u0, v1);
	v(x, y, z, u1, v0);
	v(x, y2, z, u1, v1);
	v(x2, y2, z, u0, v1);

	v(x, y, z, u0, v0);
	v(x, y, z2, u1, v0);
	v(x, y2, z, u0, v1);
	v(x, y, z2, u1, v0);
	v(x, y2, z2, u1, v1);
	v(x, y2, z, u0, v1);

	v(x2, y, z2, u0, v0);
	v(x2, y, z, u1, v0);
	v(x2, y2, z2, u0, v1);
	v(x2, y, z, u1, v0);
	v(x2, y2, z, u1, v1);
	v(x2, y2, z2, u0, v1);

	v(x, y2, z2, u0, v0);
	v(x2, y2, z2, u1, v0);
	v(x, y2, z, u0, v1);
	v(x2, y2, z2, u1, v0);
	v(x2, y2, z, u1, v1);
	v(x, y2, z, u0, v1);

	v(x, y, z, u0, v0);
	v(x2, y, z, u1, v0);
	v(x, y, z2, u0, v1);
	v(x2, y, z, u1, v0);
	v(x2, y, z2, u1, v1);
	v(x, y, z2, u0, v1);

	vert_index = i;
}

export function begin_mode_3d() {
	flush_batch();

	mode3d = true;
	active_camera = camera;

	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	vert_index = 0;

	update_camera();
}

export function end_mode_3d() {
	if (!mode3d) {
		return;
	}

	flush_batch();

	mode3d = false;
	gl.disable(gl.DEPTH_TEST);
}

export function update_camera() {
	mat4_perspective(
		projection,
		camera.fov,
		canvas.width / canvas.height,
		camera.near,
		camera.far,
	);

	mat4_view(view);

	mat4_mul(mvp_matrix, projection, view);
}
