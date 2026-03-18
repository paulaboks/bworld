import { System } from "$/common/ecs/mod.ts";
import { Velocity } from "$/common/components/velocity.ts";
import { InputManager } from "../input_manager.ts";
import { ClientWorld } from "../client_world.ts";
import { PlayerControls } from "../components/player_controls.ts";
import { Camera } from "../components/camera.ts";
import { Position } from "../../common/components/position.ts";
import { PlayerComponent } from "../player.ts";
import { GuiPlayerInventory } from "../gui/gui_player_inventory.ts";
import { CollisionCuboid } from "../components/collision.ts";

export class PlayerControlsSystem extends System {
	constructor() {
		super();
	}

	update(world: ClientWorld, _delta: number): void {
		const [player] = world.get_tag("player")!;
		const velocity = player.get(Velocity)!;
		const controls = player.get(PlayerControls)!;
		const player_component = player.get(PlayerComponent)!;
		const position = player.get(Position)!;
		const camera = player.get(Camera)!;

		let input_x = 0;
		let input_z = 0;

		if (InputManager.is_key_down(controls.move_left)) {
			input_x -= 1;
		}
		if (InputManager.is_key_down(controls.move_right)) {
			input_x += 1;
		}
		if (InputManager.is_key_down(controls.move_forward)) {
			input_z -= 1;
		}
		if (InputManager.is_key_down(controls.move_backwards)) {
			input_z += 1;
		}

		const size = Math.hypot(input_x, input_z);
		if (size > 0) {
			input_x /= size;
			input_z /= size;
		}

		const sin = Math.sin(camera.yaw);
		const cos = Math.cos(camera.yaw);

		const forwardX = sin;
		const forwardZ = cos;

		const rightX = cos;
		const rightZ = -sin;

		const speed_modifier = InputManager.is_key_down(controls.sprint_key) ? 1.75 : 1;

		velocity.vx = (forwardX * input_z + rightX * input_x) * controls.move_speed * speed_modifier;
		velocity.vz = (forwardZ * input_z + rightZ * input_x) * controls.move_speed * speed_modifier;

		const cuboid = player.get(CollisionCuboid);

		if (InputManager.is_key_down("Space") && cuboid?.colliding_y === 1) {
			velocity.vy += controls.jump_force;
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

		if (InputManager.is_key_pressed("F11")) {
			InputManager.toggle_fullscreen();
		}

		camera.x = position.x;
		camera.y = position.y + 1.69;
		camera.z = position.z;

		if (InputManager.is_mouse_grabbed()) {
			const mouse_delta = InputManager.get_mouse_delta();
			camera.yaw += -mouse_delta.x * 0.001;
			camera.pitch += -mouse_delta.y * 0.001;

			const limit = Math.PI / 2 - 0.01;
			camera.pitch = Math.max(-limit, Math.min(limit, camera.pitch));
		}

		InputManager.set_mouse_grabbed(player_component.screens.length === 0);

		const block = world.dimension.get_looked_block(world.dimension, camera);
		if (block) {
			if (InputManager.is_mouse_pressed(0)) {
				world.dimension.break_block(block.x, block.y, block.z);
			} else if (InputManager.is_mouse_pressed(2)) {
				const inventory = player_component.player_inventory;
				const hotbar_slot = inventory.container.get_slot(inventory.hotbar_selected);
				if (hotbar_slot.has_item()) {
					const FACE_OFFSETS = {
						top: { x: 0, y: 1, z: 0 },
						bottom: { x: 0, y: -1, z: 0 },
						north: { x: 0, y: 0, z: -1 },
						south: { x: 0, y: 0, z: 1 },
						west: { x: -1, y: 0, z: 0 },
						east: { x: 1, y: 0, z: 0 },
					};
					const offset = FACE_OFFSETS[block.face];
					world.dimension.add_block({
						x: block.x + offset.x,
						y: block.y + offset.y,
						z: block.z + offset.z,
						id: "bworld:glass",
					});
				}
			}
		}

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
