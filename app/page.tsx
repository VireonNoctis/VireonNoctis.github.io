"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, AudioLines, BookOpen, Github, Menu, Orbit, X } from "lucide-react";
import { NothingSystemStrip, ThemeHeroArtwork, ThemeSignatureRail, ThemeSwitcher, useCurrentTheme } from "./theme-system";

type Repo = { name: string; description: string | null; html_url: string; stargazers_count: number; language: string | null; fork: boolean; archived?: boolean; updated_at: string };
type RankedItem = { name: string; count?: number; playcount?: number; url?: string; artist?: string };
type GenreItem = { genre: string; count: number };
type Live = { repos?: number; followers?: number; anime?: number; manga?: number; scrobbles?: number; track?: string; artist?: string; playing?: boolean; animeEpisodes?: number; animeMinutes?: number; animeScore?: number; mangaChapters?: number; mangaVolumes?: number; mangaScore?: number; animeGenres?: GenreItem[]; mangaGenres?: GenreItem[]; topArtists?: RankedItem[]; topTracks?: RankedItem[] };
type CodeStats = {
  generatedAt: string;
  scope: string;
  totals: {
    repositories: number;
    failedRepositories: number;
    files: number;
    lines: number;
    nonblankLines: number;
    characters: number;
    words: number;
    stars: number;
    forks: number;
  };
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
function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="eyebrow"><i />{children}</span>; }
function IndexLabel({ n, label }: { n: string; label: string }) { return <div className="index-label"><span>{n}</span><span>{label}</span></div>; }

