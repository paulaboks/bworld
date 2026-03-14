import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:sand", {
	texture_id: "bworld:sand",
	has_collision: true,
});
