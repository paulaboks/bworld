import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { WateringCanData } from "../items/watering_can.ts";
import { PlayerComponent } from "../player.ts";

EverythingRegistry.register<TileRegistry>("tiles", "bworld:dirt", {
	texture_id: "bworld:dirt",
	has_collision: false,

	on_interact(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
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
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
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
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (!item) {
			return;
		}

		if (item.type_id === "bworld:watering_can") {
			const data = item.data as WateringCanData;
			if (data.water > 0) {
				tile.id = "bworld:hoed_watered_dirt";
				data.water -= 1;
			}
		}
	},
});

EverythingRegistry.register<TileRegistry>("tiles", "bworld:hoed_watered_dirt", {
	texture_id: "bworld:hoed_watered_dirt",
	has_collision: false,

	on_click(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
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
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (!item) {
			return;
		}

		if (item.type_id === "bworld:tomato_seeds") {
			world.dimension.add_tile(world, { x: tile.x, y: tile.y, id: "bworld:tomato_crop", tickable: true });
			item.amount -= 1;
			player_inventory.container.set_item(player_inventory.hotbar_selected, item);
		} else if (item.type_id === "bworld:potato_seeds") {
			world.dimension.add_tile(world, { x: tile.x, y: tile.y, id: "bworld:potato_crop", tickable: true });
			item.amount -= 1;
			player_inventory.container.set_item(player_inventory.hotbar_selected, item);
		} else if (item.type_id === "bworld:pumpkin_seeds") {
			world.dimension.add_tile(world, { x: tile.x, y: tile.y, id: "bworld:pumpkin_crop", tickable: true });
			item.amount -= 1;
			player_inventory.container.set_item(player_inventory.hotbar_selected, item);
		} else if (item.type_id === "bworld:carrot_seeds") {
			world.dimension.add_tile(world, { x: tile.x, y: tile.y, id: "bworld:carrot_crop", tickable: true });
			item.amount -= 1;
			player_inventory.container.set_item(player_inventory.hotbar_selected, item);
		}
	},
});
