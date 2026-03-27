import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { PlayerComponent } from "../player.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:grass", {
	id: "bworld:grass",
	textures: { top: "bworld:grass_top", bottom: "bworld:dirt", "side": "bworld:grass_side" },
	has_collision: false,
	drop_table: "bworld:dirt",

	on_interact(dimension, block) {
		const [player] = dimension.world.get_tag("player")!;
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
		const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (item?.type_id === "bworld:hoe") {
			block.id = "bworld:hoed_dirt";
			dimension.add_block(block);
			return true;
		}
		return false;
	},
});
