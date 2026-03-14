import { get_sprite_region } from "$/common/utils.ts";
import { Chunk, CHUNK_AREA, CHUNK_SIZE, Dimension } from "$/client/components/dimension.ts";
import { TEXTURE_SIZE } from "$/common/constants.ts";
import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { flush_buffer, gl, push_cube_to_mesh, set_current_texture } from "$/client/renderer/mod.ts";
import { Camera } from "$/client/components/camera.ts";

export function render_dimension(dimension: Dimension, camera: Camera) {
	set_current_texture(dimension.image.tex);
	for (const chunk of dimension.chunks) {
		if (chunk.dirty) {
			dimension.delete_chunk_mesh(chunk);
			chunk.dirty = false;
			make_chunk_mesh(chunk, dimension, camera);
			// only generate one mesh per frame
			break;
		}
	}
	for (const chunk of dimension.chunks) {
		render_chunk_opaque(chunk);
	}
}

function render_chunk_opaque(chunk: Chunk) {
	if (!chunk.vertex_buffer || !chunk.vertex_count) {
		return;
	}

	flush_buffer(chunk.vertex_buffer, chunk.vertex_count);
}

function make_chunk_mesh(chunk: Chunk, dimension: Dimension, camera: Camera) {
	let vertices = new Float32Array(CHUNK_AREA * 24 * 6 * 9);
	let count = 0;
	const blocks_registry = EverythingRegistry.get_registry<TileRegistry>("blocks");

	const show_face = (x: number, y: number, z: number) => {
		const block = dimension.get_block(x, y, z);
		if (block === -1) {
			return false;
		}
		if (block === 0) {
			return true;
		}
		const block_info = blocks_registry[block];
		if (block_info?.transparent) {
			return true;
		}
		return false;
	};

	for (let i = 0; i < chunk.blocks.length; i += 1) {
		const block_nid = chunk.blocks[i];
		if (block_nid === 0) {
			continue;
		}

		const tile_info = blocks_registry[block_nid];

		let texture_id = "bworld:missing";
		if (tile_info?.texture_id) {
			if (typeof tile_info.texture_id === "string") {
				texture_id = tile_info.texture_id;
			} else {
				// texture_id = tile_info.texture_id(tile);
			}
		}

		const [x, y, z] = dimension.index_to_xyz(i);

		const wx = chunk.x * CHUNK_SIZE + x;
		const wz = chunk.z * CHUNK_SIZE + z;

		const front = show_face(wx, y, wz + 1);
		const back = show_face(wx, y, wz - 1);
		const left = show_face(wx - 1, y, wz);
		const right = show_face(wx + 1, y, wz);
		const top = show_face(wx, y + 1, wz);
		const bottom = show_face(wx, y - 1, wz);

		const region = get_sprite_region(texture_id);

		vertices = ensure_capacity(vertices, count + (6 * 6 * 9));
		count = push_cube_to_mesh(
			vertices,
			count,
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

	chunk.vertex_buffer = gl.createBuffer();
	chunk.vertex_count = count / 9;

	gl.bindBuffer(gl.ARRAY_BUFFER, chunk.vertex_buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		vertices.subarray(0, count),
		gl.STATIC_DRAW,
	);
}

function ensure_capacity(
	buffer: Float32Array<ArrayBuffer>,
	required: number,
) {
	if (required <= buffer.length) return buffer;

	let new_length = buffer.length;
	while (new_length < required) {
		new_length *= 2;
	}

	const new_buffer = new Float32Array(new_length);
	new_buffer.set(buffer);
	return new_buffer;
}
