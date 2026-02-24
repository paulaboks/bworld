import { Component } from "$/common/ecs/mod.ts";

export class Camera extends Component {
	active = true;
	x: number;
	y: number;
	zoom: number;

	constructor(x = 0, y = 0, zoom = 1) {
		super();
		this.x = x;
		this.y = y;
		this.zoom = zoom;
	}
}
