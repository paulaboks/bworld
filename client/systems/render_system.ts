import { System } from "$/common/ecs/mod.ts";
import { World } from "$/common/ecs/world.ts";
import { Position } from "$/common/components/position.ts";
import { AnimatedSprite, Sprite } from "$/client/components/sprite.ts";
import { Dimension } from "../components/dimension.ts";
import { PlayerInventory } from "$/client/components/inventory.ts";
import { Camera } from "$/client/components/camera.ts";

import { render_animated_sprite, render_sprite } from "./rendering/sprites.ts";
import { render_dimension } from "./rendering/dimension.ts";
import { render_player_hotbar, render_player_inventory } from "./rendering/player.ts";
import { begin_mode_2d, end_mode_2d } from "../renderer.ts";

export class RenderSystem extends System {
	constructor() {
		super();
	}

	update(world: World, _delta: number): void {
		const camera_entity = world.get_entities().values().find((e) => e.get(Camera)?.active);
		const camera = camera_entity?.get(Camera);

		if (!camera) {
			return;
		}

		begin_mode_2d(camera);

		for (const entity of world.get_entities()) {
			const position = entity.get(Position);
			const sprite = entity.get(Sprite);

			if (sprite && position) {
				render_sprite(sprite, position, camera);
			}

			const animated_sprite = entity.get(AnimatedSprite);

			if (animated_sprite && position) {
				render_animated_sprite(animated_sprite, position, camera);
			}

			const dimension = entity.get(Dimension);

			if (dimension) {
				render_dimension(dimension, camera);
			}
		}

		end_mode_2d();

		for (const entity of world.get_entities()) {
			const player_inventory = entity.get(PlayerInventory);

			if (player_inventory) {
				render_player_hotbar(player_inventory);
				if (player_inventory.is_open) {
					render_player_inventory(player_inventory);
				}
			}
		}
	}
}
