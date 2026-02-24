export const SLOT_SIZE = 18 * 3;

export interface SpriteRegion {
	x: number;
	y: number;
}

export const ITEM_SPRITES: Record<string, SpriteRegion> = {
	"bworld:pickaxe": { x: 7, y: 9 },
	"bworld:bomb": { x: 9, y: 8 },
};
