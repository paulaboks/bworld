import { get_sprite_region } from "$/common/utils.ts";
import { Dimension } from "$/client/components/dimension.ts";
import { TEXTURE_SIZE } from "$/common/constants.ts";
import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { push_cube } from "$/client/renderer/mod.ts";

export function render_dimension(dimension: Dimension /*, camera: Camera*/) {
	for (const tile of dimension.tiles) {
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

		push_cube(
			dimension.image,
			tile.x,
			tile.y,
			tile.z,
			1,
			1,
			1,
			region.x * TEXTURE_SIZE,
			region.y * TEXTURE_SIZE,
			TEXTURE_SIZE,
			TEXTURE_SIZE,
		);
	}
}
