export interface Texture {
	tex: WebGLTexture;
	width: number;
	height: number;
}

export interface FntChar {
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
	xoffset: number;
	yoffset: number;
	xadvance: number;
	page: number;
}

export interface FntFont {
	line_height: number;
	chars: Record<number, FntChar>;
	pages: string[];
}

export class Camera3D {
	x = 0;
	y = 0;
	z = 0;

	pitch = 0;
	yaw = 0;
}
