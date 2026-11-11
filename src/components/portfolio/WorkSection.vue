<script setup lang="ts">
import AnimatedNumber from "../AnimatedNumber.vue";
import type { PortfolioPageContext } from "../../types/PortfolioPageContext";
const props = defineProps<{ context: PortfolioPageContext }>();
const context = props.context;
</script>

<template>
<section class="work-section section-shell section-space" id="work">
      <div class="work-layout">
        <div class="work-intro">
              <h2>MADE TO<br /><em>MATTER.</em></h2>
          <p>Public codebases, tools, platforms, and creative systems with real implementations.</p>
          <a class="inline-link" href="https://github.com/VireonNoctis?tab=repositories" target="_blank" rel="noreferrer">All repositories <span aria-hidden="true">↗</span></a>
          <div class="work-live">
            <strong><template v-if="context.live.repos !== undefined"><AnimatedNumber :value="context.live.repos" /> repositories</template><template v-else>Repository data loading</template></strong>
          </div>
        </div>
        <div class="project-stack">
          <details v-for="(project, index) in context.projects" :key="project.name" class="project-stack-card" :style="{ '--stack-top': (108 + index * 14) + 'px', zIndex: 10 + index }">
            <summary v-tactile class="project-card-shell tactile-surface">
              <div class="project-card-visual">
                <div class="project-card-mark">
                  <img v-if="project.logo" :src="'/brands/' + project.logo + '.svg'" :alt="project.name + ' mark'" width="112" height="112" loading="lazy" />
                  <span v-else class="project-card-wordmark">{{ project.mark }}</span>
                </div>
              </div>
              <div class="project-card-copy">
                <div class="project-card-topline"><span aria-hidden="true">↗</span></div>
                <h3>{{ project.name }}</h3>
                <p class="project-card-subtitle">{{ project.subtitle }}</p>
                <p class="project-card-description">{{ project.description }}</p>
                <div class="tag-row"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
                <div class="project-card-expand"><span>Project details</span><span class="expand-symbol" aria-hidden="true">＋</span></div>
              </div>
            </summary>
            <div class="project-expanded-content">
              <p>{{ project.detail }}</p>
              <a v-tactile class="tactile-surface" :href="project.url" target="_blank" rel="noreferrer">Open project <span aria-hidden="true">↗</span></a>
              <span v-if="project.role">{{ project.role }}</span>
            </div>
          </details>
        </div>
      </div>
    </section>
</template>
