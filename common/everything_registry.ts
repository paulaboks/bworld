import { Block, Dimension } from "$/client/components/dimension.ts";
import { ItemStack } from "$/client/inventory.ts";

export class EverythingRegistry {
	static #key_to_id = new Map<string, Map<string, number>>();
	static #id_to_value = new Map<string, unknown[]>();

	static register<T>(registry: string, key: string, value: T) {
		if (!this.#key_to_id.has(registry)) {
			this.#key_to_id.set(registry, new Map());
			this.#id_to_value.set(registry, []);
		}

		const key_map = this.#key_to_id.get(registry)!;
		const values = this.#id_to_value.get(registry)!;

		const id = values.length + 1;

		key_map.set(key, id);
		values[id] = value;
	}

	static get<T>(registry: string, key: string): T | undefined {
		const id = this.#key_to_id.get(registry)?.get(key);
		if (id === undefined) {
			return undefined;
		}
		return this.#id_to_value.get(registry)?.[id] as T;
	}

	static get_id(registry: string, key: string): number | undefined {
		return this.#key_to_id.get(registry)?.get(key);
	}

	static get_full<T>(registry: string, key: string): [number, T] | undefined {
		const id = this.#key_to_id.get(registry)?.get(key);
		if (id === undefined) {
			return undefined;
		}
		return [id, this.#id_to_value.get(registry)?.[id] as T];
	}

	static get_by_id<T>(registry: string, id: number): T | undefined {
		return this.#id_to_value.get(registry)?.[id] as T;
	}

	static get_registry<T>(registry: string): T[] {
		return this.#id_to_value.get(registry) as T[];
	}
}

interface TextureSideTopBottom {
	top: string;
	bottom: string;
	side: string;
}

interface TextureFront {
	front: string;
	side: string;
}

export interface BlockRegistry<T = unknown | undefined> {
	textures: string | TextureSideTopBottom | TextureFront;
	transparent?: boolean;
	alpha?: number;

	has_collision: boolean;
	drop_table?: string;

	on_create?(dimension: Dimension, block: Block<T>): void;
	on_click?(dimension: Dimension, block: Block<T>): void;
	on_interact?(dimension: Dimension, block: Block<T>): void;
	on_tick?(dimension: Dimension, block: Block<T>, tick_delta: number): void;
	on_second?(dimension: Dimension, block: Block<T>, second_delta: number): void;
}

export interface ItemRegistry<T = unknown | undefined> {
	texture_id: string | ((item: ItemStack<T>) => string);
	on_create?(item: ItemStack<T>): void;
	get_lore?(item: ItemStack<T>): string;
}
