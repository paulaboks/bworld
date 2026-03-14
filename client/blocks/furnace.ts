import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { Container, Inventory, ItemStack } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";
import { GuiFurnace } from "$/client/gui/gui_furnace.ts";

function can_craft(container: Container) {
	const input = container.get_item(0);
	const output = container.get_item(2);

	if (!input) {
		return false;
	}

	if (["bworld:log"].includes(input.type_id)) {
		return true;
	}

	if (!output) {
		return true;
	}

	if (output.amount >= output.max_amount) {
		return false;
	}

	return true;
}

function has_fuel(container: Container) {
	const fuel = container.get_item(1);

	if (!fuel) {
		return false;
	}

	if (["bworld:coal", "bworld:log"].includes(fuel.type_id)) {
		return true;
	}

	return false;
}

function consume_fuel(container: Container) {
	const fuel = container.get_item(1)!;
	fuel.amount -= 1;
	container.set_item(1, fuel);
}

function craft(container: Container, item: ItemStack) {
	const input = container.get_item(0)!;
	const output = container.get_item(2);

	if (!output) {
		container.set_item(2, item);
	} else {
		output.amount += item.amount;
	}

	input.amount -= 1;
	container.set_item(0, input);
}

interface TileChestData {
	inventory: Inventory;
	progress: number;
	fuel: number;
}

EverythingRegistry.register<BlockRegistry<TileChestData>>("blocks", "bworld:furnace", {
	textures: "bworld:furnace",
	has_collision: false,

	on_interact(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_component = player.get(PlayerComponent)!;
		if (tile.data && tile.data.inventory) {
			const gui = new GuiFurnace(tile.data.inventory, player_component.player_inventory, tile.data);
			player_component.screens.push(gui);
		}
	},
	on_create(_, tile) {
		tile.data = {
			inventory: new Inventory(new Container(3)),
			progress: 0,
			fuel: 0,
		};
	},
	on_tick(_, tile) {
		if (!tile.data) {
			return;
		}

		if (tile.data.fuel > 0) {
			tile.data.fuel -= 1;
		}

		const container = tile.data.inventory.container;

		if (can_craft(container)) {
			if (tile.data.fuel === 0 && has_fuel(container)) {
				consume_fuel(container);
				tile.data.fuel = 200;
			}

			if (tile.data.fuel > 0) {
				tile.data.progress += 1;

				if (tile.data.progress >= 100) {
					tile.data.progress = 0;
					craft(container, new ItemStack("bworld:coal"));
				}
			}
		}
	},
});
