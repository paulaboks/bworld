import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:log", {
	texture_id: "bworld:log_side",
	has_collision: true,
});

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:leaves", {
	texture_id: "bworld:leaves",
	has_collision: true,
	transparent: true,
});
