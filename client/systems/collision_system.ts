import { System } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { ClientWorld } from "../client_world.ts";
import { CollisionCuboid } from "$/client/components/collision.ts";
import { Velocity } from "$/common/components/velocity.ts";
import { Dimension } from "../components/dimension.ts";

export class CollisionSystem extends System {
	override update(world: ClientWorld, delta: number): void {
		for (const entity of world.get_entities()) {
			const position = entity.get(Position);
			const velocity = entity.get(Velocity);
			const cuboid = entity.get(CollisionCuboid);

			if (!position || !velocity || !cuboid) {
				continue;
			}

			velocity.vy += cuboid.gravity * delta;

			let new_position = position.clone();

			new_position.x += velocity.vx * delta;

			let collisions = this.check_collision(new_position, velocity, cuboid, world.dimension);

			cuboid.colliding_x = collisions.x;
			if (collisions.x !== 0) {
				velocity.vx = 0;
			}

			new_position = position.clone();

			new_position.y += velocity.vy * delta;

			collisions = this.check_collision(new_position, velocity, cuboid, world.dimension);

			cuboid.colliding_y = collisions.y;
			if (collisions.y !== 0) {
				velocity.vy = 0;
			}

			new_position = position.clone();

			new_position.z += velocity.vz * delta;

			collisions = this.check_collision(new_position, velocity, cuboid, world.dimension);

			cuboid.colliding_z = collisions.z;
			if (collisions.z !== 0) {
				velocity.vz = 0;
			}
		}
	}

	check_collision(
		position: Position,
		velocity: Velocity,
		cuboid: CollisionCuboid,
		dimension: Dimension,
	): { x: number; y: number; z: number } {
		const collisions = { x: 0, y: 0, z: 0 };

		const min_x = Math.floor(position.x - cuboid.width / 2);
		const max_x = Math.floor(position.x + cuboid.width / 2);
		const min_y = Math.floor(position.y);
		const max_y = Math.floor(position.y + cuboid.height);
		const min_z = Math.floor(position.z - cuboid.depth / 2);
		const max_z = Math.floor(position.z + cuboid.depth / 2);

		for (let x = min_x; x <= max_x; x++) {
			for (let y = min_y; y <= max_y; y++) {
				for (let z = min_z; z <= max_z; z++) {
					const block = dimension.get_block(x, y, z);
					if (block && block !== 0) {
						if (velocity.vx > 0) {
							collisions.x = -1;
						}
						if (velocity.vx < 0) {
							collisions.x = 1;
						}
						if (velocity.vy > 0) {
							collisions.y = -1;
						}
						if (velocity.vy < 0) {
							collisions.y = 1;
						}
						if (velocity.vz > 0) {
							collisions.z = -1;
						}
						if (velocity.vz < 0) {
							collisions.z = 1;
						}
					}
				}
			}
		}

		return collisions;
	}
}
