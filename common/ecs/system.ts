import type { World } from "./world.ts";

export abstract class System {
	abstract update(world: World, delta: number): void;
}
