import { onBeforeUnmount, onMounted, ref } from "vue";
import type { CodeStats, Live, Repo, SpotifyNowPlaying } from "../types";

type SpotifyPlaybackSnapshot = SpotifyNowPlaying & {
  progressMs: number | null;
  durationMs: number | null;
  updatedAtMs: number | null;
  albumUrl: string | null;
  albumReleaseDate: string | null;
  albumType: string | null;
  albumTotalTracks: number | null;
  trackNumber: number | null;
  discNumber: number | null;
  explicit: boolean | null;
  deviceName: string | null;
  deviceType: string | null;
  volumePercent: number | null;
  shuffleState: boolean | null;
  repeatState: string | null;
  albumArtists: string | null;
};
const EMPTY_SPOTIFY: SpotifyPlaybackSnapshot = {
  configured: false, isPlaying: false, track: null, artist: null, album: null, albumImage: null, url: null,
  progressMs: null, durationMs: null, updatedAtMs: null, albumUrl: null, albumReleaseDate: null,
  albumType: null, albumTotalTracks: null, trackNumber: null, discNumber: null, explicit: null,
  deviceName: null, deviceType: null, volumePercent: null, shuffleState: null, repeatState: null, albumArtists: null
};
const LASTFM_KEY = "8c06a8eea595aa5e4b748ca235fd9dd8";

