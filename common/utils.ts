import { ITEM_SPRITES, SpriteRegion } from "./constants.ts";

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

export function get_sprite_region(id: string): SpriteRegion {
	return ITEM_SPRITES[id] ?? { x: 0, y: 0 };
}
