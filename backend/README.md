# Vireon Noctis Rust API

The former JavaScript data-service modules and DOM card renderers have been migrated to Rust. The Next.js/React frontend remains TypeScript because browsers do not execute Rust source files directly; the obsolete standalone JavaScript bootstrap and legacy card scripts were removed.

## Run locally

Requirements: Rust stable.

```sh
cargo test --manifest-path backend/Cargo.toml
cargo run --manifest-path backend/Cargo.toml
```

The server listens on `0.0.0.0:8080` by default. Configure `HOST` and `PORT` as needed.

## Endpoints

- `GET /health` — process health
- `GET /api/v1/site` — service metadata
- `GET /api/v1/archive` — aggregated GitHub, AniList and Last.fm profile data

## Configuration

- `GITHUB_USERNAME` (default: `VireonNoctis`)
- `ANILIST_USERNAME` (default: `Vireon`)
- `LASTFM_USERNAME` (default: `reasfeetadmirer`)
- `LASTFM_API_KEY` (required for Last.fm data)
- `CACHE_TTL_SECONDS` (default: `900`)

GitHub Pages only hosts the static frontend; this Rust API must be deployed separately to a Rust-capable host before it can be reached publicly. Third-party API failures return missing data rather than taking down the server.
