import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:water", {
	texture_id: "bworld:water",
	has_collision: false,
});
