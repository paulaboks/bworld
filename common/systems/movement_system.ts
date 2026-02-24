import { System, World } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { Velocity } from "$/common/components/velocity.ts";

export class MovementSystem extends System {
	update(world: World, delta: number): void {
		for (const entity of world.get_entities()) {
			const position = entity.get(Position);
			const velocity = entity.get(Velocity);

			if (position && velocity) {
				position.x += velocity.vx * delta;
				position.y += velocity.vy * delta;
				position.x = Math.round(position.x);
				position.y = Math.round(position.y);
			}
		}
	}
}
