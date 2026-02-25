import { copy } from "@std/fs";
import { createCanvas, loadImage } from "@gfx/canvas-wasm";

const BUILD_FOLDER = "build";

function clear_folder() {
	Deno.removeSync(BUILD_FOLDER, { recursive: true });
	Deno.mkdir(BUILD_FOLDER);
}

function build_fonts() {
	copy(`assets/fonts`, `${BUILD_FOLDER}/assets/fonts`);
}

function next_power_of_two(value: number): number {
	return Math.pow(2, Math.ceil(Math.log2(value)));
}

const SPRITE_SIZE = 16;

function calculate_atlas_size(count: number) {
	const raw_sprites_per_side = Math.ceil(Math.sqrt(count));
	const raw_size = raw_sprites_per_side * SPRITE_SIZE;
	const size = next_power_of_two(raw_size);

	return {
		sprites_per_side: size / SPRITE_SIZE,
		size,
	};
}

async function build_atlas_from_folder(folder: string) {
	let sprite_count = 0;
	for (const entry of Deno.readDirSync(folder)) {
		console.assert(entry.isFile && entry.name.endsWith(".png"));
		sprite_count += 1;
	}

	const atlas = calculate_atlas_size(sprite_count);

	const canvas = createCanvas(atlas.size, atlas.size);
	const ctx = canvas.getContext("2d");

	const atlas_info: Record<string, { x: number; y: number }> = {};

	// purple and black missing texture at x:0 y:0 wow !
	ctx.fillStyle = "magenta";
	ctx.fillRect(0, 0, 8, 8);
	ctx.fillRect(8, 8, 8, 8);
	ctx.fillStyle = "black";
	ctx.fillRect(8, 0, 8, 8);
	ctx.fillRect(0, 8, 8, 8);

	let index = 1;
	for (const entry of Deno.readDirSync(folder)) {
		const sprite = await loadImage(`${folder}/${entry.name}`);
		const row = Math.floor(index / atlas.sprites_per_side);
		const column = index % atlas.sprites_per_side;
		ctx.drawImage(sprite, column * SPRITE_SIZE, row * SPRITE_SIZE);
		index += 1;

		const id = `bworld:${entry.name.replace(".png", "")}`;
		atlas_info[id] = { x: column, y: row };
	}

	Deno.writeFileSync(`${BUILD_FOLDER}/${folder}.png`, canvas.toBuffer());
	Deno.writeTextFileSync(`${BUILD_FOLDER}/${folder}.json`, JSON.stringify(atlas_info));
}

async function build_sprites() {
	for (const entry of Deno.readDirSync("assets/sprites")) {
		if (entry.name.endsWith(".png")) {
			copy(`assets/sprites/${entry.name}`, `${BUILD_FOLDER}/assets/sprites/${entry.name}`);
		} else if (entry.isDirectory) {
			await build_atlas_from_folder(`assets/sprites/${entry.name}`);
		}
	}
}

async function build_assets() {
	Deno.mkdir(`${BUILD_FOLDER}/assets`, { recursive: true });
	copy("assets/ASSETS.md", `${BUILD_FOLDER}/assets/ASSETS.md`);

	build_fonts();
	Deno.mkdir(`${BUILD_FOLDER}/assets/sprites`, { recursive: true });
	await build_sprites();
}

async function build_client() {
	const _result = await Deno.bundle({
		entrypoints: ["./client/index.html"],
		outputDir: `${BUILD_FOLDER}/client`,
		platform: "browser",
		minify: false,
	});
}

async function build() {
	const now = performance.now();
	clear_folder();
	await build_assets();
	await build_client();
	console.log(`Built in ${(performance.now() - now).toFixed(2)}ms`);
}

let last_build = 0;

if (import.meta.main) {
	await build();
	const watcher = Deno.watchFs(["assets", "client", "common"], { recursive: true });
	for await (const event of watcher) {
		const now = performance.now();
		if (now - last_build < 500) {
			continue;
		}
		if (["create", "modify", "rename", "remove"].includes(event.kind)) {
			last_build = now;
			console.log("Rebuilding...");
			await build();
		}
	}
}
