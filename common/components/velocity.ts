import { Component } from "$/common/ecs/component.ts";

export class Velocity extends Component {
	vx: number;
	vy: number;

	constructor(vx: number, vy: number) {
		super();
		this.vx = vx;
		this.vy = vy;
	}
}
