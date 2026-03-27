import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:glass", {
	id: "bworld:glass",
	textures: "bworld:glass",
	has_collision: true,
	transparent: true,
});

register_block_item(block);
