import { Component } from "$/common/ecs/mod.ts";
import { AssetManager } from "$/client/assets.ts";

export class Sprite extends Component {
	image: HTMLImageElement;
	width: number;
	height: number;
	source_x: number;
	source_y: number;
	source_width: number;
	source_height: number;
	flip_x = false;
	flip_y = false;

	constructor(
		image: HTMLImageElement | string,
		width: number,
		height: number,
		source_x = 0,
		source_y = 0,
		source_width = width,
		source_height = height,
	) {
		super();
		if (typeof image === "string") {
			this.image = AssetManager.instance.get<HTMLImageElement>(image);
		} else {
			this.image = image;
		}
		this.width = width;
		this.height = height;
		this.source_x = source_x;
		this.source_y = source_y;
		this.source_width = source_width;
		this.source_height = source_height;
	}
}

interface AnimatedSpritePiece {
	source_x: number[];
	source_y: number[];
	source_width: number;
	source_height: number;
	duration: number;
}

export class AnimatedSprite extends Component {
	image: HTMLImageElement;
	width: number;
	height: number;
	flip_x = false;
	flip_y = false;

	current_state: string;
	states: Record<string, AnimatedSpritePiece>;
	timer = 0;
	animation_frame = 0;

	constructor(
		image: HTMLImageElement | string,
		width: number,
		height: number,
		states: Record<string, AnimatedSpritePiece>,
		initial_state: string,
	) {
		super();
		if (typeof image === "string") {
			this.image = AssetManager.instance.get<HTMLImageElement>(image);
		} else {
			this.image = image;
		}
		this.width = width;
		this.height = height;

		this.states = states;
		this.current_state = initial_state;
	}

	set_state(state: string) {
		if (this.current_state !== state) {
			this.current_state = state;
			this.timer = 0;
			this.animation_frame = 0;
		}
	}
}
