import { System } from "$/common/ecs/mod.ts";
import { ClientWorld } from "../client_world.ts";
import { Position } from "../../common/components/position.ts";
import { CHUNK_SIZE } from "../components/dimension.ts";
import { PlayerComponent } from "$/client/player.ts";

export class WorldGenerationSystem extends System {
	constructor() {
		super();
	}

	update(world: ClientWorld, _delta: number): void {
		const [player] = world.get_tag("player")!;
		const position = player.get(Position)!;
		const player_component = player.get(PlayerComponent)!;
		const dimension = world.dimension;

		const player_chunk_x = Math.floor(position.x / CHUNK_SIZE);
		const player_chunk_z = Math.floor(position.z / CHUNK_SIZE);

		const render_distance = player_component.render_distance;

		for (const chunk of dimension.chunks) {
			if (Math.abs(chunk.x - player_chunk_x) > render_distance) {
				dimension.unload_chunk(chunk.x, chunk.z);
			}
			if (Math.abs(chunk.z - player_chunk_z) > render_distance) {
				dimension.unload_chunk(chunk.x, chunk.z);
			}
		}

		for (let i = player_chunk_x - render_distance; i <= player_chunk_x + render_distance; i += 1) {
			for (let j = player_chunk_z - render_distance; j <= player_chunk_z + render_distance; j += 1) {
				const maybe_chunk = dimension.chunks.find((chunk) => chunk.x === i && chunk.z === j);
				if (!maybe_chunk || !maybe_chunk.generated) {
					console.log("loading chunk", i, j);
					dimension.load_chunk(i, j);
					// only generate one chunk per frame
					return;
				}
			}
		}
	}
}
