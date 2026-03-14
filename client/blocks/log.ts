import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:log", {
	textures: { side: "bworld:log_side", top: "bworld:log_top", bottom: "bworld:log_top" },
	has_collision: true,
});

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:leaves", {
	textures: "bworld:leaves",
	has_collision: true,
	transparent: true,
});
