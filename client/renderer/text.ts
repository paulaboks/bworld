import { AssetManager } from "../assets.ts";
import { flush_batch, get_current_texture, push_quad, set_current_texture } from "./core.ts";
import { FntChar, FntFont, Texture } from "./types.ts";

let font_texture: Texture;
let font_fnt: FntFont;

export function init_font() {
	font_texture = AssetManager.instance.get<Texture>("bworld:m6x11");

	font_fnt = parse_fnt(AssetManager.instance.get("bworld:m6x11_fnt"));
}

function parse_fnt(text: string): FntFont {
	const lines = text.split(/\r?\n/);

	const font: FntFont = {
		line_height: 0,
		chars: {},
		pages: [],
	};

	for (const line of lines) {
		const parts = line.split(" ");
		const type = parts[0];

		const data: Record<string, string> = {};

		for (const part of parts.slice(1)) {
			const [k, v] = part.split("=");
			if (!k) {
				continue;
			}
			data[k] = v?.replace(/"/g, "");
		}

		if (type === "common") {
			font.line_height = Number(data.lineHeight);
		}

		if (type === "page") {
			font.pages.push(data.file);
		}

		if (type === "char") {
			const char: FntChar = {
				id: Number(data.id),
				x: Number(data.x),
				y: Number(data.y),
				width: Number(data.width),
				height: Number(data.height),
				xoffset: Number(data.xoffset),
				yoffset: Number(data.yoffset),
				xadvance: Number(data.xadvance),
				page: Number(data.page),
			};

			font.chars[char.id] = char;
		}
	}

	return font;
}

export function draw_text(str: string, x: number, y: number, scale: number = 1, color = [1, 1, 1, 1]) {
	if (!font_texture) {
		return;
	}

	if (get_current_texture() !== font_texture.tex) {
		flush_batch();
		set_current_texture(font_texture.tex);
	}

	for (const ch of str) {
		const glyph = font_fnt.chars[ch.charCodeAt(0)];
		if (!glyph) {
			continue;
		}

		const dx = x + glyph.xoffset * scale;
		const dy = y + glyph.yoffset * scale;
		const dw = glyph.width * scale;
		const dh = glyph.height * scale;

		const u0 = glyph.x / font_texture.width;
		const v0 = glyph.y / font_texture.height;
		const u1 = (glyph.x + glyph.width) / font_texture.width;
		const v1 = (glyph.y + glyph.height) / font_texture.height;

		push_quad(dx, dy, dw, dh, u0, v0, u1, v1, color[0], color[1], color[2], color[3]);

		x += glyph.xadvance * scale;
	}
}

export function measure_text(str: string, scale: number = 1) {
	let x = 0;
	for (const ch of str) {
		const glyph = font_fnt.chars[ch.charCodeAt(0)];
		if (!glyph) {
			continue;
		}
		x += glyph.xadvance * scale;
	}
	return x;
}
