import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { WateringCanData } from "../items/watering_can.ts";
import { PlayerComponent } from "../player.ts";

EverythingRegistry.register<TileRegistry>("tiles", "bworld:water", {
	texture_id: "bworld:water",
	has_collision: true,

	on_interact(world, _tile) {
		const [player] = world.get_tag("player")!;
		const player_inventory = player.get(PlayerComponent)!.player_inventory;
		const maybe_item = player_inventory.container.get_item(player_inventory.hotbar_selected);
		if (maybe_item && maybe_item.type_id === "bworld:watering_can") {
			const data = maybe_item.data as WateringCanData;
			data.water = data.max_water;
		}
	},
});
