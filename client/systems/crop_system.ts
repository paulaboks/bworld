import { System } from "$/common/ecs/mod.ts";
import { Sprite } from "../components/sprite.ts";
import { ClientWorld } from "../client_world.ts";
import { Crop } from "$/client/components/crop.ts";
import { get_sprite_region } from "$/common/utils.ts";
import { ClickableSprite } from "../components/clickable.ts";
import { ItemStack, PlayerInventory } from "../components/inventory.ts";

export class CropSystem extends System {
	update(world: ClientWorld, delta: number): void {
		for (const entity of world.get_entities()) {
			const crop = entity.get(Crop);

			if (!crop) {
				continue;
			}

			// finished growing, very good
			if (crop.total_stages === crop.current_stage + 1) {
				const clickable_sprite = entity.get(ClickableSprite);
				if (clickable_sprite && clickable_sprite.clicked) {
					const [player] = world.get_tag("player")!;
					const inventory = player.get(PlayerInventory)!;
					inventory.container.add_item(new ItemStack(crop.item_drop));
					world.delete_entity(entity);
				}
				continue;
			}

			crop.growth_time += delta;
			if (crop.growth_time >= crop.time_to_grow[crop.current_stage]) {
				crop.current_stage += 1;
				crop.growth_time = 0;
			}

			const sprite = entity.get(Sprite);

			if (sprite) {
				const region = get_sprite_region(crop.sprite_ids[crop.current_stage]);
				sprite.source_x = region.x * 16;
				sprite.source_y = region.y * 16;
			}
		}
	}
}
