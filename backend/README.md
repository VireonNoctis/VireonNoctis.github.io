# Spotify utilities

These small Rust binaries support the portfolio's scheduled Spotify snapshot.

## OAuth setup

Run the local callback utility to authorize the Spotify application and obtain a refresh token:

```sh
cargo run --manifest-path backend/Cargo.toml --bin spotify-auth
```

Keep the returned refresh token private. Store it as the repository Actions secret `SPOTIFY_REFRESH_TOKEN`, alongside `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.

## Playback snapshot

The scheduled GitHub Actions workflow runs this binary every five minutes:

```sh
cargo run --manifest-path backend/Cargo.toml --release --bin spotify-now-playing
```

It updates `public/spotify-now-playing.json` only when the current playback snapshot changes. The site reads that public JSON directly.

## Build

Requires the stable Rust toolchain.

```sh
cargo check --manifest-path backend/Cargo.toml --all-targets
```
