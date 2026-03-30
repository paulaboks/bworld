import { SLOT_SIZE, TEXTURE_SIZE } from "$/common/constants.ts";
import { AssetManager } from "$/client/assets.ts";
import { PlayerInventory } from "../../inventory.ts";
import { draw_item, draw_nine_slice } from "./render_utils.ts";
import {
	canvas,
	draw_rect_stroke,
	push_back_face,
	push_bottom_face,
	push_front_face,
	push_left_face,
	push_right_face,
	push_top_face,
	Texture,
} from "$/client/renderer/mod.ts";
import { PlayerComponent } from "../../player.ts";
import { get_sprite_region } from "../../../common/utils.ts";

const PADDING = 10;

export function render_player_hotbar(player_inventory: PlayerInventory) {
	const ui = AssetManager.instance.get<Texture>("bworld:ui");

	const hotbar_width = PADDING * 2 + SLOT_SIZE * 9;
	const hotbar_height = PADDING * 2 + SLOT_SIZE;

	const x = canvas.width / 2 - hotbar_width / 2;
	const y = canvas.height - hotbar_height;

	draw_nine_slice(
		ui,
		160,
		0,
		16,
		16,
		4,
		4,
		4,
		4,
		x,
		y,
		hotbar_width,
		hotbar_height,
	);

	for (let index = 0; index < 9; index += 1) {
		draw_nine_slice(
			ui,
			player_inventory.hotbar_selected === index ? 19 * 16 : 160 + 32,
			player_inventory.hotbar_selected === index ? 16 : 0,
			16,
			16,
			4,
			4,
			4,
			4,
			x + PADDING + index * SLOT_SIZE,
			y + PADDING,
			SLOT_SIZE,
			SLOT_SIZE,
		);
	}

	for (let index = 0; index < 9; index += 1) {
		const item = player_inventory.container.get_item(index);
		if (item) {
			draw_item(item, x + PADDING + index * SLOT_SIZE, y + PADDING);
		}
	}
}

export function render_player_crosshair() {
	const CROSSHAIR_SIZE = 8;
	draw_rect_stroke(
		(canvas.width - CROSSHAIR_SIZE) / 2,
		(canvas.height - CROSSHAIR_SIZE) / 2,
		CROSSHAIR_SIZE,
		CROSSHAIR_SIZE,
		[0, 0, 0, 0.6],
	);
}

const FACE_FUNCTIONS = [
	push_back_face,
	push_bottom_face,
	push_front_face,
	push_left_face,
	push_right_face,
	push_top_face,
];
export function render_player_breaking(player_component: PlayerComponent) {
	const block = player_component.breaking_block;
	if (block) {
		const tex = AssetManager.instance.get<Texture>("bworld:textures");

		const progress = Math.max(
			0,
			Math.min(1, player_component.break_progress / player_component.break_progress_max),
		);
		const break_sprite = Math.round(progress * 8);

		if (Number.isNaN(break_sprite)) {
			return;
		}
		const region = get_sprite_region(`bworld:break_${break_sprite}`);

		for (const fn of FACE_FUNCTIONS) {
			fn(
				tex,
				block.x,
				block.y,
				block.z,
				region.x * TEXTURE_SIZE,
				region.y * TEXTURE_SIZE,
				TEXTURE_SIZE,
				TEXTURE_SIZE,
			);
		}
	}
}
