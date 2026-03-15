import { Entity } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { ClientWorld } from "./client_world.ts";
import { Dimension } from "./components/dimension.ts";
import { create_player } from "./player.ts";
import { UIButton } from "./components/ui_components.ts";
import { open_about } from "./about.ts";
import { canvas } from "./renderer/mod.ts";

export function start_game(world: ClientWorld) {
	world.state = "game";
	world.clear_entities();

	const dimension = new Entity("dimension");
	world.dimension = new Dimension(world);
	dimension.add(world.dimension);
	world.add_entity(dimension);

	create_player(world);

	// UI !
	const unpause_button = new Entity("unpausebutton");
	unpause_button.add(new Position(canvas.width / 2 - 150, canvas.height / 2 - 80));
	unpause_button.add(new UIButton("Unpause", 320, 64, () => world.state = "paused"));
	world.add_entity(unpause_button);

	const about_button = new Entity("aboutbutton");
	about_button.add(new Position(canvas.width / 2 - 150, canvas.height / 2 + 80));
	about_button.add(new UIButton("About", 320, 64, () => open_about()));
	world.add_entity(about_button);
}
