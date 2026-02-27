import { Entity } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { ClientWorld } from "./client_world.ts";
import { Tilemap } from "./components/tilemap.ts";
import { AssetManager } from "./assets.ts";
import { create_player } from "./player.ts";
import { UIButton } from "./components/ui_components.ts";
import { open_about } from "./about.ts";
import { create_crop_entity, Crop } from "./components/crop.ts";

export function start_game(world: ClientWorld) {
	world.state = "game";
	world.clear_entities();

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
	world.add_entity(tilemap);

	create_player(world);

	// UI !
	const unpause_button = new Entity("unpausebutton");
	unpause_button.add(new Position(world.canvas.width / 2 - 150, world.canvas.height / 2 - 80));
	unpause_button.add(new UIButton("Unpause", 320, 64, () => world.state = "paused"));
	world.add_entity(unpause_button);

	const about_button = new Entity("aboutbutton");
	about_button.add(new Position(world.canvas.width / 2 - 150, world.canvas.height / 2 + 80));
	about_button.add(new UIButton("About", 320, 64, () => open_about()));
	world.add_entity(about_button);

	world.add_entity(create_crop_entity(
		0,
		0,
		new Crop("bworld:potato"),
	));
	world.add_entity(create_crop_entity(
		32,
		0,
		new Crop("bworld:carrot"),
	));
	world.add_entity(create_crop_entity(
		0,
		32,
		new Crop("bworld:pumpkin"),
	));
	world.add_entity(create_crop_entity(
		32,
		32,
		new Crop("bworld:tomato"),
	));
}
