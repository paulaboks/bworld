import { Component } from "$/common/ecs/mod.ts";

export class Camera extends Component {
	x = 0;
	y = 0;
	z = 3;

	pitch = 0;
	yaw = 0;
	roll = 0;

	fov = Math.PI / 3;
	near = 0.1;
	far = 1000;
}

export function screen_to_world(
	screen_x: number,
	screen_y: number,
	camera: Camera,
	screen_width: number,
	screen_height: number,
) {
	// return {
	// 	x: (screen_x - screen_width / 2) / camera.zoom + camera.x,
	// 	y: (screen_y - screen_height / 2) / camera.zoom + camera.y,
	// };
}

export function world_to_screen(
	world_x: number,
	world_y: number,
	camera: Camera,
	screen_width: number,
	screen_height: number,
) {
	// return {
	// 	x: (world_x - camera.x) / camera.zoom + screen_width / 2,
	// 	y: (world_y - camera.y) / camera.zoom + screen_height / 2,
	// };
}
