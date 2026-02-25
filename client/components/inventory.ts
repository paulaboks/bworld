import { Component } from "$/common/ecs/mod.ts";
import { SLOT_SIZE } from "$/common/constants.ts";

export class ItemStack {
	type_id: string;
	amount: number;
	max_amount: number;

	constructor(type_id: string | string, amount: number = 1, max_amount: number = 64) {
		this.type_id = type_id;
		this.amount = amount;
		this.max_amount = max_amount;
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
		this.#item_stack = item_stack;
	}

	get_item() {
		return this.#item_stack;
	}

	get type_id() {
		return this.#item_stack?.type_id;
	}

	get amount() {
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
		// TODO: merge stacks
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
		return this.#slots[slot].get_item();
	}

	get_slot(slot: number): ContainerSlot {
		return this.#slots[slot];
	}
}

export interface ContainerLayout {
	slots: { type: string; x: number; y: number }[];
	offset_x: number;
	offset_y: number;
}

export class Inventory extends Component {
	container: Container;

	is_open: boolean = false;
	layout: ContainerLayout;

	hovering_slot: number = -1;

	constructor(container: Container, layout: ContainerLayout) {
		super();
		this.container = container;
		this.layout = layout;
	}
}

export class PlayerInventory extends Inventory {
	owner_id: string;
	holding_item: ItemStack | undefined;
	hotbar_selected: number = 0;

	constructor(owner_id: string) {
		const container = new Container(9 * 4);
		const layout: ContainerLayout = {
			slots: [],
			offset_x: 10,
			offset_y: 10,
		};

		for (let row = 0; row < 4; row += 1) {
			for (let column = 0; column < 9; column += 1) {
				layout.slots.push({ type: "*", x: column * SLOT_SIZE, y: row * SLOT_SIZE });
			}
		}
		super(container, layout);
		this.owner_id = owner_id;
	}
}
