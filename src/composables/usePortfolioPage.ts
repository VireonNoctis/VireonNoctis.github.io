import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useCinematicMotion } from "./useCinematicMotion";
import { usePortfolioData } from "./usePortfolioData";
import type { AniListFavoriteCategory, CodeStatsLanguage, CodeStatsProjectEstimate, GenreItem } from "../types";

export function usePortfolioPage() {
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
  
  interface WebnovelCard {
    id: string;
    title: string;
    image: string;
    source: string;
    href: string;
  }
  const webnovels: WebnovelCard[] = [
    { id: "orv", title: "Omniscient Reader's Viewpoint", image: "https://cdn.novelupdates.com/images/2020/12/Omniscient-Readers-Viewpoint.png", source: "NOVEL UPDATES", href: "https://www.novelupdates.com/series/omniscient-readers-viewpoint/" },
    { id: "reverend", title: "Reverend Insanity", image: "https://cdn.novelupdates.com/images/2025/06/Reverend-Insanity.jpg", source: "NOVEL UPDATES", href: "https://www.novelupdates.com/series/reverend-insanity/" },
    { id: "lotm", title: "Lord of the Mysteries", image: "https://cdn.novelupdates.com/images/2018/11/Lord-of-the-Mysteries.jpeg", source: "NOVEL UPDATES", href: "https://www.novelupdates.com/series/lord-of-the-mysteries/" },
    { id: "reincarnator", title: "Reincarnator", image: "https://cdn.novelupdates.com/images/2016/10/xxlarge-2.jpg", source: "NOVEL UPDATES", href: "https://www.novelupdates.com/series/reincarnator/" },
    { id: "shadow-slave", title: "Shadow Slave", image: "https://book-pic.webnovel.com/bookcover/22196546206090805?imageMogr2/thumbnail/600x&imageId=1705256017438", source: "WEBNOVEL · OFFICIAL", href: "https://www.webnovel.com/book/22196546206090805" }
  ];
  type FavoriteCollectionCategory = AniListFavoriteCategory | "webnovels";
  const selectedFavoriteCategory = ref<FavoriteCollectionCategory>("anime");
  const favoriteCategories: { key: FavoriteCollectionCategory; label: string }[] = [
    { key: "anime", label: "ANIME" },
    { key: "manga", label: "MANGA" },
    { key: "characters", label: "CHARACTERS" },
    { key: "staff", label: "STAFF" },
    { key: "studios", label: "STUDIOS" },
    { key: "webnovels", label: "WEBNOVELS" }
  ];
  const favoriteItems = computed(() => selectedFavoriteCategory.value === "webnovels"
    ? webnovels.map((novel) => ({ id: novel.id, title: novel.title, image: novel.image, url: novel.href }))
    : live.value.anilistFavorites?.[selectedFavoriteCategory.value] ?? []);
  const hasFavoriteCollection = computed(() =>
    webnovels.length > 0 || Object.values(live.value.anilistFavorites ?? {}).some((items) => items.length > 0)
  );
  const genreListElement = ref<HTMLElement | null>(null);
  const genreBarsVisible = ref(false);
  let genreObserver: IntersectionObserver | null = null;
  
  watch(genreListElement, (node) => {
    genreObserver?.disconnect();
    genreObserver = null;
    genreBarsVisible.value = false;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      genreBarsVisible.value = true;
      return;
    }
    genreObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        genreBarsVisible.value = true;
        genreObserver?.disconnect();
        genreObserver = null;
      }
    }, { threshold: 0.3, rootMargin: "0px 0px -8% 0px" });
    genreObserver.observe(node);
  }, { flush: "post" });
  
  const selectedTech = ref<TechCard | null>(null);
  const techGlassOpening = ref(false);
  let techGlassTimer = 0;
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
  const techIconFlightActive = ref(false);
  let techIconFlight: HTMLImageElement | null = null;
  let techIconAnimation: Animation | null = null;
  
  
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
      url: "https://github.com/Kyerstorm/Lemegeton", role: "CO-OWNER / MAJOR CONTRIBUTOR"
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
    "Vue.js": "vuedotjs", Vue: "vuedotjs", Lua: "lua",
    Markdown: "markdown", JSON: "json", SQL: "postgresql", "C++": "cplusplus",
    "Plain text": "plaintext", SVG: "svg", XML: "xml", Swift: "swift",
    "Terraform (HCL)": "terraform", TOML: "terminal", Gradle: "terminal",
    EditorConfig: "git", Java: "openjdk", Properties: "terminal",
    "NPM config": "javascript"
  };
  const formatLanguages = new Set([
    "batch", "markdown", "json", "plain text", "plaintext", "yaml", "toml", "environment config",
    "shell", "svg", "git config", "config", "xml", "dockerfile", "docker config",
    "go module", "properties"
  ]);
  const logoAliases: Record<string, string> = {
    "plain text": "plaintext",
    plaintext: "plaintext",
    terraform: "terraform",
    "terraform (hcl)": "terraform"
  };
  function technologyLogo(name: string): string {
    const normalized = name.trim().toLowerCase();
    return logoAliases[normalized] ?? logoByName[name.trim()] ?? logoByName[name.trim().replace(/^./, (letter) => letter.toUpperCase())] ?? "";
  }
  const languageColors: Record<string, string> = {
    python: "#3776AB", batch: "#6A9955", kotlin: "#7F52FF", css: "#663399",
    typescript: "#3178C6", rust: "#DEA584", r: "#276DC3", go: "#00ADD8",
    javascript: "#F7DF1E", ruby: "#CC342D", yaml: "#CB171E", svelte: "#FF3E00",
    html: "#E34F26", shell: "#4EAA25", "environment config": "#9CA3AF",
    "git config": "#F05032", config: "#9CA3AF", dockerfile: "#2496ED",
    "docker config": "#2496ED", "go module": "#00ADD8", "next.js": "#EDEDED",
    react: "#61DAFB", webgl: "#990000", "three.js": "#FFFFFF", "vue.js": "#42B883",
    vue: "#42B883", lua: "#000080", markdown: "#5190CB", json: "#F5A623",
    sql: "#4169E1", "c++": "#00599C", "plain text": "#A1A1AA", plaintext: "#A1A1AA",
    svg: "#FFB13B", xml: "#F16529", swift: "#F05138",
    "terraform (hcl)": "#7B42BC", terraform: "#7B42BC", toml: "#9C4121",
    gradle: "#02303A", editorconfig: "#B4B4B4", java: "#ED8B00", properties: "#A1A1AA"
  };
  function languageAccent(name: string): string {
    return languageColors[name.trim().toLowerCase()] ?? "#A1A1AA";
  }
  function isFormatLanguage(name: string): boolean {
    return formatLanguages.has(name.trim().toLowerCase());
  }
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
        logo: technologyLogo(language.language),
        kind: language.language === "Next.js" ? "FRAMEWORK" :
          isFormatLanguage(language.language) ? "FORMAT" : "LANGUAGE"
      });
    }
    for (const project of estimates.value) {
      for (const area of project.areas) {
        const key = area.stack.trim().toLowerCase();
        if (!items.has(key)) {
          items.set(key, {
            name: area.stack.trim(),
            logo: technologyLogo(area.stack.trim()),
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
  const lastFmArtistPlaycount = computed(() => {
    const artistName = (live.value.artist ?? "").trim().toLocaleLowerCase();
    const profileCount = live.value.topArtists?.find((item) =>
      item.name.trim().toLocaleLowerCase() === artistName
    )?.playcount;
    return live.value.artistPlaycount ?? profileCount;
  });
  const listeningAlbum = computed(() => spotify.value.album || lastFmAlbum.value || "Album unavailable");
  const listeningStatsMatch = computed(() => {
    if (!spotify.value.configured || !spotify.value.track) return true;
    const sameTrack = spotify.value.track.trim().toLocaleLowerCase() === (live.value.track ?? "").trim().toLocaleLowerCase();
    const sameArtist = !spotify.value.artist ||
      spotify.value.artist.trim().toLocaleLowerCase() === (live.value.artist ?? "").trim().toLocaleLowerCase();
    return sameTrack && sameArtist;
  });
  const listeningStatus = computed(() => {
    if (spotify.value.configured && spotify.value.track) return spotify.value.isPlaying ? "SPOTIFY / NOW PLAYING" : "SPOTIFY / PAUSED";
    if (live.value.playing) return "LAST.FM / NOW PLAYING";
    if (live.value.track || spotify.value.track) return "RECENT TRACK";
    return spotify.value.configured ? "SPOTIFY / NO ACTIVE TRACK" : "LAST.FM / LISTENING PROFILE";
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
  function handleArtworkError(event: Event) {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallback === "true") return;
    image.dataset.fallback = "true";
    image.src = "/brands/lastfm.svg";
  }
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
  function clearTechIconFlight() {
    techIconAnimation?.cancel();
    techIconAnimation = null;
    techIconFlight?.remove();
    techIconFlight = null;
    techIconFlightActive.value = false;
  }
  function startTechGlassOpening() {
    if (techGlassTimer) window.clearTimeout(techGlassTimer);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    techGlassOpening.value = !reducedMotion;
    if (!reducedMotion) {
      techGlassTimer = window.setTimeout(() => {
        techGlassOpening.value = false;
        techGlassTimer = 0;
      }, 1680);
    }
  }
  async function openTech(tech: TechCard, event?: MouseEvent) {
    clearTechIconFlight();
    selectedTech.value = tech;
    startTechGlassOpening();
    const trigger = event?.currentTarget;
    const sourceImage = trigger instanceof HTMLElement ? trigger.querySelector<HTMLImageElement>(".project-language-logo img") : null;
    if (!sourceImage?.currentSrc || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  
    const sourceRect = sourceImage.getBoundingClientRect();
    techIconFlightActive.value = true;
    await nextTick();
    await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()));
  
    const destination = document.querySelector<HTMLImageElement>(".tech-modal-logo img");
    if (!destination) { techIconFlightActive.value = false; return; }
    const targetRect = destination.getBoundingClientRect();
    if (!targetRect.width || !targetRect.height) { techIconFlightActive.value = false; return; }
  
    const clone = sourceImage.cloneNode(true) as HTMLImageElement;
    clone.className = "tech-logo-flight";
    clone.src = sourceImage.currentSrc;
    Object.assign(clone.style, {
      left: sourceRect.left + "px",
      top: sourceRect.top + "px",
      width: sourceRect.width + "px",
      height: sourceRect.height + "px"
    });
    document.body.append(clone);
    techIconFlight = clone;
  
    const dx = targetRect.left - sourceRect.left;
    const dy = targetRect.top - sourceRect.top;
    const scaleX = targetRect.width / sourceRect.width;
    const scaleY = targetRect.height / sourceRect.height;
    techIconAnimation = clone.animate([
      { transform:"translate(0,0) scale(1,1)" },
      { transform:"translate(" + dx + "px," + dy + "px) scale(" + scaleX + "," + scaleY + ")" }
    ], { duration:820, easing:"cubic-bezier(.16,1,.3,1)", fill:"forwards" });
  
    techIconAnimation.onfinish = async () => {
      if (techIconFlight !== clone) return;
      destination.style.transition = "none";
      techIconFlightActive.value = false;
      await nextTick();
      if (techIconFlight !== clone) return;
      clone.remove();
      destination.style.removeProperty("transition");
      techIconFlight = null;
      techIconAnimation = null;
    };
  }
  function closeTech() {
    clearTechIconFlight();
    if (techGlassTimer) window.clearTimeout(techGlassTimer);
    techGlassTimer = 0;
    techGlassOpening.value = false;
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
    if (window.location.hash !== href) window.history.pushState(null, "", href);
    const moved = scrollTo(destination, -24);
    if (!moved) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      destination.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  }
  
  function onEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeTech();
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
    clearTechIconFlight();
    if (techGlassTimer) window.clearTimeout(techGlassTimer);
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    if (playbackClockTimer) window.clearInterval(playbackClockTimer);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", updateProgress);
    window.removeEventListener("keydown", onEscape);
    genreObserver?.disconnect();
    genreObserver = null;
    document.body.style.overflow = "";
  });
  

  function setGenreListElement(node: unknown) {
    genreListElement.value = node instanceof HTMLElement ? node : null;
  }
  function selectFavoriteCategory(category: FavoriteCollectionCategory) {
    selectedFavoriteCategory.value = category;
  }
  return { codeStats, codeStatsStatus, live, spotify, lastFmAlbum, scrollTo, webnovels, selectedFavoriteCategory, favoriteCategories, favoriteItems, hasFavoriteCollection, genreListElement, genreBarsVisible, genreObserver, selectedTech, techGlassOpening, techGlassTimer, scrollProgress, year, scrollFrame, playbackClock, playbackClockTimer, playbackWaveBars, techIconFlightActive, techIconFlight, techIconAnimation, socials, projects, stackModules, learningItems, logoByName, formatLanguages, logoAliases, languageColors, charactersPerLine, sourceLanguages, estimates, nextJsRepositories, nextJsScannedLanguage, languages, techOptions, languageCards, selectedScannedLanguage, selectedEstimateAreas, selectedManualLines, selectedManualCharacters, selectedTotalLines, selectedTotalCharacters, selectedRepositories, selectedFrameworkRepositories, listeningTrack, listeningArtist, lastFmArtistPlaycount, listeningAlbum, listeningStatsMatch, listeningStatus, listeningArtwork, listeningTrackUrl, spotifyProgressMs, spotifyProgressPercent, technologyLogo, languageAccent, isFormatLanguage, estimateCharacters, compact, formatted, handleArtworkError, formatPlaybackTime, genreWidth, clearTechIconFlight, startTechGlassOpening, closeTech, updateProgress, onScroll, handleInternalNavigation, onEscape, setGenreListElement, selectFavoriteCategory, openTech };
}
