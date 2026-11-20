import { readFile, readdir, rm, writeFile, mkdir } from "node:fs/promises";
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
    "Expected one JavaScript bundle and one CSS bundle; found " +
    jsFiles.length + " JS and " + cssFiles.length + " CSS files."
  );
}

const scriptTag = new RegExp(
  "<script\\b(?=[^>]*\\bsrc=\"[^\"]*\\b" + basename(jsFiles[0]) + "\")[^>]*>\\s*</script>",
  "i"
);
const styleTag = new RegExp(
  "<link\\b(?=[^>]*\\bhref=\"[^\"]*\\b" + basename(cssFiles[0]) + "\")[^>]*>",
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

const bootstrap = [
  '<script type="module">',
  'const decode = (payload) => {',
  '  const binary = atob(payload);',
  '  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));',
  '  return new TextDecoder().decode(bytes);',
  '};',
  'const style = document.createElement("style");',
  'style.textContent = decode("' + toBase64(css) + '");',
  'document.head.append(style);',
  'const application = document.createElement("script");',
  'application.type = "module";',
  'application.textContent = decode("' + toBase64(javascript) + '");',
  'document.body.append(application);',
  '</script>'
].join("\n");

html = html.replace(scriptTag, bootstrap).replace(styleTag, "");
if (html.includes("/assets/")) {
  throw new Error("The root page still references an external Vite asset.");
}
await writeFile(htmlPath, html, "utf8");

const signatureDirectory = join(dist, "signature");
await mkdir(signatureDirectory, { recursive: true });

const signaturePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,follow" />
    <meta name="theme-color" content="#07090c" />
    <link rel="canonical" href="https://vireonnoctis.github.io/Vireon-Signature/" />
    <meta http-equiv="refresh" content="0;url=https://vireonnoctis.github.io/Vireon-Signature/" />
    <title>Vireon Signature has moved</title>
    <style>
      * { box-sizing: border-box; }
      body {
        min-height: 100vh; margin: 0; display: grid; place-items: center;
        padding: 28px; color: #f0f1ef; background: #07090c;
        font: 14px/1.6 Arial, Helvetica, sans-serif;
      }
      main { width: min(620px, 100%); }
      p { color: #a2a8aa; }
      small { color: #a2a8aa; letter-spacing: .18em; }
      h1 { font-size: clamp(42px, 9vw, 76px); line-height: .94; letter-spacing: -.07em; }
      a {
        display: inline-flex; align-items: center; gap: 16px; margin-top: 14px;
        padding: 13px 17px; color: #07090c; background: #e5e9e9;
        text-decoration: none; font-size: 11px; letter-spacing: .08em;
      }
    </style>
    <script>
      window.location.replace("https://vireonnoctis.github.io/Vireon-Signature/" + window.location.search + window.location.hash);
    </script>
  </head>
  <body>
    <main>
      <small>VIREON / SIGNATURE</small>
      <h1>Your signature studio has moved.</h1>
      <p>The redesigned React and Three.js studio now lives in its own project.</p>
      <a href="https://vireonnoctis.github.io/Vireon-Signature/">OPEN THE NEW STUDIO <span aria-hidden="true">↗</span></a>
    </main>
  </body>
</html>
`;

await writeFile(join(signatureDirectory, "index.html"), signaturePage, "utf8");
console.log("Generated legacy /signature/ redirect to the standalone React studio.");
