import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:water", {
	id: "bworld:water",
	textures: "bworld:water",
	has_collision: false,
	transparent: true,
	alpha: 0.8,
});
