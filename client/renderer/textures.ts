import { flush_batch, get_current_texture, gl, push_quad, set_current_texture } from "./core.ts";
import { Texture } from "./types.ts";

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

export function draw_texture(
	texture: Texture,
	x: number,
	y: number,
	w: number,
	h: number,
	flip_x = false,
	flip_y = false,
) {
	if (get_current_texture() !== texture.tex) {
		flush_batch();
		set_current_texture(texture.tex);
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
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	if (get_current_texture() !== texture.tex) {
		flush_batch();
		set_current_texture(texture.tex);
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

	push_quad(dx, dy, dw, dh, u0, v0, u1, v1, r, g, b, a);
}
