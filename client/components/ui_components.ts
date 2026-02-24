import { Component } from "$/common/ecs/mod.ts";

export class UIButton extends Component {
	text: string;
	width: number;
	height: number;
	on_click: () => void;

	hovered = false;

	constructor(text: string, width: number, height: number, on_click: () => void) {
		super();
		this.text = text;
		this.width = width;
		this.height = height;
		this.on_click = on_click;
	}
}
