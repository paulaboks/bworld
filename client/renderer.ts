import { Camera } from "./components/camera.ts";

const MAX_SPRITES = 10000;
const VERTS_PER_SPRITE = 6;
const FLOATS_PER_VERT = 4;

let gl: WebGLRenderingContext;
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

const glyph_size = 32;
let font_texture: WebGLTexture;
const glyphs: Record<string, { u0: number; v0: number; u1: number; v1: number }> = {};

const vertex_src = `
attribute vec2 aPos;
attribute vec2 aUV;

varying vec2 vUV;

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
}
`;

const fragment_src = `
precision mediump float;
varying vec2 vUV;
uniform sampler2D uTex;

void main(){
  gl_FragColor = texture2D(uTex,vUV);
}
`;

export interface Texture {
	tex: WebGLTexture;
	width: number;
	height: number;
}

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

	init_font();
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

export function load_texture(image: HTMLImageElement): Texture {
	const texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		image,
	);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	return {
		tex: texture,
		width: image.width,
		height: image.height,
	};
}

export function begin_drawing() {
	vert_index = 0;
}

export function clear_background(r: number, g: number, b: number, a = 1) {
	gl.clearColor(r, g, b, a);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

export function end_drawing() {
	flush_batch();
}

export function draw_texture(
	texture: Texture,
	x: number,
	y: number,
	w: number,
	h: number,
	flip_x = false,
	flip_y = false,
) {
	if (current_texture !== texture.tex) {
		flush_batch();
		current_texture = texture.tex;
	}

	let u0 = 0, v0 = 0, u1 = 1, v1 = 1;

	if (flip_x) {
		[u0, u1] = [u1, u0];
	}
	if (flip_y) {
		[v0, v1] = [v1, v0];
	}

	push_quad(x, y, w, h, u0, v0, u1, v1);
}

export function draw_texture_region(
	texture: Texture,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	dx: number,
	dy: number,
	dw: number,
	dh: number,
	flip_x = false,
	flip_y = false,
) {
	if (current_texture !== texture.tex) {
		flush_batch();
		current_texture = texture.tex;
	}

	let u0 = sx / texture.width;
	let v0 = sy / texture.height;
	let u1 = (sx + sw) / texture.width;
	let v1 = (sy + sh) / texture.height;

	if (flip_x) {
		[u0, u1] = [u1, u0];
	}
	if (flip_y) {
		[v0, v1] = [v1, v0];
	}

	push_quad(dx, dy, dw, dh, u0, v0, u1, v1);
}

export function draw_text(str: string, x: number, y: number) {
	if (!font_texture) {
		return;
	}

	if (current_texture !== font_texture) {
		flush_batch();
		current_texture = font_texture;
	}

	for (const ch of str) {
		const g = glyphs[ch];
		if (!g) {
			x += glyph_size;
			continue;
		}

		push_quad(
			x,
			y,
			glyph_size,
			glyph_size,
			g.u0,
			g.v0,
			g.u1,
			g.v1,
		);

		x += glyph_size * 0.6;
	}
}

function flush_batch() {
	if (vert_index === 0 || !current_texture) {
		return;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_data.subarray(0, vert_index), gl.STREAM_DRAW);

	gl.useProgram(program);

	//const posLoc = gl.getAttribLocation(program, "aPos");
	//const uvLoc = gl.getAttribLocation(program, "aUV");
	gl.enableVertexAttribArray(pos_loc);
	gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(uv_loc);
	gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, 16, 8);

	gl.uniform2f(camera_pos_loc, Math.floor(camera.x), Math.floor(camera.y));
	gl.uniform1f(camera_zoom_loc, camera.zoom);
	gl.uniform1f(camera_rot_loc, camera.rotation);
	gl.uniform2f(camera_offset_loc, camera.offset_x, camera.offset_y);

	gl.bindTexture(gl.TEXTURE_2D, current_texture);
	gl.drawArrays(gl.TRIANGLES, 0, vert_index / 4);
	vert_index = 0;
}

function push_quad(dx: number, dy: number, dw: number, dh: number, u0: number, v0: number, u1: number, v1: number) {
	const x2 = dx + dw;
	const y2 = dy + dh;

	const v = [
		dx,
		dy,
		u0,
		v0,
		x2,
		dy,
		u1,
		v0,
		dx,
		y2,
		u0,
		v1,

		x2,
		dy,
		u1,
		v0,
		x2,
		y2,
		u1,
		v1,
		dx,
		y2,
		u0,
		v1,
	];

	for (let i = 0; i < v.length; i += 1) {
		vertex_data[vert_index++] = v[i];
	}
}

function init_font() {
	const c = document.createElement("canvas");
	c.width = 512;
	c.height = 512;

	const ctx = c.getContext("2d")!;
	ctx.fillStyle = "white";
	ctx.font = glyph_size + "px m6x11";

	let x = 0;
	let y = glyph_size;

	for (let i = 32; i < 127; i++) {
		const ch = String.fromCharCode(i);

		ctx.fillText(ch, x, y);

		glyphs[ch] = {
			u0: x / 512,
			v0: (y - glyph_size) / 512,
			u1: (x + glyph_size) / 512,
			v1: y / 512,
		};

		x += glyph_size;

		if (x > 512 - glyph_size) {
			x = 0;
			y += glyph_size;
		}
	}

	font_texture = gl.createTexture()!;

	gl.bindTexture(gl.TEXTURE_2D, font_texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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

export function begin_mode_2d(new_camera: Camera) {
	camera = new_camera;
}

export function end_mode_2d() {
	flush_batch();
	camera = default_camera;
}
