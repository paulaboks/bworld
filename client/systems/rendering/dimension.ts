import { get_sprite_region } from "$/common/utils.ts";
import { Chunk, CHUNK_AREA, CHUNK_SIZE, Dimension } from "$/client/components/dimension.ts";
import { TEXTURE_SIZE } from "$/common/constants.ts";
import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import {
	flush_buffer,
	gl,
	push_back_face,
	push_bottom_face,
	push_front_face,
	push_left_face,
	push_right_face,
	push_top_face,
	set_current_texture,
} from "$/client/renderer/mod.ts";
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

const FACE_PUSHING_FUNCTIONS = {
	top: push_top_face,
	bottom: push_bottom_face,
	front: push_front_face,
	back: push_back_face,
	left: push_left_face,
	right: push_right_face,
} as const;

function make_chunk_mesh(chunk: Chunk, dimension: Dimension, camera: Camera) {
	let vertices = new Float32Array(CHUNK_AREA * 24 * 6 * 9);
	let count = 0;
	const blocks_registry = EverythingRegistry.get_registry<BlockRegistry>("blocks");

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

		const block_info = blocks_registry[block_nid];

		const texture_ids = {
			top: "bworld:missing",
			bottom: "bworld:missing",
			front: "bworld:missing",
			back: "bworld:missing",
			left: "bworld:missing",
			right: "bworld:missing",
		};

		const textures = block_info.textures;
		if (!textures) {
			throw new Error(`no textures for ${block_nid}`);
		}

		if (typeof textures === "string") {
			texture_ids.top = textures;
			texture_ids.bottom = textures;
			texture_ids.front = textures;
			texture_ids.back = textures;
			texture_ids.left = textures;
			texture_ids.right = textures;
		} else if ("top" in textures && "bottom" in textures && "side" in textures) {
			texture_ids.top = textures.top;
			texture_ids.bottom = textures.bottom;
			texture_ids.front = textures.side;
			texture_ids.back = textures.side;
			texture_ids.left = textures.side;
			texture_ids.right = textures.side;
		} else if ("front" in textures && "side" in textures) {
			texture_ids.top = textures.side;
			texture_ids.bottom = textures.side;
			texture_ids.front = textures.front;
			texture_ids.back = textures.side;
			texture_ids.left = textures.side;
			texture_ids.right = textures.side;
		}

		const [x, y, z] = dimension.index_to_xyz(i);

		const wx = chunk.x * CHUNK_SIZE + x;
		const wz = chunk.z * CHUNK_SIZE + z;

		const faces = {
			front: show_face(wx, y, wz + 1),
			back: show_face(wx, y, wz - 1),
			left: show_face(wx - 1, y, wz),
			right: show_face(wx + 1, y, wz),
			top: show_face(wx, y + 1, wz),
			bottom: show_face(wx, y - 1, wz),
		} as const;

		for (const side of ["front", "back", "left", "right", "top", "bottom"] as const) {
			if (faces[side]) {
				const region = get_sprite_region(texture_ids[side]);

				vertices = ensure_capacity(vertices, count + (6 * 6 * 9));
				count = FACE_PUSHING_FUNCTIONS[side](
					vertices,
					count,
					dimension.image,
					wx,
					y,
					wz,
					region.x * TEXTURE_SIZE,
					region.y * TEXTURE_SIZE,
					TEXTURE_SIZE,
					TEXTURE_SIZE,
					1,
					1,
					1,
					1,
				);
			}
		}
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
