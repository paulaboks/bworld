import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<TileRegistry>("blocks", "bworld:stone", {
	texture_id: "bworld:stone",
	has_collision: true,
});
