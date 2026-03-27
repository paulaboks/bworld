import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { Container, Inventory, ItemStack } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";
import { GuiFurnace } from "$/client/gui/gui_furnace.ts";
import { register_block_item } from "../../common/utils.ts";

interface FurnaceRecipe {
	input: string;
	output: ItemStack;
	cook_time: number;
}

const FURNACE_RECIPES: FurnaceRecipe[] = [
	{
		input: "bworld:log",
		output: new ItemStack("bworld:coal", 1),
		cook_time: 100,
	},
	{
		input: "bworld:coal_ore",
		output: new ItemStack("bworld:coal", 1),
		cook_time: 100,
	},
	{
		input: "bworld:iron_ore",
		output: new ItemStack("bworld:iron_ingot", 1),
		cook_time: 200,
	},
	{
		input: "bworld:tin_ore",
		output: new ItemStack("bworld:tin_ingot", 1),
		cook_time: 200,
	},
	{
		input: "bworld:copper_ore",
		output: new ItemStack("bworld:copper_ingot", 1),
		cook_time: 200,
	},
	{
		input: "bworld:gold_ore",
		output: new ItemStack("bworld:gold_ingot", 1),
		cook_time: 200,
	},
];

function get_recipe(input?: ItemStack | undefined): FurnaceRecipe | undefined {
	if (!input) {
		return;
	}

	return FURNACE_RECIPES.find((r) => r.input === input.type_id);
}

function can_craft(container: Container, recipe?: FurnaceRecipe) {
	if (!recipe) {
		return false;
	}

	const output = container.get_item(2);

	if (!output) {
		return true;
	}

	if (output.type_id !== recipe.output.type_id) {
		return false;
	}

	return output.amount < output.max_amount;
}

const FUEL_VALUES: Record<string, number> = {
	"bworld:coal": 1000,
	"bworld:log": 100,
};

function get_fuel_value(item?: ItemStack | undefined): number {
	if (!item) {
		return 0;
	}
	return FUEL_VALUES[item.type_id] ?? 0;
}

function has_fuel(container: Container) {
	return get_fuel_value(container.get_item(1)) > 0;
}

function consume_fuel(container: Container): number {
	const fuel = container.get_slot(1)!;
	const value = get_fuel_value(fuel.get_item());

	if (fuel.has_item()) {
		fuel.amount! -= 1;
	}

	return value;
}

function craft(container: Container, recipe: FurnaceRecipe) {
	const input = container.get_item(0)!;
	const output = container.get_item(2);

	if (!output) {
		container.set_item(2, recipe.output.clone());
	} else {
		output.amount += recipe.output.amount;
	}

	input.amount -= 1;
	container.set_item(0, input.amount > 0 ? input : undefined);
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
			return true;
		}
		return false;
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

		const data = block_data.data;
		const container = data.inventory.container;

		const input = container.get_item(0);
		const recipe = get_recipe(input);

		// burn fuel
		if (data.fuel > 0) {
			data.fuel -= 1;
		}

		if (!can_craft(container, recipe)) {
			data.progress = 0;
			return;
		}

		// refuel
		if (data.fuel === 0 && has_fuel(container)) {
			data.fuel = consume_fuel(container);
		}

		// cook
		if (data.fuel > 0 && recipe) {
			data.progress += 1;

			if (data.progress >= recipe.cook_time) {
				data.progress = 0;
				craft(container, recipe);
			}
		}
	},
});

register_block_item(block);
