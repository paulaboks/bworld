import { System } from "$/common/ecs/mod.ts";
import { ClientWorld } from "../client_world.ts";
import { Dimension } from "../components/dimension.ts";
import { Camera, screen_to_world } from "../components/camera.ts";
import { InputManager } from "../input_manager.ts";
import { canvas } from "../renderer.ts";
import { TILE_SIZE } from "$/common/constants.ts";
import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";

export class DimensionLogicSystem extends System {
	update(world: ClientWorld, _delta: number): void {
		const dimension_entity = world.get_entities().values().find((ent) => ent.get(Dimension));
		const dimension = dimension_entity!.get(Dimension)!;

		const [player] = world.get_tag("player")!;
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
			const tile_info = EverythingRegistry.get<TileRegistry>("tiles", tile.id);

			if (!tile_info) {
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
		}

		/*for (const tile of dimension.tiles) {
			const tile_info = EverythingRegistry.get<TileRegistry>("tiles", tile.id);
			if (!tile_info) {
				continue;
			}

			if (tile_info.on_interact || tile_info.on_click) {
				console.log(tile_info);
				const hovered = point_inside_rec(
					world_mouse.x,
					world_mouse.y,
					tile.x * TILE_SIZE,
					tile.y * TILE_SIZE,
					TILE_SIZE,
					TILE_SIZE,
				);
				if (tile_info.on_interact && hovered && InputManager.is_mouse_pressed(2)) {
					InputManager.consume_mouse(2);
					tile_info.on_interact(world, tile);
				}
				if (tile_info.on_click && hovered && InputManager.is_mouse_pressed(0)) {
					InputManager.consume_mouse(0);
					tile_info.on_click(world, tile);
				}
			}
		}*/
	}
}
