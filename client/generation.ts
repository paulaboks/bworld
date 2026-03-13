import { Alea, create_noise_2d, NoiseFunction2D } from "@paulaboks/rng";
import { CHUNK_SIZE, Dimension } from "./components/dimension.ts";

type Biome =
	| "desert"
	| "plains"
	| "forest"
	| "jungle"
	| "tundra"
	| "taiga"
	| "snow"
	| "savanna"
	| "swamp";

function get_biome(temp: number, moisture: number): Biome {
	if (temp > 0.6) {
		if (moisture < -0.2) {
			return "desert";
		}
		if (moisture > 0.4) {
			return "jungle";
		}
		return "savanna";
	}
	if (temp > 0) {
		if (moisture > 0.5) {
			return "swamp";
		}
		if (moisture > 0) {
			return "forest";
		}
		return "plains";
	}
	if (temp > -0.5) {
		return "taiga";
	}
	return "tundra";
}

function get_surface_block(biome: Biome) {
	if (biome === "desert") {
		return "bworld:sand";
	} else if (biome === "tundra") {
		return "bworld:snow";
	}
	return "bworld:grass";
}

function biome_height_modifier(biome: Biome) {
	if (biome === "desert") {
		return 0.2;
	}
	if (biome === "plains") {
		return 0.4;
	}
	if (biome === "forest") {
		return 0.5;
	}
	if (biome === "jungle") {
		return 0.45;
	}
	if (biome === "taiga") {
		return 0.55;
	}
	if (biome === "tundra") {
		return 0.35;
	}
	if (biome === "savanna") {
		return 0.4;
	}
	if (biome === "swamp") {
		return 0.35;
	}

	return 0.4;
}

function fractal_noise(noise: NoiseFunction2D, x: number, y: number, octaves = 2) {
	let value = 0;
	let amp = 1;
	let freq = 1;
	let max = 0;
	for (let i = 0; i < octaves; i++) {
		value += noise(x * freq, y * freq) * amp;
		max += amp;
		amp *= 0.5;
		freq *= 2;
	}
	return value / max;
}

function get_terrain_height(base: number, biome: Biome, x: number, z: number, noise: NoiseFunction2D) {
	const biomeMod = biome_height_modifier(biome);

	const main = fractal_noise(noise, x * 0.003, z * 0.003) * 15;

	const detail = fractal_noise(noise, x * 0.01, z * 0.01) * 3;

	return Math.floor(base + biomeMod * 20 + main + detail);
}

function can_place_tree(tree_map: boolean[][], local_x: number, local_z: number) {
	const TREE_SPACING = 4;
	for (let dx = -TREE_SPACING; dx <= TREE_SPACING; dx++) {
		for (let dz = -TREE_SPACING; dz <= TREE_SPACING; dz++) {
			const nx = local_x + dx;
			const nz = local_z + dz;
			if (nx >= 0 && nx < CHUNK_SIZE && nz >= 0 && nz < CHUNK_SIZE && tree_map[nx][nz]) {
				return false;
			}
		}
	}
	return true;
}

function place_tree(dimension: Dimension, x: number, y: number, z: number, biome: Biome) {
	const height = Math.floor(Math.random() * 3) + (biome === "jungle" ? 8 : 4);
	const trunk_block = "bworld:log";
	const leaves_block = "bworld:leaves";

	// if (biome === "jungle") {
	// 	trunkBlock = "bworld:jungle_log";
	// 	leavesBlock = "bworld:jungle_leaves";
	// } else if (biome === "taiga") {
	// 	leavesBlock = "bworld:spruce_leaves";
	// }

	for (let i = 0; i < height; i++) {
		dimension.add_block({ x, y: y + i, z, id: trunk_block });
	}

	for (let dx = -2; dx <= 2; dx++) {
		for (let dz = -2; dz <= 2; dz++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) <= 3) {
					dimension.add_block({
						x: x + dx,
						y: y + height + dy,
						z: z + dz,
						id: leaves_block,
					});
				}
			}
		}
	}
}

const TREE_THRESHOLD: Record<Biome, number> = {
	forest: 0.5,
	jungle: 0.3,
	taiga: 0.6,
	plains: 0.95,
	desert: 1,
	tundra: 1,
	savanna: 0.65,
	swamp: 0.5,
	snow: 0.8,
};

function should_place_tree(feature_noise: NoiseFunction2D, biome: Biome, x: number, z: number) {
	const n = feature_noise(x * 0.1, z * 0.1);
	return n > (TREE_THRESHOLD[biome] ?? 0.8);
}

export function generate_chunk(dimension: Dimension, cx: number, cz: number, seed = "seed") {
	const height_noise = create_noise_2d(new Alea(seed + "_height"));
	const temp_noise = create_noise_2d(new Alea(seed + "_temp"));
	const moisture_noise = create_noise_2d(new Alea(seed + "_moisture"));
	const feature_noise = create_noise_2d(new Alea(seed + "_feature"));

	const biome_scale = 0.003;
	const terrain_scale = 0.01;

	const tree_map: boolean[][] = Array.from({ length: CHUNK_SIZE }, () => Array(CHUNK_SIZE).fill(false));

	for (let x = 0; x < CHUNK_SIZE; x++) {
		for (let z = 0; z < CHUNK_SIZE; z++) {
			const wx = cx * CHUNK_SIZE + x;
			const wz = cz * CHUNK_SIZE + z;

			const temp = temp_noise(wx * biome_scale, wz * biome_scale);
			const moisture = moisture_noise(wx * biome_scale, wz * biome_scale);
			const biome = get_biome(temp, moisture);

			const height_noise_value = fractal_noise(height_noise, wx * terrain_scale, wz * terrain_scale);
			const base_height = (height_noise_value + 1) * 15 + 50;
			const height = get_terrain_height(base_height, biome, wx, wz, height_noise);

			const surface_block = get_surface_block(biome);

			for (let y = 0; y <= height; y++) {
				let block = "bworld:stone";
				if (y === height) {
					block = surface_block;
				} else if (y > height - 4) {
					block = "bworld:dirt";
				}

				if (biome === "swamp" && y === height && Math.random() < 0.2) {
					block = "bworld:water";
				}

				dimension.add_block({ x: wx, y, z: wz, id: block });
			}

			if (should_place_tree(feature_noise, biome, wx, wz) && can_place_tree(tree_map, x, z)) {
				place_tree(dimension, wx, height + 1, wz, biome);
				tree_map[x][z] = true;
			}
		}
	}
}
