import { Alea, create_noise_2d } from "@paulaboks/rng";

import { Dimension } from "./components/dimension.ts";
import { ClientWorld } from "./client_world.ts";

export function generate(
	world: ClientWorld,
	dimension: Dimension,
	width: number,
	depth: number,
	max_height = 64,
	seed = "seed",
) {
	const height_noise = create_noise_2d(new Alea(seed + "_height"));

	const scale = 0.05;

	for (let z = 0; z < depth; z++) {
		for (let x = 0; x < width; x++) {
			const nx = x * scale;
			const nz = z * scale;

			// multi-octave terrain
			let h = height_noise(nx, nz) * 1 +
				height_noise(nx * 2, nz * 2) * 0.5 +
				height_noise(nx * 4, nz * 4) * 0.25;

			h /= 1.75;

			// convert noise to terrain height
			const terrain_height = Math.floor((h * 0.5 + 0.5) * max_height);

			for (let y = 0; y <= terrain_height; y++) {
				let id = "bworld:stone";

				// simple terrain layers
				if (y === terrain_height) {
					id = "bworld:leaves";
				} else if (y > terrain_height - 4) {
					id = "bworld:dirt";
				}

				dimension.add_block(world, { x, y, z, id });
			}
		}
	}
}
