import { SLOT_SIZE } from "$/common/constants.ts";
import { AssetManager } from "$/client/assets.ts";
import { PlayerInventory } from "$/client/components/inventory.ts";
import { InputManager } from "$/client/input_manager.ts";
import { draw_item, draw_nine_slice } from "./render_utils.ts";

export function render_player_inventory(ctx: CanvasRenderingContext2D, player_inventory: PlayerInventory) {
	const PADDING = 10;
	const ui = AssetManager.instance.get<HTMLImageElement>("bworld:ui");
	const layout = player_inventory.layout.slots;

	draw_nine_slice(
		ctx,
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
			ctx,
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
			draw_item(ctx, item, x, y);
		}
	}

	if (player_inventory.holding_item) {
		const mouse = InputManager.get_mouse_position();
		draw_item(ctx, player_inventory.holding_item, mouse.x, mouse.y);
	}
}
