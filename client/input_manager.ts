export type KeyCode =
	// letters
	| "KeyA"
	| "KeyB"
	| "KeyC"
	| "KeyD"
	| "KeyE"
	| "KeyF"
	| "KeyG"
	| "KeyH"
	| "KeyI"
	| "KeyJ"
	| "KeyK"
	| "KeyL"
	| "KeyM"
	| "KeyN"
	| "KeyO"
	| "KeyP"
	| "KeyQ"
	| "KeyR"
	| "KeyS"
	| "KeyT"
	| "KeyU"
	| "KeyV"
	| "KeyW"
	| "KeyX"
	| "KeyY"
	| "KeyZ"
	// top numbers
	| "Digit0"
	| "Digit1"
	| "Digit2"
	| "Digit3"
	| "Digit4"
	| "Digit5"
	| "Digit6"
	| "Digit7"
	| "Digit8"
	| "Digit9"
	// arrows
	| "ArrowUp"
	| "ArrowDown"
	| "ArrowLeft"
	| "ArrowRight"
	// controls
	| "Space"
	| "Escape"
	| "Enter"
	| "Tab"
	| "ShiftLeft"
	| "ShiftRight"
	| "ControlLeft"
	| "ControlRight"
	| "AltLeft"
	| "AltRight"
	| "Home"
	| "End"
	| "Backspace"
	| "Delete"
	// f
	| "F1"
	| "F2"
	| "F3"
	| "F4"
	| "F5"
	| "F6"
	| "F7"
	| "F8"
	| "F9"
	| "F10"
	| "F11"
	| "F12";

export class InputManager {
	static keys_down = new Set<string>();
	static keys_pressed = new Set<string>();
	static keys_released = new Set<string>();

	static mouse_buttons_down = new Set<number>();
	static mouse_buttons_pressed = new Set<number>();
	static mouse_buttons_released = new Set<number>();
	static mouse_buttons_consumed = new Set<number>();

	static mouse_x = 0;
	static mouse_y = 0;
	static mouse_delta_x = 0;
	static mouse_delta_y = 0;
	static wheel_delta = 0;

	static typed_characters = new Set<string>();

	static initialize(canvas: HTMLCanvasElement) {
		self.addEventListener("keydown", (e) => {
			e.preventDefault();
			if (!this.keys_down.has(e.code)) {
				this.keys_pressed.add(e.code);
			}
			this.keys_down.add(e.code);
			if (e.key.length === 1) {
				this.typed_characters.add(e.key);
			}
		});

		self.addEventListener("keyup", (e) => {
			e.preventDefault();
			this.keys_down.delete(e.code);
			this.keys_released.add(e.code);
		});

		self.addEventListener("mousedown", (e) => {
			e.preventDefault();
			if (!this.mouse_buttons_down.has(e.button)) {
				this.mouse_buttons_pressed.add(e.button);
			}
			this.mouse_buttons_down.add(e.button);
		});

		self.addEventListener("mouseup", (e) => {
			e.preventDefault();
			this.mouse_buttons_down.delete(e.button);
			this.mouse_buttons_released.add(e.button);
		});

		self.addEventListener("mousemove", (e) => {
			e.preventDefault();
			const rect = canvas.getBoundingClientRect();
			const new_x = e.clientX - rect.left;
			const new_y = e.clientY - rect.top;

			this.mouse_delta_x += new_x - this.mouse_x;
			this.mouse_delta_y += new_y - this.mouse_y;

			this.mouse_x = new_x;
			this.mouse_y = new_y;
		});

		self.addEventListener("wheel", (e) => {
			this.wheel_delta += e.deltaY;
		});
	}

	static is_key_down(code: KeyCode): boolean {
		return this.keys_down.has(code);
	}

	static is_key_pressed(code: KeyCode): boolean {
		return this.keys_pressed.has(code);
	}

	static is_key_released(code: KeyCode): boolean {
		return this.keys_released.has(code);
	}

	static is_mouse_down(button: number): boolean {
		return this.mouse_buttons_down.has(button);
	}

	static is_mouse_pressed(button: number): boolean {
		return this.mouse_buttons_pressed.has(button) &&
			!this.mouse_buttons_consumed.has(button);
	}

	static is_mouse_released(button: number): boolean {
		return this.mouse_buttons_released.has(button);
	}

	static get_mouse_position() {
		return { x: this.mouse_x, y: this.mouse_y };
	}

	static get_mouse_delta() {
		return { x: this.mouse_delta_x, y: this.mouse_delta_y };
	}

	static get_wheel_delta(): number {
		return this.wheel_delta;
	}

	static consume_mouse(button: number) {
		this.mouse_buttons_consumed.add(button);
	}

	static get_typed_characters(): string[] {
		const chars = [...this.typed_characters];
		this.typed_characters.clear();
		return chars;
	}

	static update() {
		this.keys_pressed.clear();
		this.keys_released.clear();
		this.mouse_buttons_pressed.clear();
		this.mouse_buttons_released.clear();
		this.mouse_delta_x = 0;
		this.mouse_delta_y = 0;
		this.wheel_delta = 0;
		this.typed_characters.clear();
		this.mouse_buttons_consumed.clear();
	}
}
