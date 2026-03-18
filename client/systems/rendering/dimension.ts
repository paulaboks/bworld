import { EverythingRegistry } from "$/common/everything_registry.ts";
import { Chunk, Dimension } from "$/client/components/dimension.ts";
import { Camera } from "$/client/components/camera.ts";
import { AssetManager } from "$/client/assets.ts";
import { flush_buffer, gl, set_current_texture } from "$/client/renderer/mod.ts";

let gdimension: Dimension;

const worker = new Worker(new URL("./workers/chunk_mesh_worker.js", import.meta.url), {
	type: "module",
});

worker.onmessage = (event) => {
	const { opaque_vertices, opaque_count, transparent_vertices, transparent_count, chunk_x, chunk_z } = event.data;
	const chunk = gdimension.get_chunk(chunk_x, chunk_z);
	if (!chunk) {
		console.error("bad");
		return;
	}
	gdimension.delete_chunk_mesh(chunk);
	chunk.dirty = false;

	chunk.opaque_vertex_buffer = gl.createBuffer();
	chunk.opaque_vertex_count = opaque_count / 9;

	gl.bindBuffer(gl.ARRAY_BUFFER, chunk.opaque_vertex_buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		opaque_vertices.subarray(0, opaque_count),
		gl.STATIC_DRAW,
	);

	chunk.transparent_vertex_buffer = gl.createBuffer();
	chunk.transparent_vertex_count = transparent_count / 9;

	gl.bindBuffer(gl.ARRAY_BUFFER, chunk.transparent_vertex_buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		transparent_vertices.subarray(0, transparent_count),
		gl.STATIC_DRAW,
	);
};

function strip_functions<T extends Record<string, any>>(obj: T) {
	const out: any = {};

	for (const k in obj) {
		const v = obj[k];

		if (typeof v === "function") continue;

		if (v && typeof v === "object") {
			out[k] = strip_functions(v);
		} else {
			out[k] = v;
		}
	}

	return out;
}

export function render_dimension(dimension: Dimension, camera: Camera) {
	gdimension = dimension;

	set_current_texture(dimension.image.tex);

	for (const chunk of dimension.chunks) {
		if (chunk.dirty && chunk.generated) {
			const padded_chunk = dimension.create_padded_chunk(chunk);
			worker.postMessage({
				chunk_x: chunk.x,
				chunk_z: chunk.z,
				padded_chunk,
				blocks_registry: strip_functions(EverythingRegistry.get_registry("blocks")),
				textures_info: AssetManager.instance.get("bworld:textures_info"),
				image: { width: dimension.image.width, height: dimension.image.height },
			}, [padded_chunk.buffer]);
			chunk.dirty = false;
		}
	}
	for (const chunk of dimension.chunks) {
		render_chunk_opaque(chunk);
	}

	for (const chunk of dimension.chunks) {
		render_chunk_transparent(chunk);
	}
}

function render_chunk_opaque(chunk: Chunk) {
	if (!chunk.opaque_vertex_buffer || !chunk.opaque_vertex_count) {
		return;
	}

	flush_buffer(chunk.opaque_vertex_buffer, chunk.opaque_vertex_count);
}

function render_chunk_transparent(chunk: Chunk) {
	if (!chunk.transparent_vertex_buffer || !chunk.transparent_vertex_count) {
		return;
	}

	flush_buffer(chunk.transparent_vertex_buffer, chunk.transparent_vertex_count);
}
