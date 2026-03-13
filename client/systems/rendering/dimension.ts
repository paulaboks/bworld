import { get_sprite_region } from "$/common/utils.ts";
import { Chunk, CHUNK_SIDE_SIZE, Dimension } from "$/client/components/dimension.ts";
import { TEXTURE_SIZE } from "$/common/constants.ts";
import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { push_cube } from "$/client/renderer/mod.ts";

export function render_dimension(dimension: Dimension /*, camera: Camera*/) {
	for (const chunk of dimension.chunks) {
		render_chunk(chunk, dimension);
	}
}

function render_chunk(chunk: Chunk, dimension: Dimension) {
	const blocks_registry = EverythingRegistry.get_registry<TileRegistry>("blocks");
	for (let i = 0; i < chunk.blocks.length; i += 1) {
		const block_nid = chunk.blocks[i];
		if (block_nid === 0) {
			continue;
		}
		const [x, y, z] = dimension.index_to_xyz(i);

		const wx = chunk.x * CHUNK_SIDE_SIZE + x;
		const wz = chunk.z * CHUNK_SIDE_SIZE + z;
		const front = dimension.get_block(wx, y, wz + 1) === 0;
		const back = dimension.get_block(wx, y, wz - 1) === 0;
		const left = dimension.get_block(wx - 1, y, wz) === 0;
		const right = dimension.get_block(wx + 1, y, wz) === 0;
		const top = dimension.get_block(wx, y + 1, wz) === 0;
		const bottom = dimension.get_block(wx, y - 1, wz) === 0;

		const tile_info = blocks_registry[block_nid];
		let texture_id = "bworld:missing";
		if (tile_info?.texture_id) {
			if (typeof tile_info.texture_id === "string") {
				texture_id = tile_info.texture_id;
			} else {
				// texture_id = tile_info.texture_id(tile);
			}
		}

		const region = get_sprite_region(texture_id);

		push_cube(
			dimension.image,
			wx,
			y,
			wz,
			1,
			1,
			1,
			region.x * TEXTURE_SIZE,
			region.y * TEXTURE_SIZE,
			TEXTURE_SIZE,
			TEXTURE_SIZE,
			1,
			1,
			1,
			1,
			front,
			back,
			left,
			right,
			top,
			bottom,
		);
	}
}
