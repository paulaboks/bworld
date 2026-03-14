import { Component } from "$/common/ecs/mod.ts";
import { KeyCode } from "$/client/input_manager.ts";

export class PlayerControls extends Component {
	move_speed: number = 5;

	// Keys
	move_forward: KeyCode = "KeyW";
	move_backwards: KeyCode = "KeyS";
	move_left: KeyCode = "KeyA";
	move_right: KeyCode = "KeyD";

	hotbar_1: KeyCode = "Digit1";
	hotbar_2: KeyCode = "Digit2";
	hotbar_3: KeyCode = "Digit3";
	hotbar_4: KeyCode = "Digit4";
	hotbar_5: KeyCode = "Digit5";
	hotbar_6: KeyCode = "Digit6";
	hotbar_7: KeyCode = "Digit7";
	hotbar_8: KeyCode = "Digit8";
	hotbar_9: KeyCode = "Digit9";

	open_inventory: KeyCode = "KeyE";

	open_debug: KeyCode = "F3";
}
