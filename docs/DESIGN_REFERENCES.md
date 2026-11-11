# Portfolio design references

The portfolio now has one visual system: **Nothing OS**. These references inform individual interactions and compositions; they are not a reason to install every library.

## Active visual direction

Use strict black, white, and neutral grey; geometric dot-matrix details; ultra-light or tightly tracked display typography; compact uppercase mono labels; Braille-first action labels; and tactile, purposeful feedback.

The hero signal field is a hand-written native WebGL2 shader. It responds to pointer movement, suspends while the document is hidden, caps its pixel ratio, and falls back to CSS when WebGL2 is unavailable. The rest of the site remains fully usable without WebGL.

## Framework and motion architecture

**Vue 3 + Vite is the only frontend runtime.**

- Vue Single-File Components keep each UI surface, local state, and behavior together.
- The Composition API and Vue refs/computed values drive the live data, project disclosures, language explorer, and modal.
- Small custom Vue directives provide pointer-spring tactile movement and IntersectionObserver reveals without a second UI framework.
- CSS transitions and requestAnimationFrame cover the micro-interactions; no React, Framer Motion, Next.js, or Vue-in-React bridge is part of the site.
- Vite builds a root-hosted static site into `dist/` for GitHub Pages. No server-side rendering is needed for this API-enhanced portfolio.
- TypeScript is checked with `vue-tsc`, including strict Vue templates.

Respect `prefers-reduced-motion`, keyboard interaction, readable focus states, touch devices, cleanup of event listeners/observers, and low-power GPUs. Keep meaningful HTML semantics: native links, buttons, details/summary, and modal dialog roles.

## Interaction and visual references

- [Dqnamo Kitchen](https://www.dqnamo.com/kitchen): tactile component experiments, animated signature, scramble text, receipt-printer presentation, cassette controls, magnetic drop zones, and card interactions. Inspect live behavior and adapt the interaction concept; do not copy the complete component.
- [SmoothUI](https://smoothui.dev/): reusable motion and component patterns. Adapt ideas to native Vue and CSS; do not add a React runtime.
- [Unlumen UI](https://ui.unlumen.com/): animated components, image treatments, navigation, and SVG interaction patterns. Rebuild suitable ideas in Vue.
- [Animmaster Lib](https://animmasterlib.dev/): references for scroll transitions, pointer effects, WebGL, 3D, sliders, text motion, and backgrounds. Treat paid/private source as inspiration only.
- [Animmaster GitHub](https://github.com/Animmaster): public portfolio references for composition, typography, parallax, and interaction architecture.
- [pqoqubbw/icons](https://github.com/pqoqubbw/icons): animated SVG icon references; adapt selectively where motion explains a state change.
- [Liquid Glass JS](https://github.com/dashersw/liquid-glass-js): WebGL refraction experiments. The portfolio deliberately keeps the current monochrome system rather than introducing a liquid-glass theme.
- [ShaderGradient](https://github.com/ruucm/shadergradient): shader background inspiration. Prefer the existing lean native WebGL2 field over a new dependency.
- [Paper Design Liquid Logo](https://github.com/paper-design/liquid-logo): one-off liquid-metal brand reveal inspiration. Its repository uses PolyForm Shield with a noncompete condition; do not reuse its source unless the terms are reviewed.
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber), [Drei](https://github.com/pmndrs/drei), and [React Three Next](https://github.com/pmndrs/react-three-next) are React-specific tooling. They are not used in this Vue app; use native WebGL2 or a Vue-compatible Three.js layer only if a real interactive 3D scene is needed.

## Selection rules

1. Study current behavior and source before adapting a reference.
2. Use the fewest dependencies that solve the actual problem.
3. Keep primary content navigable without animation or WebGL.
4. Respect reduced motion, keyboard access, responsive layouts, and lower-power devices.
5. Prefer original implementations over a verbatim copy of another creator's signature work.


## Current portfolio motion references

The latest Animmaster source review expanded the reference set beyond Discovermarket Sticky Cards and Realevate:

- [GAMELAND](https://github.com/Animmaster/GAMELAND): dark full-screen preloader with progress readout and rail, then a video-led hero. Adapt the concise progress-led entrance; this portfolio uses its own six project marks rather than importing media or source.
- [Samurai](https://github.com/Animmaster/Samurai): sequential full-screen image loader using clipped image layers, staggered reveals, and an overlay wipe. Adapt the clip-path sequence as a short, accessible entry reveal.
- [FURROW-rebuild](https://github.com/Animmaster/FURROW-rebuild): full-bleed hero media, typography-led reveals, and pointer-aware canvas interaction. Use the restraint and hierarchy, not a copied video or canvas effect.
- [Discovermarket Sticky Cards](https://github.com/Animmaster/Discovermarket-Sticky-Cards-): sticky editorial cards with scroll-linked depth and a fixed companion heading. Keep the content responsive and add page controls where the project collection grows.
- [Realevate Landing Page](https://github.com/Animmaster/Realevate-Landing-Page-): staggered image masks, a continuous title strip, and a compact counter. Adapt the image-timing language without copying its photography or exact composition.

The current entry sequence is a short six-panel brand reveal with a numbered progress rail. It must never delay access to page content when reduced motion is enabled.
