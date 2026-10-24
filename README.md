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

## Spotify now-playing integration

The site links to the Spotify profile and can display your current track inside the existing music card. Because GitHub Pages serves a static export, it never calls Spotify with private credentials from the browser. A scheduled GitHub Actions workflow checks Spotify every five minutes, updates `public/spotify-now-playing.json` only when the playback state changes, and triggers a Pages deployment.

### One-time setup

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard). Add this exact redirect URI to the app settings: `http://127.0.0.1:8888/callback`.
2. On your computer, set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` as local environment variables, then run `node scripts/spotify-auth.mjs`. Open the printed authorization URL, approve the requested `user-read-currently-playing` permission, and copy the refresh token printed by the local helper. The helper binds only to `127.0.0.1`; the credentials and token are not stored in the repository.
3. In GitHub, open **Settings → Secrets and variables → Actions** and create these repository secrets: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN`.
4. Run **Actions → Refresh Spotify listening status → Run workflow** once to test it. The scheduled job then refreshes playback automatically. Last.fm remains available for recent scrobbles, all-time artists, and tracks whenever Spotify is idle or not configured.

The initial UI and public JSON contain no credentials. Without those three secrets, the Spotify refresh workflow exits without changing data. Spotify Development Mode currently has account and endpoint restrictions; consult the [official authorization guide](https://developer.spotify.com/documentation/web-api/concepts/authorization) and [currently-playing endpoint docs](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track) if Spotify rejects the app or permission request.

## Last.fm → Discord now playing

The workflow at `.github/workflows/lastfm-discord.yml` checks the Last.fm account `reasfeetadmirer` every five minutes and sends a new branded Discord embed only when Last.fm reports a different currently playing track. It includes the track link, artist, album, up to three genre tags, the loved-track status, artist scrobbles, total scrobbles, and artwork when Last.fm provides it.

### One-time setup

1. Add the repository Actions secrets `LASTFM_API_KEY` and `DISCORD_WEBHOOK_URL` under **Settings → Secrets and variables → Actions**. The webhook URL and API key are read from the runner environment and are never committed to the repository.
2. Open **Actions → Notify Discord about Last.fm now playing → Run workflow** to test it. The workflow also runs automatically every five minutes.
3. The last-notified track identity is stored on the separate `lastfm-discord-state` branch, not `main`, so state updates do not trigger a GitHub Pages deployment. Repeated polling of the same track will not create duplicate messages.

This is polling, not a real-time Last.fm event subscription. A notification is sent only while Last.fm marks a track as currently playing; if Last.fm is not receiving your listening activity, no message is sent.

## Rust API

Requires Rust stable.

```sh
cargo test --manifest-path backend/Cargo.toml
cargo run --manifest-path backend/Cargo.toml
```

Endpoints: `GET /health`, `GET /api/v1/site`, and `GET /api/v1/archive`.

GitHub Pages serves only the exported frontend; the Rust API must be hosted separately on a Rust-capable service. Configure the repository's Pages source to **GitHub Actions**. Last.fm API details require `LASTFM_API_KEY`.
