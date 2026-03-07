import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { PlayerInventory } from "../components/inventory.ts";

EverythingRegistry.register<TileRegistry>("tiles", "bworld:dirt", {
	texture_id: "bworld:dirt",
	has_collision: false,

	on_interact(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerInventory)!;
		const maybe_item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (maybe_item && maybe_item.type_id === "bworld:hoe") {
			tile.id = "bworld:hoed_dirt";
		}
	},
});

EverythingRegistry.register<TileRegistry>("tiles", "bworld:hoed_dirt", {
	texture_id: "bworld:hoed_dirt",
	has_collision: false,

	on_click(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerInventory)!;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (!item) {
			return;
		}

		if (item.type_id === "bworld:pickaxe") {
			tile.id = "bworld:dirt";
		}
	},
	on_interact(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerInventory)!;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (!item) {
			return;
		}

		if (item.type_id === "bworld:watering_can") {
			tile.id = "bworld:hoed_watered_dirt";
		}
	},
});

EverythingRegistry.register<TileRegistry>("tiles", "bworld:hoed_watered_dirt", {
	texture_id: "bworld:hoed_watered_dirt",
	has_collision: false,

	on_click(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerInventory)!;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (!item) {
			return;
		}

		if (item.type_id === "bworld:pickaxe") {
			tile.id = "bworld:dirt";
		}
	},
	on_interact(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerInventory)!;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (!item) {
			return;
		}

		if (item.type_id === "bworld:tomato_seeds") {
			world.dimension.tiles.push({ x: tile.x, y: tile.y, id: "bworld:tomato_seeds" });
			item.amount -= 1;
			player_inventory.container.set_item(player_inventory.hotbar_selected, item);
		}
	},
});
