import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:stone", {
	id: "bworld:stone",
	textures: "bworld:stone",
	has_collision: true,
	drop_table: "bworld:stone",
	toughness: 3,
	requires_tool: true,
	tool_to_break: "pickaxe",
});

register_block_item(block);
