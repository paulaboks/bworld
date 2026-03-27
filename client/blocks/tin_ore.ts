import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:tin_ore", {
	id: "bworld:tin_ore",
	textures: "bworld:stone_tin",
	has_collision: true,
	drop_table: "bworld:tin_ore",
	toughness: 5,
	requires_tool: true,
	tool_to_break: "pickaxe",
});

register_block_item(block);
