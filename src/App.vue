<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import AnimatedNumber from "./components/AnimatedNumber.vue";
import BrailleText from "./components/BrailleText.vue";
import NothingWebGL from "./components/NothingWebGL.vue";
import { useCinematicMotion } from "./composables/useCinematicMotion";
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
const { codeStats, codeStatsStatus, live, spotify, lastFmAlbum } = usePortfolioData();
const { scrollTo } = useCinematicMotion();

const menuOpen = ref(false);
const selectedTech = ref<TechCard | null>(null);
const scrollProgress = ref(0);
const year = new Date().getFullYear();
let scrollFrame = 0;
const playbackClock = ref(Date.now());
let playbackClockTimer = 0;
const playbackWaveBars = Array.from({ length: 64 }, (_, index) => {
  const envelope = Math.abs(
    Math.sin(index * 0.61) * 0.34 +
    Math.sin(index * 0.19 + 1.1) * 0.31 +
    Math.cos(index * 1.73) * 0.17
  );
  return Math.round(16 + envelope * 82);
});

const navigation = [
  { label: "Profile", href: "#profile" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Archive", href: "#archive" },
  { label: "Contact", href: "#contact" }
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
    name: "Lemegeton", index: "01", logo: "lemegeton", mark: "", type: "MEDIA / COMMUNITY",
    subtitle: "One Discord bot. Many media worlds.",
    description: "A multi-guild media-discovery and community archive platform.",
    detail: "Connects anime, manga, novels, films, television, and games through Discord discovery, shared metadata, persistent guild boundaries, and dashboard components. The v3 migration is ongoing.",
    tags: ["DISCORD", "MULTI-GUILD", "POSTGRESQL", "V3 MIGRATION"],
    url: "https://github.com/Kyerstorm/Lemegeton", role: "CO-OWNER · MAJOR CONTRIBUTOR"
  },
  {
    name: "LOOP", index: "02", logo: "loop", mark: "LOOP", type: "SOCIAL PLATFORM",
    subtitle: "Create together. Discover everything.",
    description: "A collaborative social platform built around Circles, Loop Trees, and Co-Loop.",
    detail: "A substantial Next.js 15 and React 19 codebase with community spaces, branching conversations, creator systems, collaborative content flows, API routes, and extensive feature tests.",
    tags: ["NEXT.JS 15", "REACT 19", "TYPESCRIPT", "SUPABASE"],
    url: "https://github.com/VireonNoctis/loop-app", role: "PRODUCT / PLATFORM DEVELOPMENT"
  },
  {
    name: "PrivaCage", index: "03", logo: "privacage", mark: "", type: "PRIVACY / SYSTEMS",
    subtitle: "Understand what your device exposes.",
    description: "Local-first privacy auditing across Android and Windows.",
    detail: "Combines evidence-backed tracker intelligence, bounded Android DNS controls, local APK and permission audits, metadata inspection, encrypted profile transfer, and reversible Windows privacy controls. Feature maturity is documented separately.",
    tags: ["ANDROID", "WINDOWS", "KOTLIN", "RUST"],
    url: "https://github.com/VireonNoctis/PrivaCage", role: "PROJECT DEVELOPMENT"
  },
  {
    name: "Moonbyte", index: "04", logo: "moonbyte", mark: "MOONBYTE", type: "DISCORD GAME SYSTEM",
    subtitle: "A little world of games, right inside Discord.",
    description: "A Rust game runtime for quick games, puzzles, and multiplayer sessions.",
    detail: "The implemented runtime slice includes Tic-tac-toe, Connect Four, Memory Match, and Word Scramble, with guild-scoped sessions, transactional PostgreSQL state, versioned snapshots, and restart recovery.",
    tags: ["RUST", "TOKIO", "SERENITY", "POSTGRESQL"],
    url: "https://github.com/VireonNoctis/Moonbyte", role: "PROJECT DEVELOPMENT"
  },
  {
    name: "Lunar X", index: "05", logo: "lunarx", mark: "", type: "PLATFORM / COMMUNITY",
    subtitle: "Anime, manga, profiles, and connected game systems.",
    description: "A live community platform spanning media, profiles, and interactive systems.",
    detail: "A connected product ecosystem across community, media discovery, profiles, and game surfaces. Its code figures in Code Counted are supplied estimates and are kept separate from scanned public-repository data.",
    tags: ["RUST", "NEXT.JS", "REACT", "COMMUNITY"],
    url: "https://lunarx.to/profile/vvvx", role: "PLATFORM DEVELOPMENT"
  },
  {
    name: "Driftglass", index: "06", logo: "driftglass", mark: "DRIFTGLASS", type: "PRIVACY / AUDITING",
    subtitle: "Every update leaves a trace.",
    description: "A privacy-first application update auditor with evidence-linked reports.",
    detail: "The C++20 CLI validates run manifests and reports, compares version behaviour deterministically, and stores bounded local history. Linux Rust and macOS Swift observers remain experimental; the Svelte report viewer is read-only.",
    tags: ["C++20", "RUST", "SWIFT", "SQLITE"],
    url: "https://github.com/VireonNoctis/Driftglass", role: "EARLY PROTOTYPE"
  },
  {
    name: "SkillTether", index: "07", logo: "skilltether", mark: "SKILLTETHER", type: "DEVELOPER TOOLING",
    subtitle: "Translate the words. Preserve the intent.",
    description: "A local-first CLI for validating and localizing Agent Skills.",
    detail: "Audits package metadata, links, resources, protected machine-facing content, operational invariants, and structural drift. It produces reviewable reports and evidence-backed export candidates; scripts are inspected statically rather than executed.",
    tags: ["PYTHON", "CLI", "LOCAL-FIRST", "AGENT SKILLS"],
    url: "https://github.com/VireonNoctis/SkillTether", role: "TOOLING DEVELOPMENT"
  },
  {
    name: "SwarmForge", index: "08", logo: "swarmforge", mark: "SWARMFORGE", type: "AGENT WORKFLOWS",
    subtitle: "Coordinate the work. Verify the result.",
    description: "A portable Agent Skill for coding-assistant orchestration.",
    detail: "Breaks substantial work into bounded tasks, delegates to host-provided agents where available, manages dependencies and workspace ownership, then integrates and verifies results. It does not claim workers ran when the host exposes no delegation.",
    tags: ["AGENT SKILL", "PYTHON", "VALIDATION", "WORKFLOWS"],
    url: "https://github.com/VireonNoctis/SwarmForge", role: "OPEN-SOURCE DEVELOPER TOOLING"
  },
  {
    name: "Astra", index: "09", logo: "astra", mark: "ASTRA", type: "INTERACTIVE / SCIENCE",
    subtitle: "Explore the universe from one interactive map.",
    description: "A 3D astronomy explorer connected to public science archives.",
    detail: "A React and Three.js frontend with a Ruby/Sinatra API. It queries sources including NASA Exoplanet Archive, JPL Horizons, the Small-Body Database, and ESA Gaia, keeping live results bounded and linked to their sources.",
    tags: ["REACT", "THREE.JS", "RUBY", "NASA / JPL DATA"],
    url: "https://github.com/VireonNoctis/Universe-Explorer", role: "INTERACTIVE APPLICATION"
  },
  {
    name: "Lunar Dungeons", index: "10", logo: "lunar-dungeons", mark: "LUNAR / DUNGEONS", type: "GAME / EXPLORATION",
    subtitle: "A pixel-style world with 800 standard chambers.",
    description: "A dungeon explorer with a Three.js world and Rust service layer.",
    detail: "A Next.js interface and Three.js explorer connect to a Rust/Axum/SQLx backend for authenticated progression and server-validated combat. The documented design includes five tiers, 800 standard stages, boss encounters, and further progression.",
    tags: ["RUST", "NEXT.JS", "THREE.JS", "AXUM"],
    url: "https://github.com/VireonNoctis/waste-hub/tree/main/lunar-dungeons", role: "FEATURE DEVELOPMENT"
  },
  {
    name: "Torrent Core", index: "11", logo: "torrent-core", mark: "TORRENT CORE", type: "EXPERIMENTAL / BACKEND",
    subtitle: "Keep long-running transfers out of the request cycle.",
    description: "An experimental server-side torrent management subsystem.",
    detail: "The code includes API routes and TypeScript modules for sessions, scheduling, bandwidth policy, retry and recovery, persistence, file management, and health events. It is documented as an experimental subsystem rather than a finished public service.",
    tags: ["TYPESCRIPT", "NEXT.JS API", "NODE RUNTIME", "EXPERIMENTAL"],
    url: "https://github.com/VireonNoctis/Wasting-Time-on./tree/main/Torrent", role: "EXPERIMENTAL BACKEND"
  },
  {
    name: "ASCII Magic Art", index: "12", logo: "ascii-magic-art", mark: "ASCII MAGIC", type: "OPEN-SOURCE / CREATIVE TOOLING",
    subtitle: "Motion and structure, built from characters.",
    description: "A terminal-ready library of more than 730 animated ASCII pieces.",
    detail: "An npm CLI and browser custom element for animated scenes, diagrams, interface elements, and visual experiments across 24 categories, with alternate character rendering and prompt generation.",
    tags: ["NODE.JS", "CLI", "WEB COMPONENT", "734+ PIECES"],
    url: "https://github.com/VireonNoctis/ascii-magic-art", role: "OPEN-SOURCE PACKAGE"
  },
  {
    name: "AniList CSS", index: "13", logo: "anilist-css", mark: "ANILIST", type: "INTERFACE / THEMING",
    subtitle: "A multi-accent dark theme for AniList.",
    description: "A customizable profile skin with animated, translucent surfaces.",
    detail: "A custom CSS system with distinct accent palettes for anime, manga, and favourites, plus frosted panels, ambient overlays, and restrained motion.",
    tags: ["CSS", "ANILIST", "MULTI-ACCENT", "THEME DESIGN"],
    url: "https://github.com/VireonNoctis/Anilist-Css", role: "INTERFACE DESIGN"
  },
  {
    name: "Lunar CSS", index: "14", logo: "lunar-css", mark: "LUNAR CSS", type: "INTERFACE / THEMING",
    subtitle: "A collection of visual themes for Lunar.",
    description: "Custom CSS themes created for the Lunar Marketplace.",
    detail: "A theme collection spanning space, stained-glass, character-inspired, and other visual treatments, maintained as reusable CSS files.",
    tags: ["CSS", "THEME COLLECTION", "LUNAR MARKETPLACE"],
    url: "https://github.com/VireonNoctis/Lunar-Css", role: "INTERFACE DESIGN"
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
const listeningTrack = computed(() => {
  if (spotify.value.track && (spotify.value.configured || spotify.value.isPlaying)) return spotify.value.track;
  return live.value.track || spotify.value.track || "Listening profile";
});
const listeningArtist = computed(() => {
  if (spotify.value.artist && (spotify.value.configured || spotify.value.isPlaying)) return spotify.value.artist;
  return live.value.artist || spotify.value.artist || "Spotify and Last.fm";
});
const listeningAlbum = computed(() => spotify.value.album || lastFmAlbum.value || "Album unavailable");
const listeningStatus = computed(() => {
  if (spotify.value.configured && spotify.value.track) return spotify.value.isPlaying ? "SPOTIFY · NOW PLAYING" : "SPOTIFY · PAUSED";
  if (live.value.playing) return "LAST.FM · NOW PLAYING";
  if (live.value.track || spotify.value.track) return "RECENT TRACK";
  return spotify.value.configured ? "SPOTIFY · NO ACTIVE TRACK" : "LAST.FM / LISTENING PROFILE";
});
const listeningArtwork = computed(() => {
  if (spotify.value.albumImage) return spotify.value.albumImage;
  return live.value.trackImage || null;
});
const listeningTrackUrl = computed(() => {
  if (spotify.value.url) return spotify.value.url;
  return live.value.trackUrl || null;
});
const spotifyProgressMs = computed(() => {
  const base = Math.max(0, spotify.value.progressMs ?? 0);
  if (!spotify.value.isPlaying || !spotify.value.updatedAtMs) return base;
  const elapsed = Math.max(0, playbackClock.value - spotify.value.updatedAtMs);
  const progress = base + elapsed;
  return spotify.value.durationMs ? Math.min(progress, spotify.value.durationMs) : progress;
});
const spotifyProgressPercent = computed(() => {
  const duration = spotify.value.durationMs ?? 0;
  return duration > 0 ? Math.min(100, Math.max(0, (spotifyProgressMs.value / duration) * 100)) : 0;
});
function formatPlaybackTime(milliseconds: number | null | undefined): string {
  if (typeof milliseconds !== "number" || !Number.isFinite(milliseconds) || milliseconds <= 0) return "0:00";
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  const hours = Math.floor(minutes / 60);
  return hours > 0
    ? hours + ":" + String(minutes % 60).padStart(2, "0") + ":" + remainder
    : minutes + ":" + remainder;
}
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
function handleInternalNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const source = event.target;
  if (!(source instanceof Element)) return;
  const anchor = source.closest<HTMLAnchorElement>('a[href^="#"]');
  const href = anchor?.getAttribute("href");
  if (!href || href === "#") return;
  const destination = document.getElementById(href.slice(1));
  if (!destination) return;

  event.preventDefault();
  menuOpen.value = false;
  if (window.location.hash !== href) window.history.pushState(null, "", href);
  const moved = scrollTo(destination, -104);
  if (!moved) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    destination.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }
}

