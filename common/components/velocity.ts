import { Component } from "$/common/ecs/component.ts";

export class Velocity extends Component {
	vx: number;
	vy: number;
	vz: number;

	constructor(vx: number, vy: number, vz = 0) {
		super();
		this.vx = vx;
		this.vy = vy;
		this.vz = vz;
	}
}
