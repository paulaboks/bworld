import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:log", {
	id: "bworld:log",
	textures: { side: "bworld:log_side", top: "bworld:log_top", bottom: "bworld:log_top" },
	has_collision: true,
	drop_table: "bworld:log",
	toughness: 3,
	requires_tool: false,
	tool_to_break: "axe",
});

register_block_item(block);
