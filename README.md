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
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3-42B883?logo=vuedotjs&logoColor=white"/>
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white"/>
  <img alt="Rust API" src="https://img.shields.io/badge/Rust-Axum%20companion-DEA584?logo=rust&logoColor=black"/>
</p>

## Professional identity

Vireon presents as a **Businessman, Full-stack Developer, and Real Estate Developer**, with a portfolio spanning business, software systems, and property development.

## What the site does

- **Projects and profiles:** curated project links alongside live GitHub, AniList, Last.fm, and optional Spotify data.
- **Nothing OS design:** a cinematic monochrome system with a 3D split-panel entry/section transition, restrained IBM Plex Mono telemetry, Unicode/Braille controls, GSAP + Lenis motion, and a native WebGL2 signal field.
- **Language explorer:** select a technology tile to open its tracked lines, files, characters, words, and repository breakdown. Framework attribution remains separate from the underlying source-language counter.
- **Lunar X:** supplied codebase line counts and approximate character totals are included in the matching technology profiles.
- **Static deployment:** Vue 3 + Vite builds the site into `dist/` for GitHub Pages. The optional Rust API is deployed separately.

## Lunar X — supplied project stats

Lunar X's figures feed directly into the website's clickable technology statistics.

| Project area | Stack | Reported lines | Approx. characters |
| --- | --- | ---: | ---: |
| Backend | Rust (60 chars/line) | 265,856 | ≈ 15,951,360 |
| Frontend | Next.js (90 chars/line) | 309,274 | ≈ 27,834,660 |
| Gacha games | React (90 chars/line) | 40,751 | ≈ 3,667,590 |
| Scraping and other tools | Python (48 chars/line) | 20,865 | ≈ 1,001,520 |
| **Reported total** | | **636,746** | **≈ 48,455,130** |

*Approximate character totals use the per-stack characters-per-line assumptions shown above. These supplied figures are not part of the live repository scan.*

## Website stack

| Layer | What it does |
| --- | --- |
| Vue 3 | Reactive UI, Composition API, and Single-File Components. |
| TypeScript + vue-tsc | Typed data parsing and strict template checking. |
| Vite | Local development and static production builds. |
| CSS + native WebGL2 | Responsive monochrome interface and shader-rendered signal field. |
| Vue directives | Tactile pointer response and scroll-triggered reveals. |
| GitHub Actions + Pages | Type checking, static build, and deployment. |
| Rust + Axum | Optional companion API and scheduled Spotify snapshot helper. |

## Run locally

**Requirements:** Node.js 24+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run typecheck` | Strict Vue + TypeScript validation. |
| `npm run lint` | Alias for type checking. |
| `npm run build` | Type-check and create the static `dist/` output. |
| `npm run preview` | Preview the production build locally. |

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

The site reads `/spotify-now-playing.json`. A scheduled GitHub Actions workflow runs the Rust helper every five minutes and commits changed playback metadata. Spotify credentials must stay in local environment variables or repository Actions secrets and must never be placed in frontend code or the public JSON file.

To enable the workflow, add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` as repository Actions secrets, then run **Actions → Refresh Spotify listening status** once. The local authorization helper is `cargo run --manifest-path backend/Cargo.toml --bin spotify-auth`; use the redirect URI `http://127.0.0.1:8888/callback` in your Spotify app settings.

## Key files

```text
index.html                        Static document shell and SEO metadata
src/App.vue                       Vue portfolio and technology modal
src/components/AnimatedNumber.vue Count-up telemetry
src/components/BrailleText.vue    Accessible Braille-first action labels
src/components/NothingWebGL.vue   Native WebGL2 signal field
src/components/CinematicTransition.vue  3D split-panel cinematic transitions
src/composables/useCinematicMotion.ts     GSAP, ScrollTrigger, and Lenis motion
src/composables/usePortfolioData.ts GitHub, AniList, Last.fm, Spotify, and code stats
src/directives/interaction.ts     Tactile pointer and scroll reveal directives
src/styles.css                    Vue interaction states and accessibility overrides
app/cinematic.css                 Cinematic Nothing OS visual layer
app/*.css                         Existing Nothing OS visual system
backend/src/main.rs               Rust/Axum companion API
backend/src/bin/                  Spotify helper binaries
public/brands/                    Technology and brand marks
public/spotify-now-playing.json   Public playback snapshot
```

The site is intentionally a single-page static portfolio. All primary navigation is anchor-based; external profile and repository links open directly.
