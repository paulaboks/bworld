import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:snow", {
	id: "bworld:snow",
	textures: "bworld:snow",
	has_collision: true,
	toughness: 2,
	requires_tool: true,
	tool_to_break: "shovel",
});

register_block_item(block);
