import { SLOT_SIZE } from "$/common/constants.ts";
import { get_sprite_region } from "$/common/utils.ts";
import { AssetManager } from "$/client/assets.ts";
import { ItemStack } from "$/client/components/inventory.ts";
import { draw_text } from "$/client/text_rendering.ts";

export function draw_nine_slice(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
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
) {
	const center_width = source_width - left - right;
	const center_height = source_height - top - bottom;

	const dest_center_width = width - left - right;
	const dest_center_height = height - top - bottom;

	// top left
	ctx.drawImage(image, source_x, source_y, left, top, x, y, left, top);

	// top right
	ctx.drawImage(image, source_x + source_width - right, source_y, right, top, x + width - right, y, right, top);

	// bottom left
	ctx.drawImage(
		image,
		source_x,
		source_y + source_height - bottom,
		left,
		bottom,
		x,
		y + height - bottom,
		left,
		bottom,
	);

	// bottom right
	ctx.drawImage(
		image,
		source_x + source_width - right,
		source_y + source_height - bottom,
		right,
		bottom,
		x + width - right,
		y + height - bottom,
		right,
		bottom,
	);

	// top
	ctx.drawImage(image, source_x + left, source_y, center_width, top, x + left, y, dest_center_width, top);

	// bottom
	ctx.drawImage(
		image,
		source_x + left,
		source_y + source_height - bottom,
		center_width,
		bottom,
		x + left,
		y + height - bottom,
		dest_center_width,
		bottom,
	);

	// left
	ctx.drawImage(image, source_x, source_y + top, left, center_height, x, y + top, left, dest_center_height);

	// right
	ctx.drawImage(
		image,
		source_x + source_width - right,
		source_y + top,
		right,
		center_height,
		x + width - right,
		y + top,
		right,
		dest_center_height,
	);

	// center !
	ctx.drawImage(
		image,
		source_x + left,
		source_y + top,
		center_width,
		center_height,
		x + left,
		y + top,
		dest_center_width,
		dest_center_height,
	);
}

export function draw_item(ctx: CanvasRenderingContext2D, item: ItemStack, x: number, y: number) {
	const sprite_region = get_sprite_region(item.type_id);
	ctx.drawImage(
		AssetManager.instance.get("bworld:tiny_town"),
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
			ctx,
			String(item.amount),
			x + SLOT_SIZE + 2 - 4,
			y + SLOT_SIZE + 2 - 4,
			2,
			"#3f3f3f",
			"bottom",
			"right",
		);
		draw_text(
			ctx,
			String(item.amount),
			x + SLOT_SIZE - 4,
			y + SLOT_SIZE - 4,
			2,
			"white",
			"bottom",
			"right",
		);
	}
}
