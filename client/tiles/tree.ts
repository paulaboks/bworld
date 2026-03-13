import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { ItemStack } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";

EverythingRegistry.register<TileRegistry>("blocks", "bworld:tree", {
	texture_id: "bworld:tree",
	has_collision: false,

	on_click(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
		const maybe_item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (maybe_item && maybe_item.type_id === "bworld:axe") {
			tile.id = "bworld:grass";
			player_inventory.container.add_item(new ItemStack("bworld:log", 7));
		}
	},
});
