import { Component, Entity } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { AssetManager } from "../assets.ts";
import { Sprite } from "./sprite.ts";
import { ClickableSprite } from "./clickable.ts";

export class Crop extends Component {
	current_stage = 0;
	growth_time = 0;
	total_stages: number;
	time_to_grow: number[];
	item_drop: string;

	// you know ["bworld:carrot_seeds", "bworld:carrot_stage_1", "bworld:carrot_stage_2" ...]
	sprite_ids: string[];

	constructor(total_stages: number, time_to_grow: number[], sprite_ids: string[], item_drop: string) {
		super();
		this.total_stages = total_stages;
		this.time_to_grow = time_to_grow;
		this.sprite_ids = sprite_ids;
		this.item_drop = item_drop;
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
