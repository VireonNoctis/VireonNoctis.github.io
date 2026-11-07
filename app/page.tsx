"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { createPortal } from "react-dom";
import { ArrowDownRight, ArrowUpRight, AudioLines, BookOpen, Code2, Github, Menu, Orbit, X } from "lucide-react";
import { AnimatedNumber, BrailleText, NothingSystemStrip, ThemeHeroArtwork } from "./theme-system";

type Repo = { name: string; description: string | null; html_url: string; stargazers_count: number; language: string | null; fork: boolean; archived?: boolean; updated_at: string };
type RankedItem = { name: string; count?: number; playcount?: number; url?: string; artist?: string };
type GenreItem = { genre: string; count: number };
type Live = { repos?: number; followers?: number; anime?: number; manga?: number; scrobbles?: number; track?: string; artist?: string; playing?: boolean; animeEpisodes?: number; animeMinutes?: number; animeScore?: number; mangaChapters?: number; mangaVolumes?: number; mangaScore?: number; animeGenres?: GenreItem[]; mangaGenres?: GenreItem[]; topArtists?: RankedItem[]; topTracks?: RankedItem[] };
type CodeStatsLanguage = {
  language: string;
  files: number;
  lines: number;
  nonblankLines: number;
  characters: number;
  words: number;
};
type CodeStatsProjectEstimate = {
  id: string;
  name: string;
  url: string;
  classification: string;
  areas: { name: string; stack: string; lines: number; characters?: number; estimatedCharactersPerLine?: number }[];
};
type CodeStatsRepository = {
  name: string;
  fullName: string;
  url: string;
  branch: string;
  relationship: "owned" | "contributor";
  role?: string;
  contributionNote?: string;
  frameworks?: string[];
  files: number;
  lines: number;
  characters: number;
  words: number;
  languages: CodeStatsLanguage[];
};
type CodeStats = {
  generatedAt: string;
  scope: string;
  totals: {
    repositories: number;
    ownedRepositories: number;
    contributorRepositories: number;
    failedRepositories: number;
    files: number;
    lines: number;
    nonblankLines: number;
    characters: number;
    words: number;
    stars: number;
    forks: number;
  };
  repositories: CodeStatsRepository[];
  languages?: CodeStatsLanguage[];
  manualProjectEstimates?: CodeStatsProjectEstimate[];
};
type SpotifyNowPlaying = { configured: boolean; isPlaying: boolean; track: string | null; artist: string | null; album: string | null; albumImage: string | null; url: string | null };
// Fill this placeholder with the Lunar X API token when ready. Do not commit a real secret to a public repository.
// Keep credentials as placeholders here; this project is exported as a static GitHub Pages site, so real secrets must not be committed or shipped to browsers.
const LUNAR_X_API_TOKEN = "YOUR_LUNAR_X_API_TOKEN_HERE";
const LUNAR_X_BYPASS_TOKEN = "YOUR_LUNAR_X_BYPASS_TOKEN_HERE";

const socials = [
  { name: "GitHub", logo: "github", handle: "@VireonNoctis", href: "https://github.com/VireonNoctis" },
  { name: "AniList", logo: "anilist", handle: "Vireon", href: "https://anilist.co/user/Vireon" },
  { name: "Last.fm", logo: "lastfm", handle: "reasfeetadmirer", href: "https://last.fm/user/reasfeetadmirer" },
  { name: "Spotify", logo: "spotify", handle: "Vireon", href: "https://open.spotify.com/user/313455ps4aa6ouotajxcn34mwh4a" },
  { name: "Telegram", logo: "telegram", handle: "@Imperialism12", href: "https://t.me/Imperialism12" },
  { name: "Discord", logo: "discord", handle: "Find me there", href: "https://discord.com/users/1419744000977403994" },
];
const rise = { hidden: { opacity: 0, y: 32, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: "easeOut" } } };
const sequence = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } } };
const techLogosByName: Record<string, string> = {
  Python: "python", Batch: "windowsterminal", Kotlin: "kotlin", CSS: "css3",
  TypeScript: "typescript", Rust: "rust", R: "r", Go: "go",
  JavaScript: "javascript", Ruby: "ruby", YAML: "yaml", Svelte: "svelte",
  HTML: "html5", Shell: "terminal", "Environment config": "terminal",
  "Git config": "git", Config: "terminal", Dockerfile: "docker", "Docker config": "docker",
  "Go module": "go", "Next.js": "nextdotjs", React: "react", WebGL: "webgl", "Three.js": "threejs",
};
const formatLanguageNames = new Set(["Batch", "Markdown", "JSON", "Plain text", "YAML", "TOML", "Environment config", "Shell", "SVG", "Git config", "Config", "XML", "Dockerfile", "Docker config", "Go module", "Properties"]);
const LUNAR_X_CHARACTERS_PER_LINE: Record<string, number> = { Rust: 60, "Next.js": 90, React: 90, Python: 48, WebGL: 60, "Three.js": 60 };
function estimateProjectCharacters(area: { stack: string; lines: number; characters?: number; estimatedCharactersPerLine?: number }): number | null {
  if (typeof area.characters === "number" && Number.isFinite(area.characters) && area.characters >= 0) {
    return Math.round(area.characters);
  }
  const rate = typeof area.estimatedCharactersPerLine === "number" && Number.isFinite(area.estimatedCharactersPerLine)
    ? area.estimatedCharactersPerLine
    : LUNAR_X_CHARACTERS_PER_LINE[area.stack.trim()];
  return typeof rate === "number" && Number.isFinite(rate) && rate >= 0
    ? Math.round(area.lines * rate)
    : null;
}
function formatCompactEstimate(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="eyebrow"><i />{children}</span>; }
function IndexLabel({ n, label }: { n: string; label: string }) { return <div className="index-label"><span>{n}</span><span>{label}</span></div>; }

