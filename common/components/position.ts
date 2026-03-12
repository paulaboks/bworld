import { Component } from "$/common/ecs/component.ts";

export class Position extends Component {
	x: number;
	y: number;
	z: number;

	constructor(x: number, y: number, z = 0) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
