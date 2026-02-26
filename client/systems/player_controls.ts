import { System } from "$/common/ecs/mod.ts";
import { Velocity } from "$/common/components/velocity.ts";
import { InputManager } from "../input_manager.ts";
import { AnimatedSprite } from "../components/sprite.ts";
import { ClientWorld } from "../client_world.ts";
import { PlayerControls } from "../components/player_controls.ts";
import { PlayerInventory } from "../components/inventory.ts";
import { Camera } from "../components/camera.ts";
import { Position } from "../../common/components/position.ts";

export class PlayerControlsSystem extends System {
	constructor() {
		super();
	}

	update(world: ClientWorld, _delta: number): void {
		const [player] = world.get_tag("player")!;
		const velocity = player.get(Velocity)!;
		const controls = player.get(PlayerControls)!;
		const player_inventory = player.get(PlayerInventory)!;

		if (InputManager.is_key_down(controls.move_left)) {
			velocity.vx = -controls.move_speed;
		} else if (InputManager.is_key_down(controls.move_right)) {
			velocity.vx = controls.move_speed;
		} else {
			velocity.vx = 0;
		}

		if (InputManager.is_key_down(controls.move_up)) {
			velocity.vy = -controls.move_speed;
		} else if (InputManager.is_key_down(controls.move_down)) {
			velocity.vy = controls.move_speed;
		} else {
			velocity.vy = 0;
		}

		const animated_sprite = player.get(AnimatedSprite)!;

		if (
			InputManager.is_key_down(controls.move_up) || InputManager.is_key_down(controls.move_down) ||
			InputManager.is_key_down(controls.move_left) || InputManager.is_key_down(controls.move_right)
		) {
			animated_sprite.set_state("running");
		} else {
			animated_sprite.set_state("idle");
		}

		if (InputManager.is_key_down(controls.move_left)) {
			animated_sprite.flip_x = false;
		} else if (InputManager.is_key_down(controls.move_right)) {
			animated_sprite.flip_x = true;
		}

		if (InputManager.is_key_pressed(controls.open_inventory)) {
			const inventory = player.get(PlayerInventory)!;
			inventory.is_open = !inventory.is_open;
		}

		if (InputManager.is_key_pressed(controls.open_debug)) {
			world.debugging = !world.debugging;
		}

		const position = player.get(Position)!;
		const camera = player.get(Camera)!;

		camera.x = Math.round(position.x);
		camera.y = Math.round(position.y);

		const scroll = InputManager.get_wheel_delta();
		if (scroll > 0) {
			player_inventory.hotbar_selected = Math.min(8, player_inventory.hotbar_selected + 1);
		} else if (scroll < 0) {
			player_inventory.hotbar_selected = Math.max(0, player_inventory.hotbar_selected - 1);
		}

		// --- APPLY BOUNDS ---
		/*if (camera.bounds) {
			camera.x = Math.max(
				camera.bounds.min_x,
				Math.min(camera.x, camera.bounds.max_x),
			);

			camera.y = Math.max(
				camera.bounds.min_y,
				Math.min(camera.y, camera.bounds.max_y),
			);
		}*/
	}
}
