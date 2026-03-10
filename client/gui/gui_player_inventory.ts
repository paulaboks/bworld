import { Container, Inventory, PlayerInventory } from "../inventory.ts";
import { add_player_hotbar, add_player_inventory, GuiScreen, Slot } from "./gui_screen.ts";
import { canvas, draw_rect, Texture } from "$/client/renderer.ts";
import { AssetManager } from "../assets.ts";
import { SLOT_SIZE } from "../../common/constants.ts";
import { draw_nine_slice } from "../systems/rendering/render_utils.ts";

const PADDING = 10;

export class GuiPlayerInventory extends GuiScreen {
	override inventory_width = PADDING * 2 + SLOT_SIZE * 9;
	override inventory_height = PADDING * 2 + SLOT_SIZE * 4 + PADDING + SLOT_SIZE * 3 + PADDING;

	constructor(player_inventory: PlayerInventory) {
		super(new Inventory(new Container(10)), player_inventory, undefined);

		add_player_hotbar(this, player_inventory, PADDING, PADDING);
		add_player_inventory(this, player_inventory, PADDING, PADDING * 2 + SLOT_SIZE);

		const crafting_x = PADDING;
		const crafting_y = PADDING * 3 + SLOT_SIZE * 4;

		for (let i = 0; i < 3; i += 1) {
			for (let j = 0; j < 3; j += 1) {
				this.slots.push(
					new Slot(this.inventory, i * 3 + j, crafting_x + i * SLOT_SIZE, crafting_y + j * SLOT_SIZE),
				);
			}
		}

		this.slots.push(new Slot(this.inventory, 9, crafting_x + 5 * SLOT_SIZE, crafting_y + 1 * SLOT_SIZE));
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

		super.on_render();
	}

	override on_close(): void {
		for (let i = 0; i < this.inventory.container.size; i += 1) {
			const item = this.inventory.container.get_item(i);
			if (item) {
				this.player_inventory.container.add_item(item);
			}
		}
	}
}
