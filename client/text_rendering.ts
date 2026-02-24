const TEXT_SCALE = 8;

export function measure_text(ctx: CanvasRenderingContext2D, text: string, scale = 1): number {
	ctx.font = `${scale * TEXT_SCALE}px m6x11`;
	return ctx.measureText(text).width;
}

export function draw_text(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	scale = 1,
	color = "white",
	baseline: CanvasTextBaseline = "top",
	align: CanvasTextAlign = "left",
) {
	ctx.textBaseline = baseline;
	ctx.textAlign = align;
	ctx.font = `${scale * TEXT_SCALE}px m6x11`;
	ctx.fillStyle = color;
	ctx.fillText(text, Math.floor(x), Math.floor(y));
}
