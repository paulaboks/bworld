import { point_inside_rec } from "$/common/utils.ts";
import { InputManager } from "$/client/input_manager.ts";
import { draw_text, measure_text } from "$/client/text_rendering.ts";

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
	static ctx: CanvasRenderingContext2D;

	static windows = new Map<string, WindowState>();
	static current_window: WindowState | undefined = undefined;

	static text_inputs = new Map<string, TextInputState>();
	static active_text_input: string | undefined = undefined;

	static open_sections = new Map<string, boolean>();

	// cursor as in like for drawing
	static cursor_x = 0;
	static cursor_y = 0;
	static content_width = 0;

	static initialize(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

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
		this.ctx.save();

		// transparent background
		this.ctx.fillStyle = "rgba(25,25,25,0.95)";
		this.ctx.fillRect(win.x, win.y, win.width, win.height);

		this.ctx.strokeStyle = "#aaa";
		this.ctx.strokeRect(win.x, win.y, win.width, win.height);

		// header and title
		this.ctx.fillStyle = "#333";
		this.ctx.fillRect(win.x, win.y, win.width, HEADER_HEIGHT);

		draw_text(this.ctx, title, win.x + 8, win.y + 4, 2);

		// resize grip
		this.ctx.fillStyle = hovering_resize ? "#888" : "#666";
		this.ctx.fillRect(
			win.x + win.width - RESIZE_SIZE,
			win.y + win.height - RESIZE_SIZE,
			RESIZE_SIZE,
			RESIZE_SIZE,
		);

		// clip it !
		this.ctx.beginPath();
		this.ctx.rect(
			win.x,
			win.y + HEADER_HEIGHT,
			win.width,
			win.height - HEADER_HEIGHT,
		);
		this.ctx.clip();

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

		this.ctx.restore();

		this.current_window = undefined;
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
		this.ctx.strokeStyle = "#555";
		this.ctx.beginPath();
		this.ctx.moveTo(this.cursor_x, this.cursor_y);
		this.ctx.lineTo(this.cursor_x + this.content_width, this.cursor_y);
		this.ctx.stroke();

		this.cursor_y += PADDING * 2;
	}

	static text(content: string) {
		draw_text(this.ctx, content, this.cursor_x, this.cursor_y, 2);
		this.advance(20);
	}

	static button(label: string): boolean {
		const height = 24;
		const x = this.cursor_x;
		const y = this.cursor_y;
		const width = this.content_width;

		const mouse = InputManager.get_mouse_position();
		const hovered = point_inside_rec(mouse.x, mouse.y, x, y, width, height);

		this.ctx.fillStyle = hovered ? "#666" : "#444";
		this.ctx.fillRect(x, y, width, height);

		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x, y, width, height);

		this.ctx.fillStyle = "white";
		draw_text(this.ctx, label, x + 6, y + 4, 2);

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

		this.ctx.fillStyle = "#222";
		this.ctx.fillRect(x, y, size, size);
		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x, y, size, size);

		if (value) {
			this.ctx.fillStyle = "white";
			this.ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
		}

		this.ctx.fillStyle = "white";
		draw_text(this.ctx, label, x + size + 6, y, 2);

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

		this.ctx.fillStyle = "#333";
		this.ctx.fillRect(x, y, width, height);

		const percent = (value - min) / (max - min);
		this.ctx.fillStyle = "#0a84ff";
		this.ctx.fillRect(x, y, width * percent, height);

		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x, y, width, height);

		this.ctx.fillStyle = "white";
		draw_text(this.ctx, `${label}: ${value.toFixed(2)}`, x + 5, y + 2, 2);

		this.advance(height + PADDING);

		return value;
	}

	static progress_bar(value: number) {
		const height = 16;
		const x = this.cursor_x;
		const y = this.cursor_y;
		const width = this.content_width;

		this.ctx.fillStyle = "#333";
		this.ctx.fillRect(x, y, width, height);

		this.ctx.fillStyle = "#366992";
		this.ctx.fillRect(x, y, width * value, height);

		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x, y, width, height);

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
		this.ctx.fillStyle = is_active ? "#555" : "#333";
		this.ctx.fillRect(x, y, width, height);

		// highlight
		this.ctx.strokeStyle = is_active ? "#0a84ff" : "#aaa";
		this.ctx.strokeRect(x, y, width, height);

		const text_x = x + 6;

		draw_text(this.ctx, state.value, x + 6, y + 4, 2);

		// caret !
		if (is_active && state.show_caret) {
			const before_text = state.value.substring(0, state.caret);
			const caret_x = text_x + measure_text(this.ctx, before_text, 2);

			this.ctx.strokeStyle = "white";
			this.ctx.beginPath();
			this.ctx.moveTo(caret_x, y + 4);
			this.ctx.lineTo(caret_x, y + height - 4);
			this.ctx.stroke();
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

		const scrollbarWidth = 6;
		const x = win.x + win.width - scrollbarWidth - 2;
		const y = win.y + HEADER_HEIGHT;
		const h = content_visible_height - 24;

		const ratio = content_visible_height / win.content_height;
		const thumbHeight = h * ratio;

		const maxScroll = win.content_height - content_visible_height;
		const thumbY = y + (win.scroll_y / maxScroll) * (h - thumbHeight);

		// track
		this.ctx.fillStyle = "#222";
		this.ctx.fillRect(x, y, scrollbarWidth, h);

		// thumb
		this.ctx.fillStyle = "#888";
		this.ctx.fillRect(x, thumbY, scrollbarWidth, thumbHeight);
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
