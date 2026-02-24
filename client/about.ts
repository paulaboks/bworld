import { marked } from "marked";
import { AssetManager } from "./assets.ts";

export async function open_about() {
	const popup = self.open(
		"",
		"popupWindow",
		"width=500,height=400",
	);

	if (!popup) {
		alert("oh no");
		return;
	}

	popup.document.body.innerHTML = await marked.parse(AssetManager.instance.get("bworld:assets_text"));
	popup.document.head.innerHTML = `<style>
		body {
			font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			line-height: 1.7;
			color: #e5e7eb;
			max-width: 800px;
			margin: 2rem auto;
			padding: 0 1rem;
		}
		h1, h2, h3, h4 {
			font-weight: 600;
			line-height: 1.3;
			margin-top: 2rem;
			margin-bottom: 1rem;
		}
		h1 {
			font-size: 2rem;
			border-bottom: 1px solid #e5e7eb;
			padding-bottom: 0.3rem;
		}
		h2 {
			font-size: 1.5rem;
			border-bottom: 1px solid #e5e7eb;
			padding-bottom: 0.3rem;
		}
		h3 {
			font-size: 1.25rem;
		}
		p {
			margin: 1rem 0;
		}
		a {
			color: #2563eb;
			text-decoration: none;
		}
		a:hover {
			text-decoration: underline;
		}
		ul, ol {
			padding-left: 2rem;
			margin: 1rem 0;
		}
		code {
			background: #1f2937;
			padding: 0.2em 0.4em;
			border-radius: 4px;
			font-size: 0.9em;
		}
		pre {
			background: #0f172a;
			color: #f9fafb;
			padding: 1rem;
			border-radius: 8px;
			overflow-x: auto;
		}
		pre code {
			background: none;
			padding: 0;
			color: inherit;
		}
		blockquote {
			border-left: 4px solid #d1d5db;
			padding-left: 1rem;
			color: #6b7280;
			margin: 1rem 0;
		}
		table {
			border-collapse: collapse;
			width: 100%;
			margin: 1rem 0;
		}
		th, td {
			border: 1px solid #e5e7eb;
			padding: 0.5rem;
		}
		th {
			background: #f9fafb;
			text-align: left;
		}
	</style>`;
}
