import { SLOT_SIZE } from "$/common/constants.ts";
import { AssetManager } from "$/client/assets.ts";
import { PlayerInventory } from "$/client/components/inventory.ts";
import { InputManager } from "$/client/input_manager.ts";
import { draw_item, draw_nine_slice } from "./render_utils.ts";
import { canvas, Texture } from "$/client/renderer.ts";

const PADDING = 10;

export function render_player_inventory(player_inventory: PlayerInventory) {
	const ui = AssetManager.instance.get<Texture>("bworld:ui");
	const layout = player_inventory.layout.slots;

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
		0,
		0,
		PADDING * 2 + SLOT_SIZE * 9,
		PADDING * 2 + SLOT_SIZE * 4,
	);

	for (const [index, slot] of layout.entries()) {
		const x = slot.x + PADDING;
		const y = slot.y + PADDING;
		draw_nine_slice(
			ui,
			player_inventory.hovering_slot === index ? 19 * 16 : 160 + 32,
			player_inventory.hovering_slot === index ? 16 : 0,
			16,
			16,
			4,
			4,
			4,
			4,
			x,
			y,
			SLOT_SIZE,
			SLOT_SIZE,
		);
	}
	for (const [index, slot] of layout.entries()) {
		const x = slot.x + PADDING;
		const y = slot.y + PADDING;
		const item = player_inventory.container.get_item(index);
		if (item) {
			draw_item(item, x, y);
		}
	}

	if (player_inventory.holding_item) {
		const mouse = InputManager.get_mouse_position();
		draw_item(player_inventory.holding_item, mouse.x, mouse.y);
	}
}

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
