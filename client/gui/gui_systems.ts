import { System } from "$/common/ecs/mod.ts";
import { ClientWorld } from "../client_world.ts";
import { PlayerComponent } from "../player.ts";

export class GuiRenderSystem extends System {
	update(world: ClientWorld, _delta: number): void {
		const [player] = world.get_tag("player")!;
		const player_component = player.get(PlayerComponent)!;

		for (const screen of player_component.screens) {
			screen.on_render();
		}
	}
}

export class GuiTickSystem extends System {
	update(world: ClientWorld, delta: number): void {
		const [player] = world.get_tag("player")!;
		const player_component = player.get(PlayerComponent)!;

		for (const screen of player_component.screens) {
			screen.on_tick(delta);
		}
	}
}
