import { System } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { Sprite } from "../components/sprite.ts";
import { ClientWorld } from "../client_world.ts";
import { ClickableSprite } from "../components/clickable.ts";
import { point_inside_rec } from "$/common/utils.ts";
import { InputManager } from "../input_manager.ts";
import { Camera } from "../components/camera.ts";
import { canvas } from "../renderer/mod.ts";

export class ClickableSystem extends System {
	update(world: ClientWorld, _delta: number): void {
	}
}
