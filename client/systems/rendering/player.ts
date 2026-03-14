import { SLOT_SIZE } from "$/common/constants.ts";
import { AssetManager } from "$/client/assets.ts";
import { PlayerInventory } from "../../inventory.ts";
import { draw_item, draw_nine_slice } from "./render_utils.ts";
import { canvas, draw_rect_stroke, Texture } from "$/client/renderer/mod.ts";

const PADDING = 10;

export function render_player_hotbar(player_inventory: PlayerInventory) {
	const ui = AssetManager.instance.get<Texture>("bworld:ui");

	const hotbar_width = PADDING * 2 + SLOT_SIZE * 9;
	const hotbar_height = PADDING * 2 + SLOT_SIZE;

	const x = canvas.width / 2 - hotbar_width / 2;
	const y = canvas.height - hotbar_height;

	draw_nine_slice(
		ui,
		160,
		0,
		16,
		16,
		4,
		4,
		4,
		4,
		x,
		y,
		hotbar_width,
		hotbar_height,
	);

	for (let index = 0; index < 9; index += 1) {
		draw_nine_slice(
			ui,
			player_inventory.hotbar_selected === index ? 19 * 16 : 160 + 32,
			player_inventory.hotbar_selected === index ? 16 : 0,
			16,
			16,
			4,
			4,
			4,
			4,
			x + PADDING + index * SLOT_SIZE,
			y + PADDING,
			SLOT_SIZE,
			SLOT_SIZE,
		);
	}

	for (let index = 0; index < 9; index += 1) {
		const item = player_inventory.container.get_item(index);
		if (item) {
			draw_item(item, x + PADDING + index * SLOT_SIZE, y + PADDING);
		}
	}
}

export function render_player_crosshair() {
	const CROSSHAIR_SIZE = 8;
	draw_rect_stroke(
		(canvas.width - CROSSHAIR_SIZE) / 2,
		(canvas.height - CROSSHAIR_SIZE) / 2,
		CROSSHAIR_SIZE,
		CROSSHAIR_SIZE,
		[0, 0, 0, 0.6],
	);
}
