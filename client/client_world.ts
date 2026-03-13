import { World } from "$/common/ecs/mod.ts";
import { MovementSystem } from "$/common/systems/movement_system.ts";
import { RenderSystem } from "$/client/systems/render_system.ts";
import { PlayerControlsSystem } from "$/client/systems/player_controls.ts";
import { DebugSystem } from "$/client/systems/debug_system.ts";
import { UIInteractionSystem } from "$/client/systems/ui_interaction_system.ts";
import { UIRenderSystem } from "$/client/systems/ui_render_system.ts";
import { create_main_menu } from "./main_menu.ts";
import { start_game } from "./game.ts";
import { canvas, resize_canvas } from "./renderer/mod.ts";
import { DimensionLogicSystem } from "./systems/dimension_logic.ts";
import { Dimension } from "./components/dimension.ts";
import { GuiRenderSystem, GuiTickSystem } from "./gui/gui_systems.ts";
import { WorldGenerationSystem } from "./systems/world_generation_system.ts";

export class ClientWorld extends World {
	paused = false;
	debugging = false;

	dimension!: Dimension;

	constructor() {
		super("game");

		this.add_state("main_menu");
		this.add_state("paused");
		this.add_state("game");

		self.addEventListener("resize", resize_canvas);
		resize_canvas();

		canvas.addEventListener("contextmenu", function (event) {
			event.preventDefault();
		});

		start_game(this);

		// Logic systems
		this.add_system(new UIInteractionSystem(), "main_menu");
		this.add_system(new UIInteractionSystem(), "paused");
		this.add_system(new GuiTickSystem(), "game");
		this.add_system(new PlayerControlsSystem(), "game");
		this.add_system(new MovementSystem(), "game");
		this.add_system(new WorldGenerationSystem(), "game");
		this.add_system(new DimensionLogicSystem(), "game");

		// render systems
		this.add_system(new RenderSystem(), "game");
		this.add_system(new GuiRenderSystem(), "game");
		this.add_system(new DebugSystem(), "game");
		this.add_system(new UIRenderSystem(), "main_menu");
		this.add_system(new UIRenderSystem(), "paused");
	}
}
