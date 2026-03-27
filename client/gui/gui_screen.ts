import { SLOT_SIZE } from "$/common/constants.ts";
import { point_inside_rec } from "../../common/utils.ts";
import { AssetManager } from "../assets.ts";
import { InputManager } from "../input_manager.ts";
import { Inventory, ItemStack, PlayerInventory } from "../inventory.ts";
import { canvas, Texture } from "../renderer/mod.ts";
import { draw_item, draw_nine_slice } from "../systems/rendering/render_utils.ts";

export class Slot {
	inventory: Inventory;
	index: number;
	// relative to screen top left
	x: number;
	y: number;

	constructor(inventory: Inventory, index: number, x: number, y: number) {
		this.inventory = inventory;
		this.index = index;
		this.x = x;
		this.y = y;
	}

	get item(): ItemStack | undefined {
		return this.inventory.container.get_item(this.index);
	}
}

export abstract class GuiScreen {
	x: number = 0;
	y: number = 0;

	abstract on_tick(_delta: number): void;
	abstract on_render(): void;
	abstract on_close(): void;
}

export class GuiInventoryScreen<Inv extends Inventory = Inventory, Properties = Record<string, unknown> | undefined>
	extends GuiScreen {
	inventory: Inv;
	player_inventory: PlayerInventory;
	properties: Properties;

	slots: Slot[] = [];
	inventory_width: number = 500;
	inventory_height: number = 500;

	constructor(
		inventory: Inv,
		player_inventory: PlayerInventory,
		properties: Properties,
	) {
		super();
		this.inventory = inventory;
		this.player_inventory = player_inventory;
		this.properties = properties;
	}

	on_tick(_delta: number): void {
		this.x = canvas.width / 2 - (this.inventory_width / 2);
		this.y = canvas.height / 2 - (this.inventory_height / 2);

		this.handle_interaction();

		if (this.player_inventory.holding_item?.amount === 0) {
			this.player_inventory.holding_item = undefined;
		}
	}

	on_render(): void {
		const ui = AssetManager.instance.get<Texture>("bworld:ui");

		for (const slot of this.slots) {
			draw_nine_slice(
				ui,
				slot.inventory.hovering_slot === slot.index ? 19 * 16 : 160 + 32,
				slot.inventory.hovering_slot === slot.index ? 16 : 0,
				16,
				16,
				4,
				4,
				4,
				4,
				this.x + slot.x,
				this.y + slot.y,
				SLOT_SIZE,
				SLOT_SIZE,
			);
		}

		for (const slot of this.slots) {
			const item = slot.item;
			if (item) {
				draw_item(item, this.x + slot.x, this.y + slot.y);
			}
		}

		if (this.player_inventory.holding_item) {
			const mouse = InputManager.get_mouse_position();
			draw_item(this.player_inventory.holding_item, mouse.x, mouse.y);
		}
	}

	on_close(): void {}

	handle_interaction() {
		this.player_inventory.hovering_slot = -1;
		this.inventory.hovering_slot = -1;
		for (const slot of this.slots) {
			const mouse = InputManager.get_mouse_position();
			const slot_x = slot.x + this.x;
			const slot_y = slot.y + this.y;
			const hovering = point_inside_rec(mouse.x, mouse.y, slot_x, slot_y, SLOT_SIZE, SLOT_SIZE);
			if (hovering) {
				slot.inventory.hovering_slot = slot.index;

				if (InputManager.is_mouse_pressed(0)) {
					InputManager.consume_mouse(0);
					this.handle_left_click(slot);
					return;
				}

				if (InputManager.is_mouse_pressed(2)) {
					InputManager.consume_mouse(2);
					this.handle_right_click(slot);
					return;
				}
			}
		}
	}

	switch_item_with_holding(inventory: Inventory, index: number) {
		const container_slot = inventory.container.get_slot(index);
		const original_holding_item = this.player_inventory.holding_item;
		this.player_inventory.holding_item = container_slot.get_item();
		container_slot.set_item(original_holding_item);
	}

	handle_left_click(slot: Slot) {
		const holding = this.player_inventory.holding_item;
		const inventory_slot = slot.inventory.container.get_slot(slot.index);
		const slot_item = inventory_slot.get_item();

		// if you aren't holding anything
		// "swap" with nothing on your hand (pick it up)
		if (!holding) {
			this.switch_item_with_holding(slot.inventory, slot.index);
			return;
		}

		// if you are holding something and slot type equals holding type
		// try to add to stack
		if (slot_item && inventory_slot.type_id === holding.type_id) {
			const space_left = inventory_slot.max_amount! - slot_item.amount!;
			const amount_to_add = Math.min(space_left, holding.amount);

			slot_item.amount += amount_to_add;
			holding.amount -= amount_to_add;

			return;
		}

		// if something on hand but not the same
		// swap
		this.switch_item_with_holding(slot.inventory, slot.index);
	}

	handle_right_click(slot: Slot) {
		const holding = this.player_inventory.holding_item;
		const inventory_slot = slot.inventory.container.get_slot(slot.index);
		const slot_item = inventory_slot.get_item();

		// if holding something
		if (holding) {
			// and slot type equals holding type
			// add 1 to matching stack
			if (slot_item && inventory_slot.type_id === holding.type_id) {
				if (slot_item.amount < slot_item.max_amount!) {
					slot_item.amount += 1;
					holding.amount -= 1;
				}
				return;
			}

			// (actually the same as the last one but creates a new one techinically)
			// place 1 into empty slot
			if (!slot_item) {
				const new_item = holding.clone();
				new_item.amount = 1;
				inventory_slot.set_item(new_item);
				holding.amount -= 1;
				return;
			}

			// if something on hand but not the same
			// swap
			this.switch_item_with_holding(slot.inventory, slot.index);
			return;
		}

		// if player is holding nothing and clicks nothing, nothing happens
		if (!slot_item) {
			return;
		}

		// pick up half of the stack
		const original_amount = slot_item.amount;
		const half = Math.floor(original_amount / 2);

		slot_item.amount = half;

		const picked_up = slot_item.clone();
		picked_up.amount = original_amount - half;

		this.player_inventory.holding_item = picked_up;

		if (slot_item.amount === 0) {
			inventory_slot.set_item(undefined);
		}
	}

	/*handle_hotbar(world: ClientWorld, player_inventory: PlayerInventory) {
		const [player, player_hand] = world.get_tag("player")!;

		const player_position = player.get(Position);
		const player_sprite = player.get(AnimatedSprite);
		const hand_position = player_hand.get(Position);
		const hand_sprite = player_hand.get(Sprite);

		if (!player_position || !hand_position || !hand_sprite || !player_sprite) {
			return;
		}

		// sync position
		hand_position.x = player_position.x + (player_sprite.flip_x ? 34 : 4);
		hand_position.y = player_position.y + 34;
		hand_sprite.flip_x = player_sprite.flip_x;

		const maybe_item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (maybe_item) {
			const region = get_sprite_region(maybe_item.type_id);
			hand_sprite.source_x = region.x * 16;
			hand_sprite.source_y = region.y * 16;
			hand_sprite.source_width = 16;
			hand_sprite.source_height = 16;
			hand_sprite.width = 32;
			hand_sprite.height = 32;
		} else {
			hand_sprite.width = 0;
			hand_sprite.height = 0;
		}
	}*/
}

// generic methods that is often needed

export function add_player_inventory(
	handler: GuiInventoryScreen,
	player_inventory: PlayerInventory,
	offset_x: number,
	offset_y: number,
) {
	for (let i = 0; i < 3; ++i) {
		for (let l = 0; l < 9; ++l) {
			handler.slots.push(
				new Slot(
					player_inventory,
					l + i * 9 + 9,
					offset_x + l * SLOT_SIZE,
					offset_y + i * SLOT_SIZE,
				),
			);
		}
	}
}

export function add_player_hotbar(
	handler: GuiInventoryScreen,
	player_inventory: PlayerInventory,
	offset_x: number,
	offset_y: number,
) {
	for (let i = 0; i < 9; ++i) {
		handler.slots.push(new Slot(player_inventory, i, offset_x + i * SLOT_SIZE, offset_y));
	}
}
