import { System } from "$/common/ecs/mod.ts";
import { ClientWorld } from "../client_world.ts";
import { Dimension } from "../components/dimension.ts";
import { TICK_DELTA } from "$/common/constants.ts";
import { BlockRegistry, EverythingRegistry } from "$/common/everything_registry.ts";

export class DimensionLogicSystem extends System {
	update(world: ClientWorld, delta: number): void {
		const dimension = world.dimension;

		dimension.second_timer += delta;
		dimension.tick_timer += delta;

		if (dimension.second_timer >= 1) {
			this.handle_second(world, dimension);
		}
		if (dimension.tick_timer >= TICK_DELTA) {
			this.handle_tick(world, dimension);
		}
	}
	handle_second(world: ClientWorld, dimension: Dimension) {
		for (const chunk of dimension.chunks) {
			for (const tickable of chunk.blocks_data) {
				const tile_info = EverythingRegistry.get<BlockRegistry>("blocks", tickable.id);
				if (tile_info && tile_info.on_second) {
					tile_info.on_second(world.dimension, tickable, dimension.second_timer);
				}
			}
		}
		dimension.second_timer = 0;
	}

	handle_tick(world: ClientWorld, dimension: Dimension) {
		for (const chunk of dimension.chunks) {
			for (const tickable of chunk.blocks_data) {
				const tile_info = EverythingRegistry.get<BlockRegistry>("blocks", tickable.id);
				if (tile_info && tile_info.on_tick) {
					tile_info.on_tick(world.dimension, tickable, dimension.tick_timer);
				}
			}
		}
		dimension.tick_timer = 0;
	}
}
