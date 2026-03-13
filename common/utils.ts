import { AssetManager } from "../client/assets.ts";
import { SpriteRegion } from "./constants.ts";

export function point_inside_rec(
	point_x: number,
	point_y: number,
	rec_x: number,
	rec_y: number,
	rec_w: number,
	rec_h: number,
) {
	return point_x > rec_x &&
		point_x < rec_x + rec_w &&
		point_y > rec_y &&
		point_y < rec_y + rec_h;
}

type TexturesInfo = Record<string, SpriteRegion>;

export function get_sprite_region(id: string): SpriteRegion {
	const textures_info = AssetManager.instance.get<TexturesInfo>("bworld:textures_info");
	return textures_info?.[id] ?? { x: 0, y: 0 };
}

export function distance_point_rectangle(px: number, py: number, sqx: number, sqy: number, sqw: number, sqh: number) {
	const x0 = sqx;
	const y0 = sqy;
	const x1 = sqx + sqw;
	const y1 = sqy + sqh;

	const cx = Math.max(x0, Math.min(px, x1));
	const cy = Math.max(y0, Math.min(py, y1));

	const dx = px - cx;
	const dy = py - cy;

	return Math.sqrt(dx * dx + dy * dy);
}

export function distance_point_point(ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
	const dx = ax - bx;
	const dy = ay - by;
	const dz = az - bz;
	return dx * dx + dy * dy + dz * dz;
}
