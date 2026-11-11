# Vireon Noctis — Personal Portfolio

A cinematic, monochrome portfolio for business, software, and property development.

**Live site:** https://vireonnoctis.github.io/  
**GitHub:** https://github.com/VireonNoctis

## Direction

A typography-led opening with a six-panel image reveal, sequential motion, and restrained monochrome surfaces. The work section uses numbered pagination and sticky editorial cards. The Code Counted explorer uses the former row-based language treatment, four profiles per page, and expandable source breakdowns.

The visual direction deliberately avoids the planet, orbit graphics, floating square motifs, and a 3D hero.

## Selected work

- **Lemegeton** — multi-guild Discord media discovery and community archive.
- **LOOP** — collaborative social platform with Circles, Loop Trees, and Co-Loop.
- **PrivaCage** — local-first privacy auditing across Android and Windows.
- **Moonbyte** — Rust game runtime and Discord multiplayer systems.
- **Lunar X** — multi-surface community platform.
- **vvd Reimagined** — research-led product reconstruction; current state is a research dossier and scaffold, not a finished application.

## Portfolio features

- Six-project showcase, three projects per page, with expandable project notes.
- Live GitHub repositories and public profile metrics.
- Code Counted: four language profiles per page, with line, character, file, word, and repository detail.
- Supplied Lunar X estimates kept distinct from scanned repository statistics.
- AniList, Last.fm, and optional Spotify profile data.
- Responsive navigation, keyboard-accessible controls, reduced-motion support, and a custom 404 page.

## Stack

| Layer | Implementation |
| --- | --- |
| UI | Vue 3 Single-File Components |
| Types | TypeScript + vue-tsc |
| Build | Vite |
| Motion | GSAP + ScrollTrigger + Lenis |
| Styling | Native CSS, monochrome design system |
| Deployment | GitHub Actions + GitHub Pages |
| Companion tooling | Rust / Axum under backend/ |

## Run locally

Requirements: Node.js 24+ and npm.

    npm install
    npm run dev
    npm run typecheck
    npm run build

The site progressively loads GitHub, AniList, Last.fm, repository code statistics, and the public Spotify snapshot. The optional Rust companion service under `backend/` is independent of the GitHub Pages static deployment.
