import { distance_point_point, get_sprite_region } from "$/common/utils.ts";
import { Chunk, CHUNK_SIZE, Dimension } from "$/client/components/dimension.ts";
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
		}
		render_chunk_opaque(chunk);
	}
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.depthMask(false);
	for (const chunk of dimension.chunks) {
		render_chunk_transparent(chunk);
	}
}

function render_chunk_opaque(chunk: Chunk) {
	if (!chunk.vertexBuffer || !chunk.vertexCount) {
		return;
	}

	flush_buffer(chunk.vertexBuffer, chunk.vertexCount);
}

function render_chunk_transparent(chunk: Chunk) {
	if (!chunk.vertexTransparentBuffer || !chunk.vertexTransparentCount) {
		return;
	}

	flush_buffer(chunk.vertexTransparentBuffer, chunk.vertexTransparentCount);
}

function make_chunk_mesh(chunk: Chunk, dimension: Dimension, camera: Camera) {
	const vertices: number[] = [];
	const transparent_vertices: number[] = [];
	let count = 0;
	let transparent_count = 0;
	const transparent_blocks: [
		number,
		number,
		number,
		number,
		number,
		boolean,
		boolean,
		boolean,
		boolean,
		boolean,
		boolean,
	][] = [];
	const blocks_registry = EverythingRegistry.get_registry<TileRegistry>("blocks");
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
		const front = show_face(wx, y, wz + 1);
		const back = show_face(wx, y, wz - 1);
		const left = show_face(wx - 1, y, wz);
		const right = show_face(wx + 1, y, wz);
		const top = show_face(wx, y + 1, wz);
		const bottom = show_face(wx, y - 1, wz);

		const region = get_sprite_region(texture_id);

		if (tile_info.transparent) {
			transparent_blocks.push([
				wx,
				y,
				wz,
				region.x * TEXTURE_SIZE,
				region.y * TEXTURE_SIZE,
				front,
				back,
				left,
				right,
				top,
				bottom,
			]);
		} else {
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
	}

	transparent_blocks.sort((a, b) => {
		const da = distance_point_point(a[0], a[1], a[2], camera.x, camera.y, camera.z);
		const db = distance_point_point(b[0], b[1], b[2], camera.x, camera.y, camera.z);

		return da - db;
	});

	for (const block of transparent_blocks) {
		transparent_count = push_cube_to_mesh(
			transparent_vertices,
			transparent_count,
			dimension.image,
			block[0],
			block[1],
			block[2],
			1,
			1,
			1,
			block[3],
			block[4],
			TEXTURE_SIZE,
			TEXTURE_SIZE,
			1,
			1,
			1,
			1,
			block[5],
			block[6],
			block[7],
			block[8],
			block[9],
			block[10],
		);
	}

	chunk.vertexBuffer = gl.createBuffer();
	chunk.vertexCount = count / 9;

	gl.bindBuffer(gl.ARRAY_BUFFER, chunk.vertexBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(vertices),
		gl.STATIC_DRAW,
	);

	chunk.vertexTransparentBuffer = gl.createBuffer();
	chunk.vertexTransparentCount = transparent_count / 9;

	gl.bindBuffer(gl.ARRAY_BUFFER, chunk.vertexTransparentBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(transparent_vertices),
		gl.STATIC_DRAW,
	);
}