export default function Home() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [menu, setMenu] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [codeStats, setCodeStats] = useState<CodeStats | null>(null);
  const [codeStatsStatus, setCodeStatsStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [live, setLive] = useState<Live>({});
  const [spotify, setSpotify] = useState<SpotifyNowPlaying>({ configured: false, isPlaying: false, track: null, artist: null, album: null, albumImage: null, url: null });
  const [year, setYear] = useState("2026");
  useEffect(() => {
    setYear(String(new Date().getFullYear()));
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
              "repositories", "failedRepositories", "files", "lines", "nonblankLines",
              "characters", "words", "stars", "forks",
            ];
            const valid = typeof candidate.generatedAt === "string" &&
              Boolean(totals) &&
              validKeys.every((key) => Number.isFinite(totals?.[key]));
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
  const activeTheme = useCurrentTheme();
  const themeCopy = activeTheme === "nothing"
    ? { kicker: "PERSONAL SYSTEM LOG / 001", lineOne: "Things I", lineTwo: "won’t leave", emphasis: "UNINDEXED.", description: "Software. Stories. Signal. Everything worth keeping, in one place." }
    : activeTheme === "light"
      ? { kicker: "A collection of work, worlds, and notes worth keeping.", lineOne: "A world", lineTwo: "of curious", emphasis: "things.", description: "Selected projects, stories, and sounds — arranged with a little more room to breathe." }
      : { kicker: "A personal archive of things I keep coming back to.", lineOne: "Things I", lineTwo: "can’t leave", emphasis: "alone.", description: "Software, anime, music, and the rabbit holes that take over an evening." };
  const motionRise = reduce ? {} : rise;
  return <main id="main-content" tabIndex={-1} onKeyDown={event=>{if(event.key==="Escape")setMenu(false)}}><a className="skip-link" href="#content-start">Skip to content</a>
    <motion.div className="reading-progress" style={{scaleX:progress}} />
    <div className="atmosphere" aria-hidden="true"><div className="atmosphere-grid"/><motion.div className="aurora aurora-one" animate={reduce?{}:{x:[0,38,-18,0],y:[0,-22,16,0],rotate:[0,7,-4,0],scale:[1,1.08,.97,1]}} transition={{duration:25,repeat:Infinity,ease:"easeInOut"}}/><motion.div className="aurora aurora-two" animate={reduce?{}:{x:[0,-32,16,0],y:[0,20,-16,0],rotate:[0,-9,4,0]}} transition={{duration:31,repeat:Infinity,ease:"easeInOut"}}/><div className="grain"/></div>
    <header className="site-header"><a className="wordmark" href="#top" aria-label="Vireon — The Slop King, home" onClick={()=>setMenu(false)}><img className="wordmark-logo" src="/brands/vireon-mark.svg" alt="" width="42" height="42"/><span className="wordmark-copy"><strong>VIREON</strong><small>THE SLOP KING <span aria-hidden="true">👑</span></small></span></a><nav id="primary-navigation" className={menu?"navigation navigation-open":"navigation"} aria-label="Main navigation">{[["Index","#top"],["Manifesto","#manifesto"],["Selected work","#work"],["Tech stack","#stack"],["Learning","#learning"],["Archive","#archive"]].map(([label,href],i)=><a key={href} href={href} onClick={()=>setMenu(false)}><span className="nav-index">0{i+1}</span>{label}</a>)}<a className="nav-contact" href="#contact" onClick={()=>setMenu(false)}>Get in touch <ArrowUpRight size={14}/></a></nav><ThemeSwitcher /><button className="menu-toggle" onClick={()=>setMenu(v=>!v)} aria-label={menu?"Close navigation":"Open navigation"} aria-controls="primary-navigation" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></header>
    <NothingSystemStrip />
    <ThemeSignatureRail />
    <section className="hero section-shell" id="top"><span id="content-start" className="content-start" aria-hidden="true"/><div className="hero-meta"><Eyebrow>PERSONAL INDEX / EST. IN THE QUIET HOURS</Eyebrow><span className="coordinates">INDEPENDENT / ONLINE<br/>OPEN TO THE WORLD</span></div><div className="hero-main"><motion.div className="hero-copy" variants={sequence} initial="hidden" animate="show"><motion.p className="hero-kicker" variants={motionRise}>{themeCopy.kicker}</motion.p><motion.h1 variants={motionRise}>{themeCopy.lineOne}<br/>{themeCopy.lineTwo} <em>{themeCopy.emphasis}</em></motion.h1><motion.div className="hero-bottomline" variants={motionRise}><p>{themeCopy.description}</p><a className="round-link" href="#manifesto" aria-label="Discover the archive"><ArrowDownRight size={21}/></a></motion.div></motion.div><div className="hero-art editorial-index editorial-index-slop" role="group" aria-label="Vireon — The Slop King">
  <ThemeHeroArtwork />
  <div className="slop-card-aura" aria-hidden="true">
    <span className="slop-halo slop-halo-one"/>
    <span className="slop-halo slop-halo-two"/>
    <span className="slop-orbit slop-orbit-one"/>
    <span className="slop-orbit slop-orbit-two"/>
    <span className="slop-orbit-dot slop-orbit-dot-one"/>
    <span className="slop-orbit-dot slop-orbit-dot-two"/>
    <span className="slop-star slop-star-one">✦</span>
    <span className="slop-star slop-star-two">✧</span>
    <span className="slop-star slop-star-three">✦</span>
  </div>
  <div className="editorial-index-top slop-panel-top"><span>V / 001</span><span className="slop-live-label"><i/> BRAND IN MOTION</span></div>
  <div className="slop-brand-lockup">
    <div className="slop-brand-overline"><span>PERSONAL BRAND</span><span>EDITION N° 01</span></div>
    <div className="slop-brand-vireon">VIREON<span className="slop-brand-spark" aria-hidden="true">✦</span></div>
    <div className="slop-brand-divider" aria-hidden="true"><i/><span>✧</span><i/></div>
    <div className="slop-brand-title"><span>The Slop King</span><span className="slop-king-crown" aria-label="crown">👑</span></div>
    <p className="slop-brand-caption">CURATOR OF CONTROLLED CHAOS</p>
    <div className="slop-brand-signature" aria-hidden="true"><span>V</span><i/><span>SK</span></div>
  </div>
  <div className="editorial-index-rule slop-panel-rule"/>
  <div className="editorial-index-bottom slop-panel-bottom"><span>SOFTWARE / STORIES / SOUND</span><span>V—∞</span></div>
  <div className="editorial-index-side slop-panel-side">NO GATEKEEPING / JUST VIBES</div>
</div></div><div className="hero-foot"><span>INDEPENDENT BY NATURE</span><span className="hero-foot-center"><i className="live-dot"/> DIGITAL PRESENCE / ONLINE</span><span>SCROLL TO EXPLORE <i className="scroll-line"/></span></div></section>
    <div className="marquee" aria-label="Code, imagination, atmosphere, intention"><div className="marquee-track" aria-hidden="true">{Array.from({length:4},(_,i)=><span key={i}>CODE <b>✳</b> IMAGINATION <b>✳</b> ATMOSPHERE <b>✳</b> INTENTION <b>✳</b> </span>)}</div></div>
    <section className="manifesto section-shell section-space" id="manifesto"><IndexLabel n="01 / 06" label="THE POINT OF VIEW"/><div className="manifesto-content"><motion.div className="section-heading" initial="hidden" whileInView="show" viewport={{once:true,amount:.25}} variants={sequence}><motion.div variants={motionRise}><Eyebrow>A PERSONAL MANIFESTO</Eyebrow></motion.div><motion.h2 variants={motionRise}>Curiosity,<br/><em>with a commit history.</em></motion.h2></motion.div><motion.div className="manifesto-text" initial="hidden" whileInView="show" viewport={{once:true,amount:.2}} variants={sequence}><motion.p className="lead" variants={motionRise}>I like making useful things, pulling apart how they work, then making them feel unmistakably mine.</motion.p><motion.p variants={motionRise}>Here are my projects, the stories I get lost in, the music on repeat, and the experiments that escape the notes app.</motion.p><motion.a className="text-link" variants={motionRise} href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer">THE PERSON BEHIND THE PIXELS <ArrowUpRight size={16}/></motion.a></motion.div></div><div className="manifesto-aside"><span className="aside-rule"/><p>01 — A quiet kind of ambition.</p><p>Built, broken, rebuilt. Usually more than once.</p></div></section>
    <section className="work section-shell section-space" id="work"><div className="section-topline"><IndexLabel n="02 / 06" label="SELECTED WORK"/><Eyebrow>BUILT, MAINTAINED, ITERATED</Eyebrow></div><div className="work-heading"><motion.h2 initial="hidden" whileInView="show" viewport={{once:true}} variants={motionRise}>Projects, not<br/><em>case studies.</em></motion.h2><p>A few things I’ve spent real time on. Some are polished; some are still becoming.</p></div><div className="project-list">
<a className="project-feature" href="https://github.com/Kyerstorm/Lemegeton" target="_blank" rel="noreferrer">
  <div className="project-art lunar-art"><div className="lunar-moon"/><div className="lunar-ring"/><span>01 — COMMUNITY SYSTEMS</span><motion.div className="lunar-star" animate={reduce?{}:{rotate:360}} transition={{duration:45,repeat:Infinity,ease:"linear"}}>✳</motion.div></div>
  <div className="project-detail"><div className="project-index">01 <span>/ SOFTWARE</span></div><div><div className="project-title-row"><img className="project-logo project-logo-large" src="/brands/lemegeton.svg" alt="" width="44" height="44"/><div><h3>Lemegeton</h3><p><em>One bot. Many communities. More ways to discover.</em><br/>A multi-guild Discord bot bringing anime, manga, light novels, general novels, and Steam discovery together. It combines AniList-linked profiles, recommendations, media browsing, leaderboards, custom roles, per-server dashboards, moderation utilities, notifications, and automated GitHub commit updates.</p></div></div><div className="tag-row"><span>MULTI-GUILD</span><span>ANILIST + STEAM</span><span>MEDIA DISCOVERY</span><span>SERVER AUTOMATION</span></div></div><span className="project-arrow"><ArrowUpRight/></span></div>
</a>
<a className="project-row" href="https://github.com/VireonNoctis/PrivaCage" target="_blank" rel="noreferrer">
  <span className="project-index">02 / 04</span><div className="project-title-row"><img className="project-logo" src="/brands/privacage.svg" alt="" width="34" height="34"/><div><h3>PrivaCage</h3><p><em>Understand what your device exposes. Block what you can. Know what you cannot.</em><br/>A local-first privacy auditor for Android and Windows, backed by a Svelte + Rust web console. It brings together tracker intelligence, local app and metadata inspection, Android DNS/VPN work, and narrow, reversible Windows policy controls—without pretending any tool can make a device completely anonymous.</p></div></div><span className="project-type">PRIVACY / ANDROID + WINDOWS</span><ArrowUpRight className="row-arrow" size={19}/>
</a>
<a className="project-row" href="https://lunarx.to" target="_blank" rel="noreferrer">
  <span className="project-index">03 / 04</span><div className="project-title-row"><img className="project-logo" src="/brands/lunarx.svg" alt="" width="34" height="34"/><div><h3>Lunar X</h3><p>A community platform for anime, manga, and novel discovery, profile customisation, progression, gacha/game systems, and the infrastructure that keeps its social features moving.</p></div></div><span className="project-type">PLATFORM / COMMUNITY</span><ArrowUpRight className="row-arrow" size={19}/>
</a>
<a className="project-row" href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer">
  <span className="project-index">04 / 04</span><div className="project-title-row"><img className="project-logo" src="/brands/vireon-mark.svg" alt="" width="34" height="34"/><div><h3>Personal systems</h3><p>Small utilities, profile tooling, automation, and experiments made to reduce friction and make digital life more considered.</p></div></div><span className="project-type">TOOLS / EXPERIMENTS</span><ArrowUpRight className="row-arrow" size={19}/>
</a>
</div><div className="github-live"><div className="github-live-icon"><Github size={19}/></div><div><span className="micro-label">LIVE FROM GITHUB</span><p>{live.repos!==undefined?live.repos+" public repositories":"A growing collection of open work"}{live.followers!==undefined?" · "+live.followers+" followers":""}</p></div><a href="https://github.com/VireonNoctis?tab=repositories" target="_blank" rel="noreferrer">EXPLORE REPOSITORIES <ArrowUpRight size={15}/></a></div><section className="code-footprint" aria-label="Automated public repository code footprint" aria-busy={codeStatsStatus === "loading"}>
  <div className="code-footprint-heading"><span className="micro-label">CODE FOOTPRINT / AUTO-SYNCED</span><span className="code-footprint-updated">{codeStats ? "UPDATED " + new Date(codeStats.generatedAt).toLocaleDateString("en-IE", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : codeStatsStatus === "loading" ? "FETCHING LATEST SNAPSHOT" : "FIRST SNAPSHOT PENDING"}</span></div>
  {codeStats ? <><div className="code-footprint-grid">
    {[
      { label: "TEXT CHARACTERS", value: codeStats.totals.characters, note: "Line breaks excluded" },
      { label: "TEXT LINES", value: codeStats.totals.lines, note: codeStats.totals.nonblankLines.toLocaleString("en-US") + " non-blank" },
      { label: "WORDS", value: codeStats.totals.words, note: "Code, config and docs" },
      { label: "TRACKED FILES", value: codeStats.totals.files, note: "Text files only" },
      { label: "PUBLIC PROJECTS", value: codeStats.totals.repositories, note: codeStats.totals.failedRepositories + " scan failures" },
      { label: "STARS / FORKS", value: codeStats.totals.stars.toLocaleString("en-US") + " / " + codeStats.totals.forks.toLocaleString("en-US"), note: "Across scanned projects" },
    ].map(metric => <div className="code-footprint-metric" key={metric.label}><span>{metric.label}</span><strong>{typeof metric.value === "number" ? metric.value.toLocaleString("en-US") : metric.value}</strong><small>{metric.note}</small></div>)}
  </div><p className="code-footprint-note">Current text footprint across public, non-fork projects on their default branches. Dependency/build output, lockfiles, binaries, and files over 1 MB are excluded. This is not a line-by-line claim of individual authorship.</p></> : <p className="code-footprint-note">{codeStatsStatus === "loading" ? "The repository scan is being fetched from the profile repository." : "The automated scan has not published its first snapshot yet. GitHub Actions will populate this panel automatically."}</p>}
  <a className="code-footprint-link" href="https://github.com/VireonNoctis/VireonNoctis#codebase-footprint-automatically-refreshed" target="_blank" rel="noreferrer">OPEN GENERATED BREAKDOWN <ArrowUpRight size={13}/></a>
</section>{repos.length>0&&<div className="repo-live-area">
  <div className="repo-live-heading"><span className="micro-label">LATEST PUBLIC REPOSITORIES · AUTO-SYNCED</span><span className="repo-live-count">Sorted by latest update</span></div>
  <div className="repo-live-list">{repos.map((repo,i)=><motion.a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer" aria-label={`Open GitHub repository ${repo.name}`} initial="hidden" whileInView="show" viewport={{once:true}} variants={motionRise} transition={{delay:i*.06}}>
    <span className="repo-row-index">{String(i+1).padStart(2,"0")}</span>
    <div className="repo-live-copy"><strong>{repo.name}</strong><small>{repo.description?.trim()||"No repository description has been added yet."}</small><span className="repo-live-meta">{repo.language?<span className="repo-language">{repo.language}</span>:<span className="repo-language is-unspecified">Language not detected</span>}<span className="repo-updated">Updated {repo.updated_at.slice(0,10)}</span></span></div>
    <span className="repo-stars">✳ {repo.stargazers_count}</span><ArrowUpRight size={15} aria-hidden="true"/>
  </motion.a>)}</div>
</div>}</section>
    <section className="stack section-shell section-space" id="stack"><div className="section-topline"><IndexLabel n="03 / 06" label="THE TOOLKIT"/><Eyebrow>TOOLS ARE A MEANS, NOT A PERSONALITY</Eyebrow></div><div className="stack-heading"><motion.div initial="hidden" whileInView="show" viewport={{once:true,amount:.2}} variants={sequence}><motion.span variants={motionRise} className="eyebrow"><i/> THE CRAFT, UNDER THE SURFACE</motion.span><motion.h2 variants={motionRise}>Built with intent.<br/><em>Powered by curiosity.</em></motion.h2></motion.div><p>The languages, frameworks, and systems I reach for — plus the stack that brings this little corner of the internet to life.</p></div><div className="stack-site"><div className="stack-site-top"><div><span className="micro-label">01 / THIS WEBSITE</span><h3>The Vireon stack</h3></div><span className="stack-status"><i/> STATIC / DEPLOYED</span></div><p className="stack-site-copy">A React-powered Next.js experience, exported for GitHub Pages, with motion kept purposeful and the interface tuned to the details.</p><div className="stack-site-grid">{[{name:"Next.js",detail:"Framework",logo:"nextdotjs"},{name:"React",detail:"UI library",logo:"react"},{name:"TypeScript",detail:"Typed JavaScript",logo:"typescript"},{name:"Framer Motion",detail:"Motion design",logo:"framer"},{name:"CSS",detail:"Visual system",logo:"css3"},{name:"Lucide",detail:"Iconography",logo:"lucide"},{name:"GitHub Pages",detail:"Static hosting",logo:"github"}].map((t,i)=><div className="stack-site-item" key={t.name}><span className="stack-brand-mark"><img src={`/brands/tech-${t.logo}.svg`} alt="" loading="lazy"/></span><span><strong>{t.name}</strong><small>{t.detail}</small></span><span className="stack-item-index">{String(i+1).padStart(2,"0")}</span></div>)}</div></div><div className="stack-categories"><div className="stack-category"><div className="stack-category-head"><span>02</span><div><h3>Languages &amp; workflow</h3><p>Programming languages plus YAML-based automation workflows.</p></div></div><div className="stack-brand-chips">{[{name:"C++",logo:"cplusplus"},{name:"Rust",logo:"rust"},{name:"Java",logo:"openjdk"},{name:"JavaScript",logo:"javascript"},{name:"Python",logo:"python"},{name:"Lua",logo:"lua"},{name:"Swift",logo:"swift"},{name:"Go",logo:"go"},{name:"Batch",logo:"windowsterminal"},{name:"HTML",logo:"html5"},{name:"CSS",logo:"css3"},{name:"Kotlin",logo:"kotlin"},{name:"Ruby",logo:"ruby"},{name:"YAML",logo:"yaml"},{name:"GitHub Actions",logo:"githubactions"}].map((t,i)=><span className="stack-chip stack-branded-chip" key={t.name}><img src={`/brands/tech-${t.logo}.svg`} alt="" loading="lazy"/><span>{t.name}</span><i>{String(i+1).padStart(2,"0")}</i></span>)}</div></div><div className="stack-category"><div className="stack-category-head"><span>03</span><div><h3>Frameworks &amp; interfaces</h3><p>From web experiences to application logic.</p></div></div><div className="stack-brand-chips">{[{name:"Next.js",logo:"nextdotjs"},{name:"React",logo:"react"}].map(t=><span className="stack-chip stack-branded-chip" key={t.name}><img src={`/brands/tech-${t.logo}.svg`} alt="" loading="lazy"/><span>{t.name}</span></span>)}</div></div><div className="stack-category"><div className="stack-category-head"><span>04</span><div><h3>Data &amp; storage</h3><p>Relational, embedded, and distributed systems.</p></div></div><div className="stack-brand-chips">{[{name:"PostgreSQL",logo:"postgresql"},{name:"SQLite",logo:"sqlite"},{name:"aiosqlite",logo:"python"},{name:"ScyllaDB",logo:"scylladb"}].map(t=><span className="stack-chip stack-branded-chip" key={t.name}><img src={`/brands/tech-${t.logo}.svg`} alt="" loading="lazy"/><span>{t.name}</span></span>)}</div></div><div className="stack-category"><div className="stack-category-head"><span>05</span><div><h3>Editors &amp; terminal</h3><p>Command-line navigation, keyboard-driven editing, and a full-project editor.</p></div></div><div className="stack-brand-chips">{[{name:"Terminal / CLI",logo:"terminal"},{name:"Vim",logo:"vim"},{name:"Neovim",logo:"neovim"},{name:"Visual Studio Code",logo:"vscode"}].map(t=><span className="stack-chip stack-branded-chip" key={t.name}><img src={`/brands/tech-${t.logo}.svg`} alt="" loading="lazy"/><span>{t.name}</span></span>)}</div></div><div className="stack-category"><div className="stack-category-head"><span>06</span><div><h3>Infrastructure &amp; tooling</h3><p>Packaging, shipping, and keeping things running.</p></div></div><div className="stack-brand-chips">{[{name:"Docker",logo:"docker"},{name:"Git",logo:"git"},{name:"GitHub Actions · YAML",logo:"githubactions"}].map(t=><span className="stack-chip stack-branded-chip" key={t.name}><img src={`/brands/tech-${t.logo}.svg`} alt="" loading="lazy"/><span>{t.name}</span></span>)}</div></div></div><div className="stack-footnote"><span className="stack-footnote-symbol">✳</span><p><strong>A living toolkit.</strong> Not every tool belongs in every project. The point is to choose deliberately, learn constantly, and make the result feel considered.</p><span className="stack-footnote-end">VN / STACK INDEX</span></div></section>
    <section className="learning section-shell section-space" id="learning"><div className="section-topline"><IndexLabel n="04 / 06" label="THE NEXT FRONTIER"/><Eyebrow>ALWAYS A STUDENT OF THE CRAFT</Eyebrow></div><div className="learning-heading"><div><span className="eyebrow"><i/> CURRENTLY ON THE RADAR</span><h2>Still becoming.<br/><em>Never finished.</em></h2></div><p>Six technologies on my learning shortlist. Not badges collected — skills to explore, build with, and earn through practice.</p></div><div className="learning-grid">{[{name:"Svelte",logo:"svelte",kind:"FRONTEND",note:"A lean, compiler-first way to build interfaces."},{name:"Vue.js",logo:"vuedotjs",kind:"FRONTEND",note:"A progressive approach to reactive UI."},{name:"Angular",logo:"angular",kind:"FRAMEWORK",note:"A full framework for structured web apps."},{name:"PHP",logo:"php",kind:"LANGUAGE",note:"Server-side web development and the wider PHP ecosystem."},{name:"C#",logo:"csharp",kind:"LANGUAGE",note:"Modern application development across the .NET ecosystem."},{name:"Dart",logo:"dart",kind:"LANGUAGE",note:"A strongly typed language for cross-platform applications."}].map((t,i)=><motion.article className="learning-card" key={t.name} initial={reduce?false:{opacity:0,y:20}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.55,delay:i*.055}}><div className="learning-card-top"><span className="learning-number">0{i+1} / 06</span><span className="learning-kind">{t.kind}</span></div><div className="learning-brand"><span className="learning-logo"><img src={`/brands/tech-${t.logo}.svg`} alt="" loading="lazy"/></span><div><h3>{t.name}</h3><span>ON THE LEARNING LIST</span></div></div><p>{t.note}</p><div className="learning-card-bottom"><span className="learning-pulse"/><span>UP NEXT</span><ArrowUpRight size={15}/></div></motion.article>)}</div><div className="learning-note"><span>VN / FIELD NOTES</span><p>Learning status is intentionally honest: these are planned explorations, not claims of proficiency.</p></div></section>
    <section className="interlude" aria-label="A moment of stillness"><div className="interlude-lines"/><motion.div className="interlude-inner" initial={reduce?false:{opacity:0,y:28}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.4}} transition={{duration:1.2}}><span className="interlude-mark">“</span><p>Make it because<br/><em>you care about it.</em></p><span className="interlude-credit">A PRINCIPLE, NOT A SLOGAN</span></motion.div><motion.div className="interlude-orbit" animate={reduce?{}:{rotate:-360}} transition={{duration:65,repeat:Infinity,ease:"linear"}}><Orbit strokeWidth={.6}/></motion.div></section>
    <section className="archive section-shell section-space" id="archive"><div className="section-topline"><IndexLabel n="05 / 06" label="THE OPEN TABS"/><Eyebrow>WHAT STAYS IN ROTATION</Eyebrow></div><motion.div className="archive-heading" initial="hidden" whileInView="show" viewport={{once:true}} variants={sequence}><motion.h2 variants={motionRise}>What’s open<br/><em>in another tab.</em></motion.h2><motion.p variants={motionRise}>The stuff I read, watch, and listen to when I’m not building.</motion.p></motion.div><div className="archive-grid"><motion.a className="archive-card archive-anime" href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer" initial={reduce?false:{opacity:0,y:35}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:.85}}><div className="archive-card-top"><img className="social-logo" src="/brands/anilist.svg" alt="" width="22" height="22"/><span>READ / WATCH</span><ArrowUpRight size={16}/></div><div className="archive-illustration anime-illustration"><div className="book-shape book-one"/><div className="book-shape book-two"/><div className="book-shape book-three"/><span className="illustration-star">✳</span></div><div className="archive-card-bottom"><h3>Stories &amp; worlds</h3><p>Anime, manga, long arcs, impossible worlds.</p><div className="archive-stats"><span><strong>{live.anime?.toLocaleString()??"—"}</strong> anime</span><span><strong>{live.manga?.toLocaleString()??"—"}</strong> manga</span></div><span className="archive-link">OPEN ANILIST <ArrowUpRight size={14}/></span></div></motion.a><motion.div className="archive-card archive-music" initial={reduce?false:{opacity:0,y:35}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:.85,delay:.14}}><div className="archive-card-top"><div className="archive-brandmarks"><img src="/brands/lastfm.svg" alt="Last.fm" width="22" height="22"/><img src="/brands/spotify.svg" alt="Spotify" width="22" height="22"/></div><span>LISTEN / RETURN</span><ArrowUpRight size={16}/></div><div className="archive-illustration music-illustration"><motion.div className="vinyl" animate={reduce?{}:{rotate:360}} transition={{duration:18,repeat:Infinity,ease:"linear"}}><div className="vinyl-label"/></motion.div><div className="sound-wave">{Array.from({length:21},(_,i)=><i key={i} style={{"--i":i, "--h":(12+(i%7)*11)+"px"} as React.CSSProperties}/>)}</div></div><div className="archive-card-bottom"><h3>Soundtrack to anything</h3><p>Spotify for the live moment; Last.fm for the long memory.</p><div className="now-playing"><i className={spotify.isPlaying||(!spotify.track&&live.playing)?"live-dot":"idle-dot"}/><span>{spotify.track?(spotify.isPlaying?"SPOTIFY · PLAYING NOW":"SPOTIFY · PAUSED")+" — "+spotify.track+" — "+(spotify.artist??"Unknown artist"):live.track?(live.playing?"LAST.FM · PLAYING NOW":"LAST.FM · LAST SCROBBLE")+" — "+live.track+" — "+(live.artist??"Unknown artist"):spotify.configured?"NOTHING PLAYING ON SPOTIFY · LAST.FM IS QUIET":"SPOTIFY LIVE STATUS NEEDS SETUP"}</span></div>{spotify.track&&spotify.albumImage&&<div className="spotify-track"><img src={spotify.albumImage} alt={`Cover art for ${spotify.album??spotify.track}`} loading="lazy"/><div><span className="micro-label">{spotify.isPlaying?"ON SPOTIFY NOW":"SPOTIFY / LAST TRACK"}</span><strong>{spotify.track}</strong><small>{spotify.artist??"Unknown artist"}{spotify.album?" · "+spotify.album:""}</small></div>{spotify.url&&<a href={spotify.url} target="_blank" rel="noreferrer" aria-label={`Open ${spotify.track} on Spotify`}><ArrowUpRight size={14}/></a>}</div>}<div className="archive-stats"><span><strong>{live.scrobbles?.toLocaleString()??"—"}</strong> plays logged on Last.fm</span></div><div className="archive-actions"><a className="archive-link" href="https://open.spotify.com/user/313455ps4aa6ouotajxcn34mwh4a" target="_blank" rel="noreferrer">OPEN SPOTIFY PROFILE <ArrowUpRight size={14}/></a><a className="archive-link" href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer">OPEN LAST.FM HISTORY <ArrowUpRight size={14}/></a></div></div></motion.div></div><div className="signal-grid">
        <motion.section className="signal-panel anilist-detail" initial={reduce?false:{opacity:0,y:24}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8}}>
          <div className="signal-panel-head"><div><img src="/brands/anilist.svg" alt="" width="20" height="20"/><span className="micro-label">ANILIST / LIBRARY TELEMETRY</span></div><span className="signal-live"><i/> PUBLIC DATA</span></div>
          <h3>More than a watchlist.</h3><p className="signal-intro">A deeper read on anime and manga logged to the profile, drawn from public AniList statistics.</p>
          <div className="deep-stats">
            <div><span>EPISODES WATCHED</span><strong>{live.animeEpisodes?.toLocaleString()??"—"}</strong></div><div><span>HOURS WATCHED</span><strong>{live.animeMinutes!==undefined?Math.round(live.animeMinutes/60).toLocaleString():"—"}</strong></div>
            <div><span>CHAPTERS READ</span><strong>{live.mangaChapters?.toLocaleString()??"—"}</strong></div><div><span>VOLUMES READ</span><strong>{live.mangaVolumes?.toLocaleString()??"—"}</strong></div>
            <div><span>ANIME MEAN SCORE</span><strong>{live.animeScore?live.animeScore+"/100":"—"}</strong></div><div><span>MANGA MEAN SCORE</span><strong>{live.mangaScore?live.mangaScore+"/100":"—"}</strong></div>
          </div>
          <div className="genre-columns"><div><span className="micro-label">ANIME GENRES</span>{(live.animeGenres??[]).map(g=><div className="genre-row" key={g.genre}><span>{g.genre}</span><div><i style={{width:(g.count/Math.max(1,...(live.animeGenres??[]).map(x=>x.count))*100)+"%"}}/></div><small>{g.count}</small></div>)}{!live.animeGenres?.length&&<p className="empty-data">Waiting for AniList statistics…</p>}</div>
            <div><span className="micro-label">MANGA GENRES</span>{(live.mangaGenres??[]).map(g=><div className="genre-row" key={g.genre}><span>{g.genre}</span><div><i style={{width:(g.count/Math.max(1,...(live.mangaGenres??[]).map(x=>x.count))*100)+"%"}}/></div><small>{g.count}</small></div>)}{!live.mangaGenres?.length&&<p className="empty-data">Waiting for AniList statistics…</p>}</div></div>
          <a className="signal-footer-link" href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer">EXPLORE THE FULL PROFILE <ArrowUpRight size={14}/></a>
        </motion.section>
        <motion.section className="signal-panel lastfm-detail" initial={reduce?false:{opacity:0,y:24}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8,delay:.12}}>
          <div className="signal-panel-head"><div><img src="/brands/lastfm.svg" alt="" width="20" height="20"/><span className="micro-label">LAST.FM / LISTENING INDEX</span></div><span className="signal-live"><i/> SCROBBLE DATA</span></div>
          <h3>Patterns in the noise.</h3><p className="signal-intro">All-time listening favourites, ranked by the plays recorded on Last.fm.</p>
          <div className="ranked-lists"><div><span className="micro-label">TOP ARTISTS</span>{(live.topArtists??[]).map((item,i)=><a className="ranked-row" key={item.name} href={item.url||"https://last.fm/user/reasfeetadmirer"} target="_blank" rel="noreferrer"><span>{String(i+1).padStart(2,"0")}</span><strong>{item.name}</strong><small>{item.playcount?.toLocaleString()??"—"} plays</small><ArrowUpRight size={12}/></a>)}{!live.topArtists?.length&&<p className="empty-data">Loading the most-played artists…</p>}</div>
            <div><span className="micro-label">TOP TRACKS</span>{(live.topTracks??[]).map((item,i)=><a className="ranked-row" key={item.name+"-"+item.artist} href={item.url||"https://last.fm/user/reasfeetadmirer"} target="_blank" rel="noreferrer"><span>{String(i+1).padStart(2,"0")}</span><strong>{item.name}<small>{item.artist}</small></strong><small>{item.playcount?.toLocaleString()??"—"} plays</small><ArrowUpRight size={12}/></a>)}{!live.topTracks?.length&&<p className="empty-data">Loading the most-played tracks…</p>}</div></div>
          <a className="signal-footer-link" href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer">OPEN LISTENING HISTORY <ArrowUpRight size={14}/></a>
        </motion.section>
        <motion.section className="signal-panel discord-detail" initial={reduce?false:{opacity:0,y:24}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8,delay:.2}}>
          <div className="signal-panel-head"><div><img src="/brands/discord.svg" alt="" width="20" height="20"/><span className="micro-label">DISCORD / COMMUNITY</span></div></div>
          <h3>Find me on Discord.</h3>
          <p className="signal-intro">Open the Discord profile directly.</p>
          <a className="signal-footer-link" href="https://discord.com/users/1419744000977403994" target="_blank" rel="noreferrer">OPEN DISCORD PROFILE <ArrowUpRight size={14}/></a>
        </motion.section>
      </div><div className="archive-note"><span className="note-index">NOTE 03.1</span><p>Currently in orbit: worldbuilding, interface systems, dark fantasy, and finding the right track for the right hour.</p><span className="note-symbol">✳</span></div></section>
    <section className="contact section-shell section-space" id="contact"><div className="section-topline"><IndexLabel n="06 / 06" label="OPEN CHANNEL"/><Eyebrow>EVERY GOOD THING STARTS SOMEWHERE</Eyebrow></div><div className="contact-main"><motion.h2 initial="hidden" whileInView="show" viewport={{once:true}} variants={motionRise}>Have a good<br/><em>reason to talk?</em></motion.h2><motion.a className="contact-circle" href="https://github.com/VireonNoctis" target="_blank" rel="noreferrer" aria-label="Open GitHub profile" whileTap={{scale:.94}}><ArrowUpRight size={31}/><span>START<br/>HERE</span></motion.a></div><p className="contact-copy">Ideas, collaborations, questions, or a conversation about something worth making. The channel is open.</p><div className="social-list">{socials.map((s,i)=><motion.a key={s.name} href={s.href} target="_blank" rel="noreferrer" initial={{opacity:0,x:-16}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*.07}}><span className="social-number">0{i+1}</span><img className="social-logo" src={"/brands/"+s.logo+".svg"} alt="" width="22" height="22"/><strong>{s.name}</strong><span className="social-handle">{s.handle}</span><ArrowUpRight size={17}/></motion.a>)}</div></section>
    <section className="lunar-profile section-shell section-space" id="lunar-profile"><div className="section-topline"><IndexLabel n="LIVE / LUNAR X" label="PROFILE REDIRECTION"/><Eyebrow>OPEN PROFILE</Eyebrow></div><div className="work-heading"><h2>Lunar X,<br/><em>over there.</em></h2><p>Visit the Lunar X profile directly.</p></div><a className="signal-footer-link" href="https://lunarx.to/profile/vvvx" target="_blank" rel="noreferrer">OPEN LUNAR X PROFILE <ArrowUpRight size={14}/></a></section>
    <footer className="site-footer"><a className="footer-mark" href="#top" aria-label="Vireon — The Slop King, back to top"><img className="footer-wordmark" src="/brands/vireon-wordmark.svg" alt="Vireon — The Slop King" width="180" height="42"/></a><p>MADE IN THE QUIET HOURS.<br/><span>KEPT IN MOTION.</span></p><span className="footer-year">© {year} VIREON</span><a className="back-top" href="#top">BACK TO THE BEGINNING <ArrowUpRight size={14}/></a></footer>
  </main>;
}
