import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:tin_ore", {
	id: "bworld:tin_ore",
	textures: "bworld:stone_tin",
	has_collision: true,
	drop_table: "bworld:tin_ore",
});

register_block_item(block);
