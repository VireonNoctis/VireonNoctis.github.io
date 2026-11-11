<script setup lang="ts">
import NothingWebGL from "../NothingWebGL.vue";
</script>

<template>
<section class="hero section-shell" id="top">
      <div class="hero-art" aria-hidden="true">
        <NothingWebGL />
      </div>
      <div class="hero-main">
        <div class="hero-copy">
          <h1 aria-label="Vireon Noctis"><span class="hero-title-line">VIREON</span><span class="hero-title-line hero-title-outline">NOCTIS</span></h1>
          <div class="hero-intro-row">
            <p>Building businesses, software systems, and considered digital experiences.</p>
            <div class="hero-actions">
              <a v-tactile class="action-link action-link-primary tactile-surface" href="#work">Explore selected work<span aria-hidden="true">↘</span></a>
              <a class="action-link action-link-secondary" href="#profile">Discover the approach</a>
            </div>
          </div>
        </div>
      </div>
    </section>
</template>
