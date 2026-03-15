/// <reference lib="webworker" />

import type { BlockRegistry } from "$/common/everything_registry.ts";
import type { SpriteRegion } from "$/common/constants.ts";
import {
	push_back_face,
	push_bottom_face,
	push_front_face,
	push_left_face,
	push_right_face,
	push_top_face,
} from "../renderer/models.ts";
import type { Texture } from "../renderer/types.ts";

type TexturesInfo = Record<string, SpriteRegion>;

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 128;
const TEXTURE_SIZE = 16;

const FACE_PUSHING_FUNCTIONS = {
	top: push_top_face,
	bottom: push_bottom_face,
	front: push_front_face,
	back: push_back_face,
	left: push_left_face,
	right: push_right_face,
} as const;

self.onmessage = (event) => {
	const { chunk_x, chunk_z, padded_chunk, blocks_registry, textures_info, image } = event.data;
	const [vertices, count] = make_chunk_mesh(chunk_x, chunk_z, padded_chunk, blocks_registry, textures_info, image);
	self.postMessage({ vertices, count, chunk_x, chunk_z }, [vertices.buffer]);
};

function make_chunk_mesh(
	chunk_x: number,
	chunk_z: number,
	padded_chunk: Int16Array,
	blocks_registry: BlockRegistry[],
	textures_info: TexturesInfo,
	image: Texture,
): [Float32Array, number] {
	let vertices = new Float32Array(2048);
	let count = 0;

	const size = CHUNK_SIZE + 2;
	const layer = size * size;

	const padded_index = (x: number, y: number, z: number) => {
		return y * layer + z * size + x;
	};

	const show_face = (block: number) => {
		if (block === 0) return true;
		const info = blocks_registry[block];
		return info?.transparent ?? false;
	};

	for (let y = 0; y < CHUNK_HEIGHT; y++) {
		for (let z = 0; z < CHUNK_SIZE; z++) {
			for (let x = 0; x < CHUNK_SIZE; x++) {
				const px = x + 1;
				const pz = z + 1;

				const block_nid = padded_chunk[padded_index(px, y, pz)];
				if (block_nid === 0) continue;

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
				if (!textures) throw new Error(`no textures for ${block_nid}`);

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

				const wx = chunk_x * CHUNK_SIZE + x;
				const wz = chunk_z * CHUNK_SIZE + z;

				const faces = {
					front: show_face(padded_chunk[padded_index(px, y, pz + 1)]),
					back: show_face(padded_chunk[padded_index(px, y, pz - 1)]),
					left: show_face(padded_chunk[padded_index(px - 1, y, pz)]),
					right: show_face(padded_chunk[padded_index(px + 1, y, pz)]),
					top: show_face(padded_chunk[padded_index(px, y + 1, pz)]),
					bottom: show_face(padded_chunk[padded_index(px, y - 1, pz)]),
				} as const;

				for (const side of ["front", "back", "left", "right", "top", "bottom"] as const) {
					if (faces[side]) {
						const region = textures_info[texture_ids[side]];

						vertices = ensure_capacity(vertices, count + (6 * 6 * 9));
						count = FACE_PUSHING_FUNCTIONS[side](
							vertices,
							count,
							image,
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
		}
	}

	return [vertices, count];
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
