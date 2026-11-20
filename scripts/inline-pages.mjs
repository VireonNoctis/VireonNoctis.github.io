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

const signatureStaticShell = [
  '<main aria-labelledby="signature-static-title" style="max-width:900px;margin:0 auto;padding:72px 24px;color:#f2f1ed;font-family:Arial,Helvetica,sans-serif;background:#070707;">',
  '<p style="font-size:11px;letter-spacing:2px;color:#a9dce3;">VIREON / SIGNATURE STUDIO</p>',
  '<h1 id="signature-static-title" style="font-size:clamp(42px,8vw,86px);line-height:.95;letter-spacing:-.06em;">Leave a lasting impression.</h1>',
  '<p style="max-width:540px;color:#a0a09b;font-size:16px;line-height:1.7;">Build a considered email signature, preview it, and export portable HTML for your email client.</p>',
  '<p style="color:#a0a09b;font-size:12px;">Enable JavaScript to open the interactive signature builder.</p>',
  '</main>'
].join("");

let signaturePage = html
  .replace(/<title>[\s\S]*?<\/title>/i, "<title>Vireon Signature Studio — Email Signature Builder</title>")
  .replace(/<meta name="description" content="[^"]*"\s*\/>/i, '<meta name="description" content="Design a refined email signature and export email-safe HTML for Gmail, Proton Mail, Outlook, Apple Mail and Cloudflare Email Service." />')
  .replace(/<meta name="keywords" content="[^"]*"\s*\/>/i, '<meta name="keywords" content="email signature builder, HTML email signature, Proton Mail signature, Outlook signature, Gmail signature" />')
  .replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, '<link rel="canonical" href="https://vireonnoctis.github.io/signature/" />')
  .replace(/<meta property="og:url" content="[^"]*"\s*\/>/i, '<meta property="og:url" content="https://vireonnoctis.github.io/signature/" />')
  .replace(/<meta property="og:title" content="[^"]*"\s*\/>/i, '<meta property="og:title" content="Vireon Signature Studio — Email Signature Builder" />')
  .replace(/<meta property="og:description" content="[^"]*"\s*\/>/i, '<meta property="og:description" content="Build and export a considered, email-safe HTML signature." />')
  .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/i, '<meta name="twitter:title" content="Vireon Signature Studio" />')
  .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/i, '<meta name="twitter:description" content="Build and export a considered, email-safe HTML signature." />')
  .replace('<div id="app"></div>', '<div id="app">' + signatureStaticShell + '</div>');

if (!signaturePage.includes("Vireon Signature Studio") || signaturePage.includes("/assets/")) {
  throw new Error("The standalone signature page was not generated correctly.");
}

const signatureDirectory = join(dist, "signature");
await mkdir(signatureDirectory, { recursive: true });
await writeFile(join(signatureDirectory, "index.html"), signaturePage, "utf8");
await rm(assetDirectory, { recursive: true, force: true });

console.log(
  "Inlined " + javascript.length.toLocaleString() + " JavaScript and " +
  css.length.toLocaleString() + " CSS characters; generated dist/signature/index.html."
);
