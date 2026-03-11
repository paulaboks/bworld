import { get_sprite_region } from "$/common/utils.ts";
import { Dimension } from "$/client/components/dimension.ts";
import { TEXTURE_SIZE, TILE_SIZE } from "$/common/constants.ts";
import { Camera, world_to_screen } from "$/client/components/camera.ts";
import { canvas, draw_texture_region } from "$/client/renderer/mod.ts";
import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";

export function render_dimension(dimension: Dimension, camera: Camera) {
	for (const tile of dimension.tiles) {
		const x = tile.x * TILE_SIZE;
		const y = tile.y * TILE_SIZE;

		const screen_position = world_to_screen(x, y, camera, canvas.width, canvas.height);
		if (
			screen_position.x + TILE_SIZE < 0 || screen_position.x > canvas.width ||
			screen_position.y + TILE_SIZE < 0 || screen_position.y > canvas.height
		) {
			continue;
		}

		let texture_id = tile.id;
		const tile_info = EverythingRegistry.get<TileRegistry>("tiles", tile.id);
		if (tile_info?.texture_id) {
			if (typeof tile_info.texture_id === "string") {
				texture_id = tile_info.texture_id;
			} else {
				texture_id = tile_info.texture_id(tile);
			}
		}

		const region = get_sprite_region(texture_id);

		draw_texture_region(
			dimension.image,
			region.x * TEXTURE_SIZE,
			region.y * TEXTURE_SIZE,
			TEXTURE_SIZE,
			TEXTURE_SIZE,
			x,
			y,
			TILE_SIZE,
			TILE_SIZE,
		);
	}
}
