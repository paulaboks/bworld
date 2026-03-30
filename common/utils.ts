import { AssetManager } from "../client/assets.ts";
import { ID_MASK, SpriteRegion, STATE_SHIFT } from "./constants.ts";
import { BlockRegistry, EverythingRegistry, ItemRegistry } from "./everything_registry.ts";

export function point_inside_rec(
	point_x: number,
	point_y: number,
	rec_x: number,
	rec_y: number,
	rec_w: number,
	rec_h: number,
) {
	return point_x > rec_x &&
		point_x < rec_x + rec_w &&
		point_y > rec_y &&
		point_y < rec_y + rec_h;
}

type TexturesInfo = Record<string, SpriteRegion>;

export function get_sprite_region(id: string): SpriteRegion {
	const textures_info = AssetManager.instance.get<TexturesInfo>("bworld:textures_info");
	return textures_info?.[id] ?? { x: 0, y: 0 };
}

export function distance_point_rectangle(px: number, py: number, sqx: number, sqy: number, sqw: number, sqh: number) {
	const x0 = sqx;
	const y0 = sqy;
	const x1 = sqx + sqw;
	const y1 = sqy + sqh;

	const cx = Math.max(x0, Math.min(px, x1));
	const cy = Math.max(y0, Math.min(py, y1));

	const dx = px - cx;
	const dy = py - cy;

	return Math.sqrt(dx * dx + dy * dy);
}

export function distance_point_point(ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
	const dx = ax - bx;
	const dy = ay - by;
	const dz = az - bz;
	return dx * dx + dy * dy + dz * dz;
}

export function register_block_item(block: BlockRegistry) {
	// TODO: handle block textures
	let texture_id = "bworld:missing";
	if (typeof block.textures === "string") {
		texture_id = block.textures;
	}
	EverythingRegistry.register<ItemRegistry>("items", block.id, {
		texture_id,
		block_id: block.id,
	});
}

export function get_state_value(value: number, block_info: BlockRegistry, name: string) {
	if (!block_info.states) {
		return undefined;
	}

	if (!block_info.compiled_states) {
		compile_block_states(block_info);
	}

	const state_bits = value >>> STATE_SHIFT;

	const s = block_info.compiled_states!.find((s) => s.name === name)!;
	return (state_bits & s.mask) >>> s.shift;
}

export function set_state_value(value: number, block_info: BlockRegistry, name: string, new_value: number) {
	if (!block_info.states) {
		return undefined;
	}

	if (!block_info.compiled_states) {
		compile_block_states(block_info);
	}
	const id = value & ID_MASK;
	let state_bits = value >>> 16;

	const s = block_info.compiled_states!.find((s) => s.name === name)!;

	state_bits = (state_bits & ~s.mask) | (new_value << s.shift);

	return (state_bits << 16) | id;
}

function compile_block_states(block_info: BlockRegistry) {
	if (!block_info.states) {
		return;
	}

	let offset = 0;

	block_info.compiled_states = block_info.states.map((s) => {
		const shift = offset;
		const mask = ((1 << s.bits) - 1) << shift;

		offset += s.bits;

		return { name: s.name, mask, shift };
	});
}
