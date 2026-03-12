import { Component } from "$/common/ecs/mod.ts";
import { EverythingRegistry, TileRegistry } from "$/common/everything_registry.ts";
import { AssetManager } from "../assets.ts";
import { ClientWorld } from "../client_world.ts";
import { Texture } from "../renderer/mod.ts";

export interface Tile<T = unknown> {
	x: number;
	y: number;
	z: number;
	id: string;
	data?: T;
	tickable?: boolean;
}

export class Dimension extends Component {
	image: Texture;
	tiles: Tile[];
	second_timer = 0;
	tick_timer = 0;

	constructor(tiles: Tile[]) {
		super();
		this.image = AssetManager.instance.get("bworld:textures");
		this.tiles = tiles;
	}

	add_tile(world: ClientWorld, tile: Tile) {
		this.tiles.push(tile);
		const tile_info = EverythingRegistry.get<TileRegistry>("tiles", tile.id);
		if (tile_info?.on_create) {
			tile_info?.on_create(world, tile);
		}
	}

	delete_tile(_world: ClientWorld, tile: Tile) {
		const index = this.tiles.indexOf(tile);
		if (index !== -1) {
			this.tiles.splice(index, 1);
		}

		// const tile_info = EverythingRegistry.get<TileRegistry>("tiles", tile.id);
		// if (tile_info?.on_delete) {
		// 	tile_info?.on_delete(world, tile);
		// }
	}
}
