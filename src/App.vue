<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import AnimatedNumber from "./components/AnimatedNumber.vue";
import BrailleText from "./components/BrailleText.vue";
import NothingWebGL from "./components/NothingWebGL.vue";
import { usePortfolioData } from "./composables/usePortfolioData";
import type { CodeStatsLanguage, CodeStatsProjectEstimate, GenreItem } from "./types";

type TechKind = "LANGUAGE" | "FRAMEWORK" | "LIBRARY" | "GRAPHICS API" | "RUNTIME" | "FORMAT" | "WORKFLOW" | "LEARNING";
interface TechCard {
  name: string;
  logo: string;
  kind: TechKind;
  learningStatus?: "IN USE" | "PLANNED";
  learningNote?: string;
}
const { repos, codeStats, codeStatsStatus, live, spotify } = usePortfolioData();

const menuOpen = ref(false);
const selectedTech = ref<TechCard | null>(null);
const scrollProgress = ref(0);
const signalCycle = ref(0);
const year = new Date().getFullYear();
let scrollFrame = 0;
let cycleTimer = 0;

const navigation = [
  { label: "Home", href: "#top" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Archive", href: "#archive" }
];
const socials = [
  { name: "GitHub", logo: "github", handle: "@VireonNoctis", href: "https://github.com/VireonNoctis" },
  { name: "AniList", logo: "anilist", handle: "Vireon", href: "https://anilist.co/user/Vireon" },
  { name: "Last.fm", logo: "lastfm", handle: "reasfeetadmirer", href: "https://last.fm/user/reasfeetadmirer" },
  { name: "Spotify", logo: "spotify", handle: "Vireon", href: "https://open.spotify.com/user/313455ps4aa6ouotajxcn34mwh4a" },
  { name: "Telegram", logo: "telegram", handle: "@Imperialism12", href: "https://t.me/Imperialism12" },
  { name: "Discord", logo: "discord", handle: "Find me there", href: "https://discord.com/users/1419744000977403994" }
];
const projects = [
  {
    name: "Lemegeton", index: "01", logo: "lemegeton", type: "COMMUNITY SYSTEMS",
    subtitle: "Discord media discovery.", description: "Anime, manga, novels, and Steam across communities.",
    detail: "AniList profiles, recommendations, leaderboards, moderation, and guild tools.",
    tags: ["MULTI-GUILD", "ANILIST + STEAM", "MEDIA DISCOVERY", "SERVER AUTOMATION"],
    url: "https://github.com/Kyerstorm/Lemegeton", role: "MAJOR CONTRIBUTOR · CO-OWNER", featured: true
  },
  {
    name: "PrivaCage", index: "02", logo: "privacage", type: "PRIVACY / ANDROID + WINDOWS",
    subtitle: "Local-first privacy auditing.", description: "Android, Windows, Svelte, and Rust.",
    detail: "App, tracker, and metadata audits with scoped controls.",
    tags: ["LOCAL-FIRST", "KOTLIN", "RUST"], url: "https://github.com/VireonNoctis/PrivaCage", featured: false
  },
  {
    name: "Lunar X", index: "03", logo: "lunarx", type: "PLATFORM / COMMUNITY",
    subtitle: "Anime, manga, novels, profiles, and game systems.",
    description: "A multi-surface community platform with a reported 636,746-line core footprint.",
    detail: "Supplied codebase figures are shown separately from scanned repository statistics.",
    tags: ["RUST", "NEXT.JS", "REACT", "PYTHON"], url: "https://lunarx.to/profile/vvvx", featured: false
  },
  {
    name: "Personal systems", index: "04", logo: "vireon-mark", type: "TOOLS / EXPERIMENTS",
    subtitle: "Utilities, profile tooling, automation, and experiments.",
    description: "Small systems made to reduce friction and make digital life more considered.",
    detail: "Developer tooling, workflow experiments, visual systems, and supporting utilities across the wider Vireon project ecosystem.",
    tags: ["AUTOMATION", "EXPERIMENTS"], url: "https://github.com/VireonNoctis?tab=repositories", featured: false
  }
];
const stackModules = [
  { name: "Vue 3", logo: "vuedotjs", kind: "REACTIVE UI", copy: "Composition API, reactive state, and single-file components." },
  { name: "Vite", logo: "terminal", kind: "BUILD", copy: "Fast development and static production output." },
  { name: "WebGL2", logo: "webgl", kind: "GRAPHICS", copy: "Native shader rendering with pointer response and reduced-motion fallback." },
  { name: "Rust + Actions", logo: "rust", kind: "DATA", copy: "Rust companion tools and scheduled data refresh." },
  { name: "GitHub Pages", logo: "github", kind: "HOSTING", copy: "Static deployment from the main branch." },
  { name: "CSS + TypeScript", logo: "typescript", kind: "INTERFACE", copy: "Typed interactions, responsive layout, and monochrome surfaces." }
];
const learningItems: TechCard[] = [
  { name: "Vue.js", logo: "vuedotjs", kind: "FRAMEWORK", learningStatus: "IN USE", learningNote: "The portfolio now runs on Vue 3 and Vite, using the Composition API for reactive UI." },
  { name: "Svelte", logo: "svelte", kind: "FRAMEWORK", learningStatus: "IN USE", learningNote: "Used in active frontend work, including PrivaCage." },
  { name: "Angular", logo: "angular", kind: "FRAMEWORK", learningStatus: "PLANNED", learningNote: "A full framework for structured web applications." },
  { name: "PHP", logo: "php", kind: "LANGUAGE", learningStatus: "PLANNED", learningNote: "Server-side web development and the wider PHP ecosystem." },
  { name: "C#", logo: "csharp", kind: "LANGUAGE", learningStatus: "PLANNED", learningNote: "Modern application development across the .NET ecosystem." },
  { name: "Dart", logo: "dart", kind: "LANGUAGE", learningStatus: "PLANNED", learningNote: "A strongly typed language for cross-platform applications." },
  { name: "Shell", logo: "terminal", kind: "LANGUAGE", learningStatus: "PLANNED", learningNote: "Command-line scripting, automation, and gluing tools together." },
  { name: "WebGL", logo: "webgl", kind: "GRAPHICS API", learningStatus: "IN USE", learningNote: "Browser-native GPU rendering for the hero signal field and shader experiments." },
  { name: "Three.js", logo: "threejs", kind: "LIBRARY", learningStatus: "PLANNED", learningNote: "A JavaScript 3D library for scenes, materials, cameras, and WebGL experiences." },
  { name: "Tokio", logo: "rust", kind: "RUNTIME", learningStatus: "PLANNED", learningNote: "A Rust asynchronous runtime for high-concurrency networking, Discord event handling, and game-session workloads." }
];
const logoByName: Record<string, string> = {
  Python: "python", Batch: "windowsterminal", Kotlin: "kotlin", CSS: "css3",
  TypeScript: "typescript", Rust: "rust", R: "r", Go: "go", JavaScript: "javascript",
  Ruby: "ruby", YAML: "yaml", Svelte: "svelte", HTML: "html5", Shell: "terminal",
  "Environment config": "terminal", "Git config": "git", Config: "terminal",
  Dockerfile: "docker", "Docker config": "docker", "Go module": "go",
  "Next.js": "nextdotjs", React: "react", WebGL: "webgl", "Three.js": "threejs",
  "Vue.js": "vuedotjs", Vue: "vuedotjs"
};
const formatLanguages = new Set([
  "Batch", "Markdown", "JSON", "Plain text", "YAML", "TOML", "Environment config",
  "Shell", "SVG", "Git config", "Config", "XML", "Dockerfile", "Docker config",
  "Go module", "Properties"
]);
const charactersPerLine: Record<string, number> = {
  Rust: 60, "Next.js": 90, React: 90, Python: 48, WebGL: 60, "Three.js": 60
};
const sourceLanguages = computed(() => codeStats.value?.languages ?? []);
const estimates = computed(() => codeStats.value?.manualProjectEstimates ?? []);
const nextJsRepositories = computed(() => (codeStats.value?.repositories ?? []).filter((project) =>
  (project.frameworks ?? []).some((framework) => framework.toLowerCase() === "next.js")
));
const nextJsScannedLanguage = computed<CodeStatsLanguage>(() => {
  const total: CodeStatsLanguage = { language: "Next.js", files: 0, lines: 0, nonblankLines: 0, characters: 0, words: 0 };
  for (const project of nextJsRepositories.value) {
    const typescript = project.languages.find((language) => language.language.toLowerCase() === "typescript");
    if (!typescript) continue;
    total.files += typescript.files;
    total.lines += typescript.lines;
    total.nonblankLines += typescript.nonblankLines;
    total.characters += typescript.characters;
    total.words += typescript.words;
  }
  return total;
});
const languages = computed<CodeStatsLanguage[]>(() => {
  const typescript = sourceLanguages.value.find((language) => language.language.toLowerCase() === "typescript");
  return sourceLanguages.value.flatMap((language) => {
    if (language.language.toLowerCase() !== "typescript") return [language];
    const next = nextJsScannedLanguage.value;
    const remaining = typescript ? {
      ...typescript,
      files: Math.max(0, typescript.files - next.files),
      lines: Math.max(0, typescript.lines - next.lines),
      nonblankLines: Math.max(0, typescript.nonblankLines - next.nonblankLines),
      characters: Math.max(0, typescript.characters - next.characters),
      words: Math.max(0, typescript.words - next.words)
    } : undefined;
    return [
      ...(next.files > 0 ? [next] : []),
      ...(remaining && remaining.files > 0 ? [remaining] : [])
    ];
  });
});
function estimateCharacters(area: CodeStatsProjectEstimate["areas"][number]): number | null {
  if (typeof area.characters === "number" && Number.isFinite(area.characters) && area.characters >= 0) {
    return Math.round(area.characters);
  }
  const rate = typeof area.estimatedCharactersPerLine === "number"
    ? area.estimatedCharactersPerLine : charactersPerLine[area.stack.trim()];
  return typeof rate === "number" ? Math.round(area.lines * rate) : null;
}
function compact(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
function formatted(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}
const techOptions = computed<TechCard[]>(() => {
  const items = new Map<string, TechCard>();
  for (const language of languages.value) {
    items.set(language.language.toLowerCase(), {
      name: language.language,
      logo: logoByName[language.language] ?? "",
      kind: language.language === "Next.js" ? "FRAMEWORK" :
        formatLanguages.has(language.language) ? "FORMAT" : "LANGUAGE"
    });
  }
  for (const project of estimates.value) {
    for (const area of project.areas) {
      const key = area.stack.trim().toLowerCase();
      if (!items.has(key)) {
        items.set(key, {
          name: area.stack.trim(),
          logo: logoByName[area.stack.trim()] ?? "",
          kind: area.stack === "Next.js" ? "FRAMEWORK" :
            area.stack === "React" || area.stack === "Three.js" ? "LIBRARY" :
            area.stack === "WebGL" ? "GRAPHICS API" :
            area.stack === "Tokio" ? "RUNTIME" : "LANGUAGE"
        });
      }
    }
  }
  if (!items.has("vue.js")) items.set("vue.js", { name: "Vue.js", logo: "vuedotjs", kind: "FRAMEWORK" });
  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
});
const languageCards = computed(() => techOptions.value.map((tech) => {
  const scanned = languages.value.find((language) => language.language.toLowerCase() === tech.name.toLowerCase());
  const areas = estimates.value.flatMap((project) => project.areas.filter((area) => area.stack.trim().toLowerCase() === tech.name.toLowerCase()));
  const manualLines = areas.reduce((sum, area) => sum + area.lines, 0);
  const manualCharacters = areas.reduce((sum, area) => sum + (estimateCharacters(area) ?? 0), 0);
  return {
    ...tech,
    lines: (scanned?.lines ?? 0) + manualLines,
    characters: (scanned?.characters ?? 0) + manualCharacters,
    files: scanned?.files ?? 0,
    isEstimated: manualLines > 0,
    pendingScan: !scanned && manualLines === 0
  };
}));
const selectedScannedLanguage = computed(() => selectedTech.value
  ? languages.value.find((language) => language.language.toLowerCase() === selectedTech.value?.name.toLowerCase())
  : undefined);
const selectedEstimateAreas = computed(() => selectedTech.value
  ? estimates.value.flatMap((project) => project.areas
      .filter((area) => area.stack.trim().toLowerCase() === selectedTech.value?.name.trim().toLowerCase())
      .map((area) => ({ project, area })))
  : []);
const selectedManualLines = computed(() => selectedEstimateAreas.value.reduce((total, entry) => total + entry.area.lines, 0));
const selectedManualCharacters = computed(() => selectedEstimateAreas.value.reduce((total, entry) => total + (estimateCharacters(entry.area) ?? 0), 0));
const selectedTotalLines = computed(() => (selectedScannedLanguage.value?.lines ?? 0) + selectedManualLines.value);
const selectedTotalCharacters = computed(() => (selectedScannedLanguage.value?.characters ?? 0) + selectedManualCharacters.value);
const selectedRepositories = computed(() => {
  if (!selectedTech.value || !codeStats.value) return [];
  const name = selectedTech.value.name.toLowerCase();
  const isNext = name === "next.js";
  const isTypeScript = name === "typescript";
  return codeStats.value.repositories.flatMap((project) => {
    const usesNext = (project.frameworks ?? []).some((framework) => framework.toLowerCase() === "next.js");
    if ((isNext && !usesNext) || (isTypeScript && usesNext)) return [];
    const sourceName = isNext ? "TypeScript" : selectedTech.value?.name;
    const language = project.languages.find((item) => item.language.toLowerCase() === (sourceName ?? "").toLowerCase());
    return language ? [{ project, language }] : [];
  }).sort((a, b) => b.language.lines - a.language.lines);
});
const selectedFrameworkRepositories = computed(() => {
  if (!selectedTech.value || !codeStats.value) return [];
  return codeStats.value.repositories.filter((project) =>
    (project.frameworks ?? []).some((framework) => framework.toLowerCase() === selectedTech.value?.name.toLowerCase())
  );
});
const liveNowPlaying = computed(() => {
  if (spotify.value.track) {
    return (spotify.value.isPlaying ? "SPOTIFY · PLAYING NOW" : "SPOTIFY · PAUSED") +
      " — " + spotify.value.track + " — " + (spotify.value.artist ?? "Unknown artist");
  }
  if (live.value.track) {
    return (live.value.playing ? "LAST.FM · PLAYING NOW" : "LAST.FM · LAST SCROBBLE") +
      " — " + live.value.track + " — " + (live.value.artist ?? "Unknown artist");
  }
  return spotify.value.configured ? "NOTHING PLAYING ON SPOTIFY · LAST.FM IS QUIET" : "SPOTIFY LIVE STATUS NEEDS SETUP";
});
function genreWidth(items: GenreItem[] | undefined, count: number): number {
  const max = Math.max(1, ...(items ?? []).map((item) => item.count));
  return Math.max(3, Math.round((count / max) * 100));
}
function openTech(tech: TechCard) {
  selectedTech.value = tech;
}
function closeTech() {
  selectedTech.value = null;
}
watch(selectedTech, (value) => {
  document.body.style.overflow = value ? "hidden" : "";
});
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.value = max > 0 ? window.scrollY / max : 0;
}
function onScroll() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(() => {
    updateProgress();
    scrollFrame = 0;
  });
}
function onEscape(event: KeyboardEvent) {
  if (event.key === "Escape") {
    menuOpen.value = false;
    selectedTech.value = null;
  }
}
onMounted(() => {
  updateProgress();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  window.addEventListener("keydown", onEscape);
  cycleTimer = window.setInterval(() => { signalCycle.value = (signalCycle.value + 1) % 100; }, 1600);
});
onBeforeUnmount(() => {
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
  if (cycleTimer) window.clearInterval(cycleTimer);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", updateProgress);
  window.removeEventListener("keydown", onEscape);
  document.body.style.overflow = "";
});
const systemFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const systemFrame = computed(() => systemFrames[signalCycle.value % systemFrames.length]);
</script>

