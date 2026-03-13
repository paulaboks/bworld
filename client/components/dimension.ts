import { Component } from "$/common/ecs/mod.ts";
import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { AssetManager } from "../assets.ts";
import { ClientWorld } from "../client_world.ts";
import { generate_chunk } from "../generation.ts";
import { gl, Texture } from "../renderer/mod.ts";

export interface Block<T = unknown> {
	x: number;
	y: number;
	z: number;
	id: string;
	data?: T;
	tickable?: boolean;
}

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 128;
export const CHUNK_AREA = CHUNK_SIZE * CHUNK_SIZE;

export interface Chunk {
	x: number;
	z: number;
	blocks: Int32Array;
	generated: boolean;
	dirty: boolean;
	vertexBuffer?: WebGLBuffer;
	vertexCount?: number;
	vertexTransparentBuffer?: WebGLBuffer;
	vertexTransparentCount?: number;
}

export class Dimension extends Component {
	image: Texture = AssetManager.instance.get("bworld:textures");
	chunks: Chunk[] = [];
	second_timer = 0;
	tick_timer = 0;

	add_chunk(x: number, z: number) {
		const chunk = { x, z, blocks: new Int32Array(CHUNK_AREA * CHUNK_HEIGHT), dirty: true, generated: false };
		this.chunks.push(chunk);
		return chunk;
	}

	add_block(block: Block) {
		const block_chunk_x = Math.floor(block.x / CHUNK_SIZE);
		const block_chunk_z = Math.floor(block.z / CHUNK_SIZE);
		let chunk = this.chunks.find((chunk) => chunk.x === block_chunk_x && chunk.z === block_chunk_z);
		if (!chunk) {
			chunk = this.add_chunk(block_chunk_x, block_chunk_z);
		}

		const [nid, block_info] = EverythingRegistry.get_full<TileRegistry>("blocks", block.id)!;

		const lx = block.x - block_chunk_x * CHUNK_SIZE;
		const lz = block.z - block_chunk_z * CHUNK_SIZE;
		const ly = block.y;

		const index = ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx;

		chunk.blocks[index] = nid;
		if (block_info?.on_create) {
			block_info?.on_create(this, block);
		}
	}

	get_block(x: number, y: number, z: number) {
		const chunk_x = Math.floor(x / CHUNK_SIZE);
		const chunk_z = Math.floor(z / CHUNK_SIZE);

		const chunk = this.chunks.find(
			(c) => c.x === chunk_x && c.z === chunk_z,
		);

		if (!chunk) {
			return -1;
		}

		const lx = x - chunk_x * CHUNK_SIZE;
		const lz = z - chunk_z * CHUNK_SIZE;
		const ly = y;

		const index = ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx;

		return chunk.blocks[index];
	}

	delete_tile(_world: ClientWorld, _block: Block) {
		// const index = this.blocks.indexOf(tile);
		// if (index !== -1) {
		// 	this.blocks.splice(index, 1);
		// }

		// const tile_info = EverythingRegistry.get<TileRegistry>("blocks", tile.id);
		// if (tile_info?.on_delete) {
		// 	tile_info?.on_delete(world, tile);
		// }
	}

	index_to_xyz(index: number) {
		const y = Math.floor(index / CHUNK_AREA);
		const rem = index % CHUNK_AREA;

		const z = Math.floor(rem / CHUNK_SIZE);
		const x = rem % CHUNK_SIZE;

		return [x, y, z];
	}

	load_chunk(cx: number, cz: number) {
		generate_chunk(this, cx, cz);
		const chunk = this.chunks.find((c) => c.x === cx && c.z === cz);
		if (chunk) {
			chunk.generated = true;
			chunk.dirty = true;
		}

		const neighbors = [
			[cx - 1, cz],
			[cx + 1, cz],
			[cx, cz - 1],
			[cx, cz + 1],
		];

		for (const [nx, nz] of neighbors) {
			const neighbor = this.chunks.find((c) => c.x === nx && c.z === nz);
			if (neighbor && neighbor.generated) {
				neighbor.dirty = true;
			}
		}
	}

	unload_chunk(cx: number, cz: number) {
		const chunk_i = this.chunks.findIndex((c) => c.x === cx && c.z === cz);
		if (chunk_i === -1) {
			console.warn("Tried unloading a chunk that doesn't exist dumbass");
			return;
		}

		this.delete_chunk_mesh(this.chunks[chunk_i]);
		this.chunks.splice(chunk_i, 1);
	}

	delete_chunk_mesh(chunk: Chunk) {
		if (chunk.vertexBuffer) {
			gl.deleteBuffer(chunk.vertexBuffer);
		}
		if (chunk.vertexTransparentBuffer) {
			gl.deleteBuffer(chunk.vertexTransparentBuffer);
		}
	}
}
