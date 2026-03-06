import { Position } from "$/common/components/position.ts";
import { AnimatedSprite, Sprite } from "$/client/components/sprite.ts";
import { draw_texture_region } from "../../renderer.ts";
import { AssetManager } from "../../assets.ts";

export function render_sprite(sprite: Sprite, position: Position) {
	draw_texture_region(
		sprite.image,
		sprite.source_x,
		sprite.source_y,
		sprite.source_width,
		sprite.source_height,
		position.x,
		position.y,
		sprite.width,
		sprite.height,
		sprite.flip_x,
		sprite.flip_y,
	);
}

export function render_animated_sprite(
	animated_sprite: AnimatedSprite,
	position: Position,
) {
	const current_animation = animated_sprite.states[animated_sprite.current_state];
	if (!current_animation) {
		console.error(`Missing animation for state ${animated_sprite.current_state}`);
		return;
	}

	draw_texture_region(
		AssetManager.instance.get("bworld:player"),
		current_animation.source_x[animated_sprite.animation_frame],
		current_animation.source_y[animated_sprite.animation_frame],
		current_animation.source_width,
		current_animation.source_height,
		position.x,
		position.y,
		animated_sprite.width,
		animated_sprite.height,
		animated_sprite.flip_x,
		animated_sprite.flip_y,
	);

	animated_sprite.timer += 1;
	if (animated_sprite.timer >= current_animation.duration) {
		animated_sprite.timer = 0;
		animated_sprite.animation_frame += 1;

		if (animated_sprite.animation_frame >= current_animation.source_x.length) {
			animated_sprite.animation_frame = 0;
		}
	}
}
