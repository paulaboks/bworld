import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:stone", {
	textures: "bworld:stone",
	has_collision: true,
});
