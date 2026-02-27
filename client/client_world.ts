import { World } from "$/common/ecs/mod.ts";
import { MovementSystem } from "$/common/systems/movement_system.ts";
import { RenderSystem } from "$/client/systems/render_system.ts";
import { PlayerControlsSystem } from "$/client/systems/player_controls.ts";
import { DebugUI } from "$/client/debug_ui.ts";
import { DebugSystem } from "$/client/systems/debug_system.ts";
import { TileEditorSystem } from "$/client/systems/tile_editor_system.ts";
import { InventorySystem } from "$/client/systems/inventory_system.ts";
import { UIInteractionSystem } from "$/client/systems/ui_interaction_system.ts";
import { UIRenderSystem } from "$/client/systems/ui_render_system.ts";
import { CropSystem } from "$/client/systems/crop_system.ts";
import { create_main_menu } from "./main_menu.ts";
import { ClickableSystem } from "./systems/clickable_system.ts";

export class ClientWorld extends World {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	paused = false;
	debugging = false;

	constructor(canvas: HTMLCanvasElement) {
		super("main_menu");

		this.add_state("main_menu");
		this.add_state("paused");
		this.add_state("game");

		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Could not get CanvasRenderingContext2D");
		}
		this.ctx = ctx;
		ctx.imageSmoothingEnabled = false;

		const resize = () => {
			canvas.width = self.innerWidth;
			canvas.height = self.innerHeight;

			canvas.style.width = canvas.width + "px";
			canvas.style.height = canvas.height + "px";

			this.ctx.imageSmoothingEnabled = false;
		};

		self.addEventListener("resize", resize);
		resize();

		canvas.addEventListener("contextmenu", function (event) {
			event.preventDefault();
		});

		DebugUI.initialize(this.ctx);

		create_main_menu(this);

		// Logic systems
		this.add_system(new UIInteractionSystem(), "main_menu");
		this.add_system(new UIInteractionSystem(), "paused");
		this.add_system(new ClickableSystem(), "game");
		this.add_system(new InventorySystem(), "game");
		this.add_system(new PlayerControlsSystem(), "game");
		this.add_system(new MovementSystem(), "game");
		this.add_system(new CropSystem(), "game");

		// render systems
		this.add_system(new RenderSystem(this.ctx), "game");
		this.add_system(new DebugSystem(), "*");
		this.add_system(new TileEditorSystem(), "game");
		this.add_system(new UIRenderSystem(), "main_menu");
		this.add_system(new UIRenderSystem(), "paused");
	}
}
