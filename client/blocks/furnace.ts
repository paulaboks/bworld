import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { Container, Inventory, ItemStack } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";
import { GuiFurnace } from "$/client/gui/gui_furnace.ts";
import { register_block_item } from "../../common/utils.ts";

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

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:furnace", {
	id: "bworld:furnace",
	textures: { front: "bworld:furnace", side: "bworld:stone" },
	has_collision: true,
	drop_table: "bworld:furnace",

	on_interact(dimension, block) {
		const [player] = dimension.world.get_tag("player")!;
		const player_component = player.get(PlayerComponent)!;
		const block_data = dimension.get_block_data<TileChestData>(block.x, block.y, block.z);
		if (block_data && block_data.data.inventory) {
			const gui = new GuiFurnace(block_data.data.inventory, player_component.player_inventory, block_data.data);
			player_component.screens.push(gui);
		}
	},
	on_create(dimension, block) {
		dimension.add_block_data({
			id: block.id,
			x: block.x,
			y: block.y,
			z: block.z,
			data: {
				inventory: new Inventory(new Container(3)),
				progress: 0,
				fuel: 0,
			},
		});
	},
	on_break() {
		// TODO: remove block data
	},
	on_tick(dimension, block) {
		const block_data = dimension.get_block_data<TileChestData>(block.x, block.y, block.z);
		if (!block_data) {
			return;
		}

		if (block_data.data.fuel > 0) {
			block_data.data.fuel -= 1;
		}

		const container = block_data.data.inventory.container;

		if (can_craft(container)) {
			if (block_data.data.fuel === 0 && has_fuel(container)) {
				consume_fuel(container);
				block_data.data.fuel = 200;
			}

			if (block_data.data.fuel > 0) {
				block_data.data.progress += 1;

				if (block_data.data.progress >= 100) {
					block_data.data.progress = 0;
					craft(container, new ItemStack("bworld:coal"));
				}
			}
		}
	},
});

register_block_item(block);
