import { get_sprite_region } from "$/common/utils.ts";
import { Dimension } from "$/client/components/dimension.ts";
import { TEXTURE_SIZE, TILE_SIZE } from "$/common/constants.ts";
import { Camera, world_to_screen } from "$/client/components/camera.ts";

export function render_dimension(ctx: CanvasRenderingContext2D, tilemap: Dimension, camera: Camera) {
	ctx.save();

	for (const tile of tilemap.tiles) {
		const region = get_sprite_region(tile.id);

		const x = tile.x * TILE_SIZE;
		const y = tile.y * TILE_SIZE;

		const screen_position = world_to_screen(x, y, camera, ctx.canvas.width, ctx.canvas.height);
		if (
			screen_position.x + TILE_SIZE < 0 || screen_position.x > ctx.canvas.width ||
			screen_position.y + TILE_SIZE < 0 || screen_position.y > ctx.canvas.height
		) {
			continue;
		}

		ctx.drawImage(
			tilemap.image,
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

	ctx.restore();
}
