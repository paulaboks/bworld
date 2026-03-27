import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:planks", {
	id: "bworld:planks",
	textures: "bworld:planks",
	has_collision: true,
	drop_table: "bworld:log",
});

register_block_item(block);
