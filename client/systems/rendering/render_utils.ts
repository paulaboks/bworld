import { SLOT_SIZE } from "$/common/constants.ts";
import { get_sprite_region } from "$/common/utils.ts";
import { AssetManager } from "$/client/assets.ts";
import { ItemStack } from "$/client/components/inventory.ts";
import { draw_text, draw_texture_region, Texture } from "$/client/renderer.ts";

export function draw_nine_slice(
	image: Texture,
	source_x: number,
	source_y: number,
	source_width: number,
	source_height: number,
	left: number,
	right: number,
	top: number,
	bottom: number,
	x: number,
	y: number,
	width: number,
	height: number,
	color = [1, 1, 1, 1],
) {
	const center_width = source_width - left - right;
	const center_height = source_height - top - bottom;

	const dest_center_width = width - left - right;
	const dest_center_height = height - top - bottom;

	// top left
	draw_texture_region(
		image,
		source_x,
		source_y,
		left,
		top,
		x,
		y,
		left,
		top,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);

	// top right
	draw_texture_region(
		image,
		source_x + source_width - right,
		source_y,
		right,
		top,
		x + width - right,
		y,
		right,
		top,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);

	// bottom left
	draw_texture_region(
		image,
		source_x,
		source_y + source_height - bottom,
		left,
		bottom,
		x,
		y + height - bottom,
		left,
		bottom,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);

	// bottom right
	draw_texture_region(
		image,
		source_x + source_width - right,
		source_y + source_height - bottom,
		right,
		bottom,
		x + width - right,
		y + height - bottom,
		right,
		bottom,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);

	// top
	draw_texture_region(
		image,
		source_x + left,
		source_y,
		center_width,
		top,
		x + left,
		y,
		dest_center_width,
		top,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);

	// bottom
	draw_texture_region(
		image,
		source_x + left,
		source_y + source_height - bottom,
		center_width,
		bottom,
		x + left,
		y + height - bottom,
		dest_center_width,
		bottom,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);

	// left
	draw_texture_region(
		image,
		source_x,
		source_y + top,
		left,
		center_height,
		x,
		y + top,
		left,
		dest_center_height,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);

	// right
	draw_texture_region(
		image,
		source_x + source_width - right,
		source_y + top,
		right,
		center_height,
		x + width - right,
		y + top,
		right,
		dest_center_height,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);

	// center !
	draw_texture_region(
		image,
		source_x + left,
		source_y + top,
		center_width,
		center_height,
		x + left,
		y + top,
		dest_center_width,
		dest_center_height,
		false,
		false,
		color[0],
		color[1],
		color[2],
		color[3],
	);
}

export function draw_item(item: ItemStack, x: number, y: number) {
	const sprite_region = get_sprite_region(item.type_id);
	draw_texture_region(
		AssetManager.instance.get("bworld:textures"),
		sprite_region.x * 16,
		sprite_region.y * 16,
		16,
		16,
		x + 3,
		y + 3,
		SLOT_SIZE - 6,
		SLOT_SIZE - 6,
	);
	if (item.max_amount !== 1) {
		draw_text(
			String(item.amount),
			x + SLOT_SIZE + 2 - 11 * 2,
			y + SLOT_SIZE + 2 - 11 * 2,
			1,
			[63 / 255, 63 / 255, 63 / 255],
		);
		draw_text(
			String(item.amount),
			x + SLOT_SIZE - 11 * 2,
			y + SLOT_SIZE - 11 * 2,
			1,
		);
	}
}
