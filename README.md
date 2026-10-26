# Vireon Noctis

<p align="center">
  <strong>A personal digital universe for software, stories, sound, and experiments.</strong>
  <br />
  Built with care. Styled with intent. Kept in motion.
</p>

<p align="center">
  <a href="https://vireonnoctis.github.io/"><strong>Visit the website ↗</strong></a>
  ·
  <a href="https://github.com/VireonNoctis">GitHub</a>
  ·
  <a href="https://anilist.co/user/Vireon">AniList</a>
  ·
  <a href="https://last.fm/user/reasfeetadmirer">Last.fm</a>
</p>

<p align="center">
  <a href="https://github.com/VireonNoctis/VireonNoctis.github.io/actions/workflows/pages.yml"><img alt="Website build and deployment" src="https://github.com/VireonNoctis/VireonNoctis.github.io/actions/workflows/pages.yml/badge.svg?branch=main" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Rust" src="https://img.shields.io/badge/Rust-companion%20API-DEA584?logo=rust&logoColor=black" />
  <img alt="License" src="https://img.shields.io/badge/license-All%20Rights%20Reserved-8A2635" />
</p>

---

## About

**Vireon Noctis** is the personal website and digital archive of Vireon. It brings projects, development tools, media profiles, listening status, and current interests into one responsive, animated interface.

This is more than a static portfolio layout. It is a small design system with selectable visual identities, reusable motion patterns, a TypeScript-powered frontend, and an optional Rust companion service for API work.

## At a glance

- **Projects:** Lemegeton, PrivaCage, Lunar X, and personal tools.
- **Toolkit:** programming languages, frameworks, databases, editors, and terminal workflows.
- **Profiles and media:** GitHub, AniList, Last.fm, Spotify, Discord, and related destinations.
- **Theme selector:** eight design systems, with a first-visit picker and a persistent top-bar switcher.
- **Live listening:** an optional Spotify snapshot refreshed by a scheduled Rust helper running in GitHub Actions.
- **Deployment:** a Next.js static export served through GitHub Pages.
- **Companion service:** a separate Rust/Axum API that can be hosted on a Rust-capable platform.

## The eight design systems

Themes are intentionally different in layout, type, materials, information hierarchy, and motion. They are not a single page recoloured eight times.

| Theme | Design language |
| --- | --- |
| **Vireon Classic** | The original dark editorial identity, preserved as the baseline. |
| **Nothing × Proton** | Strict monochrome, dot-matrix texture, Unicode/Braille signals, sharp modules, and rolling numeric readouts. |
| **Liquid Glass** | Apple-inspired floating controls, translucent chrome, soft edge highlights, and a crisp content canvas. |
| **Dimensional 3D** | CSS perspective, a rotating six-face cube, a shaded sphere, orbital geometry, and layered depth. |
| **Light** | A bright gallery cover, architectural spacing, restrained blue-gray accents, and clear project groupings. |
| **Universe / Space** | A star atlas, planet artwork, orbital geometry, and observatory-style telemetry. |
| **Editorial Paper** | Warm paper texture, serif hierarchy, print-inspired details, and a magazine-like project spread. |
| **Lunar** | Near-black surfaces, white type, indigo brand light, and clipped ghost-text glitch effects inspired by my Animanga/novel Website. |

Choose a theme when the site first opens, then switch at any time using the **Theme** control in the top bar. Theme styling lives in individual CSS files so each visual system can evolve independently.

## Technology

### Frontend

- **Next.js App Router** and **React** for the page structure and components.
- **TypeScript** for application logic and static type checking.
- **CSS** for layout, responsive rules, theme-specific visual systems, and custom effects.
- **Framer Motion** for transitions, entrance effects, and carefully controlled animations.
- **Lucide React** for interface icons.
- **GitHub Pages** for static hosting and GitHub Actions for validation and deployment.

### Rust companion

The optional Rust workspace uses **Axum**, **Tokio**, **Reqwest**, **Serde**, and **Serde JSON** for HTTP routes and external-data handling. It also contains the command-line helpers used by the Spotify listening-status workflow.

The frontend does **not** require the API to run locally. GitHub Pages serves the exported frontend only; the API must be deployed separately if you want to expose it as a public service.

## Repository map

```text
.
├── app/
│   ├── page.tsx                    # Main website experience
│   ├── layout.tsx                  # Root layout, metadata, provider and CSS imports
│   ├── theme-system.tsx            # Theme catalog, theme picker and top-bar switcher
│   ├── globals.css                 # Global foundations and shared layout
│   ├── themes.css                  # Shared theme controls and preview primitives
│   └── themes/
│       ├── nothing.css             # Nothing × Proton
│       ├── liquid-glass.css        # Liquid Glass
│       ├── dimensional-3d.css      # Dimensional 3D
│       ├── light.css               # Light
│       ├── universe.css            # Universe / Space
│       ├── paper.css               # Editorial Paper
│       └── lunar.css               # Lunar
├── backend/
│   ├── src/main.rs                 # Rust/Axum companion API
│   └── src/bin/
│       ├── spotify_auth.rs         # One-time Spotify authorization helper
│       └── spotify_now_playing.rs  # Scheduled listening-state helper
├── public/
│   ├── brands/                     # Brand marks and technology logos
│   └── spotify-now-playing.json   # Public playback snapshot
├── config/icons/                   # Source icon assets
├── .github/workflows/
│   ├── pages.yml                   # Type-check, export and GitHub Pages deployment
│   └── spotify-now-playing.yml     # Scheduled Spotify snapshot refresh
├── next.config.ts
├── package.json
├── LICENSE                         # Repository-wide proprietary license
└── README.md
```

