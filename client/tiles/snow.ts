import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<TileRegistry>("blocks", "bworld:snow", {
	texture_id: "bworld:snow",
	has_collision: true,
});
