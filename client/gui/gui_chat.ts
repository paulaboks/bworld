import { GuiScreen } from "./gui_screen.ts";
import { canvas, draw_rect, draw_text, measure_text } from "$/client/renderer/mod.ts";
import { InputManager } from "../input_manager.ts";
import { ClientWorld } from "../client_world.ts";
import { PlayerComponent } from "../player.ts";
import { ItemStack } from "../inventory.ts";

export class GuiChat extends GuiScreen {
	world: ClientWorld;

	text_typed = "";
	caret = 0;
	key_repeat_timer = 0;
	show_caret = true;

	constructor(world: ClientWorld) {
		super();
		this.world = world;
	}

	override on_render(): void {
		draw_rect(0, 0, canvas.width, canvas.height, [0, 0, 0, 0.8]);

		const y = canvas.height - 32;
		draw_rect(0, y, canvas.width, canvas.height, [0, 0, 0, 0.4]);

		draw_text(this.text_typed, 0, y, 2, [1, 1, 1]);

		if (this.show_caret) {
			const before_text = this.text_typed.substring(0, this.caret);
			const caret_x = 0 + measure_text(before_text, 2);

			draw_rect(caret_x, y + 4, 1, 32 - 4);
		}
	}

	override on_tick(_delta: number): void {
		const now = performance.now();
		const repeat_delay = 400;
		const repeat_rate = 40;

		const allow_repeat = () => {
			if (InputManager.is_key_pressed("Backspace")) {
				this.key_repeat_timer = now;
				return true;
			}

			if (InputManager.is_key_down("Backspace")) {
				if (now - this.key_repeat_timer > repeat_delay) {
					this.key_repeat_timer = now - (repeat_delay - repeat_rate);
					return true;
				}
			}

			return false;
		};

		if (allow_repeat()) {
			if (this.caret > 0) {
				this.text_typed = this.text_typed.slice(0, this.caret - 1) + this.text_typed.slice(this.caret);
				this.caret -= 1;
			}
		}

		if (InputManager.is_key_pressed("Delete")) {
			this.text_typed = this.text_typed.slice(0, this.caret) + this.text_typed.slice(this.caret + 1);
		}

		if (InputManager.is_key_pressed("ArrowLeft")) {
			this.caret = Math.max(0, this.caret - 1);
		}

		if (InputManager.is_key_pressed("ArrowRight")) {
			this.caret = Math.min(this.text_typed.length, this.caret + 1);
		}

		if (InputManager.is_key_pressed("Home")) {
			this.caret = 0;
		}

		if (InputManager.is_key_pressed("End")) {
			this.caret = this.text_typed.length;
		}

		const typed = InputManager.get_typed_characters();

		for (const char of typed) {
			this.text_typed = this.text_typed.slice(0, this.caret) + char + this.text_typed.slice(this.caret);
			this.caret += 1;
		}

		if (InputManager.is_key_pressed("Enter")) {
			this.submit();
		}
	}
	override on_close(): void {}

	submit() {
		if (this.text_typed.startsWith("/")) {
			this.command();
		} else {
			// we dont have multiplayer lol?
		}
		this.text_typed = "";

		const [player] = this.world.get_tag("player")!;
		const player_component = player.get(PlayerComponent);
		if (player_component) {
			player_component.pop_screen();
		}
	}

	command() {
		if (this.text_typed.startsWith("/give")) {
			let [_, item_id, quantity] = this.text_typed.split(" ");

			if (!item_id.includes(":")) {
				item_id = `bworld:${item_id}`;
			}
			if (quantity === undefined) {
				quantity = "1";
			}

			const [player] = this.world.get_tag("player")!;
			const player_component = player.get(PlayerComponent);
			if (player_component) {
				player_component.player_inventory.container.add_item(new ItemStack(item_id, Number(quantity)));
			}
		}
	}
}