## Run the website locally

### Requirements

- **Node.js 20 or newer**
- npm (included with Node.js)

### Install and start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server. |
| `npm run lint` | Run TypeScript validation with `tsc --noEmit`. |
| `npm run build` | Build the production static export into `out/`. |

To verify a production export locally:

```bash
npm run lint
npm run build
```

The exported site is written to `out/`; the GitHub Pages workflow checks that `out/index.html` exists.

## Spotify listening-status integration

GitHub Pages is static, so the browser must not receive Spotify client secrets or a refresh token. The site therefore reads a public JSON playback snapshot produced by a scheduled Rust helper.

The workflow runs every five minutes, updates `public/spotify-now-playing.json` when the playback state changes, and triggers a Pages deployment for changed data. It exits without changing the snapshot if the required secrets are missing.

### One-time setup

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add this exact redirect URI to the app settings: `http://127.0.0.1:8888/callback`.
3. On your own computer, set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` as local environment variables.
4. Run the Rust authorization helper:

   ```bash
   cargo run --manifest-path backend/Cargo.toml --bin spotify-auth
   ```

5. Follow the printed authorization URL, approve the requested `user-read-currently-playing` permission, and copy the refresh token printed by the local helper.
6. In **GitHub → Settings → Secrets and variables → Actions**, create these repository secrets:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`
7. Run **Actions → Refresh Spotify listening status → Run workflow** once to test the integration. The scheduled job then handles later refreshes.

The authorization helper binds to `127.0.0.1`; keep the credentials and token private. Do not place them in source files, commits, or frontend environment variables. Spotify Development Mode may enforce account or endpoint restrictions; check the [official authorization guide](https://developer.spotify.com/documentation/web-api/concepts/authorization) and [currently-playing endpoint documentation](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track) if requests are denied.

## Rust companion API

### Requirements

- Rust stable toolchain
- Cargo

### Run and test

```bash
cargo test --manifest-path backend/Cargo.toml
cargo run --manifest-path backend/Cargo.toml
```

By default, the API listens on `0.0.0.0:8080`. Override `HOST` and `PORT` for a different bind address.

### Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Reports whether the service is responding. |
| `GET` | `/api/v1/site` | Returns service metadata and integration names. |
| `GET` | `/api/v1/archive` | Attempts to retrieve public GitHub, AniList, and Lunar X data and reports the Last.fm key configuration state. |

External services can fail or limit requests. The archive endpoint may therefore return partial data; it is not a guarantee that every provider is reachable or configured. Last.fm data requires a valid `LASTFM_API_KEY` wherever that integration is enabled.

GitHub Pages does not host this API. Deploy it independently on infrastructure that supports Rust, then configure the frontend or clients to use the API URL as appropriate.

## Deployment

The `.github/workflows/pages.yml` workflow validates the TypeScript, builds the static website, checks the export entry point, and deploys the `out/` directory to GitHub Pages when triggered by the main branch workflow.

To enable deployment:

1. Open the repository's **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push a commit to `main`, or run the **Build and deploy Vireon Noctis** workflow manually.

Pull requests run validation and the static export build but do not deploy the website.

## External services and assets

The website links to or may consume public data from external platforms, including GitHub, AniList, Last.fm, Spotify, Lunar X, and Discord. Their availability, APIs, branding, terms, and content are controlled by their respective providers. The use of a brand name or logo does not imply sponsorship or endorsement.

Spotify credentials must only exist in local environment variables or GitHub Actions secrets. Any public JSON snapshot should contain playback metadata only, never authorization credentials.

## Copyright and license

**© 2026 VireonNoctis. All rights reserved.**

This repository is published for public visibility, but it is **not offered under an open-source license**. The original source code, styles, theme implementations, layout compositions, project-specific assets, and documentation are proprietary. No general permission is granted to copy, modify, redistribute, sublicense, or create derivative works without prior written permission, subject to the limited rights necessary to access the repository through GitHub and any rights that cannot be excluded by law.

Third-party dependencies, trademarks, logos, provider content, and other materials not owned by VireonNoctis remain subject to their respective owners' terms and licenses.

See [LICENSE](LICENSE) for the full notice. The Rust crate's package metadata also points to its included proprietary license file so it does not advertise an MIT license.

---

<p align="center">
  <sub>Made in the quiet hours. Kept in motion.</sub>
</p>
