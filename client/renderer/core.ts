import { Camera } from "../components/camera.ts";
import { mat4 } from "gl-matrix";

export let gl: WebGLRenderingContext;
export let canvas: HTMLCanvasElement;

const MAX_SPRITES = 100000;
const VERTS_PER_SPRITE = 6;
const FLOATS_PER_VERT = 9;

let program: WebGLProgram;
let main_buffer: WebGLBuffer;

const vertex_data = new Float32Array(MAX_SPRITES * VERTS_PER_SPRITE * FLOATS_PER_VERT);
let vert_index = 0;

let pos_loc: GLint;
let uv_loc: GLint;
let color_loc: GLint;
let texture_loc: WebGLUniformLocation | null;
let mvp_loc: WebGLUniformLocation | null;
let col_diffuse_loc: WebGLUniformLocation | null;

let current_texture: WebGLTexture | null = null;
export let white_tex: WebGLTexture | null = null;

let mode3d = false;

let camera: Camera | undefined;

const ortho = mat4.create();
const proj = mat4.create();
const view = mat4.create();
const mvp = mat4.create();

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

	main_buffer = gl.createBuffer()!;
	gl.bindBuffer(gl.ARRAY_BUFFER, main_buffer);

	const stride = FLOATS_PER_VERT * 4;

	pos_loc = gl.getAttribLocation(program, "vertexPosition");
	gl.enableVertexAttribArray(pos_loc);
	gl.vertexAttribPointer(pos_loc, 3, gl.FLOAT, false, stride, 0);

	uv_loc = gl.getAttribLocation(program, "vertexTexCoord");
	gl.enableVertexAttribArray(uv_loc);
	gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, stride, 12);

	color_loc = gl.getAttribLocation(program, "vertexColor");
	gl.enableVertexAttribArray(color_loc);
	gl.vertexAttribPointer(color_loc, 4, gl.FLOAT, false, stride, 20);

	mvp_loc = gl.getUniformLocation(program, "mvp");
	texture_loc = gl.getUniformLocation(program, "texture0");
	col_diffuse_loc = gl.getUniformLocation(program, "colDiffuse");

	gl.useProgram(program);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CCW);

	create_white_texture();
}

export function begin_drawing() {
	update_2d_mvp();
	gl.depthFunc(gl.LEQUAL);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	vert_index = 0;
}

export function end_drawing() {
	flush_batch();
}

function update_2d_mvp() {
	const w = canvas.width;
	const h = canvas.height;

	const l = 0;
	const r = w;
	const t = 0;
	const b = h;
	const n = -1;
	const f = 1;

	mat4.ortho(ortho, l, r, b, t, n, f);
}

export function begin_clip(x: number, y: number, width: number, height: number) {
	gl.enable(gl.SCISSOR_TEST);

	const flipped_y = canvas.height - (y + height);

	gl.scissor(x, flipped_y, width, height);
}

export function end_clip() {
	gl.disable(gl.SCISSOR_TEST);
}

export function begin_mode_3d(new_camera: Camera) {
	flush_batch();

	mode3d = true;
	camera = new_camera;

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.depthMask(true);
	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1, 1);

	update_camera();
}

export function end_mode_3d() {
	if (!mode3d) {
		return;
	}

	flush_batch();

	mode3d = false;
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.depthMask(false);
	gl.disable(gl.POLYGON_OFFSET_FILL);
}

export function clear_background(r: number, g: number, b: number, a = 1) {
	gl.clearColor(r, g, b, a);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

export function flush_batch() {
	if (vert_index === 0 || !current_texture) {
		return;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, main_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_data.subarray(0, vert_index), gl.STREAM_DRAW);

	if (mode3d) {
		gl.uniformMatrix4fv(mvp_loc, false, mvp);
	} else {
		gl.uniformMatrix4fv(mvp_loc, false, ortho);
	}

	const stride = FLOATS_PER_VERT * 4;
	gl.vertexAttribPointer(pos_loc, 3, gl.FLOAT, false, stride, 0);
	gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, stride, 12);
	gl.vertexAttribPointer(color_loc, 4, gl.FLOAT, false, stride, 20);

	gl.uniform4f(col_diffuse_loc, 1, 1, 1, 1);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, current_texture);
	gl.uniform1i(texture_loc, 0);

	gl.drawArrays(gl.TRIANGLES, 0, vert_index / FLOATS_PER_VERT);

	vert_index = 0;
}

export function flush_buffer(buffer: WebGLBuffer, draw_count: number) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	if (mode3d) {
		gl.uniformMatrix4fv(mvp_loc, false, mvp);
	} else {
		gl.uniformMatrix4fv(mvp_loc, false, ortho);
	}

	const stride = FLOATS_PER_VERT * 4;
	gl.vertexAttribPointer(pos_loc, 3, gl.FLOAT, false, stride, 0);
	gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, stride, 12);
	gl.vertexAttribPointer(color_loc, 4, gl.FLOAT, false, stride, 20);

	gl.uniform4f(col_diffuse_loc, 1, 1, 1, 1);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, current_texture);
	gl.uniform1i(texture_loc, 0);

	gl.drawArrays(gl.TRIANGLES, 0, draw_count);
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
	}
}

export function get_current_texture(): WebGLTexture | null {
	return current_texture;
}

export function set_current_texture(texture: WebGLTexture) {
	current_texture = texture;
}

export function push_vertex(px: number, py: number, pz: number, u: number, vv: number, r = 1, g = 1, b = 1, a = 1) {
	let i = vert_index;
	vertex_data[i++] = px;
	vertex_data[i++] = py;
	vertex_data[i++] = pz;
	vertex_data[i++] = u;
	vertex_data[i++] = vv;
	vertex_data[i++] = r;
	vertex_data[i++] = g;
	vertex_data[i++] = b;
	vertex_data[i++] = a;
	vert_index = i;
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

	// triangle 1
	push_vertex(dx, dy, 0, u0, v0, r, g, b, a);
	push_vertex(x2, dy, 0, u1, v0, r, g, b, a);
	push_vertex(dx, y2, 0, u0, v1, r, g, b, a);

	// triangle 2
	push_vertex(x2, dy, 0, u1, v0, r, g, b, a);
	push_vertex(x2, y2, 0, u1, v1, r, g, b, a);
	push_vertex(dx, y2, 0, u0, v1, r, g, b, a);
}

// internal

function update_camera() {
	if (!camera) {
		return;
	}

	mat4.perspective(
		proj,
		camera.fov,
		canvas.width / canvas.height,
		camera.near,
		camera.far,
	);

	mat4.identity(view);

	mat4.rotateZ(view, view, -camera.roll);
	mat4.rotateX(view, view, -camera.pitch);
	mat4.rotateY(view, view, -camera.yaw);

	mat4.translate(view, view, [-camera.x, -camera.y, -camera.z]);

	mat4.multiply(mvp, proj, view);
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
