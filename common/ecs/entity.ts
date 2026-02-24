import type { Component } from "./component.ts";

// deno-lint-ignore no-explicit-any
type ComponentConstructor<T extends Component> = new (...args: any[]) => T;

export class Entity {
	id: string;
	// deno-lint-ignore no-explicit-any
	components = new Map<ComponentConstructor<any>, Component>();
	active = true;

	constructor(id: string = crypto.randomUUID()) {
		this.id = id;
	}

	add<T extends Component>(component: T): T {
		this.components.set(component.constructor as ComponentConstructor<T>, component);
		return component;
	}

	get<T extends Component>(type: ComponentConstructor<T>): T | undefined {
		return this.components.get(type) as T;
	}

	get_all(): Iterable<Component> {
		return this.components.values();
	}
}
