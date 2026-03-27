import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:gold_ore", {
	id: "bworld:gold_ore",
	textures: "bworld:stone_gold",
	has_collision: true,
	drop_table: "bworld:gold_ore",
});

register_block_item(block);
