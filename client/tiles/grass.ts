import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { PlayerInventory } from "../components/inventory.ts";

EverythingRegistry.register<TileRegistry>("tiles", "bworld:grass", {
	texture_id: "bworld:grass",
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
