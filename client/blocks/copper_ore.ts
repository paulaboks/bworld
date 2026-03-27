import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:copper_ore", {
	id: "bworld:copper_ore",
	textures: "bworld:stone_copper",
	has_collision: true,
	drop_table: "bworld:copper_ore",
});

register_block_item(block);
