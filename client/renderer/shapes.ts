import { flush_batch, get_current_texture, push_quad, set_current_texture, white_tex } from "./core.ts";

export function draw_rect(
	x: number,
	y: number,
	w: number,
	h: number,
	color: [number, number, number, number] = [1, 1, 1, 1],
) {
	if (get_current_texture() !== white_tex) {
		flush_batch();
		set_current_texture(white_tex!);
	}

	push_quad(x, y, w, h, 0, 0, 1, 1, color[0], color[1], color[2], color[3]);
}

export function draw_rect_stroke(
	x: number,
	y: number,
	w: number,
	h: number,
	color: [number, number, number, number] = [1, 1, 1, 1],
	thickness: number = 1,
) {
	// top
	draw_rect(x, y, w, thickness, color);
	// bottom
	draw_rect(x, y + h - thickness, w, thickness, color);
	// left
	draw_rect(x, y, thickness, h, color);
	// right
	draw_rect(x + w - thickness, y, thickness, h, color);
}