export function usePortfolioData() {
  const repos = ref<Repo[]>([]);
  const codeStats = ref<CodeStats | null>(null);
  const codeStatsStatus = ref<"loading" | "ready" | "unavailable">("loading");
  const live = ref<Live>({});
  const lastFmAlbum = ref<string | null>(null);
  const spotify = ref<SpotifyPlaybackSnapshot>({ ...EMPTY_SPOTIFY });
  let controller: AbortController | null = null;
  let spotifyRefresh = 0;

  async function loadCodeStats(signal: AbortSignal) {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/VireonNoctis/VireonNoctis/main/code-stats.json?ts=" + Date.now(),
        { cache: "no-store", signal }
      );
      if (!response.ok) throw new Error("Code stats unavailable");
      const payload = await response.json() as Partial<CodeStats>;
      const totals = payload.totals;
      const totalKeys: Array<keyof CodeStats["totals"]> = [
        "repositories", "ownedRepositories", "contributorRepositories", "failedRepositories",
        "files", "lines", "nonblankLines", "characters", "words", "stars", "forks"
      ];
      const valid = typeof payload.generatedAt === "string" && Boolean(totals) &&
        totalKeys.every((key) => Number.isFinite(totals?.[key])) &&
        Array.isArray(payload.languages) && Array.isArray(payload.repositories) &&
        Array.isArray(payload.manualProjectEstimates);
      if (!valid) throw new Error("Code stats schema mismatch");
      codeStats.value = payload as CodeStats;
      codeStatsStatus.value = "ready";
    } catch {
      if (!signal.aborted) codeStatsStatus.value = "unavailable";
    }
  }

  async function loadSpotify(signal: AbortSignal) {
    try {
      const path = new URL(import.meta.env.BASE_URL + "spotify-now-playing.json", window.location.origin);
      path.searchParams.set("ts", String(Date.now()));
      const response = await fetch(path, { cache: "no-store", signal });
      if (!response.ok) return;
      const data = await response.json() as Partial<SpotifyPlaybackSnapshot>;
      const numberOrNull = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
      const stringOrNull = (value: unknown) => typeof value === "string" && value.length > 0 ? value : null;
      spotify.value = {
        configured: data.configured === true,
        isPlaying: data.isPlaying === true,
        track: stringOrNull(data.track),
        artist: stringOrNull(data.artist),
        album: stringOrNull(data.album),
        albumImage: stringOrNull(data.albumImage),
        url: stringOrNull(data.url),
        progressMs: numberOrNull(data.progressMs),
        durationMs: numberOrNull(data.durationMs),
        updatedAtMs: numberOrNull(data.updatedAtMs),
        albumUrl: stringOrNull(data.albumUrl),
        albumReleaseDate: stringOrNull(data.albumReleaseDate),
        albumType: stringOrNull(data.albumType),
        albumTotalTracks: numberOrNull(data.albumTotalTracks),
        trackNumber: numberOrNull(data.trackNumber),
        discNumber: numberOrNull(data.discNumber),
        explicit: typeof data.explicit === "boolean" ? data.explicit : null,
        deviceName: stringOrNull(data.deviceName),
        deviceType: stringOrNull(data.deviceType),
        volumePercent: numberOrNull(data.volumePercent),
        shuffleState: typeof data.shuffleState === "boolean" ? data.shuffleState : null,
        repeatState: stringOrNull(data.repeatState),
        albumArtists: stringOrNull(data.albumArtists)
      };
    } catch { /* Live playback is progressive enhancement. */ }
  }

  async function loadGithub(signal: AbortSignal) {
    try {
      const [userResponse, repoResponse] = await Promise.all([
        fetch("https://api.github.com/users/VireonNoctis", { signal }),
        fetch("https://api.github.com/users/VireonNoctis/repos?type=owner&sort=updated&per_page=100", { signal })
      ]);
      if (userResponse.ok) {
        const user = await userResponse.json() as { followers?: number; public_repos?: number };
        live.value = { ...live.value, followers: user.followers, repos: user.public_repos };
      }
      if (repoResponse.ok) {
        const payload = await repoResponse.json() as unknown;
        if (Array.isArray(payload)) {
          repos.value = (payload as Repo[])
            .filter((repo) => typeof repo.name === "string" && typeof repo.html_url === "string" && !repo.fork && !repo.archived)
            .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
            .slice(0, 8);
        }
      }
    } catch { /* Public profile widgets never block the page. */ }
  }

  async function loadAniList(signal: AbortSignal) {
    const query = "query { User(name: \"Vireon\") { statistics { anime { count episodesWatched minutesWatched meanScore genres(limit: 5, sort: COUNT_DESC) { genre count } } manga { count chaptersRead volumesRead meanScore genres(limit: 5, sort: COUNT_DESC) { genre count } } } } }";
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal
      });
      if (!response.ok) return;
      const payload = await response.json();
      const stats = payload?.data?.User?.statistics;
      if (!stats) return;
      live.value = {
        ...live.value,
        anime: stats.anime?.count,
        manga: stats.manga?.count,
        animeEpisodes: stats.anime?.episodesWatched,
        animeMinutes: stats.anime?.minutesWatched,
        animeScore: stats.anime?.meanScore,
        mangaChapters: stats.manga?.chaptersRead,
        mangaVolumes: stats.manga?.volumesRead,
        mangaScore: stats.manga?.meanScore,
        animeGenres: Array.isArray(stats.anime?.genres) ? stats.anime.genres : [],
        mangaGenres: Array.isArray(stats.manga?.genres) ? stats.manga.genres : []
      };
    } catch { /* AniList is non-blocking. */ }
  }

  async function loadLastFm(signal: AbortSignal) {
    const request = async (method: string, params: Record<string, string> = {}) => {
      const query = new URLSearchParams({
        method, user: "reasfeetadmirer", api_key: LASTFM_KEY, format: "json", ...params
      });
      const response = await fetch("https://ws.audioscrobbler.com/2.0/?" + query, { signal });
      if (!response.ok) throw new Error("Last.fm request failed");
      return response.json();
    };
    try {
      const [recent, info, artists, tracks] = await Promise.all([
        request("user.getrecenttracks", { limit: "1" }),
        request("user.getinfo"),
        request("user.gettopartists", { limit: "5", period: "overall" }),
        request("user.gettoptracks", { limit: "5", period: "overall" })
      ]);
      const track = recent?.recenttracks?.track?.[0];
      const user = info?.user;
      if (typeof track?.album?.["#text"] === "string" && track.album["#text"]) {
        lastFmAlbum.value = track.album["#text"];
      }
      const trackImages = Array.isArray(track?.image) ? track.image : [];
      const trackImage = [...trackImages].reverse().find((item: any) =>
        typeof item?.["#text"] === "string" && item["#text"].startsWith("http")
      )?.["#text"];
      live.value = {
        ...live.value,
        ...(track ? {
          track: track.name,
          trackUrl: typeof track.url === "string" ? track.url : undefined,
          trackImage,
          artist: track.artist?.["#text"],
          playing: track["@attr"]?.nowplaying === "true"
        } : {}),
        ...(user ? { scrobbles: Number(user.playcount) } : {}),
        ...(Array.isArray(artists?.topartists?.artist) ? {
          topArtists: artists.topartists.artist.map((item: any) => ({
            name: String(item.name), playcount: Number(item.playcount), url: item.url
          }))
        } : {}),
        ...(Array.isArray(tracks?.toptracks?.track) ? {
          topTracks: tracks.toptracks.track.map((item: any) => ({
            name: String(item.name), artist: item.artist?.name, playcount: Number(item.playcount), url: item.url
          }))
        } : {})
      };
    } catch { /* Last.fm is non-blocking. */ }
  }

  onMounted(() => {
    controller = new AbortController();
    const signal = controller.signal;
    void loadCodeStats(signal);
    void loadSpotify(signal);
    void loadGithub(signal);
    void loadAniList(signal);
    void loadLastFm(signal);
    spotifyRefresh = window.setInterval(() => {
      if (controller && !controller.signal.aborted) void loadSpotify(controller.signal);
    }, 60_000);
  });

  onBeforeUnmount(() => {
    controller?.abort();
    if (spotifyRefresh) window.clearInterval(spotifyRefresh);
  });

  return { repos, codeStats, codeStatsStatus, live, spotify, lastFmAlbum };
}