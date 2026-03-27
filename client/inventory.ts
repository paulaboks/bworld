import { EverythingRegistry, ItemRegistry } from "$/common/everything_registry.ts";

export class ItemStack<T = unknown | undefined> {
	type_id: string;
	amount: number;
	max_amount: number;
	data?: T;

	constructor(type_id: string | string, amount: number = 1, max_amount: number = 64) {
		this.type_id = type_id;
		this.amount = amount;
		this.max_amount = max_amount;
		this.data = undefined;
		const item_info = EverythingRegistry.get<ItemRegistry>("items", type_id);
		if (item_info?.on_create) {
			item_info.on_create(this);
		}
	}

	clone(): ItemStack {
		return new ItemStack(this.type_id, this.amount, this.max_amount);
	}
}

export class ContainerSlot {
	#item_stack: ItemStack | undefined;

	has_item() {
		return this.#item_stack !== undefined;
	}

	set_item(item_stack: ItemStack | undefined) {
		if ((item_stack?.amount ?? 0) <= 0) {
			item_stack = undefined;
		}
		this.#item_stack = item_stack;
	}

	get_item() {
		return this.#item_stack;
	}

	get type_id() {
		return this.#item_stack?.type_id;
	}

	set amount(new_amount: number) {
		if (this.#item_stack) {
			this.#item_stack.amount = new_amount;
			if (this.#item_stack.amount <= 0) {
				this.#item_stack = undefined;
			}
		}
	}

	get amount(): number | undefined {
		return this.#item_stack?.amount;
	}

	get max_amount() {
		return this.#item_stack?.max_amount;
	}
}

export class Container {
	#slots: ContainerSlot[] = [];
	readonly size: number;

	constructor(size: number) {
		this.size = size;
		for (let i = 0; i < size; i += 1) {
			this.#slots.push(new ContainerSlot());
		}
	}

	add_item(item_stack: ItemStack) {
		for (const slot of this.#slots.filter((slot) => slot.has_item())) {
			const slot_item = slot.get_item()!;
			if (slot_item.type_id === item_stack.type_id) {
				const missing = slot_item.max_amount - slot_item.amount;
				const adding = Math.min(missing, item_stack.amount);
				slot_item.amount += adding;
				item_stack.amount -= adding;
				if (item_stack.amount === 0) {
					return;
				}
			}
		}
		for (const slot of this.#slots) {
			if (!slot.has_item()) {
				slot.set_item(item_stack);
				return;
			}
		}
		// TODO: drop item on ground
		console.error("Failed to place item in container");
	}

	get_item(slot: number): ItemStack | undefined {
		return this.#slots[slot]?.get_item();
	}

	get_slot(slot: number): ContainerSlot {
		return this.#slots[slot];
	}

	set_item(slot: number, item: ItemStack | undefined) {
		this.#slots[slot].set_item(item);
	}
}

export interface ContainerLayout {
	slots: { type: string; x: number; y: number }[];
	offset_x: number;
	offset_y: number;
}

export class Inventory {
	container: Container;

	hovering_slot: number = -1;

	constructor(container: Container) {
		this.container = container;
	}
}

export class PlayerInventory extends Inventory {
	owner_id: string;
	holding_item: ItemStack | undefined;
	hotbar_selected: number = 0;

	constructor(owner_id: string) {
		const container = new Container(9 * 4);
		super(container);
		this.owner_id = owner_id;
	}
}
