import { Position } from "$/common/components/position.ts";
import { Velocity } from "$/common/components/velocity.ts";
import { Entity } from "$/common/ecs/mod.ts";
import { Camera } from "$/client/components/camera.ts";
import { ItemStack, PlayerInventory } from "$/client/components/inventory.ts";
import { PlayerControls } from "$/client/components/player_controls.ts";
import { AnimatedSprite } from "$/client/components/sprite.ts";

export function create_player() {
	const player = new Entity("player");
	player.add(new Position(10, 10));
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
	// TODO: actual player ids
	player.add(new PlayerInventory(player.id));
	player.get(PlayerInventory)!.container.add_item(new ItemStack("bworld:pickaxe", 1, 1));
	player.get(PlayerInventory)!.container.add_item(new ItemStack("bworld:sword", 1, 1));
	player.get(PlayerInventory)!.container.add_item(new ItemStack("bworld:axe", 1, 1));
	player.get(PlayerInventory)!.container.add_item(new ItemStack("bworld:hoe", 1, 1));
	player.get(PlayerInventory)!.container.add_item(new ItemStack("bworld:watering_can", 1, 1));
	player.get(PlayerInventory)!.container.add_item(new ItemStack("bworld:bomb", 64));
	player.add(new Camera(-100, -100));
	return player;
}
