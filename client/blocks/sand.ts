import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "../../common/utils.ts";

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:sand", {
	id: "bworld:sand",
	textures: "bworld:sand",
	has_collision: true,
	drop_table: "bworld:sand",
});

register_block_item(block);
