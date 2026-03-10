import { Inventory, PlayerInventory } from "../inventory.ts";
import { add_player_hotbar, add_player_inventory, GuiScreen, Slot } from "./gui_screen.ts";
import { canvas, draw_rect, draw_text, Texture } from "$/client/renderer.ts";
import { AssetManager } from "../assets.ts";
import { SLOT_SIZE } from "../../common/constants.ts";
import { draw_nine_slice } from "../systems/rendering/render_utils.ts";

const PADDING = 10;

export class GuiFurnace extends GuiScreen<Inventory, { fuel: number; progress: number }> {
	override inventory_width = PADDING * 2 + SLOT_SIZE * 9;
	override inventory_height = PADDING * 4 + SLOT_SIZE * 7;

	constructor(
		inventory: Inventory,
		player_inventory: PlayerInventory,
		properties: { fuel: number; progress: number },
	) {
		super(inventory, player_inventory, properties);

		add_player_hotbar(this, player_inventory, PADDING, PADDING);
		add_player_inventory(this, player_inventory, PADDING, PADDING * 2 + SLOT_SIZE);

		const furnace_y = PADDING * 3 + SLOT_SIZE * 4;

		this.slots.push(
			new Slot(
				this.inventory,
				0,
				this.inventory_width / 2 - SLOT_SIZE,
				furnace_y,
			),
		);
		this.slots.push(
			new Slot(
				this.inventory,
				1,
				this.inventory_width / 2 - SLOT_SIZE,
				furnace_y + SLOT_SIZE * 2,
			),
		);
		this.slots.push(
			new Slot(
				this.inventory,
				2,
				this.inventory_width / 2 + SLOT_SIZE,
				furnace_y + SLOT_SIZE,
			),
		);
	}

	override on_render(): void {
		draw_rect(0, 0, canvas.width, canvas.height, [0, 0, 0, 0.8]);

		const ui = AssetManager.instance.get<Texture>("bworld:ui");

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
			this.x,
			this.y,
			this.inventory_width,
			this.inventory_height,
		);

		const furnace_y = PADDING * 3 + SLOT_SIZE * 4;
		draw_text(
			String(this.properties.fuel),
			this.x + this.inventory_width / 2 - SLOT_SIZE,
			this.y + furnace_y + SLOT_SIZE,
			1,
			[0, 0, 0, 1],
		);
		draw_text(
			String(this.properties.progress),
			this.x + this.inventory_width / 2,
			this.y + furnace_y + SLOT_SIZE,
			1,
			[0, 0, 0, 1],
		);

		super.on_render();
	}

	override handle_left_click(slot: Slot): void {
		if (slot.inventory === this.inventory && slot.index === 2) {
			if (this.inventory.container.get_item(2)) {
				this.pickup();
			}
		} else {
			super.handle_left_click(slot);
		}
	}

	override handle_right_click(slot: Slot): void {
		if (slot.inventory === this.inventory && slot.index === 2) {
			if (this.inventory.container.get_item(2)) {
				this.pickup();
			}
		} else {
			super.handle_right_click(slot);
		}
	}

	pickup() {
		const holding_item = this.player_inventory.holding_item;
		const item = this.inventory.container.get_item(2)!;

		if (holding_item) {
			if (holding_item.type_id === item.type_id) {
				const items_left = holding_item.max_amount - holding_item.amount;
				if (items_left >= item.amount) {
					holding_item.amount += item.amount;
					this.inventory.container.set_item(2, undefined);
				}
			}
		} else {
			this.player_inventory.holding_item = item;
			this.inventory.container.set_item(2, undefined);
		}
	}
}
