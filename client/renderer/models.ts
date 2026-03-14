import { Texture } from "./types.ts";

export function push_cube_to_mesh(
	vertices: Float32Array,
	vertex_count: number,
	texture: Texture,
	x: number,
	y: number,
	z: number,
	w: number,
	h: number,
	d: number,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	r = 1,
	g = 1,
	b = 1,
	a = 1,
	front = true,
	back = true,
	left = true,
	right = true,
	top = true,
	bottom = true,
) {
	const x2 = x + w;
	const y2 = y + h;
	const z2 = z + d;

	const u0 = sx / texture.width;
	const v0 = sy / texture.height;
	const u1 = (sx + sw) / texture.width;
	const v1 = (sy + sh) / texture.height;

	let i = vertex_count;

	const push = (px: number, py: number, pz: number, u: number, vv: number) => {
		vertices[i++] = px;
		vertices[i++] = py;
		vertices[i++] = pz;
		vertices[i++] = u;
		vertices[i++] = vv;
		vertices[i++] = r;
		vertices[i++] = g;
		vertices[i++] = b;
		vertices[i++] = a;
	};

	// front (+z)
	if (front) {
		push(x, y, z2, u0, v1);
		push(x2, y, z2, u1, v1);
		push(x2, y2, z2, u1, v0);

		push(x, y, z2, u0, v1);
		push(x2, y2, z2, u1, v0);
		push(x, y2, z2, u0, v0);
	}

	// back (-z)
	if (back) {
		push(x2, y, z, u0, v1);
		push(x, y, z, u1, v1);
		push(x, y2, z, u1, v0);

		push(x2, y, z, u0, v1);
		push(x, y2, z, u1, v0);
		push(x2, y2, z, u0, v0);
	}

	// left (-x)
	if (left) {
		push(x, y, z, u0, v1);
		push(x, y, z2, u1, v1);
		push(x, y2, z2, u1, v0);

		push(x, y, z, u0, v1);
		push(x, y2, z2, u1, v0);
		push(x, y2, z, u0, v0);
	}

	// right (+x)
	if (right) {
		push(x2, y, z2, u0, v1);
		push(x2, y, z, u1, v1);
		push(x2, y2, z, u1, v0);

		push(x2, y, z2, u0, v1);
		push(x2, y2, z, u1, v0);
		push(x2, y2, z2, u0, v0);
	}

	// top (+y)
	if (top) {
		push(x, y2, z2, u0, v1);
		push(x2, y2, z2, u1, v1);
		push(x2, y2, z, u1, v0);

		push(x, y2, z2, u0, v1);
		push(x2, y2, z, u1, v0);
		push(x, y2, z, u0, v0);
	}

	// bottom (-y)
	if (bottom) {
		push(x, y, z, u0, v1);
		push(x2, y, z, u1, v1);
		push(x2, y, z2, u1, v0);

		push(x, y, z, u0, v1);
		push(x2, y, z2, u1, v0);
		push(x, y, z2, u0, v0);
	}

	return i;
}
