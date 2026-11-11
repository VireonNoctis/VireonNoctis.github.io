import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve, basename } from "node:path";

const dist = resolve(process.cwd(), "dist");
const htmlPath = join(dist, "index.html");
let html = await readFile(htmlPath, "utf8");
const assetDirectory = join(dist, "assets");
const assetNames = await readdir(assetDirectory);

const jsFiles = assetNames.filter((name) => name.endsWith(".js"));
const cssFiles = assetNames.filter((name) => name.endsWith(".css"));
if (jsFiles.length !== 1 || cssFiles.length !== 1) {
  throw new Error(
    `Expected one JavaScript bundle and one CSS bundle; found ${jsFiles.length} JS and ${cssFiles.length} CSS files.`
  );
}

const scriptTag = new RegExp(
  `<script\\b(?=[^>]*\\bsrc=["'][^"']*\\b${basename(jsFiles[0])}["'])[^>]*>\\s*</script>`,
  "i"
);
const styleTag = new RegExp(
  `<link\\b(?=[^>]*\\bhref=["'][^"']*\\b${basename(cssFiles[0])}["'])[^>]*>`,
  "i"
);
if (!scriptTag.test(html) || !styleTag.test(html)) {
  throw new Error("Could not find the Vite JavaScript and CSS tags in dist/index.html.");
}

const [javascript, css] = await Promise.all([
  readFile(join(assetDirectory, jsFiles[0]), "utf8"),
  readFile(join(assetDirectory, cssFiles[0]), "utf8")
]);
const toBase64 = (value) => Buffer.from(value, "utf8").toString("base64");

const bootstrap = `<script type="module">
const decode = (payload) => {
  const binary = atob(payload);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};
const style = document.createElement("style");
style.textContent = decode("${toBase64(css)}");
document.head.append(style);
const application = document.createElement("script");
application.type = "module";
application.textContent = decode("${toBase64(javascript)}");
document.body.append(application);
</script>`;

html = html.replace(scriptTag, bootstrap).replace(styleTag, "");
await writeFile(htmlPath, html, "utf8");
await rm(assetDirectory, { recursive: true, force: true });

console.log(
  `Inlined ${javascript.length.toLocaleString()} JavaScript and ${css.length.toLocaleString()} CSS characters into index.html.`
);
