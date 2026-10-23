# Vireon Noctis

A personal digital archive for software, anime, music, and ongoing experiments.

## Website

- Framework: Next.js App Router, React, TypeScript and Framer Motion
- Visual direction: editorial, dark, premium typography and custom SVG brand marks
- Static hosting: GitHub Pages via GitHub Actions
- Rust service: optional separate API under `backend/`

## Local development

Requires Node.js 20+.

```sh
npm install
npm run dev
npm run lint
npm run build
```

## Lunar X profile metadata

The site requests public profile fields from `https://api.lunarx.to/api/animes/profile?username=vvvx` and links to [Lunar X profile vvvx](https://lunarx.to/profile/vvvx). The browser displays all returned fields when the public API permits cross-origin requests. API errors are shown as a status rather than fabricated metadata.

## Rust API

Requires Rust stable.

```sh
cargo test --manifest-path backend/Cargo.toml
cargo run --manifest-path backend/Cargo.toml
```

Endpoints: `GET /health`, `GET /api/v1/site`, and `GET /api/v1/archive`.

GitHub Pages serves only the exported frontend; the Rust API must be hosted separately on a Rust-capable service. Configure the repository's Pages source to **GitHub Actions**. Last.fm API details require `LASTFM_API_KEY`.
