import { Component } from "$/common/ecs/mod.ts";

export class CollisionCuboid extends Component {
	width: number;
	height: number;
	depth: number;
	gravity: number;

	colliding_x: number = 0;
	colliding_y: number = 0;
	colliding_z: number = 0;

	constructor(width: number, height: number, depth: number, gravity = -15.8) {
		super();
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.gravity = gravity;
	}
}
