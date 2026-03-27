import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:coal_ore", {
	id: "bworld:coal_ore",
	textures: "bworld:stone_coal",
	has_collision: true,
	drop_table: "bworld:coal_ore",
	toughness: 5,
	requires_tool: true,
	tool_to_break: "pickaxe",
});

register_block_item(block);
