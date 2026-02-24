import { System } from "$/common/ecs/mod.ts";
import { ClientWorld } from "$/client/client_world.ts";
import { DebugUI } from "$/client/debug_ui.ts";

export class DebugSystem extends System {
	constructor() {
		super();
	}

	update(world: ClientWorld, _delta: number): void {
		if (!world.debugging) {
			return;
		}

		DebugUI.ctx.save();
		DebugUI.ctx.resetTransform();

		DebugUI.begin("Entities", 10, 10, 300);

		for (const entity of world.get_entities()) {
			if (DebugUI.collapsing_header("Entity - " + entity.id)) {
				for (const component of entity.get_all()) {
					if (DebugUI.collapsing_header(`${component.constructor.name}##${entity.id}`)) {
						this.render_component(component);
					}
				}
			}
		}

		DebugUI.end();
		DebugUI.ctx.restore();
	}

	// deno-lint-ignore no-explicit-any
	render_component(component: any) {
		for (const key in component) {
			if (key === "__component") {
				continue;
			}
			if (typeof component[key] === "number") {
				component[key] = DebugUI.float_input(
					key,
					component[key],
				);
			} else if (typeof component[key] === "string") {
				component[key] = DebugUI.text_input(
					key,
					component[key],
				);
			} else if (typeof component[key] === "boolean") {
				component[key] = DebugUI.checkbox(
					key,
					component[key],
				);
			} else {
				DebugUI.text(`${key}: ${JSON.stringify(component[key])}`);
			}
			DebugUI.separator();
		}
	}
}
