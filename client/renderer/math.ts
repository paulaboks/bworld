import { camera } from "./core.ts";

export function mat4_perspective(out: Float32Array, fov: number, aspect: number, near: number, far: number) {
	const f = 1 / Math.tan(fov / 2);

	out[0] = f / aspect;
	out[1] = 0;
	out[2] = 0;
	out[3] = 0;

	out[4] = 0;
	out[5] = f;
	out[6] = 0;
	out[7] = 0;

	out[8] = 0;
	out[9] = 0;
	out[10] = -(far + near) / (far - near);
	out[11] = -1;

	out[12] = 0;
	out[13] = 0;
	out[14] = -(2 * far * near) / (far - near);
	out[15] = 0;
}

export function mat4_view(out: Float32Array) {
	const cx = camera.x;
	const cy = camera.y;
	const cz = camera.z;

	const yaw = camera.yaw;
	const pitch = camera.pitch;

	const cosY = Math.cos(yaw);
	const sinY = Math.sin(yaw);
	const cosP = Math.cos(pitch);
	const sinP = Math.sin(pitch);

	const fx = cosP * sinY;
	const fy = sinP;
	const fz = cosP * cosY;

	const rx = cosY;
	const rz = -sinY;

	const ux = -sinP * sinY;
	const uy = cosP;
	const uz = -sinP * cosY;

	out[0] = rx;
	out[1] = ux;
	out[2] = -fx;
	out[3] = 0;

	out[4] = 0;
	out[5] = uy;
	out[6] = -fy;
	out[7] = 0;

	out[8] = rz;
	out[9] = uz;
	out[10] = -fz;
	out[11] = 0;

	out[12] = -(rx * cx + rz * cz);
	out[13] = -(ux * cx + uy * cy + uz * cz);
	out[14] = fx * cx + fy * cy + fz * cz;
	out[15] = 1;
}

export function mat4_mul(out: Float32Array, a: Float32Array, b: Float32Array) {
	for (let i = 0; i < 4; i++) {
		const ai0 = a[i];
		const ai1 = a[i + 4];
		const ai2 = a[i + 8];
		const ai3 = a[i + 12];

		out[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
		out[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
		out[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
		out[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
	}
}
