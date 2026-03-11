import { System } from "$/common/ecs/mod.ts";
import { Position } from "$/common/components/position.ts";
import { ClientWorld } from "$/client/client_world.ts";
import { UIButton } from "$/client/components/ui_components.ts";
import { draw_nine_slice } from "./rendering/render_utils.ts";
import { AssetManager } from "../assets.ts";
import { draw_text, Texture } from "../renderer/mod.ts";

const SCALE = 4;

export class UIRenderSystem implements System {
	constructor() {}

	update(world: ClientWorld, _delta: number) {
		const ui = AssetManager.instance.get<Texture>("bworld:ui");

		for (const entity of world.get_entities()) {
			const position = entity.get(Position);
			const button = entity.get(UIButton);

			if (position && button) {
				draw_nine_slice(
					ui,
					16 * (button.hovered ? 14 : 11),
					16 * (button.hovered ? 1 : 0),
					16,
					16,
					3,
					3,
					3,
					3,
					position.x / SCALE,
					position.y / SCALE,
					button.width / SCALE,
					button.height / SCALE,
				);
				// const measure = measure_text(ctx, button.text, 1.25);
				draw_text(
					button.text,
					(position.x / SCALE) + (button.width / SCALE / 2) - (100 / 2),
					position.y / SCALE + (button.height / SCALE / 2),
					//1.5,
					//"white",
					//"middle",
				);
			}
		}
	}
}
