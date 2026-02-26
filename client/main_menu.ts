import { Entity } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { ClientWorld } from "./client_world.ts";
import { UIButton } from "./components/ui_components.ts";
import { open_about } from "./about.ts";
import { start_game } from "./game.ts";

export function create_main_menu(world: ClientWorld) {
	const canvas = world.canvas;

	const play_button = new Entity("play");
	play_button.add(new Position(canvas.width / 2 - 150, canvas.height / 2 - 80));
	play_button.add(new UIButton("Play", 320, 64, () => start_game(world)));
	world.add_entity(play_button);

	const about_button = new Entity("aboutbutton");
	about_button.add(new Position(canvas.width / 2 - 150, canvas.height / 2 + 80));
	about_button.add(new UIButton("About", 320, 64, () => open_about()));
	world.add_entity(about_button);
}
