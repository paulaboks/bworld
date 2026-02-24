import { System } from "$/common/ecs/mod.ts";
import { point_inside_rec } from "$/common/utils.ts";
import { ClientWorld } from "$/client/client_world.ts";
import { Camera } from "$/client/components/camera.ts";
import { Tilemap } from "$/client/components/tilemap.ts";
import { DebugUI } from "$/client/debug_ui.ts";
import { InputManager } from "$/client/input_manager.ts";

export class TileEditorSystem extends System {
	constructor() {
		super();
	}

	update(world: ClientWorld, _delta: number): void {
		if (!world.debugging) {
			return;
		}

		DebugUI.ctx.save();
		DebugUI.ctx.setTransform(1, 0, 0, 1, 0, 0);

		const ctx = world.ctx;

		const camera_entity = world.get_entities().values().find((e) => e.get(Camera)?.active);
		const camera = camera_entity?.get(Camera);
		if (!camera) {
			return;
		}

		for (const entity of world.get_entities()) {
			const tilemap = entity.get(Tilemap);

			if (!tilemap) {
				continue;
			}

			const scaled_size = tilemap.tile_size * tilemap.scale;
			const mouse = InputManager.get_mouse_position();

			DebugUI.begin("Tile Editor", 500, 10, 300);
			DebugUI.progress_bar(0.5);

			if (DebugUI.button("Save")) {
				navigator.clipboard.writeText(JSON.stringify(tilemap));
			}

			for (let i = 0; i < tilemap.rows; i += 1) {
				for (let j = 0; j < tilemap.columns; j += 1) {
					const x = DebugUI.cursor_x + j * scaled_size;
					const y = DebugUI.cursor_y;

					const hovered = point_inside_rec(mouse.x, mouse.y, x, y, scaled_size, scaled_size);

					if (DebugUI.is_inside_windows(mouse.x, mouse.y) && hovered && InputManager.is_mouse_pressed(0)) {
						InputManager.consume_mouse(0);
						tilemap.selected_tile = i * tilemap.columns + j;
					}

					ctx.drawImage(
						tilemap.image,
						j * tilemap.tile_size + (j * tilemap.margin),
						i * tilemap.tile_size + (i * tilemap.margin),
						tilemap.tile_size,
						tilemap.tile_size,
						x,
						y,
						scaled_size,
						scaled_size,
					);
				}
				DebugUI.advance(scaled_size);
			}

			DebugUI.end();

			if (tilemap.editing) {
				const world_x = mouse.x + camera.x;
				const world_y = mouse.y + camera.y;

				const tx = Math.floor(world_x / (tilemap.tile_size * tilemap.scale));
				const ty = Math.floor(world_y / (tilemap.tile_size * tilemap.scale));
				if (InputManager.is_mouse_pressed(0)) {
					const maybe_tile = tilemap.tiles.find((tile) => tile.x === tx && tile.y === ty);
					if (maybe_tile?.index !== tilemap.selected_tile) {
						tilemap.tiles.push({ x: tx, y: ty, index: tilemap.selected_tile });
					}
				} else if (InputManager.is_mouse_pressed(1)) {
					InputManager.consume_mouse(1);
					const index = tilemap.tiles.findLastIndex((tile) => tile.x === tx && tile.y === ty);
					if (index !== -1) {
						tilemap.tiles.splice(index, 1);
					}
				}
			}
		}

		DebugUI.ctx.restore();
	}
}
