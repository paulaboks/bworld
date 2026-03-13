import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { ItemStack } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";

interface CropsRegistry {
	total_stages: number;
	time_to_grow: number[];
	item_drop: string;
	sprite_ids: string[];
	regrowable: boolean;
}

EverythingRegistry.register<CropsRegistry>("crops", "bworld:carrot", {
	total_stages: 5,
	time_to_grow: [60, 60 * 3, 60 * 3, 60 * 3],
	sprite_ids: [
		"bworld:carrot_seeds",
		"bworld:carrot_stage_1",
		"bworld:carrot_stage_2",
		"bworld:carrot_stage_3",
		"bworld:carrot_stage_4",
	],
	item_drop: "bworld:carrot",
	regrowable: false,
});
EverythingRegistry.register<CropsRegistry>("crops", "bworld:potato", {
	total_stages: 5,
	time_to_grow: [45, 60 * 2, 60 * 2, 60 * 2],
	sprite_ids: [
		"bworld:potato_seeds",
		"bworld:potato_stage_1",
		"bworld:potato_stage_2",
		"bworld:potato_stage_3",
		"bworld:potato_stage_4",
	],
	item_drop: "bworld:potato",
	regrowable: false,
});
EverythingRegistry.register<CropsRegistry>("crops", "bworld:tomato", {
	total_stages: 5,
	time_to_grow: [90, 60 * 2, 60 * 2, 60 * 3],
	sprite_ids: [
		"bworld:tomato_seeds",
		"bworld:tomato_stage_1",
		"bworld:tomato_stage_2",
		"bworld:tomato_stage_3",
		"bworld:tomato_stage_4",
	],
	item_drop: "bworld:tomato",
	regrowable: true,
});
EverythingRegistry.register<CropsRegistry>("crops", "bworld:pumpkin", {
	total_stages: 5,
	time_to_grow: [60 * 2, 60 * 4, 60 * 4, 60 * 4],
	sprite_ids: [
		"bworld:pumpkin_seeds",
		"bworld:pumpkin_stage_1",
		"bworld:pumpkin_stage_2",
		"bworld:pumpkin_stage_3",
		"bworld:pumpkin_stage_4",
	],
	item_drop: "bworld:pumpkin",
	regrowable: false,
});

interface TileCropData {
	current_stage: number;
	growth_time: number;
}

function create_crop_tile(crop_id: string) {
	const crop_info = EverythingRegistry.get<CropsRegistry>("crops", crop_id);

	return {
		has_collision: false,
		on_create(_, tile) {
			tile.data = {
				current_stage: 0,
				growth_time: 0,
			};
		},
		texture_id(tile) {
			return crop_info.sprite_ids[tile.data!.current_stage];
		},
		on_click(world, tile) {
			const [player] = world.get_tag("player")!;
			const player_inventory = player.get(PlayerComponent)!.player_inventory;
			const item = player_inventory.container.get_item(player_inventory.hotbar_selected);
			if (!item) {
				return;
			}

			if (item.type_id === "bworld:pickaxe") {
				world.dimension.delete_tile(world, tile);
			}
		},
		on_interact(world, tile) {
			if (tile.data!.current_stage + 1 !== crop_info.total_stages) {
				return;
			}
			const [player] = world.get_tag("player")!;
			const player_inventory = player.get(PlayerComponent)!.player_inventory;
			player_inventory.container.add_item(new ItemStack(crop_info.item_drop));
			if (crop_info.regrowable) {
				tile.data!.current_stage -= 1;
			} else {
				world.dimension.delete_tile(world, tile);
			}
		},
		on_second(_, tile, delta) {
			const crop = tile.data!;
			// finished growing
			if (crop.current_stage + 1 === crop_info.total_stages) {
				return;
			}

			// grow !
			crop.growth_time += delta;
			if (crop.growth_time >= crop_info.time_to_grow[crop.current_stage]) {
				crop.current_stage += 1;
				crop.growth_time = 0;
			}
		},
	} as TileRegistry<TileCropData>;
}

EverythingRegistry.register<TileRegistry<TileCropData>>(
	"blocks",
	"bworld:tomato_crop",
	create_crop_tile("bworld:tomato"),
);
EverythingRegistry.register<TileRegistry<TileCropData>>(
	"blocks",
	"bworld:carrot_crop",
	create_crop_tile("bworld:carrot"),
);
EverythingRegistry.register<TileRegistry<TileCropData>>(
	"blocks",
	"bworld:potato_crop",
	create_crop_tile("bworld:potato"),
);
EverythingRegistry.register<TileRegistry<TileCropData>>(
	"blocks",
	"bworld:pumpkin_crop",
	create_crop_tile("bworld:pumpkin"),
);
