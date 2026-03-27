import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:iron_ore", {
	id: "bworld:iron_ore",
	textures: "bworld:stone_iron",
	has_collision: true,
	drop_table: "bworld:iron_ore",
	toughness: 5,
	requires_tool: true,
	tool_to_break: "pickaxe",
});

register_block_item(block);
