import { Block, Dimension } from "$/client/components/dimension.ts";
import { ItemStack } from "$/client/inventory.ts";

export class EverythingRegistry {
	static #key_to_id = new Map<string, Map<string, number>>();
	static #id_to_value = new Map<string, unknown[]>();

	static register<T>(registry: string, key: string, value: T): T {
		if (!this.#key_to_id.has(registry)) {
			this.#key_to_id.set(registry, new Map());
			this.#id_to_value.set(registry, []);
		}

		const key_map = this.#key_to_id.get(registry)!;
		const values = this.#id_to_value.get(registry)!;

		const id = values.length + 1;

		key_map.set(key, id);
		values[id] = value;

		return value;
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

export interface BlockStateDefinition {
	name: string;
	bits: number;
	default: number;
}

interface CompiledStateDefinition {
	name: string;
	mask: number;
	shift: number;
}

interface BlockStateVariant {
	model: string;
	y: number;
}

export interface BlockRegistry {
	id: string;
	textures: string | TextureSideTopBottom | TextureFront;
	transparent?: boolean;
	alpha?: number;

	has_collision: boolean;
	toughness?: number;
	requires_tool?: boolean;
	tool_to_break?: string;
	drop_table?: string;

	states?: BlockStateDefinition[];
	variants?: Record<string, BlockStateVariant>;

	on_create?(dimension: Dimension, block: Block): void;
	on_break?(dimension: Dimension, block: Block): void;
	on_click?(dimension: Dimension, block: Block): void;
	on_interact?(dimension: Dimension, block: Block): boolean;
	on_tick?(dimension: Dimension, block: Block, tick_delta: number): void;
	on_second?(dimension: Dimension, block: Block, second_delta: number): void;

	compiled_states?: CompiledStateDefinition[];
}

export interface ItemRegistry<T = unknown | undefined> {
	texture_id: string | ((item: ItemStack<T>) => string);
	block_id?: string;
	tool_type?: string;

	place?(dimension: Dimension, block: Block): void;

	on_create?(item: ItemStack<T>): void;

	get_lore?(item: ItemStack<T>): string;
}
