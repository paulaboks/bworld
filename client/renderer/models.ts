import type { Texture } from "./types.ts";

const pad = 0.5;

function push_vertex(
	vertices: Float32Array,
	i: number,
	px: number,
	py: number,
	pz: number,
	u: number,
	v: number,
	r: number,
	g: number,
	b: number,
	a: number,
) {
	vertices[i++] = px;
	vertices[i++] = py;
	vertices[i++] = pz;
	vertices[i++] = u;
	vertices[i++] = v;
	vertices[i++] = r;
	vertices[i++] = g;
	vertices[i++] = b;
	vertices[i++] = a;

	return i;
}

export function push_front_face(
	vertices: Float32Array,
	i: number,
	texture: Texture,
	x: number,
	y: number,
	z: number,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	const x2 = x + 1;
	const y2 = y + 1;
	const z2 = z + 1;

	const u0 = (sx + pad) / texture.width;
	const v0 = (sy + pad) / texture.height;
	const u1 = (sx + sw - pad) / texture.width;
	const v1 = (sy + sh - pad) / texture.height;

	i = push_vertex(vertices, i, x, y, z2, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y, z2, u1, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z2, u1, v0, r, g, b, a);

	i = push_vertex(vertices, i, x, y, z2, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z2, u1, v0, r, g, b, a);
	i = push_vertex(vertices, i, x, y2, z2, u0, v0, r, g, b, a);

	return i;
}

export function push_back_face(
	vertices: Float32Array,
	i: number,
	texture: Texture,
	x: number,
	y: number,
	z: number,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	const x2 = x + 1;
	const y2 = y + 1;

	const u0 = (sx + pad) / texture.width;
	const v0 = (sy + pad) / texture.height;
	const u1 = (sx + sw - pad) / texture.width;
	const v1 = (sy + sh - pad) / texture.height;

	i = push_vertex(vertices, i, x2, y, z, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x, y, z, u1, v1, r, g, b, a);
	i = push_vertex(vertices, i, x, y2, z, u1, v0, r, g, b, a);

	i = push_vertex(vertices, i, x2, y, z, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x, y2, z, u1, v0, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z, u0, v0, r, g, b, a);

	return i;
}

export function push_left_face(
	vertices: Float32Array,
	i: number,
	texture: Texture,
	x: number,
	y: number,
	z: number,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	const y2 = y + 1;
	const z2 = z + 1;

	const u0 = (sx + pad) / texture.width;
	const v0 = (sy + pad) / texture.height;
	const u1 = (sx + sw - pad) / texture.width;
	const v1 = (sy + sh - pad) / texture.height;

	i = push_vertex(vertices, i, x, y, z, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x, y, z2, u1, v1, r, g, b, a);
	i = push_vertex(vertices, i, x, y2, z2, u1, v0, r, g, b, a);

	i = push_vertex(vertices, i, x, y, z, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x, y2, z2, u1, v0, r, g, b, a);
	i = push_vertex(vertices, i, x, y2, z, u0, v0, r, g, b, a);

	return i;
}

export function push_right_face(
	vertices: Float32Array,
	i: number,
	texture: Texture,
	x: number,
	y: number,
	z: number,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	const x2 = x + 1;
	const y2 = y + 1;
	const z2 = z + 1;

	const u0 = (sx + pad) / texture.width;
	const v0 = (sy + pad) / texture.height;
	const u1 = (sx + sw - pad) / texture.width;
	const v1 = (sy + sh - pad) / texture.height;

	i = push_vertex(vertices, i, x2, y, z2, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y, z, u1, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z, u1, v0, r, g, b, a);

	i = push_vertex(vertices, i, x2, y, z2, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z, u1, v0, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z2, u0, v0, r, g, b, a);

	return i;
}

export function push_top_face(
	vertices: Float32Array,
	i: number,
	texture: Texture,
	x: number,
	y: number,
	z: number,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	const x2 = x + 1;
	const z2 = z + 1;
	const y2 = y + 1;

	const u0 = (sx + pad) / texture.width;
	const v0 = (sy + pad) / texture.height;
	const u1 = (sx + sw - pad) / texture.width;
	const v1 = (sy + sh - pad) / texture.height;

	i = push_vertex(vertices, i, x, y2, z2, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z2, u1, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z, u1, v0, r, g, b, a);

	i = push_vertex(vertices, i, x, y2, z2, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y2, z, u1, v0, r, g, b, a);
	i = push_vertex(vertices, i, x, y2, z, u0, v0, r, g, b, a);

	return i;
}

export function push_bottom_face(
	vertices: Float32Array,
	i: number,
	texture: Texture,
	x: number,
	y: number,
	z: number,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
) {
	const x2 = x + 1;
	const z2 = z + 1;

	const u0 = (sx + pad) / texture.width;
	const v0 = (sy + pad) / texture.height;
	const u1 = (sx + sw - pad) / texture.width;
	const v1 = (sy + sh - pad) / texture.height;

	i = push_vertex(vertices, i, x, y, z, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y, z, u1, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y, z2, u1, v0, r, g, b, a);

	i = push_vertex(vertices, i, x, y, z, u0, v1, r, g, b, a);
	i = push_vertex(vertices, i, x2, y, z2, u1, v0, r, g, b, a);
	i = push_vertex(vertices, i, x, y, z2, u0, v0, r, g, b, a);

	return i;
}
