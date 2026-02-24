import { System } from "$/common/ecs/mod.ts";
import { World } from "$/common/ecs/world.ts";
import { Position } from "$/common/components/position.ts";
import { AnimatedSprite, Sprite } from "$/client/components/sprite.ts";
import { Tilemap } from "$/client/components/tilemap.ts";
import { PlayerInventory } from "$/client/components/inventory.ts";
import { Camera } from "$/client/components/camera.ts";

import { render_animated_sprite, render_sprite } from "./rendering/sprites.ts";
import { render_tilemap } from "./rendering/tilemap.ts";
import { render_player_inventory } from "./rendering/player.ts";

export class RenderSystem extends System {
	ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		super();
		this.ctx = ctx;
	}

	update(world: World, _delta: number): void {
		this.ctx.save();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);

		const camera_entity = world.get_entities().values().find((e) => e.get(Camera)?.active);
		const camera = camera_entity?.get(Camera);

		if (!camera) {
			return;
		}

		for (const entity of world.get_entities()) {
			this.ctx.save();
			this.ctx.translate(
				Math.floor(this.ctx.canvas.width / 2),
				Math.floor(this.ctx.canvas.height / 2),
			);

			this.ctx.scale(camera.zoom, camera.zoom);

			this.ctx.translate(
				-Math.floor(camera.x),
				-Math.floor(camera.y),
			);

			const position = entity.get(Position);
			const sprite = entity.get(Sprite);

			if (sprite && position) {
				render_sprite(this.ctx, sprite, position);
			}

			const animated_sprite = entity.get(AnimatedSprite);

			if (animated_sprite && position) {
				render_animated_sprite(this.ctx, animated_sprite, position);
			}

			const tilemap = entity.get(Tilemap);

			if (tilemap) {
				render_tilemap(this.ctx, tilemap);
			}

			// Ui
			this.ctx.restore();

			const player_inventory = entity.get(PlayerInventory);

			if (player_inventory && player_inventory.is_open) {
				render_player_inventory(this.ctx, player_inventory);
			}
		}
	}
}
