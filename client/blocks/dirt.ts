import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";
import { PlayerComponent } from "../player.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:dirt", {
	id: "bworld:dirt",
	textures: "bworld:dirt",
	has_collision: false,
	drop_table: "bworld:dirt",

	on_interact(dimension, block) {
		const [player] = dimension.world.get_tag("player")!;
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
		const maybe_item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (maybe_item && maybe_item.type_id === "bworld:hoe") {
			dimension.add_block({ x: block.x, y: block.y, z: block.z, id: "bworld:hoed_dirt" });
		}
	},
});

register_block_item(block);
