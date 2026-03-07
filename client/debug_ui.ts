import { point_inside_rec } from "$/common/utils.ts";
import { InputManager } from "$/client/input_manager.ts";
import { begin_clip, draw_rect, draw_rect_stroke, draw_text, end_clip, measure_text } from "./renderer.ts";

const HEADER_HEIGHT = 24;
const RESIZE_SIZE = 12;

const PADDING = 4;

interface WindowState {
	x: number;
	y: number;
	width: number;
	height: number;
	dragging: boolean;
	resizing: boolean;
	scroll_y: number;
	content_height: number;
}

interface TextInputState {
	value: string;
	caret: number;
	focused: boolean;
	last_blink: number;
	show_caret: boolean;
	key_repeat_timer: number;
}

export class DebugUI {
	static windows = new Map<string, WindowState>();
	static current_window: WindowState | undefined = undefined;

	static text_inputs = new Map<string, TextInputState>();
	static active_text_input: string | undefined = undefined;

	static open_sections = new Map<string, boolean>();

	// cursor as in like for drawing
	static cursor_x = 0;
	static cursor_y = 0;
	static content_width = 0;

	static begin(title: string, x: number, y: number, width = 300, height = 300) {
		let win = this.windows.get(title);
		if (!win) {
			win = {
				x,
				y,
				width,
				height,
				dragging: false,
				resizing: false,
				scroll_y: 0,
				content_height: 0,
			};
			this.windows.set(title, win);
		}

		this.current_window = win;

		// header
		const mouse = InputManager.get_mouse_position();
		const delta = InputManager.get_mouse_delta();

		const hovering_header = point_inside_rec(mouse.x, mouse.y, win.x, win.y, win.width, HEADER_HEIGHT);

		if (hovering_header && InputManager.is_mouse_pressed(0)) {
			InputManager.consume_mouse(0);
			win.dragging = true;
		}

		if (!InputManager.is_mouse_down(0)) {
			win.dragging = false;
			win.resizing = false;
		}

		if (win.dragging) {
			win.x += delta.x;
			win.y += delta.y;
		}

		// resize square
		const hovering_resize = point_inside_rec(
			mouse.x,
			mouse.y,
			win.x + win.width - RESIZE_SIZE,
			win.y + win.height - RESIZE_SIZE,
			RESIZE_SIZE,
			RESIZE_SIZE,
		);

		if (hovering_resize && InputManager.is_mouse_pressed(0)) {
			InputManager.consume_mouse(0);
			win.resizing = true;
		}

		if (win.resizing) {
			win.width += delta.x;
			win.height += delta.y;

			win.width = Math.max(150, win.width);
			win.height = Math.max(120, win.height);
		}

		// scrolling
		const wheel = -InputManager.get_wheel_delta();

		const hovering_content = point_inside_rec(mouse.x, mouse.y, win.x, win.y, win.width, win.height);

		if (hovering_content) {
			win.scroll_y -= wheel * 0.7;
		}

		const max_scroll = Math.max(0, win.content_height - (win.height - HEADER_HEIGHT - 10));
		win.scroll_y = Math.max(0, Math.min(win.scroll_y, max_scroll));

		// render
		draw_rect(win.x, win.y, win.width, win.height, [25 / 255, 25 / 255, 25 / 255, 0.95]);

		draw_rect_stroke(win.x, win.y, win.width, win.height, [170 / 255, 170 / 255, 170 / 255, 1]);

		draw_rect(win.x, win.y, win.width, HEADER_HEIGHT, [0x33 / 255, 0x33 / 255, 0x33 / 255, 1]);

		draw_text(title, win.x + 8, win.y + 4);

		// resize grip
		draw_rect(
			win.x + win.width - RESIZE_SIZE,
			win.y + win.height - RESIZE_SIZE,
			RESIZE_SIZE,
			RESIZE_SIZE,
			hovering_resize ? [88 / 255, 88 / 255, 88 / 255, 1] : [66 / 255, 66 / 255, 66 / 255, 1],
		);

		// clip it !
		begin_clip(win.x, win.y + HEADER_HEIGHT, win.width, win.height - HEADER_HEIGHT);
		// this.ctx.beginPath();
		// this.ctx.rect(
		// 	win.x,
		// 	win.y + HEADER_HEIGHT,
		// 	win.width,
		// 	win.height - HEADER_HEIGHT,
		// );
		// this.ctx.clip();

		// move cursor_x to match the windows x and add some padding
		// same idea for cursor_y but with scrolling
		this.cursor_x = win.x + PADDING * 2;
		this.cursor_y = win.y + HEADER_HEIGHT + PADDING * 2 - win.scroll_y;
		// 20 padding (to count for scrollbar)
		this.content_width = win.width - 20;

		win.content_height = 0;
	}