function onEscape(event: KeyboardEvent) {
  if (event.key === "Escape") {
    menuOpen.value = false;
    selectedTech.value = null;
  }
}
onMounted(() => {
  updateProgress();
  playbackClockTimer = window.setInterval(() => { playbackClock.value = Date.now(); }, 1000);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  window.addEventListener("keydown", onEscape);
});
onBeforeUnmount(() => {
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
  if (playbackClockTimer) window.clearInterval(playbackClockTimer);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", updateProgress);
  window.removeEventListener("keydown", onEscape);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <div class="intro-loader" aria-hidden="true">
      <div class="intro-loader-topline"><span>VIREON / NOCTIS</span><span>INDEPENDENT WORKS · 2026</span></div>
      <div class="intro-loader-title">
        <p class="intro-loader-kicker">A PERSONAL ARCHIVE / SELECTED SYSTEMS</p>
        <h2><span class="intro-loader-title-line">VIREON</span><span class="intro-loader-title-line intro-loader-title-outline">NOCTIS</span></h2>
      </div>
      <div class="intro-loader-bottom">
        <div class="intro-loader-status"><span>INTRO SEQUENCE</span><span>PROJECT SIGNALS / REVEAL</span></div>
        <div class="intro-loader-progress"><span id="intro-fill"></span></div>
        <div class="intro-loader-readout"><span>PORTFOLIO / 001</span><strong id="intro-count">00%</strong></div>
      </div>
    </div>
  </Teleport>
  <main id="main-content" tabindex="-1" @keydown.esc="menuOpen = false" @click.capture="handleInternalNavigation">
    <a class="skip-link" href="#profile">Skip to content</a>
    <div class="reading-progress" :style="{ transform: 'scaleX(' + scrollProgress + ')' }" aria-hidden="true"></div>

    <header class="site-header section-shell">
      <a class="wordmark" href="#top" aria-label="Vireon, home" @click="menuOpen = false">
        <img src="/brands/vireon-mark.svg" alt="" width="34" height="34" />
        <span class="wordmark-copy"><strong>VIREON</strong><small>PERSONAL PORTFOLIO</small></span>
      </a>
      <nav id="primary-navigation" :class="menuOpen ? 'navigation navigation-open' : 'navigation'" aria-label="Main navigation">
        <a v-for="item in navigation" :key="item.href" :href="item.href" @click="menuOpen = false">{{ item.label }}</a>
        <a v-tactile class="nav-contact tactile-surface" href="#contact" @click="menuOpen = false">Start a conversation <span aria-hidden="true">↗</span></a>
      </nav>
      <button v-tactile class="menu-toggle tactile-surface" type="button" :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'" aria-controls="primary-navigation" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen"><span aria-hidden="true">{{ menuOpen ? "×" : "☰" }}</span></button>
    </header>

    <section class="hero section-shell" id="top">
      <div class="hero-meta"><span>VIREON NOCTIS <i>/</i> PORTFOLIO</span><span>BUSINESS · SOFTWARE · PROPERTY</span></div>
      <div class="hero-art" aria-hidden="true">
        <NothingWebGL />
        <span class="hero-art-caption">LIGHT STUDY / 001 <i>—</i> LIVE WAVE FIELD</span>
      </div>
      <div class="hero-main">
        <div class="hero-copy">
          <p class="hero-kicker">INDEPENDENT BUILDER · EST. 2026</p>
          <h1 aria-label="Vireon Noctis"><span class="hero-title-line">VIREON</span><span class="hero-title-line hero-title-outline">NOCTIS</span></h1>
          <div class="hero-intro-row">
            <p>Building businesses, software systems, and considered digital experiences.</p>
            <div class="hero-actions">
              <a v-tactile class="action-link action-link-primary tactile-surface" href="#work"><BrailleText label="Explore selected work" /><span aria-hidden="true">↘</span></a>
              <a class="action-link action-link-secondary" href="#profile">Discover the approach</a>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-foot"><span>INDEPENDENT · DETAIL-LED · SYSTEMS-MINDED</span><span>SCROLL TO EXPLORE <i class="scroll-line" aria-hidden="true"></i></span></div>
    </section>

    <div class="marquee" aria-label="Business, software, development, and design"><div class="marquee-track" aria-hidden="true"><span v-for="n in 4" :key="n">BUSINESS <b>—</b> SOFTWARE <b>—</b> DEVELOPMENT <b>—</b> DIGITAL SYSTEMS <b>—</b></span></div></div>

    <section class="profile-section section-shell section-space" id="profile" v-reveal>
      <div class="section-bar"><span>01 / PROFILE</span><span>THREE AREAS · ONE PRACTICE</span></div>
      <div class="profile-layout">
        <h2>BUILDING<br />BEYOND <em>CODE.</em></h2>
        <div class="profile-copy">
          <p class="profile-lead">Business thinking. Technical execution. Long-term perspective.</p>
          <p>I work across business, full-stack development, and real estate — bringing ideas into practical, connected systems.</p>
          <a class="inline-link" href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer">Explore the wider work <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="role-grid">
        <article class="role-item"><span>01</span><h3>Businessman</h3><p>Business and ventures</p></article>
        <article class="role-item"><span>02</span><h3>Full-stack Developer</h3><p>Software and systems</p></article>
        <article class="role-item"><span>03</span><h3>Real Estate Developer</h3><p>Property and development</p></article>
      </div>
    </section>

    <section class="work-section section-shell section-space" id="work">
      <div class="work-layout">
        <div class="work-intro">
          <div class="section-bar"><span>02 / PROJECT SHOWCASE</span><span><AnimatedNumber :value="projects.length" /> CODE-BACKED PROJECTS</span></div>
          <h2>MADE TO<br /><em>MATTER.</em></h2>
          <p>Public codebases, tools, platforms, and creative systems with real implementations.</p>
          <a class="inline-link" href="https://github.com/VireonNoctis?tab=repositories" target="_blank" rel="noreferrer">All repositories <span aria-hidden="true">↗</span></a>
          <div class="work-live">
            <span class="work-live-label">GITHUB / LIVE</span>
            <strong><template v-if="live.repos !== undefined"><AnimatedNumber :value="live.repos" /> repositories</template><template v-else>Repository data loading</template></strong>
            <small v-if="live.followers !== undefined"><AnimatedNumber :value="live.followers" /> followers</small>
          </div>
        </div>
        <div class="project-stack">
          <details v-for="(project, index) in projects" :key="project.name" class="project-stack-card" :style="{ '--stack-top': (108 + index * 14) + 'px', zIndex: 10 + index }">
            <summary v-tactile class="project-card-shell tactile-surface">
              <div class="project-card-visual">
                <span class="project-card-index">{{ project.index }}</span>
                <div class="project-card-mark">
                  <img v-if="project.logo" :src="'/brands/' + project.logo + '.svg'" :alt="project.name + ' mark'" width="112" height="112" loading="lazy" />
                  <span v-else class="project-card-wordmark">{{ project.mark }}</span>
                </div>
                <span class="project-card-category">{{ project.type }}</span>
              </div>
              <div class="project-card-copy">
                <div class="project-card-topline"><span>PROJECT / {{ project.index }}</span><span aria-hidden="true">↗</span></div>
                <h3>{{ project.name }}</h3>
                <p class="project-card-subtitle">{{ project.subtitle }}</p>
                <p class="project-card-description">{{ project.description }}</p>
                <div class="tag-row"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
                <div class="project-card-expand"><span>Project details</span><span class="expand-symbol" aria-hidden="true">＋</span></div>
              </div>
            </summary>
            <div class="project-expanded-content">
              <p>{{ project.detail }}</p>
              <a v-tactile class="tactile-surface" :href="project.url" target="_blank" rel="noreferrer">Open project <span aria-hidden="true">↗</span></a>
              <span v-if="project.role">{{ project.role }}</span>
            </div>
          </details>
        </div>
      </div>
    </section>

    <section class="stack-section section-shell section-space" id="stack" v-reveal>
      <div class="section-bar"><span>03 / TECHNICAL STACK</span><span>TOOLS & TELEMETRY</span></div>
      <div class="stack-heading"><h2>BUILT WITH<br /><em>INTENT.</em></h2><p>The technologies behind the work — from reactive interfaces to systems programming.</p></div>
      <div class="stack-modules">
        <article v-for="module in stackModules" :key="module.name" class="stack-module">
          <div class="stack-module-head"><img :src="'/brands/tech-' + module.logo + '.svg'" :alt="module.name" width="26" height="26" loading="lazy" /><span>{{ module.kind }}</span></div>
          <h3>{{ module.name }}</h3><p>{{ module.copy }}</p>
        </article>
      </div>
      <div class="code-counted" aria-label="Code counted language explorer">
        <div class="code-counted-layout">
          <div class="code-counted-heading">
            <div class="code-counted-title">
              <span class="work-live-label">02 / CODE COUNTED</span>
              <h3>Code, counted.</h3>
              <p>Tracked source technologies and project estimates, separated by provenance.</p>
            </div>
            <div class="code-counted-totals">
              <div><strong><AnimatedNumber :value="codeStats?.totals.lines ?? 0" notation="compact" :decimals="1" /></strong><span>SCANNED LINES</span></div>
              <div><strong><AnimatedNumber :value="codeStats?.totals.repositories ?? 0" /></strong><span>REPOSITORIES</span></div>
              <div><strong><AnimatedNumber :value="languageCards.length" /></strong><span>LANGUAGE PROFILES</span></div>
            </div>
          </div>
          <div class="project-language-grid">
            <button v-for="(tech, index) in languageCards" :key="tech.name" v-tactile class="project-language-tile tactile-surface" :style="{ '--stack-top': (108 + index * 6) + 'px', zIndex: 10 + index }" type="button" :aria-label="'Open ' + tech.name + ' statistics, ' + formatted(tech.lines) + ' total lines'" @click="openTech(tech)">
              <span class="project-language-logo">
                <img v-if="tech.logo" :src="'/brands/tech-' + tech.logo + '.svg'" alt="" loading="lazy" />
                <span v-else class="project-language-generic">&lt;/&gt;</span>
              </span>
              <span class="project-language-copy"><strong>{{ tech.name }}</strong><small>{{ tech.isEstimated ? "Lunar X · ≈ " + compact(tech.characters) + " estimated characters" : tech.pendingScan ? "Framework profile · scan pending" : "Tracked repository data" }}</small></span>
              <span class="project-language-lines"><strong><AnimatedNumber :value="tech.lines" /></strong><small>LINES</small></span>
              <span class="project-language-arrow" aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
        <p class="project-language-note">{{ codeStatsStatus === "ready" ? "Snapshot generated " + new Date(codeStats!.generatedAt).toLocaleDateString() + ". Select a profile for its file, character, word, and repository breakdown." : codeStatsStatus === "loading" ? "Repository scan is being loaded." : "The repository snapshot is unavailable right now; the portfolio remains usable." }}</p>
      </div>
    </section>

    <section class="archive-section section-shell section-space" id="archive" v-reveal>
      <div class="section-bar"><span>04 / PERSONAL ARCHIVE</span><span>OUTSIDE THE BUILD</span></div>
      <div class="archive-heading"><h2>MORE THAN<br /><em>WORK.</em></h2><p>Music, media, and the interests that keep the perspective wide.</p></div>
      <div class="archive-grid">
        <article class="archive-card listening-card">
          <div class="archive-card-top"><span>LISTENING / LIVE</span><span class="archive-live-dot">●</span></div>
          <div class="listening-main">
            <div class="album-art">
              <img v-if="listeningArtwork" :src="listeningArtwork" alt="Current track artwork" loading="lazy" />
              <img v-else src="/brands/lastfm.svg" alt="Last.fm" />
            </div>
            <div class="listening-copy">
              <span>{{ listeningStatus }}</span>
              <h3 :title="listeningTrack">{{ listeningTrack }}</h3>
              <p>{{ listeningArtist }}</p>
            </div>
          </div>
          <div class="listening-metadata">
            <div class="listening-album-name">
              <span>ALBUM</span>
              <a v-if="spotify.albumUrl" :href="spotify.albumUrl" target="_blank" rel="noreferrer">{{ listeningAlbum }} ↗</a>
              <strong v-else>{{ listeningAlbum }}</strong>
            </div>
            <div v-if="spotify.albumReleaseDate"><span>RELEASED</span><strong>{{ spotify.albumReleaseDate }}</strong></div>
            <div v-if="spotify.trackNumber"><span>TRACK</span><strong>{{ String(spotify.trackNumber).padStart(2, "0") }}<template v-if="spotify.albumTotalTracks"> / {{ spotify.albumTotalTracks }}</template></strong></div>
            <div v-if="spotify.deviceName"><span>DEVICE</span><strong>{{ spotify.deviceName }}</strong></div>
          </div>
          <div class="spotify-playback-panel">
            <div class="spotify-wavefield" :class="{ 'is-playing': spotify.isPlaying }" aria-hidden="true">
              <div class="spotify-wavefield-bars">
                <i v-for="(height, index) in playbackWaveBars" :key="'base-' + index" :style="{ height: height + '%', '--wave-index': index }"></i>
              </div>
              <div class="spotify-wavefield-progress" :style="{ width: spotifyProgressPercent + '%' }">
                <div class="spotify-wavefield-bars">
                  <i v-for="(height, index) in playbackWaveBars" :key="'progress-' + index" :style="{ height: height + '%', '--wave-index': index }"></i>
                </div>
              </div>
            </div>
            <div class="spotify-playback-readout">
              <time>{{ spotify.durationMs ? formatPlaybackTime(spotifyProgressMs) : "--:--" }}</time>
              <span>{{ spotify.configured ? (spotify.isPlaying ? "PLAYING" : "PAUSED") : "LAST.FM · LIVE TRACK" }}</span>
              <time>{{ spotify.durationMs ? formatPlaybackTime(spotify.durationMs) : "--:--" }}</time>
            </div>
            <div v-if="!spotify.configured" class="spotify-connection-note">SPOTIFY PLAYBACK NOT CONNECTED · LIVE TRACK VIA LAST.FM</div>
          </div>
          <div class="archive-card-bottom listening-footer">
            <div class="lastfm-scrobbles">
              <span>LAST.FM / SCROBBLES</span>
              <strong v-if="live.scrobbles !== undefined"><AnimatedNumber :value="live.scrobbles" /></strong>
              <strong v-else>—</strong>
            </div>
            <div class="listening-links">
              <a v-if="listeningTrackUrl" :href="listeningTrackUrl" target="_blank" rel="noreferrer">Open track ↗</a>
              <a href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer">Last.fm profile ↗</a>
            </div>
          </div>
        </article>
        <article class="archive-card media-card">
          <div class="archive-card-top"><span>ANILIST / PROFILE</span><a href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer">Open profile ↗</a></div>
          <h3>Anime & manga</h3>
          <div class="media-stats">
            <div><strong><AnimatedNumber :value="live.anime ?? 0" /></strong><span>ANIME</span></div>
            <div><strong><AnimatedNumber :value="live.animeEpisodes ?? 0" /></strong><span>EPISODES</span></div>
            <div><strong><AnimatedNumber :value="live.manga ?? 0" /></strong><span>MANGA</span></div>
            <div><strong><AnimatedNumber :value="live.mangaChapters ?? 0" /></strong><span>CHAPTERS</span></div>
          </div>
          <div v-if="live.animeGenres?.length" class="genre-list">
            <div v-for="genre in live.animeGenres.slice(0, 4)" :key="genre.genre" class="genre-row"><span>{{ genre.genre }}</span><span class="genre-bar"><i :style="{ width: genreWidth(live.animeGenres, genre.count) + '%' }"></i></span></div>
          </div>
        </article>
      </div>
      <div class="social-area">
        <div class="social-area-heading"><span>ELSEWHERE</span><span>PUBLIC PROFILES</span></div>
        <div class="social-list">
          <a v-for="social in socials" :key="social.name" v-tactile class="social-row tactile-surface" :href="social.href" target="_blank" rel="noreferrer">
            <img :src="'/brands/' + social.logo + '.svg'" :alt="social.name" width="22" height="22" loading="lazy" />
            <span><strong>{{ social.name }}</strong><small>{{ social.handle }}</small></span><span class="social-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>

    <section class="contact-section section-shell section-space" id="contact" v-reveal>
      <div class="section-bar"><span>05 / CONTACT</span><span>OPEN TO THE RIGHT THINGS</span></div>
      <div class="contact-main">
        <p>HAVE A GOOD IDEA?</p><h2>LET'S MAKE<br /><em>IT REAL.</em></h2>
        <div class="contact-bottom"><span>For projects, partnerships, and conversations.</span><a v-tactile class="contact-link tactile-surface" href="https://t.me/Imperialism12" target="_blank" rel="noreferrer"><BrailleText label="Get in touch" /><span aria-hidden="true">↗</span></a></div>
      </div>
    </section>

    <footer class="site-footer section-shell">
      <a class="footer-mark" href="#top">VIREON<span> / </span>NOCTIS</a>
      <span>© {{ year }} · ALL RIGHTS RESERVED</span><a class="footer-top" href="#top">BACK TO TOP ↑</a>
    </footer>

    <Teleport to="body">
      <Transition name="tech-dialog">
        <div v-if="selectedTech" class="tech-modal-backdrop" role="presentation" @click.self="closeTech">
          <section class="tech-modal" role="dialog" aria-modal="true" :aria-label="selectedTech.name + ' details'">
            <header class="tech-modal-header"><div><span class="work-live-label">{{ selectedTech.kind }}</span><h2>{{ selectedTech.name }}</h2></div><button v-tactile type="button" class="tech-modal-close tactile-surface" aria-label="Close technology details" @click="closeTech">×</button></header>
            <p v-if="selectedTech.learningNote" class="tech-modal-note">{{ selectedTech.learningNote }} <strong>{{ selectedTech.learningStatus }}</strong></p>
            <div class="tech-modal-grid">
              <div><span>TOTAL LINES</span><strong><AnimatedNumber :value="selectedTotalLines" /></strong></div>
              <div><span>CHARACTERS</span><strong><AnimatedNumber :value="selectedTotalCharacters" /></strong></div>
              <div><span>SCANNED FILES</span><strong><AnimatedNumber :value="selectedScannedLanguage?.files ?? 0" /></strong></div>
              <div><span>WORDS</span><strong><AnimatedNumber :value="selectedScannedLanguage?.words ?? 0" /></strong></div>
            </div>
            <section v-if="selectedEstimateAreas.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><span>SUPPLIED PROJECT ESTIMATES</span><strong>{{ selectedEstimateAreas.length }} areas</strong></div>
              <div v-for="entry in selectedEstimateAreas" :key="entry.project.id + '-' + entry.area.name" class="tech-modal-row"><span><strong>{{ entry.project.name }}</strong><small>{{ entry.area.name }} · {{ entry.project.classification }}</small></span><span><strong>{{ formatted(entry.area.lines) }} lines</strong><small>{{ estimateCharacters(entry.area) === null ? "Character estimate unavailable" : "≈ " + formatted(estimateCharacters(entry.area) || 0) + " characters" }}</small></span></div>
            </section>
            <section v-if="selectedRepositories.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><span>REPOSITORY SCAN</span><strong>{{ selectedRepositories.length }} repositories</strong></div>
              <a v-for="entry in selectedRepositories" :key="entry.project.fullName" class="tech-modal-row" :href="entry.project.url" target="_blank" rel="noreferrer"><span><strong>{{ entry.project.name }}</strong><small>{{ entry.project.role || (entry.project.relationship === "contributor" ? "Major contributor" : "Owned · " + entry.project.branch) }}</small></span><span><strong>{{ formatted(entry.language.lines) }}</strong><small>lines · {{ entry.language.files }} files</small></span></a>
            </section>
            <section v-if="selectedFrameworkRepositories.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><span>FRAMEWORK DETECTION</span><strong>{{ selectedFrameworkRepositories.length }} repositories</strong></div>
              <a v-for="project in selectedFrameworkRepositories" :key="project.fullName" class="tech-modal-row" :href="project.url" target="_blank" rel="noreferrer"><span><strong>{{ project.name }}</strong><small>{{ project.relationship === "contributor" ? project.role || "Contributor project" : "Owned project" }}</small></span><span><strong>{{ (project.frameworks || []).filter((item) => item.toLowerCase() === selectedTech?.name.toLowerCase()).length }}</strong><small>framework matches</small></span></a>
            </section>
            <p class="tech-modal-footnote">Scanned repository totals and supplied project estimates are shown separately.</p>
          </section>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>
