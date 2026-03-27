import { Inventory, PlayerInventory } from "../inventory.ts";
import { add_player_hotbar, add_player_inventory, GuiInventoryScreen, Slot } from "./gui_screen.ts";
import { canvas, draw_rect, Texture } from "$/client/renderer/mod.ts";
import { AssetManager } from "../assets.ts";
import { SLOT_SIZE } from "../../common/constants.ts";
import { draw_nine_slice } from "../systems/rendering/render_utils.ts";

const PADDING = 10;

export class GuiChest extends GuiInventoryScreen {
	override inventory_width = PADDING * 2 + SLOT_SIZE * 9;
	override inventory_height = PADDING * 4 + SLOT_SIZE * 7;

	constructor(inventory: Inventory, player_inventory: PlayerInventory) {
		super(inventory, player_inventory, undefined);

		add_player_hotbar(this, player_inventory, PADDING, PADDING);
		add_player_inventory(this, player_inventory, PADDING, PADDING * 2 + SLOT_SIZE);

		const chest_x = PADDING;
		const chest_y = PADDING * 3 + SLOT_SIZE * 4;

		for (let i = 0; i < 3; ++i) {
			for (let l = 0; l < 9; ++l) {
				this.slots.push(
					new Slot(
						this.inventory,
						l + i * 9,
						chest_x + l * SLOT_SIZE,
						chest_y + i * SLOT_SIZE,
					),
				);
			}
		}
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
}
