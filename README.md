# Vireon Noctis — Personal Website

<p align="center">
  <strong>A personal digital archive for software, anime, music, and experiments.</strong><br/>
  <a href="https://vireonnoctis.github.io/">Visit the live site ↗</a> ·
  <a href="https://github.com/VireonNoctis">GitHub</a> ·
  <a href="https://anilist.co/user/Vireon">AniList</a> ·
  <a href="https://last.fm/user/reasfeetadmirer">Last.fm</a>
</p>

<p align="center">
  <a href="https://github.com/VireonNoctis/VireonNoctis.github.io/actions/workflows/pages.yml"><img alt="GitHub Pages build" src="https://github.com/VireonNoctis/VireonNoctis.github.io/actions/workflows/pages.yml/badge.svg?branch=main"/></a>
  <img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white"/>
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white"/>
  <img alt="Rust API" src="https://img.shields.io/badge/Rust-Axum%20companion-DEA584?logo=rust&logoColor=black"/>
</p>

## What the site does

- **Projects and profiles:** curated project links alongside live GitHub, AniList, Last.fm, and optional Spotify data.
- **Selectable themes:** Vireon Classic, NothingOS, and Light Mode. NothingOS uses a strict monochrome system with Unicode/Braille details and animated numeric readouts.
- **Language explorer:** select a language tile to open a modal with tracked lines, files, characters, words, and repository breakdowns. The language mark animates into the modal.
- **Lunar X estimates:** Lunar X is included in the main line totals for matching language/framework profiles even though no public scannable repository is available.
- **Static deployment:** Next.js exports the site for GitHub Pages; the optional Rust API is deployed separately.

## Lunar X — supplied project stats

These estimates are part of the website's clickable language statistics. They are not repository-scanned counts.

| Project area | Stack | Reported lines |
| --- | --- | ---: |
| Backend | Rust | 265,856 |
| Frontend | Next.js | 309,274 |
| Gacha games | React | 40,751 |
| Scraping and other tools | Python | 20,865 |
| **Reported total** | | **636,746** |

The explorer adds each estimate to its matching scanned language count when available. Unprovided file, character, word, and non-blank-line totals are not inferred.

## Website stack

| Layer | What it does |
| --- | --- |
| Next.js + React | Pages, components, and site layout. |
| TypeScript | Interactive state, public-data parsing, and safer UI changes. |
| CSS | Responsive design and theme-specific visual systems. |
| Framer Motion | Scroll reveals, counters, transitions, and shared-logo modal animation. |
| Lucide React | Interface iconography. |
| GitHub Actions + Pages | Type-checking, static export, and deployment. |
| Rust + Axum | Optional companion API and scheduled Spotify snapshot helper. |

## Run locally

**Requirements:** Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run lint` | TypeScript validation. |
| `npm run build` | Build the production static export into `out/`. |

Run `npm run lint` and `npm run build` before submitting a change. Pull requests run both checks; only non-PR deployment runs publish the site.

## Companion API

The Rust application lives in `backend/` and can be tested or started with:

```bash
cargo test --manifest-path backend/Cargo.toml
cargo run --manifest-path backend/Cargo.toml
```

It listens on `HOST:PORT` (defaults to `0.0.0.0:8080`) and exposes:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Service health. |
| GET | `/api/v1/site` | Site and integration metadata. |
| GET | `/api/v1/archive` | Best-effort GitHub, AniList, Lunar X, and Last.fm configuration data. |

The archive response may be partial when an external provider is unavailable. GitHub Pages does not run this API; deploy it separately on Rust-capable infrastructure.

## Spotify snapshot

The site reads `public/spotify-now-playing.json`. A scheduled GitHub Actions workflow runs the Rust helper every five minutes and commits changed playback metadata. Spotify credentials must stay in local environment variables or repository Actions secrets and must never be placed in frontend code or the public JSON file.

To enable the workflow, add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` as repository Actions secrets, then run **Actions → Refresh Spotify listening status** once. The local authorization helper is `cargo run --manifest-path backend/Cargo.toml --bin spotify-auth`; use the redirect URI `http://127.0.0.1:8888/callback` in your Spotify app settings.

## Key files

```text
app/page.tsx                    Main site and language modal
app/theme-system.tsx             Theme catalog, picker, and switcher
app/globals.css                  Shared layout and global styles
app/themes.css                   Shared components and language-modal styles
app/themes/                      Theme-specific CSS
backend/src/main.rs              Rust/Axum API
backend/src/bin/                 Spotify helper binaries
public/brands/                   Technology and brand marks
public/spotify-now-playing.json  Public playback snapshot
.github/workflows/pages.yml      Type-check, export, and Pages deployment
.github/workflows/spotify-now-playing.yml
                                Scheduled Spotify snapshot refresh
```

## License

© 2026 VireonNoctis. All rights reserved. This repository is published for visibility and is not offered under an open-source license. See [LICENSE](LICENSE); third-party dependencies and trademarks remain subject to their owners' terms.
