import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

// TODO: watered state
const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:hoed_dirt", {
	id: "bworld:hoed_dirt",
	textures: { side: "bworld:dirt", top: "bworld:hoed_dirt", bottom: "bworld:dirt" },
	has_collision: false,
	drop_table: "bworld:dirt",
	toughness: 5,
	requires_tool: false,
	tool_to_break: "shovel",
	states: [
		{ name: "watered", bits: 1, default: 0 },
	],
});

register_block_item(block);
