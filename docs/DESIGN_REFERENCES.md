# Portfolio design references

These references are research sources, not a mandate to install every library. The portfolio now has one visual system: Nothing OS. Adapt patterns to its strict monochrome language, preserve the Next.js / React architecture, and keep every effect accessible and fast.

## ReactVibe

- Website: https://reactvibe.com/
- Documentation: https://reactvibe.com/docs
- Motion catalog: https://reactvibe.com/docs/motion/overview
- Public source repository: https://github.com/siddhantmani/reactvibe
- The docs describe a copy-paste collection of motion-first React components, backgrounds, hero sections, UI blocks, dashboard systems, and text motion. The site reported 74 components across 7 categories at the time this reference was added; the live catalogue may change.
- It is built around React, Next.js, TypeScript, Tailwind CSS, and Framer Motion. This portfolio already uses Next.js, React, TypeScript, and Framer Motion, so study and selectively adapt the interaction patterns instead of adding a duplicate component framework.
- Particularly useful patterns for this portfolio:
  - Motion and text: directional text reveals, restrained staggered entrance, and animated type used to guide attention.
  - Hero sections: strong editorial hierarchy, layered background treatment, and motion that leads into the work rather than competing with it.
  - Backgrounds: particles, waves, gradients, and ambient visuals for occasional high-impact sections.
  - Network / workflow motion: Branch Flow, Hub Flow, Converge, Network Pulse, Pipeline, Signal, Data Flow, Connection Flow, Node Flow, Origin, and Nexus can inspire original diagrams showing how projects, products, tools, and systems connect.
  - Wave CTA and waveform patterns: use only when an audio, media, or call-to-action section benefits from a visual rhythm.
  - UI blocks: use as layout references for project detail, contact, or information sections; do not add irrelevant SaaS dashboards, pricing tables, or testimonials to a personal portfolio.
- Implementation guidance:
  - Browse the current live preview and copyable source for the closest component before implementing a similar effect.
  - Use ReactVibe source as a starting point only where its license and current dependency requirements permit; the public repository currently declares MIT, but re-check the exact version and preserve required notices.
  - Adapt its Framer Motion patterns to this project's existing version and CSS theme system. Do not install a second motion library for effects already covered by Framer Motion.
  - Preserve keyboard and touch interaction, meaningful focus states, reduced-motion alternatives, SSR safety, and clear static fallbacks.
  - Prefer transform and opacity animation, avoid unnecessary continuously-running canvases, and test on mobile GPUs.

## Existing reference library

- [Dqnamo Kitchen](https://www.dqnamo.com/kitchen): tactile component experiments, animated signature, scramble text, receipt-printer presentation, cassette controls, magnetic drop zones, card interactions, and copyable prompts. Inspect live behavior and prompts; adapt the interaction concept rather than copying the entire component.
- [SmoothUI](https://smoothui.dev/): reusable React motion components and UI blocks. Useful for buttons, inputs, expandable surfaces, dynamic notifications, text motion, magnetic interactions, and page sections.
- [Unlumen UI](https://ui.unlumen.com/): reusable animated React components, image treatments, navigation, SVG motion, and AI Chat interaction patterns.
- [Animmaster Lib](https://animmasterlib.dev/): broad animation reference for scroll transitions, pointer effects, WebGL, 3D, sliders, text motion, and backgrounds. Treat paid/private source as inspiration only.
- [Animmaster GitHub](https://github.com/Animmaster): inspect the creator's public portfolio repositories for original composition, typography, 3D hero, parallax, and interaction architecture.
- [pqoqubbw/icons](https://github.com/pqoqubbw/icons): animated SVG icon references; animate icons only when motion clarifies state or interaction.
- [Drei](https://github.com/pmndrs/drei): React Three Fiber helpers for model loading, environments, cameras, controls, scroll scenes, and DOM labels attached to 3D objects.
- [React Three Next](https://github.com/pmndrs/react-three-next): optional Next.js starter architecture for projects that require a persistent shared WebGL canvas; not a default dependency for this existing site.
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber): the core React renderer for Three.js; use for true interactive 3D scenes, not ordinary 2D UI.
- [Liquid Glass JS](https://github.com/dashersw/liquid-glass-js): WebGL refraction and blur experiments for a few floating controls. Test WebGL 2, cross-origin sampling, accessibility, and fallbacks before production use.
- [ShaderGradient](https://github.com/ruucm/shadergradient): configurable animated shader backgrounds for a limited hero or feature section, with static and reduced-motion alternatives.
- [Paper Design Liquid Logo](https://github.com/paper-design/liquid-logo): inspiration for a one-off liquid-metal brand reveal. Its repository uses PolyForm Shield with a noncompete condition; do not reuse its source unless the terms have been reviewed for the intended use.

## Active visual direction

Nothing OS is the only supported design. Use pure monochrome, dot-matrix display texture, ultra-light editorial headlines, and restrained uppercase mono labels. Keep the hero signal field on the existing native WebGL2 shader.

**Framework boundary:** Next.js is a React framework, so React owns UI rendering and state. Do not add Vue as a second view runtime or use Vue reactivity alongside React state for the same interface. Motion for React handles spring-based pointer attraction, hover, tap, and shared transitions. Use the existing React component layer for tactile controls and preserve native link, button, and disclosure semantics.

Use animated icon references such as pqoqubbw/icons selectively for state changes and meaningful feedback; do not animate every glyph continuously. Keep the hand-written WebGL2 field for light ambient graphics. Add React Three Fiber and Drei only when a real interactive 3D scene is needed, rather than introducing a second rendering stack for ordinary UI.

The rest of the interface remains readable and functional without WebGL; reduced-motion users receive static states, and browsers without WebGL2 receive a monochrome CSS fallback.

## Selection rules

1. Study current project conventions and live reference behavior before implementation.
2. Use the fewest dependencies that solve the actual problem; this site already includes Framer Motion.
3. Keep core content readable and navigable without WebGL or animation.
4. Respect the user's reduced-motion preference, keyboard access, responsive layouts, and low-power devices.
5. Prefer an original implementation shaped by the reference over a verbatim copy of another creator's signature work.
