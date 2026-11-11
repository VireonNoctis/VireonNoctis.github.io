# Vireon Noctis — Personal Portfolio

A cinematic, monochrome portfolio for business, software, and property development.

**Live site:** https://vireonnoctis.github.io/  
**GitHub:** https://github.com/VireonNoctis

## Direction

A real-time WebGL 3D hero built around a raymarched folded-metal sculpture, layered with a cinematic typographic intro. The hero contains no duplicate project tiles. The project showcase is one continuous gallery, with all fourteen verified code-backed projects visible together. Code Counted is one continuous list with animated figures and expandable repository breakdowns.

The visual direction is monochrome, responsive, motion-led, and accessible, with a reduced-motion and WebGL fallback.

## Project showcase

Fourteen public projects with implementation files are presented: Lemegeton, LOOP, PrivaCage, Moonbyte, Lunar X, Driftglass, SkillTether, SwarmForge, Astra, Lunar Dungeons, Torrent Core, ASCII Magic Art, AniList CSS, and Lunar CSS. Private and empty repositories are excluded; prototypes and experimental subsystems are labelled accordingly.

## Portfolio features

- One continuous 14-project gallery, no sticky card stack or project pagination.
- A raymarched WebGL 3D hero with pointer-responsive camera movement.
- Code Counted: a single continuous language list with animated counters and detail panels.
- Live GitHub, AniList, Last.fm, and optional Spotify profile data.
- Responsive navigation, keyboard-accessible controls, reduced-motion support, and a custom 404 page.

## Stack

| Layer | Implementation |
| --- | --- |
| UI | Vue 3 Single-File Components |
| Types | TypeScript + vue-tsc |
| Build | Vite |
| Motion | GSAP + ScrollTrigger + Lenis |
| Graphics | Native WebGL2 raymarching |
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
