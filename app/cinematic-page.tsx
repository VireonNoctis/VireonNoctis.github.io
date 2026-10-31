"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatedNumber, ThemeSwitcher } from "./theme-system";

type SceneKind = "hero" | "projects" | "code" | "stack" | "learning" | "archive" | "sound" | "contact";
type RepoItem = {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  archived?: boolean;
  updated_at: string;
};
type LanguageItem = { language: string; files: number; lines: number; nonblankLines: number; characters: number; words: number };
type EstimateArea = { name: string; stack: string; lines: number; characters?: number; estimatedCharactersPerLine?: number };
type EstimateProject = { id: string; name: string; url: string; classification: string; areas: EstimateArea[] };
type StatsSnapshot = {
  totals: { repositories: number; files: number; lines: number; characters: number; words: number; stars: number; forks: number };
  languages?: LanguageItem[];
  manualProjectEstimates?: EstimateProject[];
} | null;
type GenreItem = { genre: string; count: number };
type RankedItem = { name: string; count?: number; playcount?: number; url?: string; artist?: string };
type LiveData = {
  repos?: number; followers?: number; anime?: number; manga?: number;
  scrobbles?: number; track?: string; artist?: string; playing?: boolean;
  animeEpisodes?: number; animeMinutes?: number; animeScore?: number;
  mangaChapters?: number; mangaVolumes?: number; mangaScore?: number;
  animeGenres?: GenreItem[]; mangaGenres?: GenreItem[];
  topArtists?: RankedItem[]; topTracks?: RankedItem[];
};
type SpotifyState = {
  configured: boolean; isPlaying: boolean; track: string | null; artist: string | null;
  album: string | null; albumImage: string | null; url: string | null;
};
type CinematicPageProps = { live: LiveData; repos: RepoItem[]; codeStats: StatsSnapshot; spotify: SpotifyState };

const chapters: { id: string; label: string; number: string; scene: SceneKind }[] = [
  { id: "ink-top", label: "Opening", number: "00", scene: "hero" },
  { id: "ink-work", label: "Selected work", number: "01", scene: "projects" },
  { id: "ink-code", label: "Code index", number: "02", scene: "code" },
  { id: "ink-stack", label: "The stack", number: "03", scene: "stack" },
  { id: "ink-learning", label: "Next frontier", number: "04", scene: "learning" },
  { id: "ink-archive", label: "Archive", number: "05", scene: "archive" },
  { id: "ink-sound", label: "Soundtrack", number: "06", scene: "sound" },
  { id: "ink-contact", label: "Open channel", number: "07", scene: "contact" },
];

const sceneArtwork: Record<SceneKind, { src: string; alt: string; position: string }> = {
  hero: { src: "/cinematic/moon-gate.webp", alt: "A cloaked figure beneath a vast crimson moon, framed by dark temple architecture", position: "51% 48%" },
  projects: { src: "/cinematic/theatre.webp", alt: "A distant solitary figure framed by monumental red theatre curtains", position: "50% 52%" },
  code: { src: "/cinematic/reach.webp", alt: "An expressive hand reaching toward a small red glass orb against a scratched crimson wall", position: "50% 50%" },
  stack: { src: "/cinematic/shrine-walk.webp", alt: "A lone figure looking across an ink-washed shrine city beneath a red sun", position: "38% 50%" },
  learning: { src: "/cinematic/moon-gate.webp", alt: "A cloaked figure and temple silhouettes against a textured red moon", position: "68% 48%" },
  archive: { src: "/cinematic/theatre.webp", alt: "An ornate theatre stage with scarlet curtains and a single silhouette", position: "64% 50%" },
  sound: { src: "/cinematic/shrine-walk.webp", alt: "A dramatic ink illustration of a shrine and red sky", position: "62% 50%" },
  contact: { src: "/cinematic/reach.webp", alt: "A detailed hand extending toward a glowing red glass sphere", position: "58% 50%" },
};

function CinematicScene({ scene }: { scene: SceneKind }) {
  const frame = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: frame,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.13, 1.035, 1.13]);
  const artwork = sceneArtwork[scene];

  return (
    <motion.div ref={frame} className={"cinema-art-frame cinema-art-frame-" + scene}>
      <motion.img
        className={"cinema-artwork cinema-artwork-" + scene}
        src={artwork.src}
        alt={artwork.alt}
        loading={scene === "hero" ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={scene === "hero" ? "high" : "auto"}
        style={{ y: reducedMotion ? 0 : y, scale: reducedMotion ? 1 : scale, objectPosition: artwork.position }}
      />
      <span className="cinema-ink-wipe" aria-hidden="true" />
    </motion.div>
  );
}

