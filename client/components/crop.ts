import { Entity, SerializableComponent } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { AssetManager } from "../assets.ts";
import { Sprite } from "./sprite.ts";
import { ClickableSprite } from "./clickable.ts";
import { EverythingRegistry } from "$/common/everything_registry.ts";

interface CropsRegistry {
	total_stages: number;
	time_to_grow: number[];
	item_drop: string;
	sprite_ids: string[];
}

EverythingRegistry.add_registry("crops");
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
});

export class Crop extends SerializableComponent {
	crop_id: string;
	current_stage = 0;
	growth_time = 0;
	total_stages: number;
	time_to_grow: number[];
	item_drop: string;

	// you know ["bworld:carrot_seeds", "bworld:carrot_stage_1", "bworld:carrot_stage_2" ...]
	sprite_ids: string[];

	constructor(
		crop_id: string,
	) {
		super();
		this.crop_id = crop_id;
		const crop_info = EverythingRegistry.get<CropsRegistry>("crops", crop_id);
		this.total_stages = crop_info.total_stages;
		this.time_to_grow = crop_info.time_to_grow;
		this.sprite_ids = crop_info.sprite_ids;
		this.item_drop = crop_info.item_drop;
	}

	override serialize() {
		return {
			crop_id: this.crop_id,
			current_stage: this.current_stage,
			growth_time: this.growth_time,
		};
	}

	static deserialize(data: ReturnType<Crop["serialize"]>): Crop {
		const crop = new Crop(data.crop_id);
		crop.current_stage = data.current_stage;
		crop.growth_time = data.growth_time;
		return crop;
	}
}

export function create_crop_entity(x: number, y: number, crop: Crop) {
	const crop_entity = new Entity("crop");
	crop_entity.add(new Position(x, y));
	crop_entity.add(new Sprite(AssetManager.instance.get("bworld:textures"), 32, 32, 0, 0, 16, 16));
	crop_entity.add(crop);
	crop_entity.add(
		new ClickableSprite(2),
	);
	return crop_entity;
}
