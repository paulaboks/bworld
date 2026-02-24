import { Component } from "$/common/ecs/mod.ts";

interface Tile {
	x: number;
	y: number;
	index: number;
}

export class Tilemap extends Component {
	image: HTMLImageElement;
	tile_size: number;
	rows: number;
	columns: number;
	tiles: Tile[];
	scale: number;
	margin: number;

	selected_tile = 0;
	editing = false;

	constructor(
		image: HTMLImageElement,
		tile_size: number,
		tiles: Tile[],
		scale: number = 1,
		margin: number = 0,
	) {
		super();
		this.image = image;
		this.tile_size = tile_size;
		this.columns = Math.floor((image.width + margin) / (tile_size + margin));
		this.rows = Math.floor((image.height + margin) / (tile_size + margin));
		this.tiles = tiles;
		this.scale = scale;
		this.margin = margin;
	}
}
