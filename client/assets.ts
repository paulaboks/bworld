type Asset = HTMLImageElement | HTMLAudioElement | string;

export class AssetManager {
	static instance = new AssetManager();

	assets: Record<string, Asset> = {};
	loading_promises: Promise<void>[] = [];

	constructor() {}

	load(key: string, src: string) {
		if (this.assets[key]) {
			return;
		}

		if (src.endsWith(".png")) {
			const img = new Image();
			const promise = new Promise<void>((resolve, reject) => {
				img.onload = () => resolve();
				img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
			});
			img.src = src;
			this.assets[key] = img;
			this.loading_promises.push(promise);
		} else if (src.endsWith(".ogg")) {
			const audio = new Audio();
			const promise = new Promise<void>((resolve, reject) => {
				audio.addEventListener(
					"canplaythrough",
					() => resolve(),
					{ once: true },
				);
				audio.addEventListener(
					"error",
					() => reject(new Error(`Failed to load audio: ${src}`)),
					{ once: true },
				);
			});

			audio.src = src;
			audio.load();
			this.assets[key] = audio;
			this.loading_promises.push(promise);
		} else if (src.endsWith(".txt") || src.endsWith(".md")) {
			const promise = async () => {
				const resp = await fetch(src);
				this.assets[key] = await resp.text();
			};
			this.loading_promises.push(promise());
		}
	}

	async load_all() {
		await Promise.all(this.loading_promises);
		this.loading_promises = [];
	}

	get<T>(key: string): T {
		const asset = this.assets[key];
		if (!asset) {
			throw new Error(`Asset not found: ${key}`);
		}
		return asset as T;
	}
}
