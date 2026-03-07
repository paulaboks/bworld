import { ClientWorld } from "../client/client_world.ts";
import { Tile } from "../client/components/dimension.ts";

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

export interface TileRegistry {
	texture_id: string;
	has_collision: boolean;

	on_click?(world: ClientWorld, tile: Tile): void;
	on_interact?(world: ClientWorld, tile: Tile): void;
}
