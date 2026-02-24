import { Tilemap } from "$/client/components/tilemap.ts";

export function render_tilemap(ctx: CanvasRenderingContext2D, tilemap: Tilemap) {
	ctx.save();
	ctx.translate(
		-Math.floor(ctx.canvas.width / 2),
		-Math.floor(ctx.canvas.height / 2),
	);

	for (const tile of tilemap.tiles) {
		const tx = tile.index % tilemap.columns;
		const ty = Math.floor(tile.index / tilemap.columns);
		const sx = tx * tilemap.tile_size + (tx * tilemap.margin);
		const sy = ty * tilemap.tile_size + (ty * tilemap.margin);

		ctx.drawImage(
			tilemap.image,
			sx,
			sy,
			tilemap.tile_size,
			tilemap.tile_size,
			tile.x * tilemap.tile_size * tilemap.scale,
			tile.y * tilemap.tile_size * tilemap.scale,
			tilemap.tile_size * tilemap.scale,
			tilemap.tile_size * tilemap.scale,
		);
	}

	ctx.restore();
}
