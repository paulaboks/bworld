import { Component } from "$/common/ecs/mod.ts";
import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";
import { Faces } from "../../common/constants.ts";
import { AssetManager } from "../assets.ts";
import { ClientWorld } from "../client_world.ts";
import { generate_chunk } from "../generation.ts";
import { ItemStack } from "../inventory.ts";
import { PlayerComponent } from "../player.ts";
import { gl, Texture } from "../renderer/mod.ts";
import { Camera } from "./camera.ts";

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
	blocks: Int16Array;
	generated: boolean;
	dirty: boolean;
	opaque_vertex_buffer?: WebGLBuffer;
	opaque_vertex_count?: number;
	transparent_vertex_buffer?: WebGLBuffer;
	transparent_vertex_count?: number;
}

export class Dimension extends Component {
	world: ClientWorld;
	image: Texture = AssetManager.instance.get("bworld:textures");
	chunks: Chunk[] = [];
	second_timer = 0;
	tick_timer = 0;

	constructor(world: ClientWorld) {
		super();
		this.world = world;
	}

	add_chunk(x: number, z: number) {
		const chunk = { x, z, blocks: new Int16Array(CHUNK_AREA * CHUNK_HEIGHT), dirty: true, generated: false };
		this.chunks.push(chunk);
		return chunk;
	}

	get_chunk(x: number, z: number) {
		return this.chunks.find((chunk) => chunk.x === x && chunk.z === z);
	}

	add_block(block: Block) {
		const block_chunk_x = Math.floor(block.x / CHUNK_SIZE);
		const block_chunk_z = Math.floor(block.z / CHUNK_SIZE);
		let chunk = this.get_chunk(block_chunk_x, block_chunk_z);
		if (!chunk) {
			chunk = this.add_chunk(block_chunk_x, block_chunk_z);
		}

		const [nid, block_info] = EverythingRegistry.get_full<BlockRegistry>("blocks", block.id)!;

		const lx = block.x - block_chunk_x * CHUNK_SIZE;
		const lz = block.z - block_chunk_z * CHUNK_SIZE;
		const ly = block.y;

		const index = ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx;

		chunk.blocks[index] = nid;
		chunk.dirty = true;
		if (block_info?.on_create) {
			block_info?.on_create(this, block);
		}
	}

	get_block(x: number, y: number, z: number) {
		const chunk_x = Math.floor(x / CHUNK_SIZE);
		const chunk_z = Math.floor(z / CHUNK_SIZE);

		const chunk = this.get_chunk(chunk_x, chunk_z);

		if (!chunk) {
			return -1;
		}

		const lx = x - chunk_x * CHUNK_SIZE;
		const lz = z - chunk_z * CHUNK_SIZE;
		const ly = y;

		const index = ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx;

		return chunk.blocks[index];
	}

	break_block(x: number, y: number, z: number) {
		const block_chunk_x = Math.floor(x / CHUNK_SIZE);
		const block_chunk_z = Math.floor(z / CHUNK_SIZE);
		const chunk = this.get_chunk(block_chunk_x, block_chunk_z);
		if (!chunk) {
			return;
		}

		const block_info = EverythingRegistry.get_by_id<BlockRegistry>("blocks", this.get_block(x, y, z))!;

		if (block_info.drop_table) {
			const [player] = this.world.get_tag("player")!;
			const player_component = player.get(PlayerComponent)!;
			player_component.player_inventory.container.add_item(new ItemStack(block_info.drop_table));
		}

		const lx = x - block_chunk_x * CHUNK_SIZE;
		const lz = z - block_chunk_z * CHUNK_SIZE;
		const ly = y;

		const index = ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx;
		chunk.blocks[index] = 0;
		chunk.dirty = true;

		if (lx === 0) {
			const n = this.get_chunk(block_chunk_x - 1, block_chunk_z);
			if (n) {
				n.dirty = true;
			}
		} else if (lx === CHUNK_SIZE - 1) {
			const n = this.get_chunk(block_chunk_x + 1, block_chunk_z);
			if (n) {
				n.dirty = true;
			}
		}
		if (lz === 0) {
			const n = this.get_chunk(block_chunk_x, block_chunk_z - 1);
			if (n) {
				n.dirty = true;
			}
		} else if (lz === CHUNK_SIZE - 1) {
			const n = this.get_chunk(block_chunk_x, block_chunk_z + 1);
			if (n) {
				n.dirty = true;
			}
		}

		// if (block_info?.on_create) {
		// 	block_info?.on_create(this, block);
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
		const chunk = this.get_chunk(cx, cz);
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
			console.warn("Tried unloading a chunk that doesn't exist");
			return;
		}

		this.delete_chunk_mesh(this.chunks[chunk_i]);
		this.chunks.splice(chunk_i, 1);
	}

	delete_chunk_mesh(chunk: Chunk) {
		if (chunk.opaque_vertex_buffer) {
			gl.deleteBuffer(chunk.opaque_vertex_buffer);
		}
		if (chunk.transparent_vertex_buffer) {
			gl.deleteBuffer(chunk.transparent_vertex_buffer);
		}
	}

	get_looked_block(
		dimension: Dimension,
		camera: Camera,
		max_distance = 6,
		step = 0.05,
	): { x: number; y: number; z: number; block: number; face: Faces } | undefined {
		const yaw = camera.yaw;
		const pitch = camera.pitch;

		const cos_pitch = Math.cos(pitch);
		const dx = -Math.sin(yaw) * cos_pitch;
		const dy = Math.sin(pitch);
		const dz = -Math.cos(yaw) * cos_pitch;

		let x = camera.x;
		let y = camera.y;
		let z = camera.z;

		let prev_bx = Math.floor(x);
		let prev_by = Math.floor(y);
		let prev_bz = Math.floor(z);

		let dist = 0;

		while (dist <= max_distance) {
			x += dx * step;
			y += dy * step;
			z += dz * step;
			dist += step;

			const bx = Math.floor(x);
			const by = Math.floor(y);
			const bz = Math.floor(z);

			if (bx === prev_bx && by === prev_by && bz === prev_bz) {
				continue;
			}

			const block = dimension.get_block(bx, by, bz);

			if (block && block !== 0 && block !== -1) {
				let face: Faces;

				if (bx > prev_bx) {
					face = "west";
				} else if (bx < prev_bx) {
					face = "east";
				} else if (by > prev_by) {
					face = "bottom";
				} else if (by < prev_by) {
					face = "top";
				} else if (bz > prev_bz) {
					face = "north";
				} else {
					face = "south";
				}

				return { x: bx, y: by, z: bz, face, block };
			}

			prev_bx = bx;
			prev_by = by;
			prev_bz = bz;
		}

		return undefined;
	}

	create_padded_chunk(chunk: Chunk) {
		const cx = chunk.x;
		const cz = chunk.z;

		const size = CHUNK_SIZE + 2;
		const padded = new Int16Array(size * size * CHUNK_HEIGHT);

		for (let y = 0; y < CHUNK_HEIGHT; y++) {
			for (let z = -1; z <= CHUNK_SIZE; z++) {
				for (let x = -1; x <= CHUNK_SIZE; x++) {
					let block: number;

					if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
						const index = y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
						block = chunk.blocks[index];
					} else {
						const wx = cx * CHUNK_SIZE + x;
						const wz = cz * CHUNK_SIZE + z;
						block = this.get_block(wx, y, wz) ?? 0;
					}

					const px = x + 1;
					const pz = z + 1;
					const pindex = y * size * size + pz * size + px;

					padded[pindex] = block;
				}
			}
		}

		return padded;
	}
}
