import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:glass", {
	textures: "bworld:glass",
	has_collision: true,
	transparent: true,
});
