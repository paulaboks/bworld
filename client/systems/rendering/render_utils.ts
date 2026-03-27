import { SLOT_SIZE, TEXTURE_SIZE } from "$/common/constants.ts";
import { get_sprite_region } from "$/common/utils.ts";
import { BlockRegistry, EverythingRegistry, ItemRegistry } from "$/common/everything_registry.ts";
import { AssetManager } from "$/client/assets.ts";
import { ItemStack } from "../../inventory.ts";
import { draw_text, draw_texture_region, draw_texture_region_skewed, Texture } from "$/client/renderer/mod.ts";

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
	const item_info = EverythingRegistry.get<ItemRegistry>("items", item.type_id);

	if (!item_info) {
		throw Error(`Didn't find item registry for '${item.type_id}'`);
	}

	if (item_info?.block_id) {
		draw_item_block(item, item_info, x, y);
	} else {
		draw_item_item(item, item_info, x, y);
	}

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

// ey its not a bad name
function draw_item_item(item: ItemStack, item_info: ItemRegistry, x: number, y: number) {
	let texture_id = "bworld:missing";
	if (typeof item_info?.texture_id === "string") {
		texture_id = item_info.texture_id;
	} else if (typeof item_info?.texture_id === "function") {
		texture_id = item_info.texture_id(item);
	}
	const sprite_region = get_sprite_region(texture_id);
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
}

function draw_item_block(_item: ItemStack, item_info: ItemRegistry, x: number, y: number) {
	const block_info = EverythingRegistry.get<BlockRegistry>("blocks", item_info.block_id!);

	if (!block_info) throw new Error(`no textures for ${item_info.block_id}`);

	let front_texture = "bworld:missing";
	let top_texture = "bworld:missing";
	let left_texture = "bworld:missing";

	const textures = block_info.textures;

	if (typeof textures === "string") {
		front_texture = textures;
		top_texture = textures;
		left_texture = textures;
	} else if ("top" in textures && "bottom" in textures && "side" in textures) {
		top_texture = textures.top;
		front_texture = textures.side;
		left_texture = textures.side;
	} else if ("front" in textures && "side" in textures) {
		top_texture = textures.side;
		front_texture = textures.front;
		left_texture = textures.side;
	}

	const atlas = AssetManager.instance.get<Texture>("bworld:textures");

	const top = get_sprite_region(top_texture);
	const front = get_sprite_region(front_texture);
	const left = get_sprite_region(left_texture);

	const padding = 4;
	const size = (SLOT_SIZE - padding * 2) / 2;

	const cx = x + SLOT_SIZE / 2;
	const cy = y + SLOT_SIZE / 2 - 10;

	const half_w = size;
	const half_h = size / 2;
	const height = size;

	draw_texture_region_skewed(
		atlas,
		top.x * TEXTURE_SIZE,
		top.y * TEXTURE_SIZE,
		TEXTURE_SIZE,
		TEXTURE_SIZE,
		[
			{ x: cx, y: cy - half_h },
			{ x: cx + half_w, y: cy },
			{ x: cx, y: cy + half_h },
			{ x: cx - half_w, y: cy },
		],
	);
	draw_texture_region_skewed(
		atlas,
		left.x * TEXTURE_SIZE,
		left.y * TEXTURE_SIZE,
		TEXTURE_SIZE,
		TEXTURE_SIZE,
		[
			{ x: cx - half_w, y: cy },
			{ x: cx, y: cy + half_h },
			{ x: cx, y: cy + half_h + height },
			{ x: cx - half_w, y: cy + height },
		],
	);
	draw_texture_region_skewed(
		atlas,
		front.x * TEXTURE_SIZE,
		front.y * TEXTURE_SIZE,
		TEXTURE_SIZE,
		TEXTURE_SIZE,
		[
			{ x: cx + half_w, y: cy },
			{ x: cx, y: cy + half_h },
			{ x: cx, y: cy + half_h + height },
			{ x: cx + half_w, y: cy + height },
		],
	);
}
