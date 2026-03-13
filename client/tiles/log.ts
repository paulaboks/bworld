import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<TileRegistry>("blocks", "bworld:log", {
	texture_id: "bworld:log_side",
	has_collision: true,
});

EverythingRegistry.register<TileRegistry>("blocks", "bworld:leaves", {
	texture_id: "bworld:leaves",
	has_collision: true,
	transparent: true,
});