export default function Home() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [menu, setMenu] = useState(false);
  const [selectedTech, setSelectedTech] = useState<{ name: string; logo: string; kind: "LANGUAGE" | "FRAMEWORK" | "LIBRARY" | "GRAPHICS API" | "RUNTIME" | "FORMAT" | "WORKFLOW" | "LEARNING"; learningStatus?: "IN USE" | "PLANNED"; learningNote?: string } | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [codeStats, setCodeStats] = useState<CodeStats | null>(null);
  const [codeStatsStatus, setCodeStatsStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [live, setLive] = useState<Live>({});
  const [spotify, setSpotify] = useState<SpotifyNowPlaying>({ configured: false, isPlaying: false, track: null, artist: null, album: null, albumImage: null, url: null });
  const [year, setYear] = useState("2026");
  useEffect(() => {
    setYear(String(new Date().getFullYear()));
    setPortalReady(true);
    const controller = new AbortController();
    async function loadCodeStats() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/VireonNoctis/VireonNoctis/main/code-stats.json?ts=" + Date.now(),
          { cache: "no-store", signal: controller.signal },
        );
        if (response.ok) {
          const payload: unknown = await response.json();
          if (payload && typeof payload === "object") {
            const candidate = payload as Partial<CodeStats>;
            const totals = candidate.totals;
            const validKeys: Array<keyof CodeStats["totals"]> = [
              "repositories", "ownedRepositories", "contributorRepositories", "failedRepositories",
              "files", "lines", "nonblankLines", "characters", "words", "stars", "forks",
            ];
            const valid = typeof candidate.generatedAt === "string" &&
              Boolean(totals) &&
              validKeys.every((key) => Number.isFinite(totals?.[key])) &&
              Array.isArray(candidate.languages) &&
              Array.isArray(candidate.manualProjectEstimates);
            if (valid) {
              setCodeStats(candidate as CodeStats);
              setCodeStatsStatus("ready");
              return;
            }
          }
        }
      } catch {
        // Metrics are progressive enhancement; they never block the rest of the page.
      }
      if (!controller.signal.aborted) setCodeStatsStatus("unavailable");
    }
    async function loadSpotify() {
      try {
        const response = await fetch("/spotify-now-playing.json?ts=" + Date.now(), { cache: "no-store", signal: controller.signal });
        if (response.ok) {
          const data: Partial<SpotifyNowPlaying> = await response.json();
          setSpotify({
            configured: data.configured === true,
            isPlaying: data.isPlaying === true,
            track: typeof data.track === "string" ? data.track : null,
            artist: typeof data.artist === "string" ? data.artist : null,
            album: typeof data.album === "string" ? data.album : null,
            albumImage: typeof data.albumImage === "string" ? data.albumImage : null,
            url: typeof data.url === "string" ? data.url : null,
          });
        }
      } catch { /* Spotify playback is a progressive enhancement. */ }
    }
    async function load() {
      try {
        const u = await fetch("https://api.github.com/users/VireonNoctis", { signal: controller.signal });
        if (u.ok) { const d = await u.json(); setLive(v => ({ ...v, followers: d.followers, repos: d.public_repos })); }
        const r = await fetch("https://api.github.com/users/VireonNoctis/repos?type=owner&sort=updated&per_page=100", { signal: controller.signal });
        if (r.ok) {
          const payload: unknown = await r.json();
          if (Array.isArray(payload)) {
            const all = payload as Repo[];
            const latest = all
              .filter(repo => typeof repo.name === "string" && typeof repo.html_url === "string" && !repo.fork && !repo.archived)
              .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
              .slice(0, 8);
            setRepos(latest);
          }
        }
      } catch { /* Public widgets must never block the site. */ }
      try {
        const a = await fetch("https://graphql.anilist.co", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({query:'query { User(name: "Vireon") { statistics { anime { count episodesWatched minutesWatched meanScore genres(limit: 5, sort: COUNT_DESC) { genre count } } manga { count chaptersRead volumesRead meanScore genres(limit: 5, sort: COUNT_DESC) { genre count } } } } }'}), signal:controller.signal });
        if (a.ok) { const d = await a.json(); const s = d?.data?.User?.statistics; if (s) setLive(v => ({...v, anime:s.anime.count, manga:s.manga.count, animeEpisodes:s.anime.episodesWatched, animeMinutes:s.anime.minutesWatched, animeScore:s.anime.meanScore, mangaChapters:s.manga.chaptersRead, mangaVolumes:s.manga.volumesRead, mangaScore:s.manga.meanScore, animeGenres:s.anime.genres, mangaGenres:s.manga.genres})); }
      } catch { /* AniList is progressive enhancement. */ }
      try {
        const q = new URLSearchParams({method:"user.getrecenttracks",user:"reasfeetadmirer",api_key:"8c06a8eea595aa5e4b748ca235fd9dd8",format:"json",limit:"1"});
        const f = await fetch("https://ws.audioscrobbler.com/2.0/?"+q, {signal:controller.signal});
        if (f.ok) { const d=await f.json(); const t=d?.recenttracks?.track?.[0]; if(t) setLive(v=>({...v,track:t.name,artist:t.artist?.["#text"],playing:t["@attr"]?.nowplaying==="true"})); }
        const q2 = new URLSearchParams({method:"user.getinfo",user:"reasfeetadmirer",api_key:"8c06a8eea595aa5e4b748ca235fd9dd8",format:"json"});
        const f2 = await fetch("https://ws.audioscrobbler.com/2.0/?"+q2,{signal:controller.signal});
        if(f2.ok){const d=await f2.json();if(d?.user)setLive(v=>({...v,scrobbles:Number(d.user.playcount)}));}
        const artistQuery = new URLSearchParams({method:"user.gettopartists",user:"reasfeetadmirer",api_key:"8c06a8eea595aa5e4b748ca235fd9dd8",format:"json",limit:"5",period:"overall"});
        const trackQuery = new URLSearchParams({method:"user.gettoptracks",user:"reasfeetadmirer",api_key:"8c06a8eea595aa5e4b748ca235fd9dd8",format:"json",limit:"5",period:"overall"});
        const [artistsResponse, tracksResponse] = await Promise.all([fetch("https://ws.audioscrobbler.com/2.0/?"+artistQuery,{signal:controller.signal}),fetch("https://ws.audioscrobbler.com/2.0/?"+trackQuery,{signal:controller.signal})]);
        if(artistsResponse.ok){const d=await artistsResponse.json();const items=d?.topartists?.artist;if(Array.isArray(items))setLive(v=>({...v,topArtists:items.map((x:any)=>({name:x.name,playcount:Number(x.playcount),url:x.url}))}));}
        if(tracksResponse.ok){const d=await tracksResponse.json();const items=d?.toptracks?.track;if(Array.isArray(items))setLive(v=>({...v,topTracks:items.map((x:any)=>({name:x.name,artist:x.artist?.name,playcount:Number(x.playcount),url:x.url}))}));}
      } catch { /* Last.fm is non-blocking. */ }
    }
    void load();
    void loadCodeStats();
    void loadSpotify();
    const spotifyRefresh = window.setInterval(() => { void loadSpotify(); }, 60_000);
    return () => { controller.abort(); window.clearInterval(spotifyRefresh); };
  }, []);
  useEffect(() => {
    if (!selectedTech) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedTech(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedTech]);
  const activeTheme = "nothing" as const;
  const themeCopy = {
    kicker: "VIREON / NODE 001", lineOne: "MAKE THE", lineTwo: "SIGNAL", emphasis: "MATTER.",
    description: "Projects. Systems. Signal.",
    nav: [["Home","#top"],["Work","#work"],["Stack","#stack"],["Archive","#archive"]],
    heroMeta: "NODE 001 / PUBLIC INTERFACE", coordinatesTop: "SYSTEM ONLINE", coordinatesBottom: "PUBLIC",
    brandIndex:"VN / NODE 001",brandLive:"SIGNAL DETECTED",brandOverline:"VIREON",brandEdition:"BUILD 001",
    brandTitle:"Signal Architect",brandCaption:"INPUT / PROCESS / DEPLOY",brandBottom:"SYSTEMS / STORIES / SOUND",brandEnd:"NODE—001",brandSide:"PUBLIC SIGNAL",
    marquee:["SYSTEMS","SIGNAL","ITERATION","DEPLOYMENT"],
    manifestoIndex:"01 / CORE",manifestoLabel:"PRINCIPLES",manifestoEyebrow:"CORE",manifestoTop:"BUILD FOR THE",manifestoBottom:"REAL WORLD.",
    manifestoLead:"Build. Refine. Repeat.",manifestoBody:"Business, software, and creative work.",
    manifestoLink:"INSPECT SOURCE",manifestoAsideTitle:"OBSERVE / TEST / SHIP",manifestoAsideText:"No noise. Just progress.",
    workIndex:"02 / WORK",workLabel:"PROJECTS",workEyebrow:"PROJECT REGISTRY",workTop:"BUILT TO",workBottom:"MOVE.",
    workDescription:"Software. Community. Experiments.",
    liveLabel:"GITHUB / LIVE",repoUnit:"repositories",followersUnit:"followers",repoFallback:"Loading repository data",repoCta:"VIEW REPOSITORIES",
    footprintLabel:"CODE TELEMETRY",contributorsLabel:"OWNED / CONTRIBUTED",footprintScope:"Repository totals. Not personal attribution.",
    metricLabels:["CHARACTERS","LINES","WORDS","FILES","REPOSITORIES","STARS / FORKS"],
    metricNotes:["Line breaks excluded","Non-empty lines","Source and documentation","Tracked text files","Owned and contributed","Across scanned repositories"],
    stackIndex:"03 / STACK",stackLabel:"TOOLCHAIN",stackEyebrow:"WEB SYSTEMS",stackTop:"BUILT WITH",stackBottom:"INTENT.",
    stackDescription:"The tools behind this site.",stackSubheading:"Toolchain",
    stackBody:"Next.js, React, TypeScript, WebGL, and Rust tooling.",
    stackFootnoteTitle:"STACK",stackFootnoteBody:"Next.js · React · TypeScript · WebGL2 · Rust.",
    learningIndex:"04 / NEXT",learningLabel:"LEARNING",learningEyebrow:"NEXT UP",learningTop:"ALWAYS",learningBottom:"BUILDING.",
    learningDescription:"Open a tile.",
    interludeTop:"LESS TALK.",interludeBottom:"MORE MOTION.",interludeCredit:"BUILD / REFINE / REPEAT",
    archiveIndex:"05 / ARCHIVE",archiveLabel:"LIVE DATA",archiveEyebrow:"CURRENT SIGNALS",archiveTop:"THE",archiveBottom:"ARCHIVE.",
    archiveDescription:"Anime. Manga. Music.",
    contactIndex:"06 / CONTACT",contactLabel:"OPEN PORT",contactEyebrow:"CHANNEL READY",contactTop:"HAVE A",contactBottom:"USEFUL SIGNAL?",
    contactCopy:"Projects. Ideas. Collaboration.",contactCta:"OPEN PORT"
  };
  const sourceLanguages = codeStats?.languages ?? [];
  const estimates = codeStats?.manualProjectEstimates ?? [];
  const nextJsRepositories = codeStats?.repositories.filter((project) =>
    (project.frameworks ?? []).some((framework) => framework.toLowerCase() === "next.js")) ?? [];
  const nextJsScannedLanguage = nextJsRepositories.reduce<CodeStatsLanguage>((total, project) => {
    const typescript = project.languages.find((language) => language.language.toLowerCase() === "typescript");
    if (typescript) {
      total.files += typescript.files;
      total.lines += typescript.lines;
      total.nonblankLines += typescript.nonblankLines;
      total.characters += typescript.characters;
      total.words += typescript.words;
    }
    return total;
  }, { language: "Next.js", files: 0, lines: 0, nonblankLines: 0, characters: 0, words: 0 });
  const sourceTypeScript = sourceLanguages.find((language) => language.language.toLowerCase() === "typescript");
  const remainingTypeScript = sourceTypeScript ? {
    ...sourceTypeScript,
    files: Math.max(0, sourceTypeScript.files - nextJsScannedLanguage.files),
    lines: Math.max(0, sourceTypeScript.lines - nextJsScannedLanguage.lines),
    nonblankLines: Math.max(0, sourceTypeScript.nonblankLines - nextJsScannedLanguage.nonblankLines),
    characters: Math.max(0, sourceTypeScript.characters - nextJsScannedLanguage.characters),
    words: Math.max(0, sourceTypeScript.words - nextJsScannedLanguage.words),
  } : undefined;
  // TypeScript files inside detected Next.js repositories belong to the Next.js profile,
  // and are removed from the remaining TypeScript total to prevent duplicate counting.
  const languages = sourceLanguages.flatMap((language) => {
    if (language.language.toLowerCase() !== "typescript") return [language];
    return [
      ...(nextJsScannedLanguage.files > 0 ? [nextJsScannedLanguage] : []),
      ...(remainingTypeScript && remainingTypeScript.files > 0 ? [remainingTypeScript] : []),
    ];
  });
  const selectedLanguage = selectedTech
    ? languages.find((language) => language.language.toLowerCase() === selectedTech.name.toLowerCase())
    : undefined;
  const selectedFrameworkRepositories = selectedTech && codeStats
    ? codeStats.repositories.filter((project) =>
        (project.frameworks ?? []).some((framework) => framework.toLowerCase() === selectedTech.name.toLowerCase()))
    : [];
  const selectedRepositoryLanguages = selectedLanguage && codeStats
    ? codeStats.repositories.flatMap((project) => {
        const projectUsesNextJs = (project.frameworks ?? []).some((framework) => framework.toLowerCase() === "next.js");
        const selectedIsNextJs = selectedLanguage.language.toLowerCase() === "next.js";
        const selectedIsTypeScript = selectedLanguage.language.toLowerCase() === "typescript";
        if ((selectedIsNextJs && !projectUsesNextJs) || (selectedIsTypeScript && projectUsesNextJs)) return [];
        const sourceLanguage = selectedIsNextJs ? "TypeScript" : selectedLanguage.language;
        const language = project.languages.find((item) => item.language.toLowerCase() === sourceLanguage.toLowerCase());
        return language ? [{ project, language }] : [];
      }).sort((a, b) => b.language.lines - a.language.lines)
    : [];
  const selectedEstimateAreas = selectedTech
    ? estimates.flatMap((project) => project.areas
        .filter((area) => area.stack.trim().toLowerCase() === selectedTech.name.trim().toLowerCase())
        .map((area) => ({ project, area })))
    : [];
  const selectedManualLines = selectedEstimateAreas.reduce((total, entry) => total + entry.area.lines, 0);
  const selectedManualCharacters = selectedEstimateAreas.reduce((total, entry) => total + (estimateProjectCharacters(entry.area) ?? 0), 0);
  const selectedScannedLines = selectedLanguage?.lines ?? 0;
  const selectedScannedCharacters = selectedLanguage?.characters ?? 0;
  const selectedTotalLines = selectedScannedLines + selectedManualLines;
  const selectedTotalCharacters = selectedScannedCharacters + selectedManualCharacters;
  const statTechOptions = Array.from(new Map([
    ...languages.map((language) => ({
      name: language.language,
      logo: techLogosByName[language.language] ?? "",
      kind: language.language === "Next.js" ? "FRAMEWORK" as const
        : formatLanguageNames.has(language.language) ? "FORMAT" as const : "LANGUAGE" as const,
    })),
    ...estimates.flatMap((project) => project.areas.map((area) => ({
      name: area.stack,
      logo: techLogosByName[area.stack] ?? "",
      kind: (
        area.stack === "Next.js" ? "FRAMEWORK"
          : area.stack === "React" || area.stack === "Three.js" ? "LIBRARY"
            : area.stack === "WebGL" ? "GRAPHICS API"
              : area.stack === "Tokio" ? "RUNTIME"
                : "LANGUAGE"
      ) as "FRAMEWORK" | "LIBRARY" | "GRAPHICS API" | "RUNTIME" | "LANGUAGE",
    }))),
  ].map((tech) => [tech.name.toLowerCase(), tech] as const)).values());
  const motionRise = reduce ? {} : rise;
  return <main id="main-content" tabIndex={-1} onKeyDown={event=>{if(event.key==="Escape")setMenu(false)}}><a className="skip-link" href="#content-start">Skip to content</a>
    <motion.div className="reading-progress" style={{scaleX:progress}} />
    <div className="atmosphere" aria-hidden="true"><div className="atmosphere-grid"/><motion.div className="aurora aurora-one" animate={reduce?{}:{x:[0,38,-18,0],y:[0,-22,16,0],rotate:[0,7,-4,0],scale:[1,1.08,.97,1]}} transition={{duration:25,repeat:Infinity,ease:"easeInOut"}}/><motion.div className="aurora aurora-two" animate={reduce?{}:{x:[0,-32,16,0],y:[0,20,-16,0],rotate:[0,-9,4,0]}} transition={{duration:31,repeat:Infinity,ease:"easeInOut"}}/><div className="grain"/></div>
    <header className="site-header"><a className="wordmark" href="#top" aria-label="Vireon — The Slop King, home" onClick={()=>setMenu(false)}><img className="wordmark-logo" src="/brands/vireon-mark.svg" alt="" width="42" height="42"/><span className="wordmark-copy"><strong>VIREON</strong><small>THE SLOP KING <span aria-hidden="true">👑</span></small></span></a><nav id="primary-navigation" className={menu?"navigation navigation-open":"navigation"} aria-label="Main navigation">{themeCopy.nav.map(([label,href],i)=><a key={href} href={href} onClick={()=>setMenu(false)}><span className="nav-index">0{i+1}</span>{label}</a>)}<a className="nav-contact" href="#contact" onClick={()=>setMenu(false)}><BrailleText label="Get in touch" /> <ArrowUpRight size={14}/></a></nav><button className="menu-toggle" onClick={()=>setMenu(v=>!v)} aria-label={menu?"Close navigation":"Open navigation"} aria-controls="primary-navigation" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></header>
    <NothingSystemStrip />
    <section className="hero section-shell" id="top"><span id="content-start" className="content-start" aria-hidden="true"/><div className="hero-meta"><Eyebrow>{themeCopy.heroMeta}</Eyebrow><span className="coordinates">{themeCopy.coordinatesTop}<br/>{themeCopy.coordinatesBottom}</span></div><div className="hero-main"><motion.div className="hero-copy" variants={sequence} initial="hidden" animate="show"><motion.p className="hero-kicker" variants={motionRise}>{themeCopy.kicker}</motion.p><motion.h1 variants={motionRise}>{themeCopy.lineOne}<br/>{themeCopy.lineTwo} <em>{themeCopy.emphasis}</em></motion.h1><motion.div className="hero-bottomline" variants={motionRise}><p>{themeCopy.description}</p><a className="round-link" href="#manifesto" aria-label="Discover the archive"><ArrowDownRight size={21}/></a></motion.div></motion.div><div className="hero-art editorial-index editorial-index-slop" role="group" aria-label="Vireon — The Slop King">
  <ThemeHeroArtwork />
  
  <div className="editorial-index-top slop-panel-top"><span>{themeCopy.brandIndex}</span><span className="slop-live-label"><i/> {themeCopy.brandLive}</span></div>
  <div className="slop-brand-lockup">
    <div className="slop-brand-overline"><span>{themeCopy.brandOverline}</span><span>{themeCopy.brandEdition}</span></div>
    <div className="slop-brand-vireon">VIREON<span className="slop-brand-spark" aria-hidden="true">✦</span></div>
    <div className="slop-brand-divider" aria-hidden="true"><i/><span>✧</span><i/></div>
    <div className="slop-brand-title"><span>{themeCopy.brandTitle}</span><span className="slop-king-crown" aria-label="crown">👑</span></div>
    <p className="slop-brand-caption">{themeCopy.brandCaption}</p>
    <div className="slop-brand-signature" aria-hidden="true"><span>V</span><i/><span>SK</span></div>
  </div>
  <div className="editorial-index-rule slop-panel-rule"/>
  <div className="editorial-index-bottom slop-panel-bottom"><span>{themeCopy.brandBottom}</span><span>{themeCopy.brandEnd}</span></div>
  <div className="editorial-index-side slop-panel-side">{themeCopy.brandSide}</div>
</div></div><div className="hero-foot"><span>{activeTheme==="nothing"?"NODE ACTIVE":activeTheme==="light"?"A COLLECTION IN PROGRESS":"INDEPENDENT BY NATURE"}</span><span className="hero-foot-center"><i className="live-dot"/> {activeTheme==="nothing"?"PUBLIC SIGNAL / ONLINE":activeTheme==="light"?"OPEN GALLERY / ONLINE":"DIGITAL PRESENCE / ONLINE"}</span><span>{activeTheme==="nothing"?"SCROLL TO QUERY":activeTheme==="light"?"CONTINUE BROWSING":"SCROLL TO EXPLORE"} <i className="scroll-line"/></span></div></section>
    <section className="profile-identity-band section-shell" aria-label="Professional roles">
      <div className="profile-identity-heading"><span>01 / PROFESSIONAL PROFILE</span><strong>Business, technology<br />and property.</strong></div>
      <div className="profile-identity-roles">
        <div className="profile-identity-role"><small>01</small><strong>Businessman</strong><span>BUSINESS / VENTURES</span></div>
        <div className="profile-identity-role"><small>02</small><strong>Full-stack Developer</strong><span>SOFTWARE / SYSTEMS</span></div>
        <div className="profile-identity-role"><small>03</small><strong>Real Estate Developer</strong><span>PROPERTY / DEVELOPMENT</span></div>
      </div>
    </section>
    <div className="marquee" aria-label={themeCopy.marquee.join(", ")}><div className="marquee-track" aria-hidden="true">{Array.from({length:4},(_,i)=><span key={i}>{themeCopy.marquee.join("  ✳  ")} <b>✳</b> </span>)}</div></div>
    <section className="manifesto section-shell section-space" id="manifesto"><IndexLabel n={themeCopy.manifestoIndex} label={themeCopy.manifestoLabel}/><div className="manifesto-content"><motion.div className="section-heading" initial="hidden" whileInView="show" viewport={{once:true,amount:.25}} variants={sequence}><motion.div variants={motionRise}><Eyebrow>{themeCopy.manifestoEyebrow}</Eyebrow></motion.div><motion.h2 variants={motionRise}>{themeCopy.manifestoTop}<br/><em>{themeCopy.manifestoBottom}</em></motion.h2></motion.div><motion.div className="manifesto-text" initial="hidden" whileInView="show" viewport={{once:true,amount:.2}} variants={sequence}><motion.p className="lead" variants={motionRise}>{themeCopy.manifestoLead}</motion.p><motion.p variants={motionRise}>{themeCopy.manifestoBody}</motion.p><motion.a className="text-link" variants={motionRise} href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer"><BrailleText label={themeCopy.manifestoLink} /> <ArrowUpRight size={16}/></motion.a></motion.div></div><div className="manifesto-aside"><span className="aside-rule"/><p>{themeCopy.manifestoAsideTitle}</p><p>{themeCopy.manifestoAsideText}</p></div></section>
    <section className="work section-shell section-space" id="work"><div className="section-topline"><IndexLabel n={themeCopy.workIndex} label={themeCopy.workLabel}/><Eyebrow>{themeCopy.workEyebrow}</Eyebrow></div><div className="work-heading"><motion.h2 initial="hidden" whileInView="show" viewport={{once:true}} variants={motionRise}>{themeCopy.workTop}<br/><em>{themeCopy.workBottom}</em></motion.h2><p>{themeCopy.workDescription}</p></div><div className="project-list project-list-expandable">
<details className="project-feature project-feature-expand project-expand">
  <summary className="project-feature-summary">
    <div className="project-art lunar-art"><div className="lunar-moon"/><div className="lunar-ring"/><span>01 — COMMUNITY SYSTEMS</span><motion.div className="lunar-star" animate={reduce?{}:{rotate:360}} transition={{duration:45,repeat:Infinity,ease:"linear"}}>✳</motion.div></div>
    <div className="project-detail"><div className="project-index">01 <span>/ SOFTWARE</span></div><div><div className="project-title-row"><img className="project-logo project-logo-large" src="/brands/lemegeton.svg" alt="" width="44" height="44"/><div><h3>Lemegeton</h3><p><em>Discord media discovery.</em><br/>Anime, manga, novels, and Steam across communities.</p></div></div><div className="tag-row"><span>MULTI-GUILD</span><span>ANILIST + STEAM</span><span>MEDIA DISCOVERY</span><span>SERVER AUTOMATION</span></div></div><span className="project-arrow"><ArrowUpRight/></span></div>
    <span className="project-expand-hint"><BrailleText label="Expand project" /> <span aria-hidden="true">＋</span></span>
  </summary>
  <div className="project-expanded-content"><p>AniList profiles, recommendations, leaderboards, moderation, and guild tools.</p><a href="https://github.com/Kyerstorm/Lemegeton" target="_blank" rel="noreferrer"><BrailleText label="Open repository" /> <ArrowUpRight size={14}/></a><span>MAJOR CONTRIBUTOR · CO-OWNER</span></div>
</details>
<details className="project-row project-row-expand project-expand">
  <summary className="project-row-summary"><span className="project-index">02 / 04</span><div className="project-title-row"><img className="project-logo" src="/brands/privacage.svg" alt="" width="34" height="34"/><div><h3>PrivaCage</h3><p><em>Local-first privacy auditing.</em><br/>Android, Windows, Svelte, and Rust.</p></div></div><span className="project-type">PRIVACY / ANDROID + WINDOWS</span><ArrowUpRight className="row-arrow" size={19}/></summary>
  <div className="project-expanded-content"><p>App, tracker, and metadata audits with scoped controls.</p><a href="https://github.com/VireonNoctis/PrivaCage" target="_blank" rel="noreferrer"><BrailleText label="Open repository" /> <ArrowUpRight size={14}/></a></div>
</details>
<details className="project-row project-expand">
  <summary className="project-row-summary"><span className="project-index">03 / 04</span><div className="project-title-row"><img className="project-logo" src="/brands/lunarx.svg" alt="" width="34" height="34"/><div><h3>Lunar X</h3><p>Anime, manga, novels, profiles, and game systems.</p></div></div><span className="project-type">PLATFORM / COMMUNITY</span><ArrowUpRight className="row-arrow" size={19}/></summary>
  <div className="project-expanded-content"><p>Reported footprint: 676,088 lines across its core stacks.</p><a href="https://lunarx.to/Profile/vvvx" target="_blank" rel="noreferrer"><BrailleText label="Open profile" /> <ArrowUpRight size={14}/></a></div>
</details>
<details className="project-row project-expand">
  <summary className="project-row-summary"><span className="project-index">04 / 04</span><div className="project-title-row"><img className="project-logo" src="/brands/vireon-mark.svg" alt="" width="34" height="34"/><div><h3>Personal systems</h3><p>Small utilities, profile tooling, automation, and experiments made to reduce friction and make digital life more considered.</p></div></div><span className="project-type">TOOLS / EXPERIMENTS</span><ArrowUpRight className="row-arrow" size={19}/></summary>
  <div className="project-expanded-content"><p>Includes developer tooling, workflow experiments, visual systems, and supporting utilities across the wider Vireon project ecosystem.</p><a href="https://github.com/VireonNoctis?tab=repositories" target="_blank" rel="noreferrer"><BrailleText label="Browse repositories" /> <ArrowUpRight size={14}/></a></div>
</details>
</div><div className="github-live"><div className="github-live-icon"><Github size={19}/></div><div><span className="micro-label">{themeCopy.liveLabel}</span><p>{live.repos!==undefined?<><AnimatedNumber value={live.repos}/> {themeCopy.repoUnit}</>:themeCopy.repoFallback}{live.followers!==undefined?<> · <AnimatedNumber value={live.followers}/> {themeCopy.followersUnit}</>:""}</p></div><a href="https://github.com/VireonNoctis?tab=repositories" target="_blank" rel="noreferrer"><BrailleText label={themeCopy.repoCta} /> <ArrowUpRight size={15}/></a></div><section className="code-footprint-teaser" aria-label="Language code statistics">
  <div className="code-footprint-teaser-head"><span className="micro-label">CODE TELEMETRY / OPEN ON A LANGUAGE</span><span className="code-footprint-updated">{codeStats ? `${languages.length} LANGUAGE GROUPS · ${codeStats.totals.repositories} REPOSITORIES IN SNAPSHOT` : codeStatsStatus === "loading" ? "FETCHING LANGUAGE DATA" : "LANGUAGE DATA TEMPORARILY UNAVAILABLE"}</span></div>
  <p>Select a stack to inspect its totals.</p>
  <a className="code-footprint-link" href="#stack"><BrailleText label="Open language index" /> <ArrowUpRight size={13}/></a>
</section>{repos.length>0&&<div className="repo-live-area">
  <div className="repo-live-heading"><span className="micro-label">LATEST PUBLIC REPOSITORIES · AUTO-SYNCED</span><span className="repo-live-count">Sorted by latest update</span></div>
  <div className="repo-live-list">{repos.map((repo,i)=><motion.a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer" aria-label={`Open GitHub repository ${repo.name}`} initial="hidden" whileInView="show" viewport={{once:true}} variants={motionRise} transition={{delay:i*.06}}>
    <span className="repo-row-index">{String(i+1).padStart(2,"0")}</span>
    <div className="repo-live-copy"><strong>{repo.name}</strong><small>{repo.description?.trim()||"No repository description has been added yet."}</small><span className="repo-live-meta">{repo.language?<span className="repo-language">{repo.language}</span>:<span className="repo-language is-unspecified">Language not detected</span>}<span className="repo-updated">Updated {repo.updated_at.slice(0,10)}</span></span></div>
    <span className="repo-stars">✳ <AnimatedNumber value={repo.stargazers_count}/></span><ArrowUpRight size={15} aria-hidden="true"/>
  </motion.a>)}</div>
</div>}</section>
    <section className="stack section-shell section-space" id="stack"><div className="section-topline"><IndexLabel n={themeCopy.stackIndex} label={themeCopy.stackLabel}/><Eyebrow>{themeCopy.stackEyebrow}</Eyebrow></div><div className="stack-heading"><motion.div initial="hidden" whileInView="show" viewport={{once:true,amount:.2}} variants={sequence}><motion.span variants={motionRise} className="eyebrow"><i/> {themeCopy.stackEyebrow}</motion.span><motion.h2 variants={motionRise}>{themeCopy.stackTop}<br/><em>{themeCopy.stackBottom}</em></motion.h2></motion.div><p>{themeCopy.stackDescription}</p></div><div className="website-stack-overview">
      <div className="website-stack-feature">
        <div className="website-stack-visual">
          <div className="website-stack-visual-top"><span>V / WEB SYSTEMS</span><span>BUILD 001</span></div>
          <div className="website-stack-visual-center">
            <div className="website-stack-logo-stack">
              <span className="website-stack-logo website-stack-logo-next"><img src="/brands/tech-nextdotjs.svg" alt="Next.js" loading="lazy"/></span>
              <span className="website-stack-logo website-stack-logo-react"><img src="/brands/tech-react.svg" alt="React" loading="lazy"/></span>
              <span className="website-stack-logo website-stack-logo-ts"><img src="/brands/tech-typescript.svg" alt="TypeScript" loading="lazy"/></span>
            </div>
            <span className="website-stack-visual-word">VIREON<span> / INTERFACE</span></span>
            <span className="website-stack-visual-caption">COMPONENTS · DATA · MOTION · THEMES</span>
          </div>
          <div className="website-stack-visual-bottom"><span>RENDER / INTERACT / DEPLOY</span><span><i/> STATIC SITE</span></div>
        </div>
        <div className="website-stack-feature-copy">
          <span className="micro-label">01 / THE FRONT END</span>
          <h3>One system.<br/><em>Every interaction.</em></h3>
          <p>Next.js. React. TypeScript. WebGL2. Rust tooling.</p>
          <div className="website-stack-pipeline"><span>01 <b>BUILD</b></span><i/><span>02 <b>CHECK</b></span><i/><span>03 <b>PUBLISH</b></span></div>
        </div>
      </div>
      <div className="website-stack-modules" aria-label="Technologies used by this website">
        {[{name:"Next.js",logo:"nextdotjs",kind:"APPLICATION",copy:"Routing, interface, and static export."},{name:"CSS theme system",logo:"css3",kind:"VISUAL DESIGN",copy:"Monochrome layout, responsive surfaces, and tactile controls."},{name:"Framer Motion",logo:"framer",kind:"ANIMATION",copy:"Scroll reveals, counters, and shared-element transitions."},{name:"Rust + GitHub Actions",logo:"rust",kind:"LIVE DATA",copy:"Rust data refresh and automated build checks."},{name:"GitHub Pages",logo:"github",kind:"HOSTING",copy:"Static export and deployment."}].map((item,i)=><article className="website-stack-module" key={item.name}>
          <div className="website-stack-module-top"><span>{String(i+1).padStart(2,"0")} / {item.kind}</span><img src={`/brands/tech-${item.logo}.svg`} alt="" loading="lazy"/></div>
          <h3>{item.name}</h3><p>{item.copy}</p>
        </article>)}
      </div>
    </div>
    <div className="project-language-explorer">
      <div className="project-language-heading">
        <div><span className="micro-label">02 / CODEBASE EXPLORER</span><h3>Technology statistics, on demand.</h3><p>Tracked source technologies and supplied Lunar X estimates. Next.js project source is grouped under its framework profile, with no duplicate TypeScript count.</p></div>
        <span className="project-language-count">{statTechOptions.length} PROFILES</span>
      </div>
      <div className="project-language-grid">
        {statTechOptions.map((tech,i)=>{
          const scanned=languages.find((language)=>language.language.toLowerCase()===tech.name.toLowerCase());
          const lunarAreas=estimates.flatMap(project=>project.areas.filter(area=>area.stack.trim().toLowerCase()===tech.name.toLowerCase()));
          const lunarLines=lunarAreas.reduce((sum,area)=>sum+area.lines,0);
          const lunarCharacters=lunarAreas.reduce((sum,area)=>sum+(estimateProjectCharacters(area)??0),0);
          const totalLines=(scanned?.lines??0)+lunarLines;
          return <motion.button type="button" className="project-language-tile" key={tech.name} aria-haspopup="dialog" aria-label={`Open ${tech.name} technology statistics, ${totalLines.toLocaleString()} total lines`} onClick={()=>setSelectedTech({name:tech.name,logo:tech.logo,kind:tech.kind})} initial={reduce?false:{opacity:0,y:12}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.35,delay:Math.min(i*.018,.25)}}>
            <span className="project-language-logo">{tech.logo ? <motion.img layoutId={`tech-logo-${tech.name}`} src={`/brands/tech-${tech.logo}.svg`} alt="" loading="lazy"/> : <motion.span layoutId={`tech-logo-${tech.name}`} className="project-language-generic"><Code2 size={16}/></motion.span>}</span>
            <span className="project-language-copy"><strong>{tech.name}</strong><small>{lunarLines>0?("Lunar X · ≈ "+formatCompactEstimate(lunarCharacters)+" estimated characters"):tech.name==="Next.js"?"detected Next.js project source":"tracked repository data"}</small></span>
            <span className="project-language-lines"><strong>{totalLines.toLocaleString()}</strong><small>lines</small></span>
            <ArrowUpRight size={14} className="project-language-arrow" aria-hidden="true"/>
          </motion.button>;
        })}
      </div>
      <p className="project-language-note">Next.js includes TypeScript source from repositories detected as Next.js; those files are removed from the separate TypeScript total. Lunar X estimates remain included for Rust, Next.js, React, and Python.</p>
    </div><div className="stack-footnote"><span className="stack-footnote-symbol">✳</span><p><strong>{themeCopy.stackFootnoteTitle}</strong> {themeCopy.stackFootnoteBody}</p><span className="stack-footnote-end">VN / STACK INDEX</span></div>
    {portalReady && createPortal(
      <AnimatePresence initial={false}>
        {selectedTech && (
          <motion.div
            className="tech-modal-backdrop"
            key={selectedTech.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            onClick={() => setSelectedTech(null)}
          >
            <motion.section
              className="tech-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tech-modal-title"
              tabIndex={-1}
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.985, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99, filter: "blur(5px)" }}
              transition={{ duration: reduce ? 0 : 0.32, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="tech-modal-topline">
                <span className="micro-label">{selectedTech.learningStatus ? "LANGUAGE / " + selectedTech.learningStatus : selectedTech.kind + " / SOURCE STATISTICS"}</span>
                <button type="button" className="tech-modal-close" autoFocus onClick={() => setSelectedTech(null)} aria-label={`Close ${selectedTech.name} statistics`}><X size={17}/></button>
              </div>
              <div className="tech-modal-identity">
                {selectedTech.logo ? <motion.img layoutId={`tech-logo-${selectedTech.name}`} src={`/brands/tech-${selectedTech.logo}.svg`} alt="" /> : <motion.span layoutId={`tech-logo-${selectedTech.name}`} className="tech-modal-generic-logo"><Code2 size={24}/></motion.span>}
                <div>
                  <span className="micro-label">{selectedTech.learningStatus ? (selectedTech.learningStatus === "IN USE" ? "ACTIVE TOOLKIT" : "LEARNING ROADMAP") : selectedEstimateAreas.length > 0 ? "COMBINED TOTAL / LUNAR X INCLUDED" : selectedLanguage ? (selectedTech.name === "Next.js" ? "FRAMEWORK-AWARE REPOSITORY SCAN" : "AUTOMATED REPOSITORY SCAN") : "NO SOURCE DATA FOUND"}</span>
                  <h2 id="tech-modal-title">{selectedTech.name}</h2>
                  <p>{selectedTech.learningStatus
                    ? (selectedTech.learningNote ?? (selectedTech.learningStatus === "IN USE" ? "Part of the current toolkit." : "On the learning shortlist."))
                    : selectedEstimateAreas.length > 0
                      ? "Includes supplied Lunar X estimates."
                      : selectedLanguage
                        ? selectedTech.name === "Next.js"
                          ? "Next.js source is grouped separately from TypeScript."
                          : selectedTech.name === "TypeScript"
                            ? "TypeScript source from repositories that are not detected as Next.js projects."
                            : "Tracked repository totals."
                        : "No tracked data yet."}</p>
                </div>
              </div>
              {(selectedLanguage || selectedEstimateAreas.length > 0) && (
                <div className="tech-modal-grid" aria-label={`${selectedTech.name} combined statistics`}>
                  {[
                    { label: "TOTAL LINES", value: selectedTotalLines, note: selectedEstimateAreas.length > 0 ? "Includes Lunar X" : "Across scanned repositories" },
                    ...(selectedEstimateAreas.length > 0 ? [
                      { label: "LUNAR X LINES", value: selectedManualLines, note: "Project estimate" },
                    ] : []),
                    ...(selectedLanguage ? [
                      { label: "SCANNED LINES", value: selectedLanguage.lines, note: "Tracked project lines" },
                      { label: "NON-BLANK LINES", value: selectedLanguage.nonblankLines, note: "Tracked project lines" },
                      { label: "FILES", value: selectedLanguage.files, note: "Tracked text files" },
                      { label: "WORDS", value: selectedLanguage.words, note: "Tracked project text" },
                    ] : []),
                    ...((selectedLanguage || selectedEstimateAreas.length > 0) ? [
                      { label: "CHARACTERS", value: selectedTotalCharacters, note: selectedEstimateAreas.length > 0 ? "Includes Lunar X estimate" : "Tracked project text" },
                    ] : []),
                  ].map((metric) => <div className="tech-modal-stat" key={metric.label}>
                    <span>{metric.label}</span><strong><AnimatedNumber value={metric.value}/></strong><small>{metric.note}</small>
                  </div>)}
                </div>
              )}
              {!selectedLanguage && selectedEstimateAreas.length === 0 && (
                <div className="tech-modal-empty">{selectedTech.learningStatus
                  ? <><strong>{selectedTech.learningStatus === "IN USE" ? "In active use" : "On the learning shortlist"}</strong><p>{selectedTech.learningNote}</p></>
                  : <>No tracked statistics are available for {selectedTech.name} yet.</>}</div>
              )}
              {selectedEstimateAreas.length > 0 && (
                <section className="tech-modal-section" aria-label="Manual project estimates">
                  <div className="tech-modal-section-heading">
                    <div><span className="micro-label">LUNAR X / INCLUDED ABOVE</span><h3>Source breakdown</h3></div>
                    <span className="tech-modal-source-label">ALREADY INCLUDED IN TOTAL LINES</span>
                  </div>
                  <div className="tech-modal-estimate-list">
                    {selectedEstimateAreas.map(({ project, area }) => (
                      <a className="tech-modal-estimate" href={project.url} key={`${project.id}-${area.name}`} target="_blank" rel="noreferrer">
                        <span className="tech-modal-estimate-project"><strong>{project.name}</strong><small>{area.name} · {area.stack} · {area.estimatedCharactersPerLine ?? LUNAR_X_CHARACTERS_PER_LINE[area.stack.trim()] ?? "—"} chars/line</small></span>
                        <span className="tech-modal-estimate-lines">
                          <strong><AnimatedNumber value={area.lines}/></strong><small>reported lines</small>
                          <strong>≈ <AnimatedNumber value={estimateProjectCharacters(area) ?? 0}/></strong><small>estimated characters</small>
                        </span>
                        <ArrowUpRight size={15} aria-hidden="true"/>
                      </a>
                    ))}
                  </div>
                  <p className="tech-modal-footnote">Approximate character totals use the per-stack rate shown beside each area.</p>
                </section>
              )}
              {selectedRepositoryLanguages.length > 0 && (
                <section className="tech-modal-section" aria-label="Repository-level breakdown">
                  <div className="tech-modal-section-heading">
                    <div><span className="micro-label">REPOSITORY-LEVEL DETAIL</span><h3>Where it appears</h3></div>
                    <span className="tech-modal-source-label">{selectedRepositoryLanguages.length} repositories</span>
                  </div>
                  <div className="tech-modal-repository-list">
                    {selectedRepositoryLanguages.map(({ project, language }) => (
                      <a className="tech-modal-repository" href={project.url} key={project.fullName} target="_blank" rel="noreferrer">
                        <span className="tech-modal-repository-copy"><strong>{project.name}</strong><small>{project.role ?? (project.relationship === "contributor" ? "Major contributor" : `Owned · ${project.branch}`)}</small></span>
                        <span className="tech-modal-repository-stats"><strong><AnimatedNumber value={language.lines}/></strong><small>lines · {language.files} files</small></span>
                        <ArrowUpRight size={15} aria-hidden="true"/>
                      </a>
                    ))}
                  </div>
                </section>
              )}
              {selectedFrameworkRepositories.length > 0 && (
                <section className="tech-modal-section" aria-label="Framework usage">
                  <div className="tech-modal-section-heading">
                    <div><span className="micro-label">FRAMEWORK DETECTION</span><h3>Projects using {selectedTech?.name}</h3></div>
                    <span className="tech-modal-source-label">{selectedFrameworkRepositories.length} repositories</span>
                  </div>
                  <div className="tech-modal-repository-list">
                    {selectedFrameworkRepositories.map((project) => (
                      <a className="tech-modal-repository" href={project.url} key={project.fullName} target="_blank" rel="noreferrer">
                        <span className="tech-modal-repository-copy"><strong>{project.name}</strong><small>{project.relationship === "contributor" ? project.role ?? "Contributor project" : "Owned project"}</small></span>
                        <span className="tech-modal-repository-stats"><strong>{project.frameworks?.filter((item) => item.toLowerCase() === selectedTech?.name.toLowerCase()).length ?? 0}</strong><small>framework match</small></span>
                        <ArrowUpRight size={15} aria-hidden="true"/>
                      </a>
                    ))}
                  </div>
                </section>
              )}
              <p className="tech-modal-footnote">Next.js source is grouped separately. Supplied estimates remain distinct from repository scans.</p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )}
    </section>
    <section className="learning section-shell section-space" id="learning"><div className="section-topline"><IndexLabel n={themeCopy.learningIndex} label={themeCopy.learningLabel}/><Eyebrow>{themeCopy.learningEyebrow}</Eyebrow></div><div className="learning-heading"><div><span className="eyebrow"><i/> {themeCopy.learningEyebrow}</span><h2>{themeCopy.learningTop}<br/><em>{themeCopy.learningBottom}</em></h2></div><p>{themeCopy.learningDescription}</p></div><div className="learning-grid">
      {[
        {name:"Svelte",logo:"svelte",kind:"FRONTEND",status:"IN USE" as const,note:"Used in active frontend work, including PrivaCage."},
        {name:"Vue.js",logo:"vuedotjs",kind:"FRONTEND",status:"PLANNED" as const,note:"A progressive approach to reactive UI."},
        {name:"Angular",logo:"angular",kind:"FRAMEWORK",status:"PLANNED" as const,note:"A full framework for structured web apps."},
        {name:"PHP",logo:"php",kind:"LANGUAGE",status:"PLANNED" as const,note:"Server-side web development and the wider PHP ecosystem."},
        {name:"C#",logo:"csharp",kind:"LANGUAGE",status:"PLANNED" as const,note:"Modern application development across the .NET ecosystem."},
        {name:"Dart",logo:"dart",kind:"LANGUAGE",status:"PLANNED" as const,note:"A strongly typed language for cross-platform applications."},
        {name:"Shell",logo:"terminal",kind:"LANGUAGE",status:"PLANNED" as const,note:"Command-line scripting, automation, and gluing tools together."},
        {name:"WebGL",logo:"webgl",kind:"GRAPHICS API",status:"PLANNED" as const,note:"Browser-native GPU rendering for interactive visuals, shaders, and real-time graphics."},
        {name:"Three.js",logo:"threejs",kind:"3D LIBRARY",status:"PLANNED" as const,note:"A JavaScript 3D library for scenes, materials, cameras, and WebGL experiences."},
        {name:"Tokio",logo:"rust",kind:"ASYNC RUNTIME",status:"PLANNED" as const,note:"A Rust asynchronous runtime for high-concurrency networking, Discord event handling, and game-session workloads."},
      ].map((t,i)=><motion.button type="button" className="learning-card" key={t.name} aria-haspopup="dialog" aria-label={`Open ${t.name} details. Status: ${t.status}.`} onClick={()=>setSelectedTech({name:t.name,logo:t.logo,kind:"LEARNING",learningStatus:t.status,learningNote:t.note})} initial={reduce?false:{opacity:0,y:20}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.55,delay:i*.055}} whileHover={reduce?undefined:{y:-3}} whileTap={{scale:.99}}>
        <div className="learning-card-top"><span className="learning-number">{String(i+1).padStart(2,"0")} / 10</span><span className="learning-kind">{t.kind}</span></div>
        <div className="learning-brand"><span className="learning-logo"><img src={`/brands/tech-${t.logo}.svg`} alt="" loading="lazy"/></span><div><h3>{t.name}</h3><span>{t.status==="IN USE"?"IN ACTIVE USE":"ON THE LEARNING LIST"}</span></div></div>
        <p>{t.note}{t.name === "WebGL" && <span className="learning-card-estimate">Lunar X estimate · 20,657 lines · ≈ 1,239,420 characters</span>}{t.name === "Three.js" && <span className="learning-card-estimate">Lunar X estimate · 18,685 lines · ≈ 1,121,100 characters</span>}</p>
        <div className="learning-card-bottom"><span className="learning-pulse"/><span>{t.status==="IN USE"?"ACTIVE TOOLKIT":"UP NEXT"}</span><ArrowUpRight size={15}/></div>
      </motion.button>)}
    </div><div className="learning-note"><span>VN / FIELD NOTES</span><p>Open any tile for its role and status in the current toolkit or future plans.</p></div></section>
    <section className="interlude" aria-label="A moment of stillness"><div className="interlude-lines"/><motion.div className="interlude-inner" initial={reduce?false:{opacity:0,y:28}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.4}} transition={{duration:1.2}}><span className="interlude-mark">“</span><p>{themeCopy.interludeTop}<br/><em>{themeCopy.interludeBottom}</em></p><span className="interlude-credit">{themeCopy.interludeCredit}</span></motion.div><motion.div className="interlude-orbit" animate={reduce?{}:{rotate:-360}} transition={{duration:65,repeat:Infinity,ease:"linear"}}><Orbit strokeWidth={.6}/></motion.div></section>
    <section className="archive section-shell section-space" id="archive"><div className="section-topline"><IndexLabel n={themeCopy.archiveIndex} label={themeCopy.archiveLabel}/><Eyebrow>{themeCopy.archiveEyebrow}</Eyebrow></div><motion.div className="archive-heading" initial="hidden" whileInView="show" viewport={{once:true}} variants={sequence}><motion.h2 variants={motionRise}>{themeCopy.archiveTop}<br/><em>{themeCopy.archiveBottom}</em></motion.h2><motion.p variants={motionRise}>{themeCopy.archiveDescription}</motion.p></motion.div><div className="archive-grid"><motion.a className="archive-card archive-anime" href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer" initial={reduce?false:{opacity:0,y:35}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:.85}}><div className="archive-card-top"><img className="social-logo" src="/brands/anilist.svg" alt="" width="22" height="22"/><span>READ / WATCH</span><ArrowUpRight size={16}/></div><div className="archive-illustration anime-illustration"><div className="book-shape book-one"/><div className="book-shape book-two"/><div className="book-shape book-three"/><span className="illustration-star">✳</span></div><div className="archive-card-bottom"><h3>Stories &amp; worlds</h3><p>Anime and manga.</p><div className="archive-stats"><span><strong>{live.anime!==undefined?<AnimatedNumber value={live.anime}/>:"—"}</strong> anime</span><span><strong>{live.manga!==undefined?<AnimatedNumber value={live.manga}/>:"—"}</strong> manga</span></div><span className="archive-link"><BrailleText label="Open AniList" /> <ArrowUpRight size={14}/></span></div></motion.a><motion.div className="archive-card archive-music" initial={reduce?false:{opacity:0,y:35}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:.85,delay:.14}}><div className="archive-card-top"><div className="archive-brandmarks"><img src="/brands/lastfm.svg" alt="Last.fm" width="22" height="22"/><img src="/brands/spotify.svg" alt="Spotify" width="22" height="22"/></div><span>LISTEN / RETURN</span><ArrowUpRight size={16}/></div><div className="archive-illustration music-illustration"><motion.div className="vinyl" animate={reduce?{}:{rotate:360}} transition={{duration:18,repeat:Infinity,ease:"linear"}}><div className="vinyl-label"/></motion.div><div className="sound-wave">{Array.from({length:21},(_,i)=><i key={i} style={{"--i":i, "--h":(12+(i%7)*11)+"px"} as React.CSSProperties}/>)}</div></div><div className="archive-card-bottom"><h3>Soundtrack to anything</h3><p>Spotify for the live moment; Last.fm for the long memory.</p><div className="now-playing"><i className={spotify.isPlaying||(!spotify.track&&live.playing)?"live-dot":"idle-dot"}/><span>{spotify.track?(spotify.isPlaying?"SPOTIFY · PLAYING NOW":"SPOTIFY · PAUSED")+" — "+spotify.track+" — "+(spotify.artist??"Unknown artist"):live.track?(live.playing?"LAST.FM · PLAYING NOW":"LAST.FM · LAST SCROBBLE")+" — "+live.track+" — "+(live.artist??"Unknown artist"):spotify.configured?"NOTHING PLAYING ON SPOTIFY · LAST.FM IS QUIET":"SPOTIFY LIVE STATUS NEEDS SETUP"}</span></div>{spotify.track&&spotify.albumImage&&<div className="spotify-track"><img src={spotify.albumImage} alt={`Cover art for ${spotify.album??spotify.track}`} loading="lazy"/><div><span className="micro-label">{spotify.isPlaying?"ON SPOTIFY NOW":"SPOTIFY / LAST TRACK"}</span><strong>{spotify.track}</strong><small>{spotify.artist??"Unknown artist"}{spotify.album?" · "+spotify.album:""}</small></div>{spotify.url&&<a href={spotify.url} target="_blank" rel="noreferrer" aria-label={`Open ${spotify.track} on Spotify`}><ArrowUpRight size={14}/></a>}</div>}<div className="archive-stats"><span><strong>{live.scrobbles!==undefined?<AnimatedNumber value={live.scrobbles}/>:"—"}</strong> plays logged on Last.fm</span></div><div className="archive-actions"><a className="archive-link" href="https://open.spotify.com/user/313455ps4aa6ouotajxcn34mwh4a" target="_blank" rel="noreferrer"><BrailleText label="Open Spotify profile" /> <ArrowUpRight size={14}/></a><a className="archive-link" href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer"><BrailleText label="Open Last.fm history" /> <ArrowUpRight size={14}/></a></div></div></motion.div></div><div className="signal-grid">
        <motion.section className="signal-panel anilist-detail" initial={reduce?false:{opacity:0,y:24}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8}}>
          <div className="signal-panel-head"><div><img src="/brands/anilist.svg" alt="" width="20" height="20"/><span className="micro-label">ANILIST / LIBRARY TELEMETRY</span></div><span className="signal-live"><i/> PUBLIC DATA</span></div>
          <h3>More than a watchlist.</h3><p className="signal-intro">Reading and watch statistics.</p>
          <div className="deep-stats">
            <div><span>EPISODES WATCHED</span><strong>{live.animeEpisodes!==undefined?<AnimatedNumber value={live.animeEpisodes}/>:"—"}</strong></div><div><span>HOURS WATCHED</span><strong>{live.animeMinutes!==undefined?<AnimatedNumber value={Math.round(live.animeMinutes/60)}/>:"—"}</strong></div>
            <div><span>CHAPTERS READ</span><strong>{live.mangaChapters!==undefined?<AnimatedNumber value={live.mangaChapters}/>:"—"}</strong></div><div><span>VOLUMES READ</span><strong>{live.mangaVolumes!==undefined?<AnimatedNumber value={live.mangaVolumes}/>:"—"}</strong></div>
            <div><span>ANIME MEAN SCORE</span><strong className="deep-stat-number deep-stat-score">{live.animeScore!==undefined?<><span className="deep-stat-value"><AnimatedNumber value={live.animeScore} decimals={1}/></span><small>/100</small></>:"—"}</strong></div><div><span>MANGA MEAN SCORE</span><strong className="deep-stat-number deep-stat-score">{live.mangaScore!==undefined?<><span className="deep-stat-value"><AnimatedNumber value={live.mangaScore} decimals={1}/></span><small>/100</small></>:"—"}</strong></div>
          </div>
          <div className="genre-columns"><div><span className="micro-label">ANIME GENRES</span>{(live.animeGenres??[]).map(g=><div className="genre-row" key={g.genre}><span>{g.genre}</span><div><i style={{width:(g.count/Math.max(1,...(live.animeGenres??[]).map(x=>x.count))*100)+"%"}}/></div><small><AnimatedNumber value={g.count}/></small></div>)}{!live.animeGenres?.length&&<p className="empty-data">Waiting for AniList statistics…</p>}</div>
            <div><span className="micro-label">MANGA GENRES</span>{(live.mangaGenres??[]).map(g=><div className="genre-row" key={g.genre}><span>{g.genre}</span><div><i style={{width:(g.count/Math.max(1,...(live.mangaGenres??[]).map(x=>x.count))*100)+"%"}}/></div><small><AnimatedNumber value={g.count}/></small></div>)}{!live.mangaGenres?.length&&<p className="empty-data">Waiting for AniList statistics…</p>}</div></div>
          <a className="signal-footer-link" href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer"><BrailleText label="Explore the full profile" /> <ArrowUpRight size={14}/></a>
        </motion.section>
        <motion.section className="signal-panel lastfm-detail" initial={reduce?false:{opacity:0,y:24}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8,delay:.12}}>
          <div className="signal-panel-head"><div><img src="/brands/lastfm.svg" alt="" width="20" height="20"/><span className="micro-label">LAST.FM / LISTENING INDEX</span></div><span className="signal-live"><i/> SCROBBLE DATA</span></div>
          <h3>Patterns in the noise.</h3><p className="signal-intro">All-time listening.</p>
          <div className="ranked-lists"><div><span className="micro-label">TOP ARTISTS</span>{(live.topArtists??[]).map((item,i)=><a className="ranked-row" key={item.name} href={item.url||"https://last.fm/user/reasfeetadmirer"} target="_blank" rel="noreferrer"><span>{String(i+1).padStart(2,"0")}</span><strong>{item.name}</strong><small>{item.playcount!==undefined?<><AnimatedNumber value={item.playcount}/> plays</>:"— plays"}</small><ArrowUpRight size={12}/></a>)}{!live.topArtists?.length&&<p className="empty-data">Loading the most-played artists…</p>}</div>
            <div><span className="micro-label">TOP TRACKS</span>{(live.topTracks??[]).map((item,i)=><a className="ranked-row" key={item.name+"-"+item.artist} href={item.url||"https://last.fm/user/reasfeetadmirer"} target="_blank" rel="noreferrer"><span>{String(i+1).padStart(2,"0")}</span><strong>{item.name}<small>{item.artist}</small></strong><small>{item.playcount!==undefined?<><AnimatedNumber value={item.playcount}/> plays</>:"— plays"}</small><ArrowUpRight size={12}/></a>)}{!live.topTracks?.length&&<p className="empty-data">Loading the most-played tracks…</p>}</div></div>
          <a className="signal-footer-link" href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer"><BrailleText label="Open listening history" /> <ArrowUpRight size={14}/></a>
        </motion.section>
        <motion.section className="signal-panel discord-detail" initial={reduce?false:{opacity:0,y:24}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8,delay:.2}}>
          <div className="signal-panel-head"><div><img src="/brands/discord.svg" alt="" width="20" height="20"/><span className="micro-label">DISCORD / COMMUNITY</span></div></div>
          <h3>Find me on Discord.</h3>
          <p className="signal-intro">Open the Discord profile directly.</p>
          <a className="signal-footer-link" href="https://discord.com/users/1419744000977403994" target="_blank" rel="noreferrer"><BrailleText label="Open Discord profile" /> <ArrowUpRight size={14}/></a>
        </motion.section>
      </div><div className="archive-note"><span className="note-index">NOTE 03.1</span><p>Currently in orbit: worldbuilding, interface systems, dark fantasy, and finding the right track for the right hour.</p><span className="note-symbol">✳</span></div></section>
    <section className="contact section-shell section-space" id="contact"><div className="section-topline"><IndexLabel n={themeCopy.contactIndex} label={themeCopy.contactLabel}/><Eyebrow>{themeCopy.contactEyebrow}</Eyebrow></div><div className="contact-main"><motion.h2 initial="hidden" whileInView="show" viewport={{once:true}} variants={motionRise}>{themeCopy.contactTop}<br/><em>{themeCopy.contactBottom}</em></motion.h2><motion.a className="contact-circle" href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer" aria-label="Open GitHub profile" whileTap={{scale:.94}}><ArrowUpRight size={31}/><span><BrailleText label={themeCopy.contactCta} /></span></motion.a></div><p className="contact-copy">{themeCopy.contactCopy}</p><div className="social-list">{socials.map((s,i)=><motion.a key={s.name} href={s.href} target="_blank" rel="noreferrer" initial={{opacity:0,x:-16}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*.07}}><span className="social-number">0{i+1}</span><img className="social-logo" src={"/brands/"+s.logo+".svg"} alt="" width="22" height="22"/><strong>{s.name}</strong><span className="social-handle">{s.handle}</span><ArrowUpRight size={17}/></motion.a>)}</div></section>
    <section className="lunar-profile section-shell section-space" id="lunar-profile"><div className="section-topline"><IndexLabel n="LIVE / LUNAR X" label="PROFILE REDIRECTION"/><Eyebrow>OPEN PROFILE</Eyebrow></div><div className="work-heading"><h2>Lunar X,<br/><em>over there.</em></h2><p>Lunar X profile.</p></div><a className="signal-footer-link" href="https://lunarx.to/profile/vvvx" target="_blank" rel="noreferrer"><BrailleText label="Open Lunar X profile" /> <ArrowUpRight size={14}/></a></section>
    <footer className="site-footer"><a className="footer-mark" href="#top" aria-label="Vireon — The Slop King, back to top"><img className="footer-wordmark" src="/brands/vireon-wordmark.svg" alt="Vireon — The Slop King" width="180" height="42"/></a><p>MADE IN THE QUIET HOURS.<br/><span>KEPT IN MOTION.</span></p><span className="footer-year">© {year} VIREON</span><a className="back-top" href="#top"><BrailleText label="Back to top" /> <ArrowUpRight size={14}/></a></footer>
  </main>;
}
