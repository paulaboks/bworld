import { EverythingRegistry, ItemRegistry } from "$/common/everything_registry.ts";

export interface WateringCanData {
	water: number;
	max_water: number;
}

EverythingRegistry.register<ItemRegistry<WateringCanData>>("items", "bworld:watering_can", {
	texture_id: "bworld:watering_can",
	on_create(item) {
		item.data = { water: 0, max_water: 32 };
	},
	get_lore(item) {
		return `Water: ${item.data?.water}/${item.data?.max_water}`;
	},
});
