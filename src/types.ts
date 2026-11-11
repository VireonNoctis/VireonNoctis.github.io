export interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  archived?: boolean;
  updated_at: string;
}
export interface RankedItem {
  name: string;
  count?: number;
  playcount?: number;
  url?: string;
  artist?: string;
}
export interface GenreItem {
  genre: string;
  count: number;
}
export type AniListFavoriteCategory = "anime" | "manga" | "characters" | "staff" | "studios";
export interface AniListFavorite {
  id: number;
  title: string;
  image?: string;
  url: string;
}
export type AniListFavorites = Record<AniListFavoriteCategory, AniListFavorite[]>;
export interface Live {
  repos?: number;
  followers?: number;
  commits?: number;
  anime?: number;
  manga?: number;
  scrobbles?: number;
  track?: string;
  trackUrl?: string;
  trackImage?: string;
  artist?: string;
  playing?: boolean;
  trackDurationMs?: number;
  trackPlaycount?: number;
  trackUserPlaycount?: number;
  artistPlaycount?: number;
  trackListeners?: number;
  animeEpisodes?: number;
  animeMinutes?: number;
  animeScore?: number;
  mangaChapters?: number;
  mangaVolumes?: number;
  mangaScore?: number;
  animeGenres?: GenreItem[];
  mangaGenres?: GenreItem[];
  anilistFavorites?: AniListFavorites;
  topArtists?: RankedItem[];
  topTracks?: RankedItem[];
}
export interface CodeStatsLanguage {
  language: string;
  files: number;
  lines: number;
  nonblankLines: number;
  characters: number;
  words: number;
}
export interface CodeStatsProjectEstimate {
  id: string;
  name: string;
  url: string;
  classification: string;
  areas: { name: string; stack: string; lines: number; characters?: number; estimatedCharactersPerLine?: number }[];
}
export interface CodeStatsRepository {
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
}
export interface CodeStats {
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
}
export interface SpotifyNowPlaying {
  configured: boolean;
  isPlaying: boolean;
  track: string | null;
  artist: string | null;
  album: string | null;
  albumImage: string | null;
  url: string | null;
}
