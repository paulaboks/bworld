import { Component } from "$/common/ecs/mod.ts";
import { KeyCode } from "$/client/input_manager.ts";

export class PlayerControls extends Component {
	move_speed: number = 100;

	// Keys
	move_up: KeyCode = "KeyW";
	move_down: KeyCode = "KeyS";
	move_left: KeyCode = "KeyA";
	move_right: KeyCode = "KeyD";

	open_inventory: KeyCode = "KeyE";

	open_debug: KeyCode = "F3";
}