	static end() {
		if (!this.current_window) {
			return;
		}

		// see how far we've come to save content height
		this.current_window.content_height = this.cursor_y - this.current_window.y + this.current_window.scroll_y;

		this.#draw_scrollbar();

		this.current_window = undefined;

		end_clip();
	}

	static advance(height: number) {
		if (!this.current_window) {
			return;
		}
		this.cursor_y += height;
		// maybe dont reset on every advance? eh whatever
		this.cursor_x = this.current_window.x + PADDING * 2;
	}

	static separator() {
		draw_rect(this.cursor_x, this.cursor_y, this.content_width, 1, [55 / 255, 55 / 255, 55 / 255, 1]);

		this.cursor_y += PADDING * 2;
	}

	static text(content: string) {
		draw_text(content, this.cursor_x, this.cursor_y);
		this.advance(20);
	}

	static button(label: string): boolean {
		const height = 24;
		const x = this.cursor_x;
		const y = this.cursor_y;
		const width = this.content_width;

		const mouse = InputManager.get_mouse_position();
		const hovered = point_inside_rec(mouse.x, mouse.y, x, y, width, height);

		draw_rect(x, y, width, height, hovered ? [66 / 255, 66 / 255, 66 / 255, 1] : [44 / 255, 44 / 255, 44 / 255, 1]);
		draw_rect_stroke(x, y, width, height);

		draw_text(label, x + 6, y + 4);

		this.advance(height + PADDING);

		if (hovered && InputManager.is_mouse_pressed(0)) {
			InputManager.consume_mouse(0);
			return true;
		}

		return false;
	}

	static checkbox(label: string, value: boolean): boolean {
		// shoutout to booleans
		const size = 16;
		const x = this.cursor_x;
		const y = this.cursor_y;

		const mouse = InputManager.get_mouse_position();
		const hovered = point_inside_rec(mouse.x, mouse.y, x, y, size, size);

		draw_rect(x, y, size, size, [22 / 255, 22 / 255, 22 / 22, 1]);
		draw_rect_stroke(x, y, size, size);

		if (value) {
			draw_rect(x + 4, y + 4, size - 8, size - 8);
		}

		draw_text(label, x + size + 6, y);

		this.advance(size + PADDING);

		if (hovered && InputManager.is_mouse_pressed(0)) {
			InputManager.consume_mouse(0);
			return !value;
		}

		return value;
	}

	static slider_float(
		label: string,
		value: number,
		min: number,
		max: number,
	): number {
		const height = 20;
		const x = this.cursor_x;
		const y = this.cursor_y;
		const width = this.content_width;

		const mouse = InputManager.get_mouse_position();
		const hovered = point_inside_rec(mouse.x, mouse.y, x, y, width, height);

		if (hovered && InputManager.is_mouse_down(0)) {
			const t = (mouse.x - x) / width;
			value = min + (max - min) * Math.min(Math.max(t, 0), 1);
		}

		draw_rect(x, y, width, height, [0x33 / 255, 0x33 / 255, 0x33 / 255, 1]);

		const percent = (value - min) / (max - min);
		draw_rect(x, y, width * percent, height, [10 / 255, 132 / 255, 255 / 255, 1]);

		draw_rect_stroke(x, y, width, height);

		draw_text(`${label}: ${value.toFixed(2)}`, x + 5, y + 2);

		this.advance(height + PADDING);

		return value;
	}

	static progress_bar(value: number) {
		const height = 16;
		const x = this.cursor_x;
		const y = this.cursor_y;
		const width = this.content_width;

		draw_rect(x, y, width, height, [0x33 / 255, 0x33 / 255, 0x33 / 255, 1]);

		draw_rect(x, y, width * value, height, [54 / 255, 105 / 255, 146 / 255, 1]);

		draw_rect_stroke(x, y, width, height);

		this.advance(height + PADDING);
	}

