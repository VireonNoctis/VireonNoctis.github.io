<script setup lang="ts">
import AnimatedNumber from "../AnimatedNumber.vue";
import type { PortfolioPageContext } from "../../types/PortfolioPageContext";
const props = defineProps<{ context: PortfolioPageContext }>();
const context = props.context;
</script>

<template>
<section class="stack-section section-shell section-space" id="stack" v-reveal>
      <div class="stack-heading"><h2>BUILT WITH<br /><em>INTENT.</em></h2><p>The technologies behind the work — from reactive interfaces to systems programming.</p></div>
      <div class="stack-modules">
        <article v-for="module in context.stackModules" :key="module.name" class="stack-module">
          <div class="stack-module-head"><img :src="'/brands/tech-' + module.logo + '.svg'" :alt="module.name" width="26" height="26" loading="lazy" /></div>
          <h3>{{ module.name }}</h3><p>{{ module.copy }}</p>
        </article>
      </div>
      <div class="code-counted" aria-label="Code counted language explorer">
        <div class="code-counted-layout">
          <div class="code-counted-heading">
            <div class="code-counted-title">
              <h3>Code, counted.</h3>
              <p>Repository scans and separately supplied project estimates.</p>
            </div>
            <div class="code-counted-totals">
              <div><strong><AnimatedNumber :value="context.codeStats?.totals.lines ?? 0" notation="compact" :decimals="1" immediate /></strong><span>SCANNED LINES</span></div>
              <div><strong><AnimatedNumber :value="context.codeStats?.totals.repositories ?? 0" immediate /></strong><span>REPOSITORIES</span></div>
              <div><strong><AnimatedNumber :value="context.languageCards.length" immediate /></strong><span>LANGUAGE PROFILES</span></div>
              <div><strong><AnimatedNumber :value="context.live.commits ?? 0" immediate /></strong><span>TOTAL COMMITS</span></div>
            </div>
          </div>
          <div class="project-language-grid">
            <button v-for="(tech, index) in context.languageCards" :key="tech.name" v-tactile class="project-language-tile tactile-surface" :style="{ '--stack-top': (108 + index * 6) + 'px', '--language-accent': context.languageAccent(tech.name), zIndex: 10 + index }" type="button" :aria-label="'Open ' + tech.name + ' statistics, ' + context.formatted(tech.lines) + ' total lines'" @click="context.openTech(tech, $event)">
              <span class="project-language-logo">
                <img v-if="tech.logo" :src="'/brands/tech-' + tech.logo + '.svg'" alt="" loading="lazy" />
                <span v-else class="project-language-generic">&lt;/&gt;</span>
              </span>
              <span class="project-language-copy"><strong>{{ tech.name }}</strong></span>
              <span class="project-language-lines"><strong><AnimatedNumber :value="tech.lines" immediate /></strong><small>LINES</small></span>
              <span class="project-language-arrow" aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>
    </section>
</template>
