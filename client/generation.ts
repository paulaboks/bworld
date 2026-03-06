import { Alea, create_noise_2d } from "@paulaboks/rng";

import { Dimension } from "./components/dimension.ts";

export function generate(dimension: Dimension, width: number, height: number, seed = "seed") {
	const height_noise = create_noise_2d(new Alea(seed + "_height"));
	const tree_noise = create_noise_2d(new Alea(seed + "_trees"));

	const scale = 0.05;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			// multi-octave terrain
			const nx = x * scale;
			const ny = y * scale;

			let h = height_noise(nx, ny) * 1 + height_noise(nx * 2, ny * 2) * 0.5 + height_noise(nx * 4, ny * 4) * 0.25;

			h /= 1.75; // normalize

			let id = "bworld:grass";

			if (h < -0.25) {
				id = "bworld:water";
			} else if (h < -0.15) {
				id = "bworld:sand";
			} else {
				id = "bworld:grass";
			}

			dimension.tiles.push({ x, y, id });

			// tree placement
			if (id === "bworld:grass") {
				const t = tree_noise(x * 0.12, y * 0.12);

				if (t > 0.65) {
					dimension.tiles.push({
						x,
						y,
						id: "bworld:tree",
					});
				}
			}
		}
	}
}
