# Vireon Noctis — Personal Portfolio

A cinematic, monochrome portfolio for business, software, and property development.

**Live site:** https://vireonnoctis.github.io/  
**GitHub:** https://github.com/VireonNoctis

## Direction

A typography-led opening with a six-panel image reveal, sequential motion, and restrained monochrome surfaces. The work section uses numbered pagination and editorial project cards. The Code Counted explorer uses the row-based language treatment, four profiles per page, and expandable source breakdowns.

The visual direction deliberately avoids planet, orbit, floating-square, and 3D-hero motifs.

## Project showcase

The showcase lists fourteen public projects with implementation files: Lemegeton, LOOP, PrivaCage, Moonbyte, Lunar X, Driftglass, SkillTether, SwarmForge, Astra, Lunar Dungeons, Torrent Core, ASCII Magic Art, AniList CSS, and Lunar CSS. Private and empty repositories are excluded; prototypes and experimental subsystems are labelled accordingly.

## Portfolio features

- Fourteen-project showcase, three projects per page, with expandable project notes.
- Six-project cinematic opening.
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
| Hosting | GitHub Pages branch publishing |
| Companion tooling | Rust / Axum under backend/ |

## Run locally

Requirements: Node.js 24+ and npm.

    npm install
    npm run dev
    npm run typecheck
    npm run build

The Vite source entry lives at `src/index.html`. A production build also copies the compiled bundle and public files to the repository root because this site uses GitHub Pages branch publishing. `index.html` at the root is generated output; edit the source entry instead.

The site progressively loads GitHub, AniList, Last.fm, repository code statistics, and the public Spotify snapshot. The optional Rust companion service under `backend/` is independent of the static deployment.
