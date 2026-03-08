import { SLOT_SIZE } from "$/common/constants.ts";
import { AssetManager } from "$/client/assets.ts";
import { PlayerInventory } from "$/client/components/inventory.ts";
import { InputManager } from "$/client/input_manager.ts";
import { draw_item, draw_nine_slice } from "./render_utils.ts";
import { canvas, draw_text, measure_text, Texture } from "$/client/renderer.ts";
import { EverythingRegistry, ItemRegistry } from "$/common/everything_registry.ts";

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

	const mouse = InputManager.get_mouse_position();

	if (player_inventory.holding_item) {
		draw_item(player_inventory.holding_item, mouse.x, mouse.y);
	}

	if (player_inventory.hovering_slot !== -1) {
		const item = player_inventory.container.get_item(player_inventory.hovering_slot);
		if (item) {
			const item_info = EverythingRegistry.get<ItemRegistry>("items", item.type_id);
			const item_name = item.type_id;
			const box_width = measure_text(item_name, 2) + 4 * 3;
			const lines = item_info?.get_lore ? 2 : 1;
			draw_nine_slice(
				ui,
				16 * 11,
				0,
				16,
				16,
				4,
				4,
				4,
				4,
				mouse.x + 4,
				mouse.y,
				box_width,
				32 * lines + 4 * (lines + 2),
				[1, 1, 1, 0.8],
			);
			draw_text(item_name, mouse.x + 4, mouse.y, 2);
			if (item_info?.get_lore) {
				draw_text(item_info.get_lore(item), mouse.x + 4, mouse.y + 32, 2);
			}
		}
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
