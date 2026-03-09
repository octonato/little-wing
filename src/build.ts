import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const isProduction = process.argv.includes("--production");
const rootDir = resolve(import.meta.dirname, "..");
const distDir = resolve(rootDir, "dist");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const entrypoints = [
	resolve(rootDir, "src/popup/popup.ts"),
	resolve(rootDir, "src/background/service-worker.ts"),
];

if (isProduction) {
	for (const entrypoint of entrypoints) {
		const result = await Bun.build({
			entrypoints: [entrypoint],
			outdir: distDir,
			root: resolve(rootDir, "src"),
			target: "browser",
			minify: true,
		});
		if (!result.success) {
			console.error(`Build failed for ${entrypoint}:`, result.logs);
			process.exit(1);
		}
	}
} else {
	const result = await Bun.build({
		entrypoints,
		outdir: distDir,
		root: resolve(rootDir, "src"),
		target: "browser",
	});
	if (!result.success) {
		console.error("Build failed:", result.logs);
		process.exit(1);
	}
}

cpSync(resolve(rootDir, "static/manifest.json"), resolve(distDir, "manifest.json"));
cpSync(resolve(rootDir, "src/popup/popup.html"), resolve(distDir, "popup/popup.html"));

console.log(`Built ${isProduction ? "production" : "development"} extension to dist/`);
