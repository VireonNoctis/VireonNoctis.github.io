// components/stats-card.js
class StatsCard {
  static render({ github, anilist, lastfm }) {
    const container = document.querySelector("#stats-card");
    if (!container) return;

    const githubRepos = github?.repositories ?? 0;
    const githubFollowers = github?.followers ?? 0;
    const githubFollowing = github?.following ?? 0;

    const animeTotal = anilist?.anime?.total ?? 0;
    const animeEpisodes = anilist?.anime?.episodes ?? 0;
    const mangaTotal = anilist?.manga?.total ?? 0;
    const mangaChapters = anilist?.manga?.chapters ?? 0;
    const mangaVolumes = anilist?.manga?.volumes ?? 0;

    const scrobbles = lastfm?.scrobbles ?? 0;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-box">
          <h4>GitHub</h4>
          <p>Repositories: ${githubRepos}</p>
          <p>Followers: ${githubFollowers}</p>
          <p>Following: ${githubFollowing}</p>
        </div>

        <div class="stat-box">
          <h4>AniList — Anime</h4>
          <p>Total: ${animeTotal}</p>
          <p>Episodes: ${animeEpisodes}</p>
        </div>

        <div class="stat-box">
          <h4>AniList — Manga</h4>
          <p>Total: ${mangaTotal}</p>
          <p>Chapters: ${mangaChapters}</p>
          <p>Volumes: ${mangaVolumes}</p>
        </div>

        <div class="stat-box">
          <h4>Last.fm</h4>
          <p>Scrobbles: ${scrobbles}</p>
        </div>
      </div>
    `;
  }
}

export default StatsCard;