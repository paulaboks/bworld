import { Component } from "$/common/ecs/mod.ts";
import { AssetManager } from "../assets.ts";
import { Texture } from "../renderer.ts";

interface Tile {
	x: number;
	y: number;
	id: string;
	data?: Record<string, unknown> | undefined;
}

export class Dimension extends Component {
	image: Texture;
	tiles: Tile[];

	constructor(tiles: Tile[]) {
		super();
		this.image = AssetManager.instance.get("bworld:textures");
		this.tiles = tiles;
	}
}
