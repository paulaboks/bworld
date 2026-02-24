import { AssetManager } from "./assets.ts";
import { ClientWorld } from "./client_world.ts";
import { InputManager } from "./input_manager.ts";

export class ClientLoop {
	running = false;
	last_time = 0;
	world: ClientWorld;

	frame_count = 0;
	last_fps_time = 0;

	constructor(world: ClientWorld) {
		this.world = world;
	}

	start() {
		this.running = true;
		const now = performance.now();
		this.last_time = now;
		this.frame_count = 0;
		this.last_fps_time = this.last_time;
		requestAnimationFrame((time) => this.loop(time));
	}

	stop() {
		this.running = false;
	}

	loop(time: number) {
		if (!this.running) {
			return;
		}

		const delta = (time - this.last_time) / 1000;

		const ctx = this.world.ctx;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		this.world.update(delta);

		this.frame_count += 1;
		const now = performance.now();
		if (now - this.last_fps_time >= 1000) {
			const fps = (this.frame_count * 1000) / (now - this.last_fps_time);
			console.log(`FPS: ${fps.toFixed(2)}`);
			this.frame_count = 0;
			this.last_fps_time = now;
		}

		InputManager.update();

		this.last_time = time;
		requestAnimationFrame((time) => this.loop(time));
	}
}

const canvas = document.getElementById("game") as HTMLCanvasElement;
if (!canvas) {
	throw Error("Canvas was not found");
}

InputManager.initialize(canvas);

AssetManager.instance.load("bworld:player", "/assets/sprites/player.png");
AssetManager.instance.load("bworld:roguelike", "/assets/sprites/roguelike.png");
AssetManager.instance.load("bworld:tiny_town", "/assets/sprites/tiny_town.png");
AssetManager.instance.load("bworld:ui", "/assets/sprites/ui.png");

await AssetManager.instance.load_all();

const client_world = new ClientWorld(canvas);

const loop = new ClientLoop(client_world);
loop.start();

console.log("Game started");
