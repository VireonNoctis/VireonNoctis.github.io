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
  let lastFmRefresh = 0;
  let scrobbleRefresh = 0;
  let lastFmTrackKey = "";
  let artworkLookupKey = "";
  let trackInfoKey = "";

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
      const path = new URL("https://raw.githubusercontent.com/VireonNoctis/VireonNoctis.github.io/main/public/spotify-now-playing.json");
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
      const [userResponse, repoResponse, commitsResponse] = await Promise.all([
        fetch("https://api.github.com/users/VireonNoctis", { signal }),
        fetch("https://api.github.com/users/VireonNoctis/repos?type=owner&sort=updated&per_page=100", { signal }),
        fetch("https://api.github.com/search/commits?q=author%3AVireonNoctis&per_page=1", {
          signal, headers: { Accept: "application/vnd.github+json" }
        })
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
      if (commitsResponse.ok) {
        const payload = await commitsResponse.json() as { total_count?: number };
        if (typeof payload.total_count === "number" && Number.isFinite(payload.total_count)) {
          live.value = { ...live.value, commits: payload.total_count };
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

  async function requestLastFm(method: string, params: Record<string, string>, signal: AbortSignal) {
    const query = new URLSearchParams({ method, user: "reasfeetadmirer", api_key: LASTFM_KEY, format: "json", ...params });
    const response = await fetch("https://ws.audioscrobbler.com/2.0/?" + query, { signal, cache: "no-store" });
    if (!response.ok) throw new Error("Last.fm request failed");
    const payload = await response.json();
    if (payload?.error) throw new Error(String(payload.message || "Last.fm API error"));
    return payload;
  }

  async function lookupArtwork(trackName: string, artistName: string, trackKey: string, signal: AbortSignal) {
    try {
      const params = new URLSearchParams({ term: artistName + " " + trackName, entity: "song", limit: "1" });
      const response = await fetch("https://itunes.apple.com/search?" + params, { signal, cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json() as { results?: Array<{ artworkUrl100?: string }> };
      const artwork = payload.results?.[0]?.artworkUrl100;
      if (!artwork || lastFmTrackKey !== trackKey) return;
      live.value = { ...live.value, trackImage: artwork.replace(/100x100bb\./, "600x600bb.") };
    } catch { /* Artwork lookup is an optional fallback. */ }
  }

  async function loadLastFmTrackInfo(trackName: string, artistName: string, trackKey: string, signal: AbortSignal) {
    const [trackPayload, artistPayload] = await Promise.all([
      requestLastFm("track.getInfo", {
        track: trackName, artist: artistName, username: "reasfeetadmirer"
      }, signal).catch(() => null),
      requestLastFm("artist.getInfo", {
        artist: artistName, username: "reasfeetadmirer"
      }, signal).catch(() => null)
    ]);
    if (lastFmTrackKey !== trackKey) return;

    const track = trackPayload?.track;
    const albumImages = Array.isArray(track?.album?.image) ? track.album.image : [];
    const albumImage = [...albumImages].reverse().find((item: any) =>
      typeof item?.["#text"] === "string" && item["#text"].startsWith("http")
    )?.["#text"];
    const count = (value: unknown): number | undefined => {
      if (value === undefined || value === null || value === "") return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : undefined;
    };

    const duration = count(track?.duration);
    const globalTrackPlays = count(track?.playcount);
    const personalTrackPlays = count(track?.userplaycount);
    const listeners = count(track?.listeners);
    const personalArtistPlays = count(artistPayload?.artist?.stats?.userplaycount);
    const albumTitle = typeof track?.album?.title === "string" ? track.album.title.trim() : "";

    if (albumTitle) lastFmAlbum.value = albumTitle;
    live.value = {
      ...live.value,
      ...(duration !== undefined && duration > 0 ? { trackDurationMs: duration } : {}),
      ...(globalTrackPlays !== undefined ? { trackPlaycount: globalTrackPlays } : {}),
      ...(personalTrackPlays !== undefined ? { trackUserPlaycount: personalTrackPlays } : {}),
      ...(personalArtistPlays !== undefined ? { artistPlaycount: personalArtistPlays } : {}),
      ...(listeners !== undefined ? { trackListeners: listeners } : {}),
      ...(albumImage && !live.value.trackImage ? { trackImage: albumImage.replace(/^http:/, "https:") } : {})
    };
  }

  async function loadLastFmPlayback(signal: AbortSignal) {
    try {
      const payload = await requestLastFm("user.getrecenttracks", { limit: "1" }, signal);
      const rawTrack = payload?.recenttracks?.track;
      const track = Array.isArray(rawTrack) ? rawTrack[0] : rawTrack;
      if (!track || typeof track.name !== "string") { live.value = { ...live.value, playing: false }; return; }
      const artistName = String(track.artist?.["#text"] || track.artist?.name || "");
      const albumName = String(track.album?.["#text"] || "");
      const trackKey = [artistName, track.name, albumName].join("::");
      const changed = trackKey !== lastFmTrackKey;
      lastFmTrackKey = trackKey;
      const images = Array.isArray(track.image) ? track.image : [];
      const image = [...images].reverse().find((item: any) => typeof item?.["#text"] === "string" && item["#text"].startsWith("http"))?.["#text"];
      if (changed) lastFmAlbum.value = albumName || null;
      else if (albumName) lastFmAlbum.value = albumName;
      live.value = {
        ...live.value,
        track: track.name,
        trackUrl: typeof track.url === "string" ? track.url : undefined,
        trackImage: image ? image.replace(/^http:/, "https:") : changed ? undefined : live.value.trackImage,
        artist: artistName || "Unknown artist",
        playing: track["@attr"]?.nowplaying === "true",
        ...(changed ? {
          trackDurationMs: undefined,
          trackPlaycount: undefined,
          trackUserPlaycount: undefined,
          artistPlaycount: undefined,
          trackListeners: undefined
        } : {})
      };
      if (changed && artistName && trackInfoKey !== trackKey) {
        trackInfoKey = trackKey;
        void loadLastFmTrackInfo(track.name, artistName, trackKey, signal);
      }
      if (!image && artistName && artworkLookupKey !== trackKey) {
        artworkLookupKey = trackKey;
        void lookupArtwork(track.name, artistName, trackKey, signal);
      }
    } catch { /* Live listening data never blocks the page. */ }
  }



  async function loadLastFmScrobbles(signal: AbortSignal) {
    try {
      const payload = await requestLastFm("user.getinfo", {}, signal);
      const total = Number(payload?.user?.playcount);
      if (!Number.isFinite(total) || total < 0) return;
      live.value = { ...live.value, scrobbles: Math.round(total) };
    } catch { /* The most recent scrobble total remains visible during temporary API errors. */ }
  }

  async function loadLastFm(signal: AbortSignal) {
    try {
      const [info, artists, tracks] = await Promise.all([
        requestLastFm("user.getinfo", {}, signal),
        requestLastFm("user.gettopartists", { limit: "5", period: "overall" }, signal),
        requestLastFm("user.gettoptracks", { limit: "5", period: "overall" }, signal)
      ]);
      const user = info?.user;
      live.value = {
        ...live.value,
        ...(user ? { scrobbles: Number(user.playcount) } : {}),
        ...(Array.isArray(artists?.topartists?.artist) ? {
          topArtists: artists.topartists.artist.map((item: any) => ({ name: String(item.name), playcount: Number(item.playcount), url: item.url }))
        } : {}),
        ...(Array.isArray(tracks?.toptracks?.track) ? {
          topTracks: tracks.toptracks.track.map((item: any) => ({ name: String(item.name), artist: item.artist?.name, playcount: Number(item.playcount), url: item.url }))
        } : {})
      };
    } catch { /* Last.fm profile data is non-blocking. */ }
  }

  onMounted(() => {
    controller = new AbortController();
    const signal = controller.signal;
    void loadCodeStats(signal);
    void loadSpotify(signal);
    void loadGithub(signal);
    void loadAniList(signal);
    void loadLastFm(signal);
    void loadLastFmPlayback(signal);
    spotifyRefresh = window.setInterval(() => {
      if (controller && !controller.signal.aborted) void loadSpotify(controller.signal);
    }, 45_000);
    lastFmRefresh = window.setInterval(() => {
      if (controller && !controller.signal.aborted) void loadLastFmPlayback(controller.signal);
    }, 20_000);
    scrobbleRefresh = window.setInterval(() => {
      if (controller && !controller.signal.aborted) void loadLastFmScrobbles(controller.signal);
    }, 30_000);
  });

  onBeforeUnmount(() => {
    controller?.abort();
    if (spotifyRefresh) window.clearInterval(spotifyRefresh);
    if (lastFmRefresh) window.clearInterval(lastFmRefresh);
    if (scrobbleRefresh) window.clearInterval(scrobbleRefresh);
  });

  return { repos, codeStats, codeStatsStatus, live, spotify, lastFmAlbum };
}