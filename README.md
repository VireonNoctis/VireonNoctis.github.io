# Vireon Noctis — Personal Portfolio

A monochrome, motion-led portfolio for software, business, and property development.

**Live site:** https://vireonnoctis.github.io/  
**Repository:** https://github.com/VireonNoctis/VireonNoctis.github.io

## Application

The site is built as a Vue 3 Single-File Component application. Page markup, reactive UI, and the global presentation layer live in Vue SFCs; TypeScript remains for composables, data contracts, and interaction directives.

- Vue 3 + TypeScript + Vite
- GSAP, ScrollTrigger, and Lenis for motion and navigation
- Native WebGL2 for the hero visual
- Rust command-line utilities for Spotify OAuth and playback snapshots
- GitHub Pages branch publishing

## Features

- A continuous, responsive project gallery.
- Repository language and project metrics with animated count-up.
- Live GitHub, AniList, Last.fm, and Spotify profile data.
- Responsive navigation, keyboard-accessible controls, reduced-motion support, and a custom 404 page.

## Local development

Requires Node.js 24+ and npm.

```sh
npm install
npm run dev
npm run typecheck
npm run build
```

The Vite source entry is `src/index.html`. The root `index.html`, `assets/`, and copied `brands/` are generated deployment output; edit `src/` and `public/` instead.

## Spotify utilities

The optional Rust tools are under `backend/`. See [backend/README.md](backend/README.md) for OAuth setup and playback snapshot refresh instructions.
