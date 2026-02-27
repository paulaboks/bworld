import { Component } from "$/common/ecs/mod.ts";

export class ClickableSprite extends Component {
	clicked = false;
	button: number;
	access_range: number;

	constructor(button: number = 0, access_range = 2) {
		super();
		this.button = button;
		this.access_range = access_range;
	}
}
