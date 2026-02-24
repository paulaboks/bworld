import { Position } from "$/common/components/position.ts";
import { AnimatedSprite, Sprite } from "$/client/components/sprite.ts";

export function render_sprite(ctx: CanvasRenderingContext2D, sprite: Sprite, position: Position) {
	ctx.save();

	ctx.translate(
		Math.floor(sprite.flip_x ? position.x + sprite.width : position.x),
		Math.floor(sprite.flip_y ? position.y + sprite.height : position.y),
	);
	ctx.scale(
		sprite.flip_x ? -1 : 1,
		sprite.flip_y ? -1 : 1,
	);

	ctx.drawImage(
		sprite.image,
		sprite.source_x,
		sprite.source_y,
		sprite.source_width,
		sprite.source_height,
		0,
		0,
		sprite.width,
		sprite.height,
	);
	ctx.restore();
}

export function render_animated_sprite(
	ctx: CanvasRenderingContext2D,
	animated_sprite: AnimatedSprite,
	position: Position,
) {
	ctx.save();

	const current_animation = animated_sprite.states[animated_sprite.current_state];
	if (!current_animation) {
		console.error(`Missing animation for state ${animated_sprite.current_state}`);
		return;
	}

	ctx.translate(
		Math.floor(animated_sprite.flip_x ? position.x + animated_sprite.width : position.x),
		Math.floor(animated_sprite.flip_y ? position.y + animated_sprite.height : position.y),
	);

	ctx.scale(
		animated_sprite.flip_x ? -1 : 1,
		animated_sprite.flip_y ? -1 : 1,
	);

	ctx.drawImage(
		animated_sprite.image,
		current_animation.source_x[animated_sprite.animation_frame],
		current_animation.source_y[animated_sprite.animation_frame],
		current_animation.source_width,
		current_animation.source_height,
		0,
		0,
		animated_sprite.width,
		animated_sprite.height,
	);

	animated_sprite.timer += 1;
	if (animated_sprite.timer >= current_animation.duration) {
		animated_sprite.timer = 0;
		animated_sprite.animation_frame += 1;

		if (animated_sprite.animation_frame >= current_animation.source_x.length) {
			animated_sprite.animation_frame = 0;
		}
	}

	ctx.restore();
}
