import { Entity, World } from "$/common/ecs/mod.ts";
import { MovementSystem } from "$/common/systems/movement_system.ts";
import { RenderSystem } from "$/client/systems/render_system.ts";
import { PlayerControlsSystem } from "$/client/systems/player_controls.ts";
import { DebugUI } from "$/client/debug_ui.ts";
import { DebugSystem } from "$/client/systems/debug_system.ts";
import { create_player } from "$/client/player.ts";
import { Tilemap } from "$/client/components/tilemap.ts";
import { AssetManager } from "$/client/assets.ts";
import { TileEditorSystem } from "$/client/systems/tile_editor_system.ts";
import { InventorySystem } from "$/client/systems/inventory_system.ts";

export class ClientWorld extends World {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	debugging = false;

	constructor(canvas: HTMLCanvasElement) {
		super();

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

		const tilemap = new Entity("backgroundtiles");
		tilemap.add(
			new Tilemap(
				AssetManager.instance.get("bworld:roguelike"),
				16,
				[],
				2,
				1,
			),
		);
		this.add_entity(tilemap);

		const player = create_player();
		this.add_entity(player);

		this.add_system(new InventorySystem());
		this.add_system(new PlayerControlsSystem(player));
		this.add_system(new MovementSystem());

		// render systems
		this.add_system(new RenderSystem(this.ctx));
		this.add_system(new DebugSystem());
		this.add_system(new TileEditorSystem());
	}
}
