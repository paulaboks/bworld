import { System } from "$/common/ecs/mod.ts";
import { ClientWorld } from "../client_world.ts";
import { Dimension } from "../components/dimension.ts";
import { Camera, screen_to_world } from "../components/camera.ts";
import { InputManager } from "../input_manager.ts";
import { canvas } from "../renderer/mod.ts";
import { TICK_DELTA, TILE_SIZE } from "$/common/constants.ts";
import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { Position } from "$/common/components/position.ts";
import { distance_point_rectangle } from "../../common/utils.ts";

export class DimensionLogicSystem extends System {
	update(world: ClientWorld, delta: number): void {
		/*const dimension_entity = world.get_entities().values().find((ent) => ent.get(Dimension));
		const dimension = dimension_entity!.get(Dimension)!;

		dimension.second_timer += delta;
		dimension.tick_timer += delta;

		if (dimension.second_timer >= 1) {
			this.handle_second(world, dimension);
		}
		if (dimension.tick_timer >= TICK_DELTA) {
			this.handle_tick(world, dimension);
		}

		const [player] = world.get_tag("player")!;
		const player_position = player.get(Position)!;
		const camera = player.get(Camera)!;

		const mouse = InputManager.get_mouse_position();

		const world_mouse = screen_to_world(
			mouse.x,
			mouse.y,
			camera,
			canvas.width,
			canvas.height,
		);

		const tile_x = Math.floor(world_mouse.x / TILE_SIZE);
		const tile_y = Math.floor(world_mouse.y / TILE_SIZE);

		const tile = dimension.tiles.findLast((tile) => tile.x === tile_x && tile.y === tile_y);

		if (tile) {
			const tile_info = EverythingRegistry.get<TileRegistry>("blocks", tile.id);

			if (!tile_info) {
				return;
			}

			const distance_to_player = distance_point_rectangle(
				player_position.x + (72 / 2),
				player_position.y + (72 / 2),
				tile.x * TILE_SIZE,
				tile.y * TILE_SIZE,
				TILE_SIZE,
				TILE_SIZE,
			);
			if (distance_to_player > TILE_SIZE * 2) {
				return;
			}

			if (tile_info.on_interact || tile_info.on_click) {
				if (tile_info.on_interact && InputManager.is_mouse_pressed(2)) {
					InputManager.consume_mouse(2);
					tile_info.on_interact(world, tile);
				}
				if (tile_info.on_click && InputManager.is_mouse_pressed(0)) {
					InputManager.consume_mouse(0);
					tile_info.on_click(world, tile);
				}
			}
		}*/
	}
	handle_second(world: ClientWorld, dimension: Dimension) {
		const tickables = dimension.blocks.filter((t) => t.tickable);
		for (const tickable of tickables) {
			const tile_info = EverythingRegistry.get<TileRegistry>("blocks", tickable.id);
			if (tile_info && tile_info.on_second) {
				tile_info.on_second(world, tickable, dimension.second_timer);
			}
		}
		dimension.second_timer = 0;
	}

	handle_tick(world: ClientWorld, dimension: Dimension) {
		const tickables = dimension.blocks.filter((t) => t.tickable);
		for (const tickable of tickables) {
			const tile_info = EverythingRegistry.get<TileRegistry>("blocks", tickable.id);
			if (tile_info && tile_info.on_tick) {
				tile_info.on_tick(world, tickable, dimension.tick_timer);
			}
		}
		dimension.tick_timer = 0;
	}
}
