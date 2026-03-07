import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { ItemStack, PlayerInventory } from "../components/inventory.ts";

EverythingRegistry.register<TileRegistry>("tiles", "bworld:tree", {
	texture_id: "bworld:tree",
	has_collision: false,

	on_click(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerInventory)!;
		const maybe_item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (maybe_item && maybe_item.type_id === "bworld:axe") {
			tile.id = "bworld:grass";
			player_inventory.container.add_item(new ItemStack("bworld:log", 7));
		}
	},
});
