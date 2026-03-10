import { Position } from "$/common/components/position.ts";
import { Velocity } from "$/common/components/velocity.ts";
import { Component, Entity } from "$/common/ecs/mod.ts";
import { Camera } from "$/client/components/camera.ts";
import { ItemStack, PlayerInventory } from "./inventory.ts";
import { PlayerControls } from "$/client/components/player_controls.ts";
import { AnimatedSprite, Sprite } from "$/client/components/sprite.ts";
import { ClientWorld } from "./client_world.ts";
import { AssetManager } from "./assets.ts";
import { GuiScreen } from "./gui/gui_screen.ts";

export class PlayerComponent extends Component {
	player_inventory = new PlayerInventory("");
	screens: GuiScreen[] = [];

	pop_screen() {
		const screen = this.screens.pop();
		if (screen) {
			screen.on_close();
		}
	}
}

export function create_player(world: ClientWorld) {
	const player = new Entity("player");
	player.add(new Position(1440, 700));
	player.add(new Velocity(0, 0));
	player.add(
		new AnimatedSprite("bworld:player", 72, 72, {
			"idle": {
				source_x: [0, 24],
				source_y: [0, 0],
				source_width: 24,
				source_height: 24,
				duration: 60,
			},
			"running": {
				source_x: [0, 24, 48, 72, 96, 120, 144, 168],
				source_y: [24, 24, 24, 24, 24, 24, 24, 24],
				source_width: 24,
				source_height: 24,
				duration: 20,
			},
		}, "idle"),
	);
	player.add(new PlayerControls());

	player.add(new PlayerComponent());
	const player_inventory = player.get(PlayerComponent)!.player_inventory;
	player_inventory.container.add_item(new ItemStack("bworld:pickaxe", 1, 1));
	player_inventory.container.add_item(new ItemStack("bworld:hoe", 1, 1));
	player_inventory.container.add_item(new ItemStack("bworld:watering_can", 1, 1));
	player_inventory.container.add_item(new ItemStack("bworld:axe", 1, 1));
	// player.get(PlayerInventory)!.container.add_item(new ItemStack("bworld:sword", 1, 1));
	// player.get(PlayerInventory)!.container.add_item(new ItemStack("bworld:bomb", 64));
	// player_inventory.container.add_item(new ItemStack("bworld:tomato_seeds", 64));
	// player_inventory.container.add_item(new ItemStack("bworld:potato_seeds", 64));
	// player_inventory.container.add_item(new ItemStack("bworld:pumpkin_seeds", 64));
	// player_inventory.container.add_item(new ItemStack("bworld:carrot_seeds", 64));
	player_inventory.container.add_item(new ItemStack("bworld:furnace", 1));
	player.add(new Camera(-100, -100));

	world.add_entity(player);

	const player_hand = new Entity("playerhand");
	player_hand.add(new Position(0, 0));
	// empty sprite
	player_hand.add(new Sprite(AssetManager.instance.get("bworld:textures"), 0, 0));
	world.add_entity(player_hand);

	world.add_tag("player", [player, player_hand]);

	return player;
}
