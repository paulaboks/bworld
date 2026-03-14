import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:snow", {
	texture_id: "bworld:snow",
	has_collision: true,
});
