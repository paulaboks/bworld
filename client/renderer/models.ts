import { flush_batch, get_current_texture, push_vertex, set_current_texture } from "./core.ts";
import { Texture } from "./types.ts";

export function push_cube(
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
) {
	if (get_current_texture() !== texture.tex) {
		flush_batch();
		set_current_texture(texture.tex);
	}

	const x2 = x + w;
	const y2 = y + h;
	const z2 = z + d;

	const u0 = sx / texture.width;
	const v0 = sy / texture.height;
	const u1 = (sx + sw) / texture.width;
	const v1 = (sy + sh) / texture.height;

	push_vertex(x, y, z2, u0, v0, r, g, b, a);
	push_vertex(x2, y, z2, u1, v0, r, g, b, a);
	push_vertex(x, y2, z2, u0, v1, r, g, b, a);
	push_vertex(x2, y, z2, u1, v0, r, g, b, a);
	push_vertex(x2, y2, z2, u1, v1, r, g, b, a);
	push_vertex(x, y2, z2, u0, v1, r, g, b, a);

	push_vertex(x2, y, z, u0, v0, r, g, b, a);
	push_vertex(x, y, z, u1, v0, r, g, b, a);
	push_vertex(x2, y2, z, u0, v1, r, g, b, a);
	push_vertex(x, y, z, u1, v0, r, g, b, a);
	push_vertex(x, y2, z, u1, v1, r, g, b, a);
	push_vertex(x2, y2, z, u0, v1, r, g, b, a);

	push_vertex(x, y, z, u0, v0, r, g, b, a);
	push_vertex(x, y, z2, u1, v0, r, g, b, a);
	push_vertex(x, y2, z, u0, v1, r, g, b, a);
	push_vertex(x, y, z2, u1, v0, r, g, b, a);
	push_vertex(x, y2, z2, u1, v1, r, g, b, a);
	push_vertex(x, y2, z, u0, v1, r, g, b, a);

	push_vertex(x2, y, z2, u0, v0, r, g, b, a);
	push_vertex(x2, y, z, u1, v0, r, g, b, a);
	push_vertex(x2, y2, z2, u0, v1, r, g, b, a);
	push_vertex(x2, y, z, u1, v0, r, g, b, a);
	push_vertex(x2, y2, z, u1, v1, r, g, b, a);
	push_vertex(x2, y2, z2, u0, v1, r, g, b, a);

	push_vertex(x, y2, z2, u0, v0, r, g, b, a);
	push_vertex(x2, y2, z2, u1, v0, r, g, b, a);
	push_vertex(x, y2, z, u0, v1, r, g, b, a);
	push_vertex(x2, y2, z2, u1, v0, r, g, b, a);
	push_vertex(x2, y2, z, u1, v1, r, g, b, a);
	push_vertex(x, y2, z, u0, v1, r, g, b, a);

	push_vertex(x, y, z, u0, v0, r, g, b, a);
	push_vertex(x2, y, z, u1, v0, r, g, b, a);
	push_vertex(x, y, z2, u0, v1, r, g, b, a);
	push_vertex(x2, y, z, u1, v0, r, g, b, a);
	push_vertex(x2, y, z2, u1, v1, r, g, b, a);
	push_vertex(x, y, z2, u0, v1, r, g, b, a);
}
