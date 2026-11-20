# Vireon Signature Studio

Public route: https://vireonnoctis.github.io/signature/

## Product

A browser-only email signature builder integrated into the existing Vue 3 + Vite portfolio. It uses the portfolio's monochrome Nothing OS design system and does not add a frontend dependency, server, account requirement, analytics endpoint, or remote draft store.

The editor offers three layouts (portrait, brand mark, minimal), ink and paper signature palettes, an editable accent colour, personal and company details, contact links, optional social links, a tagline, and an optional call-to-action link. The preview renders the exact HTML fragment used for export.

## Data handling

- Draft values are saved in the current browser's local storage under vireon.signature-studio.v1.
- No form values are sent to Vireon servers.
- Images are referenced by public HTTPS URLs. Local file paths, blob URLs, and data URLs are not exported because email clients cannot reliably retrieve them.
- Use an image host that permits recipients' email clients to load the image. Some recipients block remote images until they explicitly allow them.
- Exported HTML includes the signature only and contains no scripts, external stylesheets, web fonts, tracking pixels, or analytics.

## Email markup strategy

The renderer deliberately emits a compact HTML fragment built from presentation tables and inline styles. It uses explicit dimensions, system fonts, ordinary text links, and a text-only fallback for rich clipboard copying. Avoid adding CSS Grid, Flexbox, backdrop filters, external fonts, or JavaScript to the exported fragment.

Three output layouts are available:

- portrait: a portrait image when a valid HTTPS image URL is supplied, otherwise an initials block.
- brand: a logo image when supplied, otherwise an initials block.
- minimal: a type-led layout without an image column.

The Copy signature action writes both text/html and text/plain clipboard formats when the browser supports rich clipboard writes. Copy HTML writes the fragment as text. Export .html downloads a standalone preview document containing the fragment.

## Compatibility notes

The generated fragment is designed for broad interoperability with Gmail, Proton Mail, classic and current Outlook, Apple Mail, Yahoo Mail, Thunderbird, and other clients that accept HTML signatures. Email clients may sanitize HTML, substitute fonts, block remote images, or apply their own dark-mode transformations; visual parity cannot be guaranteed across every client or version. The editor therefore prioritizes readable content and a graceful text-first fallback over fragile visual effects.

Proton Mail supports pasting a formatted signature from a third-party builder into Settings → Identity and addresses → Display name and signature:
https://proton.me/support/display-name-email-signature

Cloudflare Email Service can send outbound messages through a Workers binding, REST API, or SMTP. For programmatic sending, insert the exported fragment into the outgoing message's HTML body. Cloudflare Email Routing handles inbound routing and forwarding; it does not install a signature in a user's outgoing composer:
https://developers.cloudflare.com/email-service/get-started/send-emails/
https://developers.cloudflare.com/email-service/

## Build and deployment

The normal Vite build remains a single application bundle. scripts/inline-pages.mjs inlines the generated JavaScript and CSS into dist/index.html, then creates dist/signature/index.html from the same inline application shell with route-specific metadata and a static pre-hydration heading. src/main.ts mounts the Signature Studio when the browser path is /signature/; every other path mounts the portfolio.

The Pages workflow verifies both generated pages and publishes the new signature/ directory alongside the existing site output.
