import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:snow", {
	textures: "bworld:snow",
	has_collision: true,
});
