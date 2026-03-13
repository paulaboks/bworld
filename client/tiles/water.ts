import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<TileRegistry>("blocks", "bworld:water", {
	texture_id: "bworld:water",
	has_collision: false,
});
