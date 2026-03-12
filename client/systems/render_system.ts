import { System } from "$/common/ecs/mod.ts";
import { World } from "$/common/ecs/world.ts";
import { Position } from "$/common/components/position.ts";
import { AnimatedSprite, Sprite } from "$/client/components/sprite.ts";
import { Dimension } from "../components/dimension.ts";
import { Camera } from "$/client/components/camera.ts";

import { render_animated_sprite, render_sprite } from "./rendering/sprites.ts";
import { render_dimension } from "./rendering/dimension.ts";
import { render_player_hotbar } from "./rendering/player.ts";
import { PlayerComponent } from "../player.ts";
import { begin_mode_3d, end_mode_3d } from "../renderer/core.ts";

export class RenderSystem extends System {
	constructor() {
		super();
	}

	update(world: World, _delta: number): void {
		const camera_entity = world.get_entities().values().find((e) => e.get(Camera));
		const camera = camera_entity?.get(Camera);

		if (!camera) {
			return;
		}

		begin_mode_3d(camera);

		for (const entity of world.get_entities()) {
			const dimension = entity.get(Dimension);

			if (dimension) {
				render_dimension(dimension /*, camera*/);
			}
		}

		end_mode_3d();

		for (const entity of world.get_entities()) {
			const position = entity.get(Position);

			const sprite = entity.get(Sprite);
			if (position && sprite) {
				render_sprite(sprite, position);
			}

			const animated_sprite = entity.get(AnimatedSprite);
			if (position && animated_sprite) {
				render_animated_sprite(animated_sprite, position);
			}

			const player_component = entity.get(PlayerComponent);
			if (player_component) {
				render_player_hotbar(player_component.player_inventory);
			}
		}
	}
}
