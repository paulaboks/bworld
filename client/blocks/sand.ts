import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:sand", {
	textures: "bworld:sand",
	has_collision: true,
	drop_table: "bworld:sand",
});
