import type { Entity } from "./entity.ts";
import type { System } from "./system.ts";

export class World {
	#entities = new Set<Entity>();
	#entities_for_deletion = new Set<Entity>();

	#systems = new Map<string, Set<System>>();
	#tags = new Map<string, Entity[]>();
	#states = new Set<string>();

	#state: string = "";
	#new_state: string | undefined;

	constructor(initial_state: string) {
		this.#state = initial_state;
		this.add_state("*");
	}

	add_state(new_state: string) {
		this.#states.add(new_state);
		this.#systems.set(new_state, new Set());
	}

	add_entity(entity: Entity) {
		this.#entities.add(entity);
	}

	add_system(system: System, state: string) {
		console.assert(this.#states.has(state));
		this.#systems.get(state)!.add(system);
	}

	add_tag(tag: string, entities: Entity[]) {
		this.#tags.set(tag, entities);
	}

	get_tag(tag: string) {
		return this.#tags.get(tag);
	}

	update(delta: number) {
		for (const system of this.#systems.get("*") ?? []) {
			system.update(this, delta);
		}
		for (const system of this.#systems.get(this.#state) ?? []) {
			system.update(this, delta);
		}
		// should be faster than Set.prototype.difference lol
		for (const entity of this.#entities_for_deletion) {
			this.#entities.delete(entity);
		}
		if (this.#new_state) {
			this.#state = this.#new_state;
			this.#new_state = undefined;
		}
	}

	get_entities() {
		return this.#entities;
	}

	delete_entity(entity: Entity) {
		this.#entities_for_deletion.add(entity);
	}

	clear_entities() {
		for (const entity of this.#entities) {
			this.#entities_for_deletion.add(entity);
		}
	}

	get state() {
		return this.#state;
	}

	set state(new_state: string) {
		this.#new_state = new_state;
	}
}
