import { System } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { point_inside_rec } from "$/common/utils.ts";
import { ClientWorld } from "$/client/client_world.ts";
import { UIButton } from "$/client/components/ui_components.ts";
import { InputManager } from "$/client/input_manager.ts";

export class UIInteractionSystem implements System {
	update(world: ClientWorld, _delta: number) {
		// TODO: dont like
		if (InputManager.is_key_pressed("Escape")) {
			world.paused = !world.paused;
		}

		if (!world.paused) {
			return;
		}

		const mouse = InputManager.get_mouse_position();

		for (const entity of world.get_entities()) {
			const position = entity.get(Position);
			const button = entity.get(UIButton);

			if (position && button) {
				const hovered = point_inside_rec(mouse.x, mouse.y, position.x, position.y, button.width, button.height);
				button.hovered = hovered;
				if (hovered && InputManager.is_mouse_pressed(0)) {
					InputManager.consume_mouse(0);
					button.on_click();
				}
			}
		}
	}
}
