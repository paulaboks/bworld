import { System } from "$/common/ecs/mod.ts";
import { Velocity } from "$/common/components/velocity.ts";
import { InputManager } from "../input_manager.ts";
import { AnimatedSprite } from "../components/sprite.ts";
import { ClientWorld } from "../client_world.ts";
import { PlayerControls } from "../components/player_controls.ts";
import { Camera } from "../components/camera.ts";
import { Position } from "../../common/components/position.ts";
import { canvas } from "../renderer.ts";
import { PlayerComponent } from "../player.ts";
import { GuiPlayerInventory } from "../gui/gui_player_inventory.ts";

export class PlayerControlsSystem extends System {
	constructor() {
		super();
	}

	update(world: ClientWorld, _delta: number): void {
		const [player] = world.get_tag("player")!;
		const velocity = player.get(Velocity)!;
		const controls = player.get(PlayerControls)!;
		const player_component = player.get(PlayerComponent)!;

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
			if (player_component.screens.length === 0) {
				player_component.screens.push(new GuiPlayerInventory(player_component.player_inventory));
			} else {
				player_component.pop_screen();
			}
		}

		if (InputManager.is_key_pressed(controls.open_debug)) {
			world.debugging = !world.debugging;
		}

		const position = player.get(Position)!;
		const camera = player.get(Camera)!;

		camera.x = Math.round(position.x);
		camera.y = Math.round(position.y);
		camera.offset_x = Math.floor(canvas.width / 2);
		camera.offset_y = Math.floor(canvas.height / 2);

		if (player_component.screens.length === 0) {
			const player_inventory = player_component.player_inventory;
			const scroll = InputManager.get_wheel_delta();
			if (scroll > 0) {
				player_inventory.hotbar_selected = Math.min(8, player_inventory.hotbar_selected + 1);
			} else if (scroll < 0) {
				player_inventory.hotbar_selected = Math.max(0, player_inventory.hotbar_selected - 1);
			}

			if (InputManager.is_key_pressed(controls.hotbar_1)) {
				player_inventory.hotbar_selected = 0;
			} else if (InputManager.is_key_pressed(controls.hotbar_2)) {
				player_inventory.hotbar_selected = 1;
			} else if (InputManager.is_key_pressed(controls.hotbar_3)) {
				player_inventory.hotbar_selected = 2;
			} else if (InputManager.is_key_pressed(controls.hotbar_4)) {
				player_inventory.hotbar_selected = 3;
			} else if (InputManager.is_key_pressed(controls.hotbar_5)) {
				player_inventory.hotbar_selected = 4;
			} else if (InputManager.is_key_pressed(controls.hotbar_6)) {
				player_inventory.hotbar_selected = 5;
			} else if (InputManager.is_key_pressed(controls.hotbar_7)) {
				player_inventory.hotbar_selected = 6;
			} else if (InputManager.is_key_pressed(controls.hotbar_8)) {
				player_inventory.hotbar_selected = 7;
			} else if (InputManager.is_key_pressed(controls.hotbar_9)) {
				player_inventory.hotbar_selected = 8;
			}
		}
	}
}
