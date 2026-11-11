import { cp, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const projectRoot = process.cwd();
const outputDirectory = resolve(projectRoot, "dist");

const entries = await readdir(outputDirectory);
if (!entries.includes("index.html")) {
  throw new Error("Vite output is missing dist/index.html.");
}

for (const directory of ["assets", "brands"]) {
  await rm(join(projectRoot, directory), { recursive: true, force: true });
}

for (const entry of entries) {
  await cp(join(outputDirectory, entry), join(projectRoot, entry), {
    recursive: true,
    force: true
  });
}

console.log(`Published ${entries.length} built entries to the GitHub Pages branch root.`);
