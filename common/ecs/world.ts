import type { Entity } from "./entity.ts";
import type { System } from "./system.ts";

export class World {
	entities = new Set<Entity>();
	systems = new Set<System>();
	tags = new Map<string, Entity[]>();

	add_entity(entity: Entity) {
		this.entities.add(entity);
	}

	add_system(system: System) {
		this.systems.add(system);
	}

	add_tag(tag: string, entities: Entity[]) {
		this.tags.set(tag, entities);
	}

	get_tag(tag: string) {
		return this.tags.get(tag);
	}

	update(delta: number) {
		for (const system of this.systems) {
			system.update(this, delta);
		}
	}

	get_entities() {
		return this.entities;
	}
}