	static collapsing_header(label: string): boolean {
		// i only did the ## for ids on this one cause its the only one that mattered
		const open = this.open_sections.get(label) ?? false;

		const clicked = this.button((open ? "- " : "+ ") + label.replace(/##.*/, ""));
		if (clicked) {
			this.open_sections.set(label, !open);
			return !open;
		}

		return open;
	}

	static combo(
		label: string,
		index: number,
		options: string[],
	): number {
		if (this.button(`${label}: ${options[index]}`)) {
			index = (index + 1) % options.length;
		}
		return index;
	}

	static text_input(label: string, value: string): string {
		// yeah just use the text widget
		this.text(label);

		const id = label;

		let state = this.text_inputs.get(id);
		if (!state) {
			// initial state
			state = {
				value,
				caret: value.length,
				focused: false,
				last_blink: performance.now(),
				show_caret: true,
				key_repeat_timer: 0,
			};
			this.text_inputs.set(id, state);
		}
		// update on every call
		state.value = value;

		const height = 24;
		const x = this.cursor_x;
		const y = this.cursor_y;
		const width = this.content_width;

		const mouse = InputManager.get_mouse_position();
		const hovered = point_inside_rec(mouse.x, mouse.y, x, y, width, height);

		// set focus and move caret to end
		if (hovered && InputManager.is_mouse_pressed(0)) {
			InputManager.consume_mouse(0);
			this.active_text_input = id;
			state.focused = true;
			state.caret = value.length;
		} else if (InputManager.is_mouse_pressed(0) && !hovered) {
			if (this.active_text_input === id) {
				state.focused = false;
				this.active_text_input = undefined;
			}
		}

		const is_active = this.active_text_input === id;

		if (is_active) {
			this.#handle_text_editing(state);
		}

		// overkill?
		if (is_active) {
			const now = performance.now();
			if (now - state.last_blink > 500) {
				state.show_caret = !state.show_caret;
				state.last_blink = now;
			}
		} else {
			state.show_caret = false;
		}

		// draw box
		draw_rect(
			x,
			y,
			width,
			height,
			is_active ? [55 / 255, 55 / 255, 55 / 255, 1] : [0x33 / 255, 0x33 / 255, 0x33 / 255, 1],
		);

		// highlight
		draw_rect_stroke(
			x,
			y,
			width,
			height,
			is_active ? [10 / 255, 132 / 255, 1, 1] : [0xaa / 255, 0xaa / 255, 0xaa / 255, 1],
		);

		const text_x = x + 6;

		draw_text(state.value, x + 6, y + 4);

		// caret !
		if (is_active && state.show_caret) {
			const before_text = state.value.substring(0, state.caret);
			const caret_x = text_x + measure_text(before_text);

			draw_rect(caret_x, y + 4, 1, height - 4);
		}

		this.cursor_y += height + PADDING;

		return state.value;
	}

	static float_input(label: string, value: number) {
		// TODO: do something better when input needs to be empty
		const float_value = parseFloat(this.text_input(label, String(value)));
		if (Number.isNaN(float_value)) {
			return 0;
		}
		return float_value;
	}

	static is_inside_windows(x: number, y: number) {
		if (!this.current_window) {
			return false;
		}
		return point_inside_rec(
			x,
			y,
			this.current_window.x,
			this.current_window.y,
			this.current_window.width,
			this.current_window.height,
		);
	}

	static #draw_scrollbar() {
		const win = this.current_window!;
		const content_visible_height = win.height - HEADER_HEIGHT;

		if (win.content_height <= content_visible_height) {
			return;
		}

		const scrollbar_width = 6;
		const x = win.x + win.width - scrollbar_width - 2;
		const y = win.y + HEADER_HEIGHT;
		const h = content_visible_height - 24;

		const ratio = content_visible_height / win.content_height;
		const thumb_height = h * ratio;

		const max_scroll = win.content_height - content_visible_height;
		const thumb_y = y + (win.scroll_y / max_scroll) * (h - thumb_height);

		// track
		draw_rect(x, y, scrollbar_width, h, [0x22 / 255, 0x22 / 255, 0x22 / 255, 1]);

		// thumb
		draw_rect(x, thumb_y, scrollbar_width, thumb_height, [0x88 / 255, 0x88 / 255, 0x88 / 255, 1]);
	}

	static #handle_text_editing(state: TextInputState) {
		const now = performance.now();
		const repeat_delay = 400;
		const repeat_rate = 40;

		function allow_repeat(): boolean {
			if (InputManager.is_key_pressed("Backspace")) {
				state.key_repeat_timer = now;
				return true;
			}

			if (InputManager.is_key_down("Backspace")) {
				if (now - state.key_repeat_timer > repeat_delay) {
					state.key_repeat_timer = now - (repeat_delay - repeat_rate);
					return true;
				}
			}

			return false;
		}

		if (allow_repeat()) {
			if (state.caret > 0) {
				state.value = state.value.slice(0, state.caret - 1) + state.value.slice(state.caret);
				state.caret -= 1;
			}
		}

		if (InputManager.is_key_pressed("Delete")) {
			state.value = state.value.slice(0, state.caret) + state.value.slice(state.caret + 1);
		}

		if (InputManager.is_key_pressed("ArrowLeft")) {
			state.caret = Math.max(0, state.caret - 1);
		}

		if (InputManager.is_key_pressed("ArrowRight")) {
			state.caret = Math.min(state.value.length, state.caret + 1);
		}

		if (InputManager.is_key_pressed("Home")) {
			state.caret = 0;
		}

		if (InputManager.is_key_pressed("End")) {
			state.caret = state.value.length;
		}

		const typed = InputManager.get_typed_characters();

		for (const char of typed) {
			state.value = state.value.slice(0, state.caret) + char + state.value.slice(state.caret);
			state.caret += 1;
		}
	}
}
