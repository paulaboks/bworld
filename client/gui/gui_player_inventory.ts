import { Container, Inventory, ItemStack, PlayerInventory } from "../inventory.ts";
import { add_player_hotbar, add_player_inventory, GuiScreen, Slot } from "./gui_screen.ts";
import { canvas, draw_rect, Texture } from "$/client/renderer.ts";
import { AssetManager } from "../assets.ts";
import { SLOT_SIZE } from "../../common/constants.ts";
import { draw_nine_slice } from "../systems/rendering/render_utils.ts";

export interface CraftingRecipe {
	width: number;
	height: number;
	pattern: (string | undefined)[];
	result: ItemStack;
}

const recipes: CraftingRecipe[] = [
	{
		width: 3,
		height: 3,
		pattern: [
			"bworld:log",
			"bworld:log",
			"bworld:log",
			"bworld:log",
			undefined,
			"bworld:log",
			"bworld:log",
			"bworld:log",
			"bworld:log",
		],
		result: new ItemStack("bworld:chest", 1),
	},
];

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

	override on_tick(delta: number): void {
		super.on_tick(delta);
		this.update_crafting_result();
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
		for (let i = 0; i < 8; i += 1) {
			const item = this.inventory.container.get_item(i);
			if (item) {
				this.player_inventory.container.add_item(item);
			}
		}
	}

	get_crafting_grid(): (string | undefined)[] {
		const grid: (string | undefined)[] = [];

		for (let i = 0; i < 9; i++) {
			const item = this.inventory.container.get_item(i);
			grid.push(item?.type_id);
		}

		return grid;
	}

	matches_recipe(
		grid: (string | undefined)[],
		recipe: CraftingRecipe,
	): boolean {
		for (let y = 0; y <= 3 - recipe.height; y++) {
			for (let x = 0; x <= 3 - recipe.width; x++) {
				let match = true;

				for (let ry = 0; ry < recipe.height; ry++) {
					for (let rx = 0; rx < recipe.width; rx++) {
						const grid_index = (y + ry) * 3 + (x + rx);
						const recipe_index = ry * recipe.width + rx;

						if (grid[grid_index] !== recipe.pattern[recipe_index]) {
							match = false;
							break;
						}
					}
				}

				if (match) return true;
			}
		}

		return false;
	}

	update_crafting_result() {
		const grid = this.get_crafting_grid();

		for (const recipe of recipes) {
			if (this.matches_recipe(grid, recipe)) {
				this.inventory.container.set_item(
					9,
					recipe.result.clone(),
				);
				return;
			}
		}

		this.inventory.container.set_item(9, undefined);
	}

	consume_recipe_items() {
		for (let i = 0; i < 9; i++) {
			const item = this.inventory.container.get_item(i);
			if (!item) {
				continue;
			}

			item.amount -= 1;

			if (item.amount <= 0) {
				this.inventory.container.set_item(i, undefined);
			}
		}
	}

	override handle_left_click(slot: Slot): void {
		if (slot.inventory === this.inventory && slot.index === 9) {
			if (this.inventory.container.get_item(9)) {
				this.craft();
			}
		} else {
			super.handle_left_click(slot);
		}
	}

	override handle_right_click(slot: Slot): void {
		if (slot.inventory === this.inventory && slot.index === 9) {
			if (this.inventory.container.get_item(9)) {
				this.craft();
			}
		} else {
			super.handle_right_click(slot);
		}
	}

	craft() {
		const holding_item = this.player_inventory.holding_item;
		const item = this.inventory.container.get_item(9)!;

		if (holding_item) {
			if (holding_item.type_id === item.type_id) {
				const items_left = holding_item.max_amount - holding_item.amount;
				if (items_left >= item.amount) {
					this.consume_recipe_items();
					holding_item.amount += item.amount;
				}
			}
		} else {
			this.player_inventory.holding_item = item;
			this.consume_recipe_items();
		}
	}
}
