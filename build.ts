import { copy } from "@std/fs";

const BUILD_FOLDER = "build";

function clear_folder() {
	Deno.removeSync(BUILD_FOLDER, { recursive: true });
	Deno.mkdir(BUILD_FOLDER);
}

function build_assets() {
	copy("assets", `${BUILD_FOLDER}/assets`);
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
	build_assets();
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
