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
