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

export function screen_to_world(
	screen_x: number,
	screen_y: number,
	camera: Camera,
	screen_width: number,
	screen_height: number,
) {
	return {
		x: (screen_x - screen_width / 2) / camera.zoom + camera.x,
		y: (screen_y - screen_height / 2) / camera.zoom + camera.y,
	};
}
