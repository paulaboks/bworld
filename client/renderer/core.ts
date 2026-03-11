import { Camera } from "../components/camera.ts";

const MAX_SPRITES = 10000;
const VERTS_PER_SPRITE = 6;
const FLOATS_PER_VERT = 8;

export let gl: WebGLRenderingContext;
export let canvas: HTMLCanvasElement;
let program: WebGLProgram;
let buffer: WebGLBuffer;

const default_camera = new Camera();
let camera: Camera = default_camera;

let camera_pos_loc: WebGLUniformLocation | null;
let camera_zoom_loc: WebGLUniformLocation | null;
let camera_rot_loc: WebGLUniformLocation | null;
let camera_offset_loc: WebGLUniformLocation | null;

const vertex_data = new Float32Array(MAX_SPRITES * VERTS_PER_SPRITE * FLOATS_PER_VERT);
let vert_index = 0;

let pos_loc: GLint;
let uv_loc: GLint;
let resolution_loc: WebGLUniformLocation | null;
let _texture_loc: WebGLUniformLocation | null;

let current_texture: WebGLTexture | null = null;
export let white_tex: WebGLTexture | null = null;

const vertex_src = `
attribute vec2 aPos;
attribute vec2 aUV;
attribute vec4 aColor;

varying vec2 vUV;
varying vec4 vColor;

uniform vec2 uResolution;
uniform vec2 uCameraPos;
uniform float uCameraZoom;
uniform float uCameraRot;
uniform vec2 uCameraOffset;

void main(){

  // world → camera space
  vec2 pos = aPos - uCameraPos;

  // rotation
  float c = cos(uCameraRot);
  float s = sin(uCameraRot);
  pos = vec2(
	pos.x * c - pos.y * s,
	pos.x * s + pos.y * c
  );

  // zoom
  pos *= uCameraZoom;

  // screen offset (center camera)
  pos += uCameraOffset;

  // convert to clip space
  vec2 zero = pos / uResolution;
  vec2 clip = zero * 2.0 - 1.0;

  gl_Position = vec4(clip * vec2(1.0,-1.0),0.0,1.0);

  vUV = aUV;
  vColor = aColor;
}
`;

const fragment_src = `
precision mediump float;
varying vec2 vUV;
varying vec4 vColor;
uniform sampler2D uTex;

void main() {
	vec4 texColor = texture2D(uTex, vUV);
	gl_FragColor = texColor * vColor;
}
`;

export function init_window(canvas_element: HTMLCanvasElement) {
	canvas = canvas_element;
	canvas.width = 1800;
	canvas.height = 900;
	const ctx = canvas.getContext("webgl");
	if (!ctx) {
		throw new Error("WebGL not supported");
	}

	gl = ctx;

	program = create_program(vertex_src, fragment_src);

	buffer = gl.createBuffer()!;

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	const stride = FLOATS_PER_VERT * 4;

	pos_loc = gl.getAttribLocation(program, "aPos");
	gl.enableVertexAttribArray(pos_loc);
	gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, stride, 0);

	uv_loc = gl.getAttribLocation(program, "aUV");
	gl.enableVertexAttribArray(uv_loc);
	gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, stride, 8);

	const color_loc = gl.getAttribLocation(program, "aColor");
	gl.enableVertexAttribArray(color_loc);
	gl.vertexAttribPointer(color_loc, 4, gl.FLOAT, false, FLOATS_PER_VERT * 4, 16);

	resolution_loc = gl.getUniformLocation(program, "uResolution");
	_texture_loc = gl.getUniformLocation(program, "uTex");

	camera_pos_loc = gl.getUniformLocation(program, "uCameraPos");
	camera_zoom_loc = gl.getUniformLocation(program, "uCameraZoom");
	camera_rot_loc = gl.getUniformLocation(program, "uCameraRot");
	camera_offset_loc = gl.getUniformLocation(program, "uCameraOffset");

	gl.useProgram(program);
	gl.uniform2f(resolution_loc, canvas.width, canvas.height);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	create_white_texture();
}

export function begin_drawing() {
	vert_index = 0;
}

export function end_drawing() {
	flush_batch();
}

export function begin_mode_2d(new_camera: Camera) {
	camera = new_camera;
}

export function end_mode_2d() {
	flush_batch();
	camera = default_camera;
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

	gl.useProgram(program);

	// const stride = FLOATS_PER_VERT * 4;
	// gl.enableVertexAttribArray(pos_loc);
	// gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, stride, 0);
	// gl.enableVertexAttribArray(uv_loc);
	// gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, stride, 8);

	gl.uniform2f(camera_pos_loc, Math.floor(camera.x), Math.floor(camera.y));
	gl.uniform1f(camera_zoom_loc, camera.zoom);
	gl.uniform1f(camera_rot_loc, camera.rotation);
	gl.uniform2f(camera_offset_loc, camera.offset_x, camera.offset_y);

	gl.bindTexture(gl.TEXTURE_2D, current_texture);
	gl.drawArrays(gl.TRIANGLES, 0, vert_index / 8);
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

	// deno-fmt-ignore
	const v = [
        dx, dy, u0, v0, r, g, b, a,
        x2, dy, u1, v0, r, g, b, a,
        dx, y2, u0, v1, r, g, b, a,

        x2, dy, u1, v0, r, g, b, a,
        x2, y2, u1, v1, r, g, b, a,
        dx, y2, u0, v1, r, g, b, a,
    ];

	for (let i = 0; i < v.length; i += 1) {
		vertex_data[vert_index++] = v[i];
	}
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
		gl.uniform2f(resolution_loc, width, height);
	}
}

export function get_current_texture(): WebGLTexture | null {
	return current_texture;
}

export function set_current_texture(texture: WebGLTexture) {
	current_texture = texture;
}

function create_shader(type: number, src: string): WebGLShader {
	const s = gl.createShader(type)!;
	gl.shaderSource(s, src);
	gl.compileShader(s);
	return s;
}

function create_program(vs: string, fs: string): WebGLProgram {
	const program = gl.createProgram();

	const v = create_shader(gl.VERTEX_SHADER, vs);
	const f = create_shader(gl.FRAGMENT_SHADER, fs);

	gl.attachShader(program, v);
	gl.attachShader(program, f);
	gl.linkProgram(program);

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
