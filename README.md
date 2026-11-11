# Vireon Noctis — Personal Portfolio

A cinematic, monochrome portfolio for business, software, and property development.

Live site: https://vireonnoctis.github.io/
GitHub: https://github.com/VireonNoctis

## Direction

The interface combines a typography-led introduction, a sequential project-mark reveal, and scroll-stacked project cards. The visual language stays deliberately restrained: black, white, neutral grey, strong type, and precise transitions. It intentionally avoids the 3D planet, orbit, floating geometric ornament, and theme selector.

## Portfolio features

- Selected work with expandable project notes and scroll-linked stacked cards.
- Live GitHub repositories and public profile metrics.
- Repository language explorer with line, character, file, and word totals.
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

The site progressively loads GitHub, AniList, Last.fm, repository code statistics, and the public Spotify snapshot. The optional Rust companion service under backend/ is independent of the GitHub Pages static deployment.
