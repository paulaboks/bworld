import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { PlayerComponent } from "../player.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:grass", {
	textures: { top: "bworld:grass_top", bottom: "bworld:dirt", "side": "bworld:grass_side" },
	has_collision: false,
	drop_table: "bworld:dirt",

	on_interact(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (item?.type_id === "bworld:hoe") {
			tile.id = "bworld:hoed_dirt";
		} else if (item?.type_id === "bworld:chest") {
			// world.dimension.add_block(world, { x: tile.x, y: tile.y, id: "bworld:chest" });
		} else if (item?.type_id === "bworld:furnace") {
			// world.dimension.add_block(world, { x: tile.x, y: tile.y, id: "bworld:furnace", tickable: true });
		}
	},
});
