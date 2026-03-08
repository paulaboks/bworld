import { ClientWorld } from "../client/client_world.ts";
import { Tile } from "../client/components/dimension.ts";
import { ItemStack } from "../client/components/inventory.ts";

export class EverythingRegistry {
	static #registries = new Map<string, Map<string, unknown>>();

	static add_registry(name: string) {
		this.#registries.set(name, new Map());
	}

	static register<T>(registry_name: string, key: string, value: T) {
		this.#registries.get(registry_name)?.set(key, value);
	}

	static get<T>(registry_name: string, key: string): T {
		return this.#registries.get(registry_name)?.get(key) as T;
	}
}

export interface TileRegistry<T = unknown | undefined> {
	texture_id: string | ((tile: Tile<T>) => string);
	has_collision: boolean;

	on_create?(world: ClientWorld, tile: Tile<T>): void;
	on_click?(world: ClientWorld, tile: Tile<T>): void;
	on_interact?(world: ClientWorld, tile: Tile<T>): void;
	on_tick?(world: ClientWorld, tile: Tile<T>, tick_delta: number): void;
	on_second?(world: ClientWorld, tile: Tile<T>, second_delta: number): void;
}

export interface ItemRegistry<T = unknown | undefined> {
	texture_id: string | ((item: ItemStack<T>) => string);
	on_create?(item: ItemStack<T>): void;
	get_lore?(item: ItemStack<T>): string;
}
