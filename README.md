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

## External profile links

The Lunar X and Discord sections link directly to their respective profiles. The website does not fetch or display Lunar X profile metadata or Discord activity counts.

## Rust API

Requires Rust stable.

```sh
cargo test --manifest-path backend/Cargo.toml
cargo run --manifest-path backend/Cargo.toml
```

Endpoints: `GET /health`, `GET /api/v1/site`, and `GET /api/v1/archive`.

GitHub Pages serves only the exported frontend; the Rust API must be hosted separately on a Rust-capable service. Configure the repository's Pages source to **GitHub Actions**. Last.fm API details require `LASTFM_API_KEY`.
