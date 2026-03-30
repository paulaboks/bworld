import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { register_block_item } from "$/common/utils.ts";
import { Container, Inventory } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";
import { GuiChest } from "$/client/gui/gui_chest.ts";

interface TileChestData {
	inventory: Inventory;
}

const block = EverythingRegistry.register<BlockRegistry>("blocks", "bworld:chest", {
	id: "bworld:chest",
	textures: "bworld:planks",
	toughness: 8,
	requires_tool: false,
	tool_to_break: "axe",
	drop_table: "bworld:chest",

	has_collision: false,
	on_interact(dimension, block) {
		const [player] = dimension.world.get_tag("player")!;
		const player_component = player.get(PlayerComponent)!;
		const block_data = dimension.get_block_data<TileChestData>(block.x, block.y, block.z);
		if (block_data && block_data.data.inventory) {
			const gui = new GuiChest(block_data.data.inventory, player_component.player_inventory);
			player_component.screens.push(gui);
			return true;
		}
		return false;
	},
	on_create(dimension, block) {
		dimension.add_block_data({
			id: block.id,
			x: block.x,
			y: block.y,
			z: block.z,
			data: {
				inventory: new Inventory(new Container(9 * 3)),
			},
		});
	},
});

register_block_item(block);
