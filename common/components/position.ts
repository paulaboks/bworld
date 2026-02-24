import { Component } from "$/common/ecs/component.ts";

export class Position extends Component {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		super();
		this.x = x;
		this.y = y;
	}
}
