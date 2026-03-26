import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:leaves", {
	id: "bworld:leaves",
	textures: "bworld:leaves",
	has_collision: true,
	transparent: true,
});

register_block_item(block);
