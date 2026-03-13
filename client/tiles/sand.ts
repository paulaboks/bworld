import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<TileRegistry>("blocks", "bworld:sand", {
	texture_id: "bworld:sand",
	has_collision: true,
});
