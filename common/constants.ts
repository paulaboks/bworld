export const TEXTURE_SIZE = 16;

export const TICKS_PER_SECOND = 20;
export const TICK_DELTA = 1 / TICKS_PER_SECOND;

export const SLOT_SIZE = 18 * 3;

export interface SpriteRegion {
	x: number;
	y: number;
}

export const faces = ["west", "east", "bottom", "top", "north", "south"] as const;
export type Faces = typeof faces[number];

export const AIR = 0;
export const VOID = 0xFFFFFFFF;

export const ID_MASK = 0xFFFF;
export const STATE_SHIFT = 16;
