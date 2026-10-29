"use client";

import { useEffect, useState } from "react";
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

function CinematicIllustration({ scene }: { scene: SceneKind }) {
  const prefix = "ink-" + scene;
  const hatching = "url(#hatch-" + scene + ")";
  const stripes = "url(#stripes-" + scene + ")";
  return (
    <svg className={"cinema-artwork cinema-artwork-" + scene} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label={"Original illustrated " + scene + " scene"}>
      <defs>
        <pattern id={"hatch-" + scene} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(19)">
          <path d="M0 0V14" stroke="#130b0c" strokeWidth="3" opacity=".8" />
        </pattern>
        <pattern id={"stripes-" + scene} width="38" height="38" patternUnits="userSpaceOnUse">
          <rect width="38" height="38" fill="#f4eee6" />
          <path d="M0 0V38M8 0V38M29 0V38" stroke="#d2c5bd" strokeWidth="4" />
          <path d="M17 0V38" stroke="#fffaf3" strokeWidth="7" />
        </pattern>
        <linearGradient id={"redglow-" + scene} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff1832" />
          <stop offset=".6" stopColor="#d90824" />
          <stop offset="1" stopColor="#790817" />
        </linearGradient>
        <linearGradient id={"paper-" + scene} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf3" />
          <stop offset="1" stopColor="#d7ccc3" />
        </linearGradient>
        <clipPath id={"frame-" + scene}><rect width="1600" height="900" /></clipPath>
      </defs>
      <g clipPath={"url(#frame-" + scene + ")"} className="cinema-art-base">
        {scene === "hero" && <>
          <rect width="1600" height="900" fill="#b80820" />
          <path d="M0 0H930L1050 900H0Z" fill="#ed0a27" />
          <path d="M930 0H1600V900H1038Z" fill="#8b071b" />
          <path d="M24 0L208 900M116 0L308 900M238 0L420 900M360 0L545 900M500 0L686 900M644 0L812 900M780 0L942 900" stroke="#510615" strokeWidth="7" opacity=".8" />
          <path d="M35 0L180 900M294 0L412 900M567 0L680 900M833 0L950 900" stroke="#ff4150" strokeWidth="3" opacity=".55" />
          <path d="M0 530L260 486L570 544L900 503L1178 540L1600 492V900H0Z" fill="#090808" />
          <path d="M0 553L283 519L572 574L902 530L1178 564L1600 523" stroke="#f5eee5" strokeWidth="14" fill="none" />
          <path d="M0 573L300 545L578 596L906 555L1184 586L1600 550" stroke="#191111" strokeWidth="5" fill="none" />
          <g transform="translate(890 42) rotate(9)">
            <path d="M270 42C352 20 446 42 477 108L509 194L462 280L432 349L405 417L348 453L306 409L322 342L279 285L242 349L185 391L150 372L168 307L205 249L206 192L166 167L147 113L182 64Z" fill="#f1e8dd" stroke="#080808" strokeWidth="12" strokeLinejoin="round" />
            <path d="M179 70L218 32L242 92L271 48L294 113L326 61L347 132L392 93L404 157L448 136L460 202L415 229L383 203L357 252L326 212L299 259L272 218L240 266L208 218L175 226L148 177L172 133Z" fill="#0b0909" />
            <path d="M208 147C243 113 293 113 328 137L355 179L335 207L294 199L272 181L252 205L215 191Z" fill="#ff2236" stroke="#090808" strokeWidth="8" />
            <path d="M215 147L246 155L264 147M288 145L316 151L337 166" fill="none" stroke="#090808" strokeWidth="8" strokeLinecap="round" />
            <path d="M352 284L421 295M339 310L400 325M310 337L383 354" stroke="#0a0909" strokeWidth="7" />
            <path d="M190 245L164 292L179 328M236 266L214 317M290 264L281 308" stroke="#0a0909" strokeWidth="7" fill="none" />
            <path d="M175 371L139 409L117 396L143 349M404 409L451 433L472 415L439 377" fill="#f1e8dd" stroke="#080808" strokeWidth="9" />
          </g>
          <g stroke="#0a0808" strokeWidth="5" fill="none" opacity=".9">
            <path d="M70 146L235 96L200 127L282 102M514 255L635 215L597 251L697 225M690 102L790 77L758 105" />
            <path d="M104 374L220 342L188 367L254 354M580 411L700 389L666 410L734 395" />
          </g>
          <path d="M0 0H1600V16H0Z" fill="#0a0909" />
          <path d="M0 870L280 858L510 874L760 854L1095 876L1320 856L1600 871V900H0Z" fill="#070707" />
        </>}

        {scene === "projects" && <>
          <rect width="1600" height="900" fill="#cf061e" />
          <rect x="0" y="0" width="1600" height="790" fill="#e10b26" />
          <g className="curtain-left">
            <path d="M-30 0H420L380 790H-30Z" fill="#f3ece4" stroke="#090808" strokeWidth="12" />
            <path d="M0 0H410L370 790H0Z" fill={stripes} />
            <path d="M74 0L112 790M162 0L196 790M270 0L295 790M364 0L370 790" stroke="#090808" strokeWidth="8" />
          </g>
          <g className="curtain-right">
            <path d="M1190 0H1640V790H1225Z" fill={stripes} stroke="#090808" strokeWidth="12" />
            <path d="M1250 0L1295 790M1350 0L1392 790M1450 0L1490 790M1540 0L1588 790" stroke="#090808" strokeWidth="8" />
          </g>
          <path d="M385 0H1215V790H385Z" fill="#9d081b" stroke="#080808" strokeWidth="12" />
          <path d="M430 0H1170V790H430Z" fill="#0a0909" />
          <circle cx="800" cy="285" r="195" fill="#f3122c" stroke="#050505" strokeWidth="12" />
          <circle cx="800" cy="285" r="145" fill="none" stroke="#f9f0e7" strokeWidth="6" />
          <g className="stage-figure">
            <path d="M711 300C707 237 741 194 801 193C858 193 891 238 884 304L860 367L736 367Z" fill="#090808" />
            <path d="M752 322C756 282 775 264 801 264C830 264 849 283 850 322L838 365L761 365Z" fill="#f3e9df" stroke="#070707" strokeWidth="9" />
            <path d="M725 365L877 365L964 790H626Z" fill="#26bfdf" stroke="#080808" strokeWidth="13" />
            <path d="M769 373L800 436L831 373M800 438V780" fill="none" stroke="#090808" strokeWidth="10" />
            <path d="M695 405L626 530L654 576L727 485M902 405L979 530L949 566L875 480" fill="#f0d2b8" stroke="#070707" strokeWidth="12" strokeLinejoin="round" />
            <path d="M651 574L625 602L644 628L681 603M950 566L976 592L957 619L926 594" fill="#f0d2b8" stroke="#070707" strokeWidth="9" />
          </g>
          <g transform="translate(1040 510)">
            <rect x="-25" y="0" width="155" height="34" fill="#f4eee5" stroke="#090808" strokeWidth="9" />
            <path d="M0 34H106L88 138H19Z" fill="#e8dfd4" stroke="#090808" strokeWidth="9" />
            <path d="M20 48H86" stroke="#26bfdf" strokeWidth="34" />
            <path d="M165 0H250L232 138H181Z" fill="#e9dfd5" stroke="#090808" strokeWidth="9" />
            <path d="M179 62H237" stroke="#e8d62a" strokeWidth="34" />
          </g>
          <path d="M0 784H1600V900H0Z" fill="url(#paper-projects)" />
          <rect x="0" y="790" width="1600" height="110" fill={stripes} />
          <path d="M0 790H1600" stroke="#080808" strokeWidth="17" />
          <g fill="none" stroke="#090808" strokeWidth="6"><path d="M0 850L220 830L430 854L650 828L875 850L1088 828L1300 853L1600 833" /><path d="M90 890L286 867L480 889L691 870L900 891L1150 868L1374 890" /></g>
        </>}

        {scene === "code" && <>
          <rect width="1600" height="900" fill="#f5eee6" />
          <rect width="1600" height="260" fill="#dfd2c9" />
          <path d="M0 0H1600V260H0Z" fill={stripes} opacity=".8" />
          <rect x="0" y="251" width="1600" height="18" fill="#090808" />
          <rect x="0" y="704" width="1600" height="196" fill="#0a0909" />
          <rect x="0" y="698" width="1600" height="16" fill="#f3ece4" stroke="#080808" strokeWidth="8" />
          <g className="code-bottle" transform="translate(225 170)">
            <path d="M40 0H130V62L161 96V510Q161 542 133 542H36Q8 542 8 510V96L40 62Z" fill="#23c9ed" stroke="#080808" strokeWidth="12" />
            <rect x="36" y="-30" width="100" height="43" fill="#0a0909" stroke="#080808" strokeWidth="8" />
            <path d="M13 163H155M15 365H156" stroke="#eaf7f8" strokeWidth="8" opacity=".9" />
            <path d="M36 202H128M42 220H119M32 410H139" stroke="#087b9b" strokeWidth="7" />
            <path d="M8 473L161 473" stroke="#080808" strokeWidth="8" />
          </g>
          <g className="code-bottle" transform="translate(610 135)">
            <path d="M40 0H130V62L161 96V510Q161 542 133 542H36Q8 542 8 510V96L40 62Z" fill="#7ddb38" stroke="#080808" strokeWidth="12" />
            <rect x="36" y="-30" width="100" height="43" fill="#0a0909" stroke="#080808" strokeWidth="8" />
            <path d="M13 163H155M15 365H156" stroke="#efffe1" strokeWidth="8" opacity=".9" />
            <path d="M36 202H128M42 220H119M32 410H139" stroke="#397e1e" strokeWidth="7" />
            <path d="M8 473L161 473" stroke="#080808" strokeWidth="8" />
          </g>
          <g className="code-bottle" transform="translate(995 155)">
            <path d="M40 0H130V62L161 96V510Q161 542 133 542H36Q8 542 8 510V96L40 62Z" fill="#f1df28" stroke="#080808" strokeWidth="12" />
            <rect x="36" y="-30" width="100" height="43" fill="#0a0909" stroke="#080808" strokeWidth="8" />
            <path d="M13 163H155M15 365H156" stroke="#fff8b2" strokeWidth="8" opacity=".9" />
            <path d="M36 202H128M42 220H119M32 410H139" stroke="#9b8e08" strokeWidth="7" />
            <path d="M8 473L161 473" stroke="#080808" strokeWidth="8" />
          </g>
          <g fill="none" stroke="#080808" strokeWidth="6">
            <path d="M0 30L245 20L420 45L590 18L800 42L1000 15L1190 43L1410 20L1600 36" />
            <path d="M0 62L220 54L430 74L620 53L825 73L1025 49L1250 75L1480 50L1600 63" />
          </g>
          <rect x="0" y="730" width="1600" height="170" fill="#0a0909" />
          <path d="M0 740L1600 715M0 778L1600 751M0 818L1600 785M0 859L1600 818" stroke="#fffaf3" strokeWidth="5" opacity=".55" />
        </>}

        {scene === "stack" && <>
          <rect width="1600" height="900" fill="#111010" />
          <path d="M0 0H1160V900H0Z" fill="#f6f0e9" />
          <path d="M0 0H1160V900H0Z" fill={hatching} opacity=".23" />
          <path d="M1160 0H1600V900H1160Z" fill="#e60927" />
          <path d="M1205 0L1250 900M1300 0L1333 900M1420 0L1447 900M1528 0L1555 900" stroke="#8a071b" strokeWidth="8" />
          <path d="M-60 267C130 144 379 174 586 197C805 221 986 195 1200 285V570C985 667 741 623 518 636C290 650 95 670 -60 571Z" fill="#111010" stroke="#090808" strokeWidth="17" />
          <path d="M-20 301C164 207 356 224 570 244C773 264 970 247 1166 310V527C980 603 748 579 527 590C299 604 107 614 -20 536Z" fill="#fffaf3" stroke="#111010" strokeWidth="10" />
          <g className="eye-left">
            <path d="M97 408C150 330 248 303 330 348C378 374 399 427 415 468C348 515 224 519 130 478Z" fill="#fff" stroke="#050505" strokeWidth="14" />
            <ellipse cx="259" cy="418" rx="61" ry="83" fill="#24bfdf" stroke="#080808" strokeWidth="13" />
            <ellipse cx="259" cy="418" rx="27" ry="51" fill="#030303" />
            <circle cx="238" cy="389" r="19" fill="#fff" />
            <path d="M97 405L137 354L178 334L219 332L262 341L306 347L350 375L393 425" fill="none" stroke="#080808" strokeWidth="22" />
          </g>
          <g className="eye-right">
            <path d="M606 400C670 317 778 305 871 351C930 383 951 437 961 474C875 522 752 524 647 482Z" fill="#fff" stroke="#050505" strokeWidth="14" />
            <ellipse cx="787" cy="420" rx="64" ry="85" fill="#24bfdf" stroke="#080808" strokeWidth="13" />
            <ellipse cx="787" cy="420" rx="28" ry="53" fill="#030303" />
            <circle cx="766" cy="388" r="20" fill="#fff" />
            <path d="M605 405L646 353L691 330L735 332L784 340L830 346L876 375L929 430" fill="none" stroke="#080808" strokeWidth="22" />
          </g>
          <path d="M-10 594L122 556L258 592L384 553L518 590L650 552L790 594L930 560L1076 594L1190 568" stroke="#090808" strokeWidth="22" fill="none" />
          <path d="M0 635L140 603L283 635L436 606L585 641L740 613L890 640L1040 616L1164 645" stroke="#090808" strokeWidth="12" fill="none" />
          <path d="M1135 0H1170V900H1135Z" fill="#070707" />
        </>}

        {scene === "learning" && <>
          <rect width="1600" height="900" fill="#d30925" />
          <rect x="0" y="0" width="1600" height="700" fill="#e60a28" />
          <path d="M0 0H390L370 700H0Z" fill={stripes} />
          <path d="M63 0L75 700M170 0L182 700M278 0L280 700M1500 0L1532 700" stroke="#090808" strokeWidth="9" />
          <rect x="391" y="0" width="820" height="700" fill="#101010" stroke="#090808" strokeWidth="13" />
          <rect x="420" y="0" width="760" height="700" fill="#f6eee6" />
          <path d="M420 0H1180V320H420Z" fill="#de0a25" />
          <path d="M420 0L520 0L483 700H420ZM1110 0H1180V700H1085Z" fill={stripes} />
          <g transform="translate(540 70)">
            <path d="M210 53C250 -2 334 6 355 63L366 138L325 190L236 190L197 138Z" fill="#0a0909" />
            <path d="M228 100C232 57 260 47 292 48C322 48 345 70 341 112L328 158L243 158Z" fill="#e9c9b3" stroke="#080808" strokeWidth="9" />
            <path d="M218 72L248 19L276 66L303 23L330 66L361 39L365 98" fill="#080808" stroke="#080808" strokeWidth="8" />
            <path d="M244 156L328 156L346 238L221 238Z" fill="#dfc1a4" stroke="#080808" strokeWidth="9" />
            <path d="M196 220L373 220L462 630H110Z" fill="#20c2e2" stroke="#080808" strokeWidth="13" />
            <path d="M245 236L285 298L325 236M285 298V625" fill="none" stroke="#080808" strokeWidth="9" />
            <path d="M195 256L90 388L133 422L238 316M373 256L484 370L452 412L344 317" fill="#dfc1a4" stroke="#080808" strokeWidth="12" />
            <path d="M137 418L98 452L123 471L158 442M454 409L498 433L485 463L445 436" fill="#dfc1a4" stroke="#080808" strokeWidth="8" />
            <path d="M196 610L276 610L263 760L170 760ZM305 610L384 610L415 760L320 760Z" fill="#19191a" stroke="#080808" strokeWidth="12" />
          </g>
          <rect x="0" y="700" width="1600" height="200" fill={stripes} />
          <path d="M0 700H1600" stroke="#090808" strokeWidth="15" />
          <path d="M0 845L230 824L425 848L660 821L910 844L1145 825L1385 848L1600 829" stroke="#080808" strokeWidth="8" fill="none" />
        </>}

        {scene === "archive" && <>
          <rect width="1600" height="900" fill="#e50927" />
          <path d="M0 0H1600V900H0Z" fill="url(#redglow-archive)" />
          <path d="M0 70L1600 0M0 190L1600 110M0 320L1600 238M0 458L1600 371M0 597L1600 507M0 735L1600 641" stroke="#85091a" strokeWidth="10" opacity=".7" />
          <g transform="translate(130 70) rotate(-13 300 300)">
            <path d="M0 68L84 0L508 0L590 68L590 170L0 170Z" fill="#f1e8df" stroke="#080808" strokeWidth="12" />
            <path d="M62 40L508 40" stroke="#090808" strokeWidth="9" />
            <rect x="95" y="68" width="394" height="102" fill="#26c6e6" stroke="#080808" strokeWidth="10" />
            <path d="M180 0V-55H425V0" fill="#f1e8df" stroke="#080808" strokeWidth="12" />
            <path d="M194 -55V-91H410V-55" fill="#111" stroke="#080808" strokeWidth="9" />
          </g>
          <path d="M445 150L650 440L725 429L545 122Z" fill="#f3eade" stroke="#080808" strokeWidth="12" />
          <path d="M672 430L736 413L783 493L755 525L707 505Z" fill="#f0c8ad" stroke="#080808" strokeWidth="10" />
          <path d="M680 491L753 500L895 754L770 754Z" fill="#21c4e7" stroke="#080808" strokeWidth="8" />
          <path d="M1027 512L1300 512L1240 854Q1234 876 1210 876H1120Q1092 876 1088 850Z" fill="#f8f2eb" stroke="#080808" strokeWidth="14" />
          <path d="M1057 662H1278L1240 854Q1235 873 1210 873H1120Q1096 873 1090 851Z" fill="#20c7e9" />
          <path d="M1040 512H1288" stroke="#080808" strokeWidth="18" />
          <path d="M736 502C800 540 837 576 864 631" fill="none" stroke="#24c8e9" strokeWidth="18" />
          <path d="M842 602L862 637L873 601M850 635L880 636" stroke="#080808" strokeWidth="6" fill="none" />
          <g stroke="#080808" strokeWidth="8" fill="none"><path d="M1350 135L1460 104L1429 130L1520 105M1370 230L1484 202L1450 225L1553 205M60 468L200 430L167 455L260 427M130 550L270 520L241 543L330 519" /></g>
        </>}

        {scene === "sound" && <>
          <rect width="1600" height="900" fill="#f3ece4" />
          <path d="M0 0H1600V640H0Z" fill="#d90a25" />
          <path d="M0 0L130 0L105 640H0M1510 0H1600V640H1480Z" fill={stripes} />
          <path d="M0 640H1600V900H0Z" fill="#0a0909" />
          <circle cx="800" cy="317" r="245" fill="#e60826" stroke="#070707" strokeWidth="18" />
          <circle cx="800" cy="317" r="202" fill="none" stroke="#f5eee6" strokeWidth="10" />
          <circle cx="800" cy="317" r="159" fill="none" stroke="#090808" strokeWidth="8" />
          <g className="sound-silhouette">
            <path d="M706 322C695 248 733 198 799 198C864 198 901 247 890 324L866 383H731Z" fill="#080808" />
            <path d="M683 375L920 375L1015 640H586Z" fill="#070707" />
            <path d="M746 380L800 458L855 380" fill="none" stroke="#20c3e4" strokeWidth="12" />
          </g>
          <g className="sound-wave" stroke="#fffaf3" strokeWidth="7" fill="none">
            <path d="M105 316V362M141 278V400M177 240V438M213 291V383M249 258V414" />
            <path d="M1350 316V362M1386 278V400M1422 240V438M1458 291V383M1494 258V414" />
          </g>
          <path d="M0 685L1600 660M0 744L1600 719M0 804L1600 777M0 864L1600 837" stroke="#fffaf3" strokeWidth="4" opacity=".35" />
        </>}

        {scene === "contact" && <>
          <rect width="1600" height="900" fill="#b80b22" />
          <rect x="0" y="0" width="1600" height="900" fill="url(#redglow-contact)" />
          <path d="M0 0L1600 0V900H0Z" fill="#e70927" opacity=".32" />
          <path d="M-30 100L1630 15M-30 230L1630 145M-30 360L1630 275M-30 490L1630 405M-30 620L1630 535M-30 750L1630 665M-30 880L1630 795" stroke="#8d091a" strokeWidth="9" />
          <path d="M0 0H1600V42H0Z" fill="#0b0909" />
          <path d="M0 832L1600 780V900H0Z" fill="#0a0909" />
          <g transform="translate(680 90) rotate(-8 400 390)" className="reach-hand">
            <path d="M340 520C300 460 279 406 285 351L299 195C302 168 323 155 343 160C368 164 374 184 372 208L365 331L393 138C398 110 419 98 441 104C466 111 472 133 465 159L435 335L481 174C488 149 510 137 532 145C556 153 560 176 552 200L514 350L570 238C584 214 608 210 628 225C649 241 646 262 634 283L584 400C625 376 658 355 688 338C711 326 734 338 741 359C750 383 734 405 714 420L580 535C540 578 509 615 457 637C407 657 370 606 340 520Z" fill="#f0d0b9" stroke="#080808" strokeWidth="16" strokeLinejoin="round" />
            <path d="M343 188L330 331M428 129L407 310M519 171L477 325M612 249L564 366" stroke="#8a5d4e" strokeWidth="8" fill="none" />
            <path d="M354 459L410 493L447 465M431 528L491 548" stroke="#080808" strokeWidth="8" fill="none" />
          </g>
          <path d="M820 200C700 150 615 217 600 301C580 405 685 441 796 399C905 358 987 294 1052 334C1118 374 1077 459 1005 490" fill="none" stroke="#fb283e" strokeWidth="26" strokeLinecap="round" />
          <path d="M803 201C684 151 599 218 584 302C564 406 669 442 780 400C889 359 971 295 1036 335C1102 375 1061 460 989 491" fill="none" stroke="#080808" strokeWidth="7" strokeLinecap="round" />
          <g stroke="#080808" strokeWidth="5" fill="none"><path d="M86 165L210 137L176 160L278 139M130 288L255 253L214 282L321 253M90 430L202 399L176 419L280 401M1300 147L1410 118L1378 144L1500 115M1280 265L1402 237L1365 260L1504 234" /></g>
        </>}
      </g>
      <g className="cinema-art-overlay">
        <path d="M0 58H1600" stroke="#080808" strokeWidth="12" />
        <rect x="46" y="22" width="216" height="43" fill="#f7f0e8" stroke="#080808" strokeWidth="7" />
        <text x="62" y="49" fontSize="16" fontWeight="800" fontFamily="monospace" fill="#090808" letterSpacing="2">{scene === "hero" ? "V / N · ORIGINALS" : "CHAPTER / " + chapters.find((x) => x.scene === scene)?.number}</text>
        <rect x="1330" y="22" width="226" height="43" fill="#f7f0e8" stroke="#080808" strokeWidth="7" />
        <text x="1345" y="49" fontSize="15" fontWeight="800" fontFamily="monospace" fill="#090808" letterSpacing="1">{scene === "hero" ? "NOCTIS / 001" : chapters.find((x) => x.scene === scene)?.label.toUpperCase()}</text>
        <path d="M0 856L1600 825V900H0Z" fill="#070707" opacity=".9" />
        <text x="46" y="880" fontSize="15" fontWeight="700" fontFamily="monospace" fill="#f8f0e8" letterSpacing="3">INK / FRAME / MOTION</text>
        <text x="1554" y="880" textAnchor="end" fontSize="15" fontWeight="700" fontFamily="monospace" fill="#f8f0e8" letterSpacing="3">{scene.toUpperCase()} · 16:09</text>
      </g>
    </svg>
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
          <div className="cinema-scene-art"><CinematicIllustration scene="hero" /><div className="cinema-hero-vertical">SOFTWARE / STORIES / SOUND</div><a className="cinema-round-down" href="#ink-work" aria-label="Scroll to selected work"><ArrowDownRight size={24} /></a></div>
          <div className="cinema-paper-band cinema-paper-hero">
            <div className="cinema-paper-kicker"><PaperIndex number="00" eyebrow="A PERSONAL UNIVERSE" /><span>VIREON NOCTIS / DIGITAL EDITION</span></div>
            <div className="cinema-paper-headline"><h1>MADE OF<br /><em>INK &amp; INTENT.</em></h1><div className="cinema-paper-copy"><p>Software, stories, sound, and the systems between them. A living archive of what I build, what I study, and what stays with me.</p><a className="cinema-text-link" href="#ink-work">ENTER THE ARCHIVE <ArrowUpRight size={15} /></a></div></div>
          </div>
        </section>

        <section className="cinema-chapter" id="ink-work" data-chapter="01">
          <div className="cinema-scene-art"><CinematicIllustration scene="projects" /><div className="cinema-art-side-note">ACT I / BUILT WORLDS</div></div>
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
          <div className="cinema-scene-art"><CinematicIllustration scene="code" /><div className="cinema-art-side-note">ACT II / SOURCE MATERIAL</div></div>
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
          <div className="cinema-scene-art"><CinematicIllustration scene="stack" /><div className="cinema-art-side-note">ACT III / UNDER THE SURFACE</div></div>
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
          <div className="cinema-scene-art"><CinematicIllustration scene="learning" /><div className="cinema-art-side-note">ACT IV / STILL BECOMING</div></div>
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
          <div className="cinema-scene-art"><CinematicIllustration scene="archive" /><div className="cinema-art-side-note">ACT V / THINGS THAT STAY</div></div>
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
          <div className="cinema-scene-art"><CinematicIllustration scene="sound" /><div className="cinema-art-side-note">ACT VI / SOUNDTRACK</div></div>
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
          <div className="cinema-scene-art"><CinematicIllustration scene="contact" /><div className="cinema-art-side-note">FINAL FRAME / OPEN CHANNEL</div></div>
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
