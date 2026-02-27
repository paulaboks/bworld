import { System } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { Sprite } from "../components/sprite.ts";
import { ClientWorld } from "../client_world.ts";
import { ClickableSprite } from "../components/clickable.ts";
import { point_inside_rec } from "$/common/utils.ts";
import { InputManager } from "../input_manager.ts";
import { Camera, screen_to_world } from "../components/camera.ts";

export class ClickableSystem extends System {
	update(world: ClientWorld, _delta: number): void {
		const [player] = world.get_tag("player")!;
		const camera = player.get(Camera)!;

		const mouse = InputManager.get_mouse_position();

		const world_mouse = screen_to_world(
			mouse.x,
			mouse.y,
			camera,
			world.canvas.width,
			world.canvas.height,
		);

		for (const entity of world.get_entities()) {
			const position = entity.get(Position);

			if (!position) {
				continue;
			}

			const clickable_sprite = entity.get(ClickableSprite);
			const sprite = entity.get(Sprite);

			if (clickable_sprite && sprite) {
				clickable_sprite.clicked = false;
				const hovered = point_inside_rec(
					world_mouse.x,
					world_mouse.y,
					position.x,
					position.y,
					sprite.width,
					sprite.height,
				);
				if (hovered && InputManager.is_mouse_pressed(clickable_sprite.button)) {
					InputManager.consume_mouse(clickable_sprite.button);
					clickable_sprite.clicked = true;
				}
			}
		}
	}
}