<template>
  <main id="main-content" tabindex="-1" @keydown.esc="menuOpen = false">
    <a class="skip-link" href="#content-start">Skip to content</a>
    <div class="reading-progress" :style="{ transform: 'scaleX(' + scrollProgress + ')' }"></div>
    <div class="atmosphere" aria-hidden="true">
      <div class="atmosphere-grid"></div>
      <div class="grain"></div>
    </div>

    <header class="site-header">
      <a class="wordmark" href="#top" aria-label="Vireon, home" @click="menuOpen = false">
        <img class="wordmark-logo" src="/brands/vireon-mark.svg" alt="" width="42" height="42" />
        <span class="wordmark-copy"><strong>VIREON</strong><small>THE SLOP KING <span aria-hidden="true">♛</span></small></span>
      </a>
      <nav id="primary-navigation" :class="menuOpen ? 'navigation navigation-open' : 'navigation'" aria-label="Main navigation">
        <a v-for="(item, index) in navigation" :key="item.href" :href="item.href" @click="menuOpen = false">
          <span class="nav-index">0{{ index + 1 }}</span>{{ item.label }}
        </a>
        <a v-tactile class="nav-contact tactile-surface" href="#contact" @click="menuOpen = false">
          <BrailleText label="Get in touch" /><span aria-hidden="true">↗</span>
        </a>
      </nav>
      <button v-tactile class="menu-toggle tactile-surface" type="button" :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'" aria-controls="primary-navigation" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        <span aria-hidden="true">{{ menuOpen ? "×" : "☰" }}</span>
      </button>
    </header>

    <aside class="nothing-system-strip section-shell" aria-label="Nothing monochrome system readout" v-reveal>
      <div class="nothing-system-cell nothing-system-live"><span class="unicode-signal" aria-hidden="true">{{ systemFrame }}</span><span>SYSTEM ONLINE</span></div>
      <div class="nothing-system-cell"><span class="nothing-system-label">THEME INDEX</span><span class="nothing-system-value">01 <span>/ 01</span></span></div>
      <div class="nothing-system-cell"><span class="nothing-system-label">PROJECT MODULES</span><span class="nothing-system-value">04 <span>ACTIVE</span></span></div>
      <div class="nothing-system-cell nothing-system-unicode"><span class="nothing-system-label">SIGNAL CYCLE</span><span class="nothing-system-cycle">{{ String(signalCycle).padStart(2, "0") }} <span>/ 99</span></span><span class="nothing-system-signal" aria-hidden="true">⠿ ⠶ ⣿ ⠿</span></div>
    </aside>

    <section class="hero section-shell" id="top">
      <span id="content-start" class="content-start" aria-hidden="true"></span>
      <div class="hero-meta"><span class="eyebrow"><i></i>VIREON / NODE 001</span><span class="coordinates">SYSTEM ONLINE<br />PUBLIC INTERFACE</span></div>
      <div class="hero-main">
        <div class="hero-copy" v-reveal>
          <p class="hero-kicker">A PERSONAL SYSTEM / EST. 2026</p>
          <h1>MAKE THE<br />SIGNAL <em>MATTER.</em></h1>
          <div class="hero-bottomline">
            <p>Projects. Systems. Signal.</p>
            <a class="round-link tactile-surface" v-tactile href="#manifesto" aria-label="Discover the portfolio"><span aria-hidden="true">↘</span></a>
          </div>
        </div>
        <div class="hero-art editorial-index editorial-index-slop" role="group" aria-label="Vireon monochrome signal field">
          <div class="theme-hero-artwork theme-hero-artwork-nothing">
            <NothingWebGL />
            <div class="nothing-webgl-vignette"></div>
            <div class="nothing-hero-ring nothing-hero-ring-outer"></div>
            <div class="nothing-hero-ring nothing-hero-ring-inner"></div>
            <div class="nothing-hero-core"><span>VN</span></div>
            <span class="nothing-hero-code nothing-hero-code-top">NODE / 001 · SIGNAL FIELD</span>
            <span class="nothing-hero-code nothing-hero-code-bottom">WEBGL 2 / SHADER ACTIVE</span>
          </div>
          <div class="slop-brand-lockup">
            <div class="slop-brand-vireon">VIREON<span class="slop-brand-spark" aria-hidden="true">✳</span></div>
            <div class="slop-brand-divider" aria-hidden="true"><i></i><span>⠿</span><i></i></div>
            <div class="slop-brand-title"><span>Signal Architect</span><span class="slop-king-crown" aria-label="crown">♛</span></div>
            <div class="slop-brand-signature" aria-hidden="true"><span>V</span><i></i><span>VN</span></div>
          </div>
        </div>
      </div>
      <div class="hero-foot"><span>NODE ACTIVE</span><span class="hero-foot-center"><i class="live-dot"></i> PUBLIC SIGNAL / ONLINE</span><span>SCROLL TO QUERY <i class="scroll-line"></i></span></div>
    </section>

    <section class="profile-identity-band section-shell" aria-label="Professional roles" v-reveal>
      <div class="profile-identity-heading"><span>01 / PROFESSIONAL PROFILE</span><strong>Business, technology<br />and property.</strong></div>
      <div class="profile-identity-roles">
        <div class="profile-identity-role"><small>01</small><strong>Businessman</strong><span>BUSINESS / VENTURES</span></div>
        <div class="profile-identity-role"><small>02</small><strong>Full-stack Developer</strong><span>SOFTWARE / SYSTEMS</span></div>
        <div class="profile-identity-role"><small>03</small><strong>Real Estate Developer</strong><span>PROPERTY / DEVELOPMENT</span></div>
      </div>
    </section>

    <div class="marquee" aria-label="Systems, signal, iteration, deployment"><div class="marquee-track" aria-hidden="true"><span v-for="n in 4" :key="n">SYSTEMS　✳　SIGNAL　✳　ITERATION　✳　DEPLOYMENT　<b>✳</b>　</span></div></div>

    <section class="manifesto section-shell section-space" id="manifesto" v-reveal>
      <div class="index-label"><span>01 / CORE</span><span>PRINCIPLES</span></div>
      <div class="manifesto-content">
        <div class="section-heading"><span class="eyebrow"><i></i>CORE</span><h2>BUILD FOR THE<br /><em>REAL WORLD.</em></h2></div>
        <div class="manifesto-text"><p class="lead">Build. Refine. Repeat.</p><p>Business, software, and creative work.</p>
          <a v-tactile class="text-link tactile-surface" href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer"><BrailleText label="Inspect source" /><span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="manifesto-aside"><span class="aside-rule"></span><p>OBSERVE / TEST / SHIP</p><p>No noise. Just progress.</p></div>
    </section>

    <section class="work section-shell section-space" id="work" v-reveal>
      <div class="section-topline"><div class="index-label"><span>02 / WORK</span><span>PROJECTS</span></div><span class="eyebrow"><i></i>PROJECT REGISTRY</span></div>
      <div class="work-heading"><h2>BUILT TO<br /><em>MOVE.</em></h2><p>Software. Community. Experiments.</p></div>
      <div class="project-list project-list-expandable">
        <details v-for="project in projects" :key="project.name" :class="project.featured ? 'project-feature project-feature-expand project-expand' : 'project-row project-row-expand project-expand'">
          <summary v-tactile class="tactile-surface project-feature-summary" v-if="project.featured">
            <div class="project-art lunar-art"><div class="lunar-moon"></div><div class="lunar-ring"></div><div class="lunar-star">✳</div></div>
            <div class="project-detail">
              <div class="project-index">{{ project.index }} <span>/ SOFTWARE</span></div>
              <div><div class="project-title-row"><img class="project-logo project-logo-large" :src="'/brands/' + project.logo + '.svg'" alt="" width="44" height="44" /><div><h3>{{ project.name }}</h3><p><em>{{ project.subtitle }}</em><br />{{ project.description }}</p></div></div>
                <div class="tag-row"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div></div>
              <span class="project-arrow" aria-hidden="true">↗</span>
            </div>
            <span class="project-expand-hint"><BrailleText label="Expand project" /><span aria-hidden="true">＋</span></span>
          </summary>
          <summary v-else v-tactile class="tactile-surface project-row-summary">
            <span class="project-index">{{ project.index }} / 04</span>
            <div class="project-title-row"><img class="project-logo" :src="'/brands/' + project.logo + '.svg'" alt="" width="34" height="34" /><div><h3>{{ project.name }}</h3><p>{{ project.subtitle }}<br />{{ project.description }}</p></div></div>
            <span class="project-type">{{ project.type }}</span><span class="row-arrow" aria-hidden="true">↗</span>
          </summary>
          <div class="project-expanded-content"><p>{{ project.detail }}</p>
            <a v-tactile class="tactile-surface" :href="project.url" target="_blank" rel="noreferrer"><BrailleText label="Open project" /><span aria-hidden="true">↗</span></a>
            <span v-if="project.role">{{ project.role }}</span>
          </div>
        </details>
      </div>
      <div class="github-live">
        <div class="github-live-icon"><span aria-hidden="true">⌘</span></div>
        <div><span class="micro-label">GITHUB / LIVE</span><p><template v-if="live.repos !== undefined"><AnimatedNumber :value="live.repos" /> repositories</template><template v-else>Loading repository data</template><template v-if="live.followers !== undefined"> · <AnimatedNumber :value="live.followers" /> followers</template></p></div>
        <a v-tactile class="tactile-surface" href="https://github.com/VireonNoctis?tab=repositories" target="_blank" rel="noreferrer"><BrailleText label="View repositories" /><span aria-hidden="true">↗</span></a>
      </div>
      <section class="code-footprint-teaser" aria-label="Language code statistics">
        <div class="code-footprint-teaser-head"><span class="micro-label">CODE TELEMETRY / OPEN ON A LANGUAGE</span><span class="code-footprint-updated">{{ codeStats ? languageCards.length + " LANGUAGE GROUPS · " + codeStats.totals.repositories + " REPOSITORIES IN SNAPSHOT" : codeStatsStatus === "loading" ? "FETCHING LANGUAGE DATA" : "LANGUAGE DATA TEMPORARILY UNAVAILABLE" }}</span></div>
        <p>Repository totals. Select a stack to inspect its details.</p>
        <a v-tactile class="code-footprint-link tactile-surface" href="#stack"><BrailleText label="Open language index" /><span aria-hidden="true">↗</span></a>
      </section>
      <div v-if="repos.length" class="repo-live-area">
        <div class="repo-live-heading"><span class="micro-label">LATEST PUBLIC REPOSITORIES · AUTO-SYNCED</span><span class="repo-live-count">Sorted by latest update</span></div>
        <div class="repo-live-list">
          <a v-for="(repo, index) in repos" :key="repo.name" v-tactile class="tactile-surface" :href="repo.html_url" target="_blank" rel="noreferrer">
            <span class="repo-row-index">{{ String(index + 1).padStart(2, "0") }}</span>
            <div class="repo-live-copy"><strong>{{ repo.name }}</strong><small>{{ repo.description?.trim() || "No repository description has been added yet." }}</small><span class="repo-live-meta"><span class="repo-language">{{ repo.language || "Language not detected" }}</span><span class="repo-updated">Updated {{ repo.updated_at.slice(0, 10) }}</span></span></div>
            <span class="repo-stars">✳ <AnimatedNumber :value="repo.stargazers_count" /></span><span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>

    <section class="stack section-shell section-space" id="stack" v-reveal>
      <div class="section-topline"><div class="index-label"><span>03 / STACK</span><span>TOOLCHAIN</span></div><span class="eyebrow"><i></i>WEB SYSTEMS</span></div>
      <div class="stack-heading"><div><span class="eyebrow"><i></i>WEB SYSTEMS</span><h2>BUILT WITH<br /><em>INTENT.</em></h2></div><p>The tools behind this site.</p></div>
      <div class="website-stack-overview">
        <div class="website-stack-feature">
          <div class="website-stack-visual">
            <div class="website-stack-visual-top"><span>V / WEB SYSTEMS</span><span>BUILD 003</span></div>
            <div class="website-stack-visual-center"><div class="website-stack-logo-stack">
              <span class="website-stack-logo website-stack-logo-next"><img src="/brands/tech-vuedotjs.svg" alt="Vue.js" loading="lazy" /></span>
              <span class="website-stack-logo website-stack-logo-react"><img src="/brands/tech-typescript.svg" alt="TypeScript" loading="lazy" /></span>
              <span class="website-stack-logo website-stack-logo-ts"><img src="/brands/tech-webgl.svg" alt="WebGL2" loading="lazy" /></span>
            </div><span class="website-stack-visual-word">VIREON<span> / INTERFACE</span></span><span class="website-stack-visual-caption">REACTIVITY · DATA · MOTION · SHADERS</span></div>
            <div class="website-stack-visual-bottom"><span>RENDER / INTERACT / DEPLOY</span><span><i></i> STATIC SITE</span></div>
          </div>
          <div class="website-stack-feature-copy"><span class="micro-label">01 / THE FRONT END</span><h3>One system.<br /><em>Every interaction.</em></h3><p>Vue 3. TypeScript. Vite. WebGL2. Rust tooling.</p><div class="website-stack-pipeline"><span>01 <b>BUILD</b></span><i></i><span>02 <b>CHECK</b></span><i></i><span>03 <b>PUBLISH</b></span></div></div>
        </div>
        <div class="website-stack-modules" aria-label="Technologies used by this website">
          <article v-for="(item, index) in stackModules" :key="item.name" class="website-stack-module">
            <div class="website-stack-module-top"><span>{{ String(index + 1).padStart(2, "0") }} / {{ item.kind }}</span><img :src="'/brands/tech-' + item.logo + '.svg'" alt="" loading="lazy" /></div>
            <h3>{{ item.name }}</h3><p>{{ item.copy }}</p>
          </article>
        </div>
      </div>

      <div class="project-language-explorer">
        <div class="project-language-heading"><div><span class="micro-label">02 / CODEBASE EXPLORER</span><h3>Technology statistics, on demand.</h3><p>Tracked source technologies and supplied Lunar X estimates. Framework totals are grouped separately from their underlying TypeScript files.</p></div><span class="project-language-count">{{ languageCards.length }} PROFILES</span></div>
        <div class="project-language-grid">
          <button v-for="tech in languageCards" :key="tech.name" v-tactile class="project-language-tile tactile-surface" type="button" :aria-label="'Open ' + tech.name + ' technology statistics, ' + formatted(tech.lines) + ' total lines'" @click="openTech(tech)">
            <span class="project-language-logo"><img v-if="tech.logo" :src="'/brands/tech-' + tech.logo + '.svg'" alt="" loading="lazy" /><span v-else class="project-language-generic">&lt;/&gt;</span></span>
            <span class="project-language-copy"><strong>{{ tech.name }}</strong><small>{{ tech.isEstimated ? "Lunar X · ≈ " + compact(tech.characters) + " estimated characters" : tech.pendingScan ? "Framework profile · scan pending" : "Tracked repository data" }}</small></span>
            <span class="project-language-lines"><strong>{{ formatted(tech.lines) }}</strong><small>lines</small></span>
            <span class="project-language-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
        <p class="project-language-note">{{ codeStatsStatus === "ready" ? "Snapshot generated " + new Date(codeStats!.generatedAt).toLocaleDateString() + ". Select any profile to expand its source breakdown." : codeStatsStatus === "loading" ? "Repository scan is being loaded." : "The repository snapshot is unavailable right now; the site remains fully usable." }}</p>
      </div>
    </section>

    <section class="learning section-shell section-space" id="learning" v-reveal>
      <div class="section-topline"><div class="index-label"><span>04 / NEXT</span><span>LEARNING</span></div><span class="eyebrow"><i></i>TOOLKIT</span></div>
      <div class="learning-heading"><div><span class="eyebrow"><i></i>ACTIVE / NEXT</span><h2>ALWAYS<br /><em>BUILDING.</em></h2></div><p>Open a tile.</p></div>
      <div class="learning-grid">
        <button v-for="(item, index) in learningItems" :key="item.name" v-tactile class="learning-card tactile-surface" type="button" :aria-haspopup="'dialog'" :aria-label="'Open ' + item.name + ' details. Status: ' + item.learningStatus + '.'" @click="openTech(item)">
          <div class="learning-card-top"><span class="learning-number">{{ String(index + 1).padStart(2, "0") }} / 10</span><span class="learning-kind">{{ item.kind }}</span></div>
          <div class="learning-brand"><span class="learning-logo"><img :src="'/brands/tech-' + item.logo + '.svg'" alt="" loading="lazy" /></span><div><h3>{{ item.name }}</h3><span>{{ item.learningStatus === "IN USE" ? "IN ACTIVE USE" : "ON THE LEARNING LIST" }}</span></div></div>
          <p>{{ item.learningNote }}<span v-if="item.name === 'WebGL'" class="learning-card-estimate">Lunar X estimate · 20,657 lines · ≈ 1,239,420 characters</span><span v-if="item.name === 'Three.js'" class="learning-card-estimate">Lunar X estimate · 18,685 lines · ≈ 1,121,100 characters</span></p>
          <div class="learning-card-bottom"><span class="learning-pulse"></span><span>{{ item.learningStatus === "IN USE" ? "ACTIVE TOOLKIT" : "UP NEXT" }}</span><span aria-hidden="true">↗</span></div>
        </button>
      </div>
      <div class="learning-note"><span>VN / FIELD NOTES</span><p>Open any tile for its role and status in the current toolkit or future plans.</p></div>
    </section>

    <section class="interlude" aria-label="A moment of stillness" v-reveal>
      <div class="interlude-lines"></div><div class="interlude-inner"><span class="interlude-mark">“</span><p>LESS TALK.<br /><em>MORE MOTION.</em></p><span class="interlude-credit">BUILD / REFINE / REPEAT</span></div><div class="interlude-orbit" aria-hidden="true">⠿</div>
    </section>

    <section class="archive section-shell section-space" id="archive" v-reveal>
      <div class="section-topline"><div class="index-label"><span>05 / ARCHIVE</span><span>LIVE DATA</span></div><span class="eyebrow"><i></i>CURRENT SIGNALS</span></div>
      <div class="archive-heading"><h2>THE<br /><em>ARCHIVE.</em></h2><p>Anime. Manga. Music.</p></div>
      <div class="archive-grid">
        <a v-tactile class="archive-card archive-anime tactile-surface" href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer">
          <div class="archive-card-top"><img src="/brands/anilist.svg" alt="" width="22" height="22" /><span>READ / WATCH</span><span aria-hidden="true">↗</span></div>
          <div class="archive-illustration anime-illustration"><div class="book-shape book-one"></div><div class="book-shape book-two"></div><div class="book-shape book-three"></div><span class="illustration-star">✳</span></div>
          <div class="archive-card-bottom"><h3>Stories &amp; worlds</h3><p>Anime and manga.</p><div class="archive-stats"><span><strong><AnimatedNumber v-if="live.anime !== undefined" :value="live.anime" /><template v-else>—</template></strong> anime</span><span><strong><AnimatedNumber v-if="live.manga !== undefined" :value="live.manga" /><template v-else>—</template></strong> manga</span></div><span class="archive-link"><BrailleText label="Open AniList" /><span aria-hidden="true">↗</span></span></div>
        </a>
        <div class="archive-card archive-music">
          <div class="archive-card-top"><div class="archive-brandmarks"><img src="/brands/lastfm.svg" alt="Last.fm" width="22" height="22" /><img src="/brands/spotify.svg" alt="Spotify" width="22" height="22" /></div><span>LISTEN / RETURN</span><span aria-hidden="true">↗</span></div>
          <div class="archive-illustration music-illustration"><div class="vinyl"><div class="vinyl-label"></div></div><div class="sound-wave"><i v-for="n in 21" :key="n" :style="{ '--i': n, '--h': (12 + (n % 7) * 11) + 'px' }"></i></div></div>
          <div class="archive-card-bottom"><h3>Soundtrack to anything</h3><p>Spotify for the live moment; Last.fm for the long memory.</p>
            <div class="now-playing"><i :class="spotify.isPlaying || (!spotify.track && live.playing) ? 'live-dot' : 'idle-dot'"></i><span>{{ liveNowPlaying }}</span></div>
            <div v-if="spotify.track && spotify.albumImage" class="spotify-track"><img :src="spotify.albumImage" :alt="'Cover art for ' + (spotify.album || spotify.track)" loading="lazy" /><div><span class="micro-label">{{ spotify.isPlaying ? "ON SPOTIFY NOW" : "SPOTIFY / LAST TRACK" }}</span><strong>{{ spotify.track }}</strong><small>{{ spotify.artist || "Unknown artist" }}{{ spotify.album ? " · " + spotify.album : "" }}</small></div><a v-if="spotify.url" :href="spotify.url" target="_blank" rel="noreferrer" :aria-label="'Open ' + spotify.track + ' on Spotify">↗</a></div>
            <div class="archive-stats"><span><strong><AnimatedNumber v-if="live.scrobbles !== undefined" :value="live.scrobbles" /><template v-else>—</template></strong> plays logged on Last.fm</span></div>
            <div class="archive-actions"><a v-tactile class="archive-link tactile-surface" href="https://open.spotify.com/user/313455ps4aa6ouotajxcn34mwh4a" target="_blank" rel="noreferrer"><BrailleText label="Open Spotify profile" /><span aria-hidden="true">↗</span></a><a v-tactile class="archive-link tactile-surface" href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer"><BrailleText label="Open Last.fm history" /><span aria-hidden="true">↗</span></a></div>
          </div>
        </div>
      </div>

      <div class="signal-grid">
        <section class="signal-panel anilist-detail">
          <div class="signal-panel-head"><div><img src="/brands/anilist.svg" alt="" width="20" height="20" /><span class="micro-label">ANILIST / LIBRARY TELEMETRY</span></div><span class="signal-live"><i></i> PUBLIC DATA</span></div>
          <h3>More than a watchlist.</h3><p class="signal-intro">Reading and watch statistics.</p>
          <div class="deep-stats">
            <div><span>EPISODES WATCHED</span><strong><AnimatedNumber v-if="live.animeEpisodes !== undefined" :value="live.animeEpisodes" /><template v-else>—</template></strong></div>
            <div><span>HOURS WATCHED</span><strong><AnimatedNumber v-if="live.animeMinutes !== undefined" :value="Math.round(live.animeMinutes / 60)" /><template v-else>—</template></strong></div>
            <div><span>CHAPTERS READ</span><strong><AnimatedNumber v-if="live.mangaChapters !== undefined" :value="live.mangaChapters" /><template v-else>—</template></strong></div>
            <div><span>VOLUMES READ</span><strong><AnimatedNumber v-if="live.mangaVolumes !== undefined" :value="live.mangaVolumes" /><template v-else>—</template></strong></div>
            <div><span>ANIME MEAN SCORE</span><strong class="deep-stat-number deep-stat-score"><AnimatedNumber v-if="live.animeScore !== undefined" :value="live.animeScore" :decimals="1" /><template v-else>—</template><small>/100</small></strong></div>
            <div><span>MANGA MEAN SCORE</span><strong class="deep-stat-number deep-stat-score"><AnimatedNumber v-if="live.mangaScore !== undefined" :value="live.mangaScore" :decimals="1" /><template v-else>—</template><small>/100</small></strong></div>
          </div>
          <div class="genre-columns">
            <div><span class="micro-label">ANIME GENRES</span><div v-for="genre in live.animeGenres || []" :key="genre.genre" class="genre-row"><span>{{ genre.genre }}</span><div><i :style="{ width: genreWidth(live.animeGenres, genre.count) + '%' }"></i></div><small><AnimatedNumber :value="genre.count" /></small></div><p v-if="!live.animeGenres?.length" class="empty-data">Waiting for AniList statistics…</p></div>
            <div><span class="micro-label">MANGA GENRES</span><div v-for="genre in live.mangaGenres || []" :key="genre.genre" class="genre-row"><span>{{ genre.genre }}</span><div><i :style="{ width: genreWidth(live.mangaGenres, genre.count) + '%' }"></i></div><small><AnimatedNumber :value="genre.count" /></small></div><p v-if="!live.mangaGenres?.length" class="empty-data">Waiting for AniList statistics…</p></div>
          </div>
          <a v-tactile class="signal-footer-link tactile-surface" href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer"><BrailleText label="Explore the full profile" /><span aria-hidden="true">↗</span></a>
        </section>
        <section class="signal-panel lastfm-detail">
          <div class="signal-panel-head"><div><img src="/brands/lastfm.svg" alt="" width="20" height="20" /><span class="micro-label">LAST.FM / LISTENING INDEX</span></div><span class="signal-live"><i></i> SCROBBLE DATA</span></div>
          <h3>Patterns in the noise.</h3><p class="signal-intro">All-time listening.</p>
          <div class="ranked-lists">
            <div><span class="micro-label">TOP ARTISTS</span><a v-for="(item, index) in live.topArtists || []" :key="item.name" class="ranked-row" :href="item.url || 'https://last.fm/user/reasfeetadmirer'" target="_blank" rel="noreferrer"><span>{{ String(index + 1).padStart(2, "0") }}</span><strong>{{ item.name }}</strong><small><AnimatedNumber v-if="item.playcount !== undefined" :value="item.playcount" /> plays</small><span aria-hidden="true">↗</span></a><p v-if="!live.topArtists?.length" class="empty-data">Loading the most-played artists…</p></div>
            <div><span class="micro-label">TOP TRACKS</span><a v-for="(item, index) in live.topTracks || []" :key="item.name + '-' + item.artist" class="ranked-row" :href="item.url || 'https://last.fm/user/reasfeetadmirer'" target="_blank" rel="noreferrer"><span>{{ String(index + 1).padStart(2, "0") }}</span><strong>{{ item.name }}<small>{{ item.artist }}</small></strong><small><AnimatedNumber v-if="item.playcount !== undefined" :value="item.playcount" /> plays</small><span aria-hidden="true">↗</span></a><p v-if="!live.topTracks?.length" class="empty-data">Loading the most-played tracks…</p></div>
          </div>
          <a v-tactile class="signal-footer-link tactile-surface" href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer"><BrailleText label="Open listening history" /><span aria-hidden="true">↗</span></a>
        </section>
        <section class="signal-panel discord-detail">
          <div class="signal-panel-head"><div><img src="/brands/discord.svg" alt="" width="20" height="20" /><span class="micro-label">DISCORD / COMMUNITY</span></div></div>
          <h3>Find me on Discord.</h3><p class="signal-intro">Open the Discord profile directly.</p>
          <a v-tactile class="signal-footer-link tactile-surface" href="https://discord.com/users/1419744000977403994" target="_blank" rel="noreferrer"><BrailleText label="Open Discord profile" /><span aria-hidden="true">↗</span></a>
        </section>
      </div>
      <div class="archive-note"><span class="note-index">NOTE 03.1</span><p>Currently in orbit: worldbuilding, interface systems, dark fantasy, and finding the right track for the right hour.</p><span class="note-symbol">✳</span></div>
    </section>

    <section class="contact section-shell section-space" id="contact" v-reveal>
      <div class="section-topline"><div class="index-label"><span>06 / CONTACT</span><span>OPEN PORT</span></div><span class="eyebrow"><i></i>CHANNEL READY</span></div>
      <div class="contact-main"><h2>HAVE A<br /><em>USEFUL SIGNAL?</em></h2><a v-tactile class="contact-circle tactile-surface" href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer" aria-label="Open GitHub profile"><span aria-hidden="true">↗</span><span><BrailleText label="Open port" /></span></a></div>
      <p class="contact-copy">Projects. Ideas. Collaboration.</p>
      <div class="social-list"><a v-for="(social, index) in socials" :key="social.name" v-tactile class="tactile-surface" :href="social.href" target="_blank" rel="noreferrer"><span class="social-number">0{{ index + 1 }}</span><img class="social-logo" :src="'/brands/' + social.logo + '.svg'" alt="" width="22" height="22" /><strong>{{ social.name }}</strong><span class="social-handle">{{ social.handle }}</span><span aria-hidden="true">↗</span></a></div>
    </section>

    <section class="lunar-profile section-shell section-space" id="lunar-profile" v-reveal>
      <div class="section-topline"><div class="index-label"><span>LIVE / LUNAR X</span><span>PROFILE REDIRECTION</span></div><span class="eyebrow"><i></i>OPEN PROFILE</span></div>
      <div class="work-heading"><h2>LUNAR X,<br /><em>OVER THERE.</em></h2><p>Lunar X profile.</p></div>
      <a v-tactile class="signal-footer-link tactile-surface" href="https://lunarx.to/profile/vvvx" target="_blank" rel="noreferrer"><BrailleText label="Open Lunar X profile" /><span aria-hidden="true">↗</span></a>
    </section>

    <footer class="site-footer">
      <a class="footer-mark" href="#top" aria-label="Vireon, back to top"><img class="footer-wordmark" src="/brands/vireon-wordmark.svg" alt="Vireon — The Slop King" width="180" height="42" /></a>
      <p>MADE IN THE QUIET HOURS.<br /><span>KEPT IN MOTION.</span></p><span class="footer-year">© {{ year }} VIREON</span>
      <a v-tactile class="back-top tactile-surface" href="#top"><BrailleText label="Back to top" /><span aria-hidden="true">↗</span></a>
    </footer>

    <Teleport to="body">
      <Transition name="tech-dialog">
        <div v-if="selectedTech" class="tech-modal-backdrop" role="presentation" @click.self="closeTech">
          <section class="tech-modal" role="dialog" aria-modal="true" :aria-label="selectedTech.name + ' details'">
            <header class="tech-modal-header">
              <div class="tech-modal-brand"><span class="tech-modal-logo"><img v-if="selectedTech.logo" :src="'/brands/tech-' + selectedTech.logo + '.svg'" alt="" /><span v-else>&lt;/&gt;</span></span><div><span class="micro-label">{{ selectedTech.kind }}</span><h2>{{ selectedTech.name }}</h2></div></div>
              <button v-tactile type="button" class="tech-modal-close tactile-surface" aria-label="Close technology details" @click="closeTech">×</button>
            </header>
            <p v-if="selectedTech.learningNote" class="tech-modal-learning-note">{{ selectedTech.learningNote }} <strong>{{ selectedTech.learningStatus }}</strong></p>
            <div class="tech-modal-grid">
              <div class="tech-modal-stat"><span>TOTAL LINES</span><strong><AnimatedNumber :value="selectedTotalLines" /></strong></div>
              <div class="tech-modal-stat"><span>CHARACTERS</span><strong><AnimatedNumber :value="selectedTotalCharacters" /></strong></div>
              <div class="tech-modal-stat"><span>SCANNED FILES</span><strong><AnimatedNumber :value="selectedScannedLanguage?.files ?? 0" /></strong></div>
              <div class="tech-modal-stat"><span>WORDS</span><strong><AnimatedNumber :value="selectedScannedLanguage?.words ?? 0" /></strong></div>
            </div>
            <section v-if="selectedEstimateAreas.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><div><span class="micro-label">SUPPLIED PROJECT ESTIMATES</span><h3>Lunar X footprint</h3></div><span class="tech-modal-source-label">{{ selectedEstimateAreas.length }} areas</span></div>
              <div class="tech-modal-estimate-list">
                <div v-for="entry in selectedEstimateAreas" :key="entry.project.id + '-' + entry.area.name" class="tech-modal-estimate">
                  <span class="tech-modal-estimate-project"><strong>{{ entry.project.name }}</strong><small>{{ entry.area.name }} · {{ entry.project.classification }}</small></span>
                  <span class="tech-modal-estimate-lines"><strong>{{ formatted(entry.area.lines) }} lines</strong><small>{{ estimateCharacters(entry.area) === null ? "Character estimate unavailable" : "≈ " + formatted(estimateCharacters(entry.area) || 0) + " characters" }}</small></span>
                </div>
              </div>
            </section>
            <section v-if="selectedRepositories.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><div><span class="micro-label">REPOSITORY SCAN</span><h3>Source breakdown</h3></div><span class="tech-modal-source-label">{{ selectedRepositories.length }} repositories</span></div>
              <div class="tech-modal-repository-list">
                <a v-for="entry in selectedRepositories" :key="entry.project.fullName" class="tech-modal-repository" :href="entry.project.url" target="_blank" rel="noreferrer">
                  <span class="tech-modal-repository-copy"><strong>{{ entry.project.name }}</strong><small>{{ entry.project.role || (entry.project.relationship === "contributor" ? "Major contributor" : "Owned · " + entry.project.branch) }}</small></span>
                  <span class="tech-modal-repository-stats"><strong><AnimatedNumber :value="entry.language.lines" /></strong><small>lines · {{ entry.language.files }} files</small></span><span aria-hidden="true">↗</span>
                </a>
              </div>
            </section>
            <section v-if="selectedFrameworkRepositories.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><div><span class="micro-label">FRAMEWORK DETECTION</span><h3>Projects using {{ selectedTech.name }}</h3></div><span class="tech-modal-source-label">{{ selectedFrameworkRepositories.length }} repositories</span></div>
              <div class="tech-modal-repository-list">
                <a v-for="project in selectedFrameworkRepositories" :key="project.fullName" class="tech-modal-repository" :href="project.url" target="_blank" rel="noreferrer">
                  <span class="tech-modal-repository-copy"><strong>{{ project.name }}</strong><small>{{ project.relationship === "contributor" ? project.role || "Contributor project" : "Owned project" }}</small></span>
                  <span class="tech-modal-repository-stats"><strong>{{ (project.frameworks || []).filter((item) => item.toLowerCase() === selectedTech?.name.toLowerCase()).length }}</strong><small>framework match</small></span><span aria-hidden="true">↗</span>
                </a>
              </div>
            </section>
            <p v-if="!selectedScannedLanguage && !selectedEstimateAreas.length && !selectedTech.learningNote" class="tech-modal-footnote">No repository snapshot is currently available for this profile. The live scan will populate it when the source data updates.</p>
            <p v-else class="tech-modal-footnote">Scanned repository data and supplied estimates are kept separate. Framework attribution is not counted twice against TypeScript.</p>
          </section>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>
