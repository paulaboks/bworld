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
