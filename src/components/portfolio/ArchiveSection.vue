<script setup lang="ts">
import AnimatedNumber from "../AnimatedNumber.vue";
import type { PortfolioPageContext } from "../../types/PortfolioPageContext";
const props = defineProps<{ context: PortfolioPageContext }>();
const context = props.context;
</script>

<template>
<section class="archive-section section-shell section-space" id="archive" v-reveal>
      <div class="archive-heading"><h2>MORE THAN<br /><em>WORK.</em></h2><p>Music, media, and the interests that keep the perspective wide.</p></div>
      <div class="archive-grid">
        <article class="archive-card listening-card">
          <div class="archive-card-top"><span>LISTENING / LIVE</span><span class="archive-live-dot" aria-hidden="true"></span></div>
          <div class="listening-main">
            <div class="album-art">
              <Transition name="track-art" mode="out-in">
                <img v-if="context.listeningArtwork" :key="context.listeningArtwork" :src="context.listeningArtwork" alt="Current track artwork" loading="lazy" @error="context.handleArtworkError" />
                <img v-else key="lastfm-fallback" src="/brands/lastfm.svg" alt="Last.fm" />
              </Transition>
            </div>
            <div class="listening-copy">
              <div class="listening-copy-main">
                <span>{{ context.listeningStatus }}</span>
                <Transition name="track-copy" mode="out-in">
                  <div :key="context.listeningTrack + '::' + context.listeningArtist" class="listening-track-copy">
                    <h3 :title="context.listeningTrack">{{ context.listeningTrack }}</h3>
                    <p>{{ context.listeningArtist }}</p>
                  </div>
                </Transition>
              </div>
              <aside class="listening-edge-stats" aria-label="Personal listening statistics">
                <div class="listening-artist-stat">
                  <span>ARTIST PLAYS · LAST.FM</span>
                  <strong v-if="context.lastFmArtistPlaycount !== undefined"><AnimatedNumber :value="context.lastFmArtistPlaycount" immediate :duration="1250" /></strong>
                  <strong v-else>—</strong>
                </div>
                <div>
                  <span>YOUR TRACK PLAYS</span>
                  <strong v-if="context.listeningStatsMatch && context.live.trackUserPlaycount !== undefined"><AnimatedNumber :value="context.live.trackUserPlaycount" immediate :duration="1250" /></strong>
                  <strong v-else>—</strong>
                </div>
              </aside>
              <div class="listening-inline-album">
                <span>ALBUM</span>
                <strong :title="context.listeningAlbum">{{ context.listeningAlbum }}</strong>
              </div>
            </div>
          </div>
          <div class="listening-metadata">
            <div v-if="context.spotify.albumReleaseDate"><span>RELEASED</span><strong>{{ context.spotify.albumReleaseDate }}</strong></div>
            <div v-if="context.spotify.trackNumber" class="listening-track-number"><span>TRACK</span><strong>{{ String(context.spotify.trackNumber).padStart(2, "0") }}<template v-if="context.spotify.albumTotalTracks"> / {{ context.spotify.albumTotalTracks }}</template></strong></div>
            <div v-if="context.spotify.deviceName"><span>DEVICE</span><strong>{{ context.spotify.deviceName }}</strong></div>
          </div>
          <div class="spotify-playback-panel">
            <div class="spotify-wavefield" :class="{ 'is-playing': context.spotify.configured ? context.spotify.isPlaying : context.live.playing }" aria-hidden="true">
              <div class="spotify-wavefield-bars">
                <i v-for="(height, index) in context.playbackWaveBars" :key="'base-' + index" :style="{ height: height + '%', '--wave-index': index }"></i>
              </div>
              <div v-if="context.spotify.configured" class="spotify-wavefield-progress" :style="{ width: context.spotifyProgressPercent + '%' }">
                <div class="spotify-wavefield-bars">
                  <i v-for="(height, index) in context.playbackWaveBars" :key="'progress-' + index" :style="{ height: height + '%', '--wave-index': index }"></i>
                </div>
              </div>
            </div>
            <div class="spotify-playback-readout">
              <time>{{ context.spotify.configured && context.spotify.durationMs ? context.formatPlaybackTime(context.spotifyProgressMs) : "LIVE" }}</time>
              <span>{{ context.spotify.configured ? (context.spotify.isPlaying ? "SPOTIFY / PLAYING" : "SPOTIFY / PAUSED") : context.live.playing ? "LAST.FM / NOW PLAYING" : "LAST.FM / RECENT TRACK" }}</span>
              <time>{{ context.spotify.configured && context.spotify.durationMs ? context.formatPlaybackTime(context.spotify.durationMs) : context.live.trackDurationMs ? context.formatPlaybackTime(context.live.trackDurationMs) : "—" }}</time>
            </div>
            <div v-if="context.live.trackPlaycount !== undefined || context.live.trackListeners !== undefined || context.live.trackDurationMs" class="lastfm-track-stats">
              <div v-if="context.live.trackPlaycount !== undefined" class="lastfm-global-track">
                <span>GLOBAL TRACK PLAYS</span>
                <strong><AnimatedNumber :value="context.live.trackPlaycount" immediate :duration="1250" /></strong>
              </div>
              <div v-if="context.live.trackListeners !== undefined" class="lastfm-global-track">
                <span>LISTENERS</span>
                <strong><AnimatedNumber :value="context.live.trackListeners" immediate :duration="1250" /></strong>
              </div>
              <div v-if="context.live.trackDurationMs" class="lastfm-global-track">
                <span>DURATION</span>
                <strong><time :key="context.live.trackDurationMs" class="lastfm-duration-value">{{ context.formatPlaybackTime(context.live.trackDurationMs) }}</time></strong>
              </div>
            </div>
          </div>
          <div class="archive-card-bottom listening-footer">
            <div class="lastfm-scrobbles">
              <span>LAST.FM / SCROBBLES</span>
              <strong v-if="context.live.scrobbles !== undefined"><AnimatedNumber :value="context.live.scrobbles" immediate /></strong>
              <strong v-else>—</strong>
            </div>
            <div class="listening-links">
              <a v-if="context.listeningTrackUrl" :href="context.listeningTrackUrl" target="_blank" rel="noreferrer">Open track ↗</a>
              <a href="https://last.fm/user/reasfeetadmirer" target="_blank" rel="noreferrer">Last.fm profile ↗</a>
            </div>
          </div>
        </article>
        <article class="archive-card media-card">
          <div class="archive-card-top"><span>ANILIST / PROFILE</span><a href="https://anilist.co/user/Vireon" target="_blank" rel="noreferrer">Open profile ↗</a></div>
          <h3>Anime & manga</h3>
          <div class="media-stats">
            <div><strong><AnimatedNumber :value="context.live.anime ?? 0" immediate /></strong><span>ANIME</span></div>
            <div><strong><AnimatedNumber :value="context.live.animeEpisodes ?? 0" immediate /></strong><span>EPISODES</span></div>
            <div><strong><AnimatedNumber :value="context.live.manga ?? 0" immediate /></strong><span>MANGA</span></div>
            <div><strong><AnimatedNumber :value="context.live.mangaChapters ?? 0" immediate /></strong><span>CHAPTERS</span></div>
          </div>
          <div v-if="context.live.animeGenres?.length" :ref="context.setGenreListElement" class="genre-list" :class="{ 'is-visible': context.genreBarsVisible }">
            <div v-for="(genre, index) in context.live.animeGenres.slice(0, 5)" :key="genre.genre" class="genre-row"><span>{{ genre.genre }}</span><span class="genre-bar"><i :style="{ '--genre-width': context.genreWidth(context.live.animeGenres, genre.count) + '%', transitionDelay: (index * 90) + 'ms' }"></i></span></div>
          </div>
        </article>
      </div>
      <section v-if="context.hasFavoriteCollection" class="favorites-section" aria-label="Favourite collections">
        <div class="favorites-heading">
          <div><span>ANILIST / COLLECTION</span><h3>FAVOURITES</h3></div>
          <a v-if="context.selectedFavoriteCategory !== 'webnovels'" href="https://anilist.co/user/Vireon/favourites" target="_blank" rel="noreferrer">VIEW ALL ↗</a>
          <span v-else>05 TITLES</span>
        </div>
        <div class="favorites-controls" role="group" aria-label="Favourite category">
          <button v-for="category in context.favoriteCategories" :key="category.key" type="button" class="favorite-category-button" :class="{ 'is-active': context.selectedFavoriteCategory === category.key }" :aria-pressed="context.selectedFavoriteCategory === category.key" @click="context.selectFavoriteCategory(category.key)">{{ category.label }}</button>
        </div>
        <Transition name="favorite-switch" mode="out-in">
          <div :key="context.selectedFavoriteCategory" class="anilist-favorite-grid" :class="{ 'is-seven': context.favoriteItems.length === 7 }">
            <a v-for="item in context.favoriteItems" :key="item.id" class="anilist-favorite-card" :class="{ 'is-webnovel': context.selectedFavoriteCategory === 'webnovels' }" :href="item.url" target="_blank" rel="noreferrer" :title="item.title">
              <span class="anilist-favorite-image">
                <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
                <span v-else>{{ item.title.slice(0, 1) }}</span>
              </span>
              <span class="anilist-favorite-title">{{ item.title }}</span>
              <span class="anilist-favorite-arrow" aria-hidden="true">↗</span>
            </a>
            <p v-if="!context.favoriteItems.length" class="favorites-empty">No favourites in this category.</p>
          </div>
        </Transition>
      </section>
      <div class="social-area" id="elsewhere">
        <div class="social-area-heading"><span>ELSEWHERE</span></div>
        <div class="social-list">
          <a v-for="social in context.socials" :key="social.name" v-tactile class="social-row tactile-surface" :href="social.href" target="_blank" rel="noreferrer">
            <img :src="'/brands/' + social.logo + '.svg'" :alt="social.name" width="22" height="22" loading="lazy" />
            <span><strong>{{ social.name }}</strong><small>{{ social.handle }}</small></span><span class="social-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
</template>
