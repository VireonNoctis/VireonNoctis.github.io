# Vireon Noctis

A personal web presence for software, anime, music, and ongoing experiments.

## Stack

- **Frontend:** Next.js App Router, React, TypeScript, Framer Motion.
- **Typography:** Clash Display, Satoshi, IBM Plex Mono.
- **Visual identity:** custom SVG marks for Vireon Noctis, Lemegeton, LunarAnime, and linked platforms.
- **Data API:** Rust + Axum in `backend/`.
- **Hosting:** GitHub Pages, using Next.js static export.

## Development

Requirements: Node.js 20+ and Rust stable.

```sh
npm install
npm run dev
cargo test --manifest-path backend/Cargo.toml
```

Open http://localhost:3000.

## Rust API

```sh
cargo run --manifest-path backend/Cargo.toml
```

- `GET /health`
- `GET /api/v1/site`
- `GET /api/v1/archive`

The old standalone JavaScript bootstrap, API wrappers, caches, scrapers and DOM card-rendering files have been replaced by Rust modules or removed where they belonged to the retired legacy frontend. The current Next.js browser frontend stays in TypeScript, which is the appropriate language for React and client-side interaction. **GitHub Pages cannot run the Rust server**, so the API is a separate service and must be hosted independently.

## Deployment

Pushes to `main` run TypeScript validation, Rust tests, the static Next.js build, and GitHub Pages deployment. Repository Pages settings must use **GitHub Actions** as the deployment source.

## Integrations

- GitHub: `VireonNoctis`
- AniList: `Vireon`
- Last.fm: `reasfeetadmirer`

Third-party API failures are treated as optional data; an upstream outage should not block the website.
