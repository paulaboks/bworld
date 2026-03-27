import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { Container, Inventory } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";
import { GuiChest } from "$/client/gui/gui_chest.ts";

interface TileChestData {
	inventory: Inventory;
}

EverythingRegistry.register<BlockRegistry>("blocks", "bworld:chest", {
	id: "bworld:chest",
	textures: "bworld:chest",
	toughness: 10,
	requires_tool: false,
	tool_to_break: "axe",

	has_collision: false,
	/*on_interact(dimension, tile) {
		const [player] = dimension.world.get_tag("player")!;
		const player_component = player.get(PlayerComponent)!;
		if (tile.data && tile.data.inventory) {
			player_component.screens.push(new GuiChest(tile.data.inventory, player_component.player_inventory));
		}
	},
	on_create(_, tile) {
		tile.data = { inventory: new Inventory(new Container(9 * 3)) };
	},*/
});
