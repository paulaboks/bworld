import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:sand", {
	id: "bworld:sand",
	textures: "bworld:sand",
	has_collision: true,
	drop_table: "bworld:sand",
	toughness: 3,
	requires_tool: false,
	tool_to_break: "shovel",
});

register_block_item(block);
