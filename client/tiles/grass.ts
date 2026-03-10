import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { PlayerComponent } from "../player.ts";

EverythingRegistry.register<TileRegistry>("tiles", "bworld:grass", {
	texture_id: "bworld:grass",
	has_collision: false,

	on_interact(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (item?.type_id === "bworld:hoe") {
			tile.id = "bworld:hoed_dirt";
		} else if (item?.type_id === "bworld:chest") {
			world.dimension.add_tile(world, { x: tile.x, y: tile.y, id: "bworld:chest" });
		}
	},
});
