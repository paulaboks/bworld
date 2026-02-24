import { System, World } from "$/common/ecs/mod.ts";
import { point_inside_rec } from "$/common/utils.ts";
import { SLOT_SIZE } from "$/common/constants.ts";
import { Container, PlayerInventory } from "$/client/components/inventory.ts";
import { InputManager } from "$/client/input_manager.ts";

export class InventorySystem extends System {
	update(world: World, _delta: number): void {
		for (const entity of world.get_entities()) {
			const player_inventory = entity.get(PlayerInventory);

			if (player_inventory) {
				player_inventory.hovering_slot = -1;
				const container = player_inventory.container;
				if (player_inventory.is_open) {
					for (const [index, slot] of player_inventory.layout.slots.entries()) {
						const mouse = InputManager.get_mouse_position();
						const slot_x = slot.x + player_inventory.layout.offset_x;
						const slot_y = slot.y + player_inventory.layout.offset_y;
						const hovering = point_inside_rec(mouse.x, mouse.y, slot_x, slot_y, SLOT_SIZE, SLOT_SIZE);
						if (hovering) {
							player_inventory.hovering_slot = index;

							if (InputManager.is_mouse_pressed(0)) {
								InputManager.consume_mouse(0);
								this.handle_left_click(player_inventory, container, index);
								return;
							}

							if (InputManager.is_mouse_pressed(2)) {
								InputManager.consume_mouse(2);
								this.handle_right_click(player_inventory, container, index);
								return;
							}
						}
					}
				} else {
					if (player_inventory.holding_item) {
						container.add_item(player_inventory.holding_item);
						player_inventory.holding_item = undefined;
					}
				}

				if (player_inventory.holding_item?.amount === 0) {
					player_inventory.holding_item = undefined;
				}
			}
		}
	}

	switch_item_with_holding(player_inventory: PlayerInventory, index: number) {
		const container_slot = player_inventory.container.get_slot(index);
		const original_holding_item = player_inventory.holding_item;
		player_inventory.holding_item = container_slot.get_item();
		container_slot.set_item(original_holding_item);
	}

	handle_left_click(player_inventory: PlayerInventory, container: Container, index: number) {
		const holding = player_inventory.holding_item;
		const slot = container.get_slot(index);
		const slot_item = slot.get_item();

		// if you aren't holding anything
		// "swap" with nothing on your hand (pick it up)
		if (!holding) {
			this.switch_item_with_holding(player_inventory, index);
			return;
		}

		// if you are holding something and slot type equals holding type
		// try to add to stack
		if (slot_item && slot.type_id === holding.type_id) {
			const space_left = slot.max_amount! - slot_item.amount!;
			const amount_to_add = Math.min(space_left, holding.amount);

			slot_item.amount += amount_to_add;
			holding.amount -= amount_to_add;

			return;
		}

		// if something on hand but not the same
		// swap
		this.switch_item_with_holding(player_inventory, index);
	}

	handle_right_click(player_inventory: PlayerInventory, container: Container, index: number) {
		const holding = player_inventory.holding_item;
		const slot = container.get_slot(index);
		const slot_item = slot.get_item();

		// if holding something
		if (holding) {
			// and slot type equals holding type
			// add 1 to matching stack
			if (slot_item && slot.type_id === holding.type_id) {
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
				slot.set_item(new_item);
				holding.amount -= 1;
				return;
			}

			// if something on hand but not the same
			// swap
			this.switch_item_with_holding(player_inventory, index);
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

		player_inventory.holding_item = picked_up;

		if (slot_item.amount === 0) {
			slot.set_item(undefined);
		}
	}
}
