import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { Container, Inventory } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";
import { GuiChest } from "$/client/gui/gui_chest.ts";

interface TileChestData {
	inventory: Inventory;
}

EverythingRegistry.register<BlockRegistry<TileChestData>>("blocks", "bworld:chest", {
	texture_id: "bworld:chest",
	has_collision: false,

	on_interact(world, tile) {
		const [player] = world.get_tag("player")!;
		const player_component = player.get(PlayerComponent)!;
		if (tile.data && tile.data.inventory) {
			player_component.screens.push(new GuiChest(tile.data.inventory, player_component.player_inventory));
		}
	},
	on_create(_, tile) {
		tile.data = { inventory: new Inventory(new Container(9 * 3)) };
	},
});