function PaperIndex({ number, eyebrow }: { number: string; eyebrow: string }) {
  return <div className="cinema-paper-index"><span>{number}</span><i /><span>{eyebrow}</span></div>;
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return <div className="cinema-stat"><span>{label}</span><strong><AnimatedNumber value={value} />{suffix ? <small>{suffix}</small> : null}</strong></div>;
}

export default function CinematicPage({ live, repos, codeStats, spotify }: CinematicPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("ink-top");
  const [progress, setProgress] = useState(0);
  const manualAreas = codeStats?.manualProjectEstimates?.flatMap((project) => project.areas.map((area) => ({ ...area, project: project.name, url: project.url }))) ?? [];
  const estimateLines = (name: string) => manualAreas.filter((area) => area.stack.toLowerCase() === name.toLowerCase()).reduce((sum, area) => sum + area.lines, 0);
  const estimateCharacters = (name: string) => manualAreas.filter((area) => area.stack.toLowerCase() === name.toLowerCase()).reduce((sum, area) => sum + (area.characters ?? Math.round(area.lines * (area.estimatedCharactersPerLine ?? 60))), 0);
  const webglLines = estimateLines("WebGL") || 20657;
  const threeLines = estimateLines("Three.js") || 18685;
  const webglCharacters = estimateCharacters("WebGL") || webglLines * 60;
  const threeCharacters = estimateCharacters("Three.js") || threeLines * 60;
  const totalLines = codeStats?.totals.lines ?? 0;
  const totalCharacters = codeStats?.totals.characters ?? 0;
  const repositoryItems = repos.filter((repo) => !repo.fork && !repo.archived).slice(0, 4);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".cinema-chapter"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.22) {
          const id = (entry.target as HTMLElement).id;
          setActiveId(id);
          entry.target.classList.add("is-in-view");
        }
      });
    }, { threshold: [0.22, 0.4, 0.65] });
    targets.forEach((target) => observer.observe(target));
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.min(100, Math.max(0, (window.scrollY / max) * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const linkRows = [
    { name: "GitHub", handle: "@VireonNoctis", href: "https://github.com/VireonNoctis", logo: "/brands/github.svg" },
    { name: "AniList", handle: "Vireon", href: "https://anilist.co/user/Vireon", logo: "/brands/anilist.svg" },
    { name: "Last.fm", handle: "reasfeetadmirer", href: "https://last.fm/user/reasfeetadmirer", logo: "/brands/lastfm.svg" },
    { name: "Spotify", handle: "Vireon", href: "https://open.spotify.com/user/313455ps4aa6ouotajxcn34mwh4a", logo: "/brands/spotify.svg" },
    { name: "Telegram", handle: "@Imperialism12", href: "https://t.me/Imperialism12", logo: "/brands/telegram.svg" },
    { name: "Discord", handle: "Profile", href: "https://discord.com/users/1419744000977403994", logo: "/brands/discord.svg" },
  ];

  return (
    <div className="cinema-site">
      <a className="cinema-skip" href="#ink-work">Skip to the work</a>
      <header className="cinema-header">
        <a className="cinema-brand" href="#ink-top" onClick={closeMenu} aria-label="Vireon Noctis, back to opening">
          <img src="/brands/vireon-mark.svg" alt="" width="34" height="34" />
          <span><strong>VIREON / NOCTIS</strong><small>PERSONAL ARCHIVE · VOL. 01</small></span>
        </a>
        <nav className={menuOpen ? "cinema-nav is-open" : "cinema-nav"} aria-label="Cinematic archive">
          {chapters.filter((chapter) => chapter.id !== "ink-top").map((chapter) => (
            <a key={chapter.id} href={"#" + chapter.id} className={activeId === chapter.id ? "is-current" : ""} onClick={closeMenu}>
              <span>{chapter.number}</span>{chapter.label}
            </a>
          ))}
        </nav>
        <div className="cinema-header-actions"><span className="cinema-live-mark"><i /> SCROLL EXPERIENCE</span><ThemeSwitcher />
          <button type="button" className="cinema-menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </header>
      <div className="cinema-progress" aria-hidden="true"><i style={{ width: progress + "%" }} /></div>

      <main className="cinema-main">
        <section className="cinema-chapter cinema-chapter-hero is-in-view" id="ink-top" data-chapter="00">
          <div className="cinema-scene-art"><CinematicScene scene="hero" /><div className="cinema-hero-vertical">SOFTWARE / STORIES / SOUND</div><a className="cinema-round-down" href="#ink-work" aria-label="Scroll to selected work"><ArrowDownRight size={24} /></a></div>
          <div className="cinema-paper-band cinema-paper-hero">
            <div className="cinema-paper-kicker"><PaperIndex number="00" eyebrow="A PERSONAL UNIVERSE" /><span>VIREON NOCTIS / DIGITAL EDITION</span></div>
            <div className="cinema-paper-headline"><h1>MADE OF<br /><em>INK &amp; INTENT.</em></h1><div className="cinema-paper-copy"><p>Software, stories, sound, and the systems between them. A living archive of what I build, what I study, and what stays with me.</p><a className="cinema-text-link" href="#ink-work">ENTER THE ARCHIVE <ArrowUpRight size={15} /></a></div></div>
          </div>
        </section>

        <section className="cinema-chapter" id="ink-work" data-chapter="01">
          <div className="cinema-scene-art"><CinematicScene scene="projects" /><div className="cinema-art-side-note">ACT I / BUILT WORLDS</div></div>
          <div className="cinema-paper-band cinema-paper-work">
            <div className="cinema-section-intro"><PaperIndex number="01" eyebrow="SELECTED WORK" /><h2>PROJECTS<br /><em>WITH A PULSE.</em></h2><p>Tools and communities shaped through iteration, contribution, and a lot of late nights.</p></div>
            <div className="cinema-project-list">
              <a href="https://github.com/Kyerstorm/Lemegeton" target="_blank" rel="noreferrer"><span>01 / COMMUNITY SYSTEMS</span><strong>Lemegeton</strong><small>Multi-guild Discord bot · AniList · Steam · discovery</small><ArrowUpRight size={16} /></a>
              <a href="https://github.com/VireonNoctis/PrivaCage" target="_blank" rel="noreferrer"><span>02 / PRIVACY ENGINEERING</span><strong>PrivaCage</strong><small>Svelte + Rust · Android · Windows</small><ArrowUpRight size={16} /></a>
              <a href="https://lunarx.to" target="_blank" rel="noreferrer"><span>03 / COMMUNITY PLATFORM</span><strong>Lunar X</strong><small>Anime · manga · novels · game systems</small><ArrowUpRight size={16} /></a>
              <a href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer"><span>04 / PERSONAL SYSTEMS</span><strong>Utilities &amp; experiments</strong><small>Automation, tooling, and unfinished ideas</small><ArrowUpRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="cinema-chapter" id="ink-code" data-chapter="02">
          <div className="cinema-scene-art"><CinematicScene scene="code" /><div className="cinema-art-side-note">ACT II / SOURCE MATERIAL</div></div>
          <div className="cinema-paper-band cinema-paper-stats">
            <div className="cinema-section-intro"><PaperIndex number="02" eyebrow="CODE TELEMETRY" /><h2>A WHOLE LOT<br /><em>OF BUILDING.</em></h2><p>Automated repository text totals plus separately reported Lunar X estimates. These totals describe repositories, not line-by-line personal authorship.</p><a className="cinema-text-link" href="#ink-stack">TRACE THE TOOLCHAIN <ArrowUpRight size={15} /></a></div>
            <div className="cinema-stat-grid">
              <Stat label="SCANNED LINES" value={totalLines} />
              <Stat label="CHARACTERS" value={totalCharacters} />
              <Stat label="REPOSITORIES" value={codeStats?.totals.repositories ?? live.repos ?? 0} />
              <Stat label="WORDS" value={codeStats?.totals.words ?? 0} />
              <div className="cinema-estimate-strip"><span>LUNAR X / REPORTED ESTIMATES</span><div><strong>WebGL <b>20,657 lines</b></strong><small>≈ <AnimatedNumber value={webglCharacters} /> characters</small></div><div><strong>Three.js <b>18,685 lines</b></strong><small>≈ <AnimatedNumber value={threeCharacters} /> characters</small></div></div>
            </div>
          </div>
        </section>

        <section className="cinema-chapter" id="ink-stack" data-chapter="03">
          <div className="cinema-scene-art"><CinematicScene scene="stack" /><div className="cinema-art-side-note">ACT III / UNDER THE SURFACE</div></div>
          <div className="cinema-paper-band cinema-paper-stack">
            <div className="cinema-section-intro"><PaperIndex number="03" eyebrow="THE TOOLCHAIN" /><h2>EVERY LAYER<br /><em>HAS A JOB.</em></h2><p>The stack behind this website, from the interface and scene choreography to public data and static deployment.</p></div>
            <div className="cinema-stack-lines">
              <div><span>01 / INTERFACE</span><strong>Next.js + React</strong><p>Components, layouts, and page rendering.</p></div>
              <div><span>02 / BEHAVIOUR</span><strong>TypeScript</strong><p>Typed UI state, data parsing, and interactions.</p></div>
              <div><span>03 / MOTION</span><strong>Framer Motion + CSS</strong><p>Transitions, scroll reveals, and visual systems.</p></div>
              <div><span>04 / RELEASE</span><strong>GitHub Actions + Pages</strong><p>Validation, static export, and deployment.</p></div>
            </div>
          </div>
        </section>

        <section className="cinema-chapter" id="ink-learning" data-chapter="04">
          <div className="cinema-scene-art"><CinematicScene scene="learning" /><div className="cinema-art-side-note">ACT IV / STILL BECOMING</div></div>
          <div className="cinema-paper-band cinema-paper-learning">
            <div className="cinema-section-intro"><PaperIndex number="04" eyebrow="THE NEXT FRONTIER" /><h2>NOT YET<br /><em>FINISHED.</em></h2><p>Open areas to explore. Counts shown for WebGL and Three.js are the existing Lunar X estimates, integrated into each row.</p></div>
            <div className="cinema-roadmap">
              <div><span className="cinema-roadmap-state is-active" /><strong>Svelte</strong><small>IN ACTIVE USE · PrivaCage</small></div>
              <div><span className="cinema-roadmap-state" /><strong>Vue.js / Angular</strong><small>FRONTEND STUDIES</small></div>
              <div><span className="cinema-roadmap-state" /><strong>PHP · C# · Dart · Shell</strong><small>LANGUAGES &amp; TOOLING</small></div>
              <div className="cinema-roadmap-feature"><span className="cinema-roadmap-state" /><strong>WebGL</strong><small>GRAPHICS API · PLANNED</small><b>20,657 lines</b><i>≈ <AnimatedNumber value={webglCharacters} /> characters</i></div>
              <div className="cinema-roadmap-feature"><span className="cinema-roadmap-state" /><strong>Three.js</strong><small>3D LIBRARY · PLANNED</small><b>18,685 lines</b><i>≈ <AnimatedNumber value={threeCharacters} /> characters</i></div>
            </div>
          </div>
        </section>

        <section className="cinema-chapter" id="ink-archive" data-chapter="05">
          <div className="cinema-scene-art"><CinematicScene scene="archive" /><div className="cinema-art-side-note">ACT V / THINGS THAT STAY</div></div>
          <div className="cinema-paper-band cinema-paper-archive">
            <div className="cinema-section-intro"><PaperIndex number="05" eyebrow="READ / WATCH" /><h2>WORLDS THAT<br /><em>FOLLOW YOU.</em></h2><p>Anime and manga are a long-running archive in their own right, tracked through the AniList profile.</p><a className="cinema-text-link" href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer">OPEN ANILIST <ArrowUpRight size={15} /></a></div>
            <div className="cinema-media-stats">
              <Stat label="ANIME TITLES" value={live.anime ?? 0} />
              <Stat label="MANGA TITLES" value={live.manga ?? 0} />
              <Stat label="EPISODES WATCHED" value={live.animeEpisodes ?? 0} />
              <Stat label="CHAPTERS READ" value={live.mangaChapters ?? 0} />
              <div className="cinema-score-line"><span>ANIME MEAN SCORE</span><strong>{live.animeScore !== undefined ? <><AnimatedNumber value={live.animeScore} decimals={1} /><small>/100</small></> : "—"}</strong><span>MANGA MEAN SCORE</span><strong>{live.mangaScore !== undefined ? <><AnimatedNumber value={live.mangaScore} decimals={1} /><small>/100</small></> : "—"}</strong></div>
            </div>
          </div>
        </section>

        <section className="cinema-chapter" id="ink-sound" data-chapter="06">
          <div className="cinema-scene-art"><CinematicScene scene="sound" /><div className="cinema-art-side-note">ACT VI / SOUNDTRACK</div></div>
          <div className="cinema-paper-band cinema-paper-sound">
            <div className="cinema-section-intro"><PaperIndex number="06" eyebrow="LISTEN / RETURN" /><h2>THE RIGHT TRACK<br /><em>FOR THE HOUR.</em></h2><p>Spotify for the live moment; Last.fm for the long memory.</p><div className="cinema-media-links"><a href="https://open.spotify.com/user/313455ps4aa6ouotajxcn34mwh4a" target="_blank" rel="noreferrer"><img src="/brands/spotify.svg" alt="" /> Spotify <ArrowUpRight size={14} /></a><a href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer"><img src="/brands/lastfm.svg" alt="" /> Last.fm <ArrowUpRight size={14} /></a></div></div>
            <div className="cinema-track-sheet">
              <span className="cinema-track-overline"><i className={spotify.isPlaying || live.playing ? "is-playing" : ""} /> {spotify.track ? (spotify.isPlaying ? "SPOTIFY / PLAYING NOW" : "SPOTIFY / LAST TRACK") : live.track ? (live.playing ? "LAST.FM / PLAYING NOW" : "LAST.FM / LAST SCROBBLE") : "LISTENING STATUS"}</span>
              <strong>{spotify.track ?? live.track ?? "The next track hasn't surfaced yet."}</strong>
              <span>{spotify.artist ?? live.artist ?? "Live listening data"}</span>
              {spotify.albumImage ? <img className="cinema-album-art" src={spotify.albumImage} alt={"Cover art for " + (spotify.album ?? spotify.track ?? "current track")} loading="lazy" /> : <div className="cinema-disc" aria-hidden="true"><span>V / N</span></div>}
              <div className="cinema-track-footer"><span>{live.scrobbles !== undefined ? <><AnimatedNumber value={live.scrobbles} /> PLAYS LOGGED</> : "LAST.FM ARCHIVE"}</span><a href={spotify.url ?? "https://last.fm/user/reasfeetadmirer"} target="_blank" rel="noreferrer">OPEN HISTORY <ArrowUpRight size={14} /></a></div>
              <div className="cinema-top-artists"><span>TOP ARTISTS</span>{(live.topArtists ?? []).slice(0, 3).map((artist, index) => <a key={artist.name} href={artist.url ?? "https://last.fm/user/reasfeetadmirer"} target="_blank" rel="noreferrer"><i>0{index + 1}</i><strong>{artist.name}</strong><small>{artist.playcount !== undefined ? <><AnimatedNumber value={artist.playcount} /> plays</> : "Last.fm"}</small></a>)}</div>
            </div>
          </div>
        </section>

        <section className="cinema-chapter cinema-chapter-contact" id="ink-contact" data-chapter="07">
          <div className="cinema-scene-art"><CinematicScene scene="contact" /><div className="cinema-art-side-note">FINAL FRAME / OPEN CHANNEL</div></div>
          <div className="cinema-paper-band cinema-paper-contact">
            <div className="cinema-section-intro"><PaperIndex number="07" eyebrow="THE ARCHIVE CONTINUES" /><h2>LEAVE THE FRAME<br /><em>OPEN.</em></h2><p>Project proposals, technical questions, and interesting things worth sharing can start here.</p><a className="cinema-contact-button" href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer">GET IN TOUCH <ArrowUpRight size={16} /></a></div>
            <div className="cinema-contact-columns">
              <div className="cinema-social-links">{linkRows.map((item, index) => <a key={item.name} href={item.href} target="_blank" rel="noreferrer"><i>0{index + 1}</i><img src={item.logo} alt="" /><strong>{item.name}</strong><small>{item.handle}</small><ArrowUpRight size={14} /></a>)}</div>
              <div className="cinema-live-repos"><div className="cinema-live-repos-head"><span>GITHUB / LATEST PUBLIC WORK</span><a href="https://github.com/VireonNoctis?tab=repositories" target="_blank" rel="noreferrer">ALL REPOS <ArrowUpRight size={13} /></a></div>
                {repositoryItems.length ? repositoryItems.map((repo, index) => <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer"><i>0{index + 1}</i><span><strong>{repo.name}</strong><small>{repo.description?.trim() || "No description added yet."}</small></span><b>{repo.language ?? "SOURCE"}</b><ArrowUpRight size={14} /></a>) : <a href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer"><i>01</i><span><strong>GitHub</strong><small>Open the public repository index.</small></span><ArrowUpRight size={14} /></a>}
              </div>
            </div>
          </div>
          <footer className="cinema-footer"><span>© {new Date().getFullYear()} VIREON NOCTIS</span><span>MADE IN THE QUIET HOURS · KEPT IN MOTION</span><a href="#ink-top">BACK TO OPENING ↑</a></footer>
        </section>
      </main>
      <div className="cinema-side-index" aria-hidden="true"><span>{chapters.find((chapter) => chapter.id === activeId)?.number ?? "00"}</span><i /> <span>08 CHAPTERS</span></div>
    </div>
  );
}
