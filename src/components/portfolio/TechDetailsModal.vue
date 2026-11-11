<script setup lang="ts">
import AnimatedNumber from "../AnimatedNumber.vue";
import type { PortfolioPageContext } from "../../types/PortfolioPageContext";
const props = defineProps<{ context: PortfolioPageContext }>();
const context = props.context;
</script>

<template>
<Teleport to="body">
      <div v-if="context.techGlassOpening" class="tech-glass-opening" aria-hidden="true">
        <div class="tech-glass-veil"></div>
        <div class="tech-glass-leaf tech-glass-leaf-left">
          <span class="tech-glass-facet"></span>
          <span class="tech-glass-ridge"></span>
          <span class="tech-glass-index">V / N</span>
        </div>
        <div class="tech-glass-leaf tech-glass-leaf-right">
          <span class="tech-glass-facet"></span>
          <span class="tech-glass-ridge"></span>
          <span class="tech-glass-index">SYSTEM / 03</span>
        </div>
        <div class="tech-glass-opening-core"></div>
        <div class="tech-glass-aperture-line"></div>
      </div>
      <Transition name="tech-dialog">
        <div v-if="context.selectedTech" class="tech-modal-backdrop" role="presentation" @click.self="context.closeTech">
          <section class="tech-modal" role="dialog" aria-modal="true" :aria-label="context.selectedTech.name + ' details'">
            <header class="tech-modal-header"><div class="tech-modal-heading"><span class="tech-modal-logo"><img v-if="context.selectedTech.logo" :class="{ 'is-flight-hidden': context.techIconFlightActive }" :src="'/brands/tech-' + context.selectedTech.logo + '.svg'" :alt="context.selectedTech.name" /><span v-else>&lt;/&gt;</span></span><div><span class="work-live-label">{{ context.selectedTech.kind }}</span><h2>{{ context.selectedTech.name }}</h2></div></div><button v-tactile type="button" class="tech-modal-close tactile-surface" aria-label="Close technology details" @click="context.closeTech">×</button></header>
            <p v-if="context.selectedTech.learningNote" class="tech-modal-note">{{ context.selectedTech.learningNote }} <strong>{{ context.selectedTech.learningStatus }}</strong></p>
            <div class="tech-modal-grid">
              <div><span>TOTAL LINES</span><strong><AnimatedNumber :value="context.selectedTotalLines" immediate /></strong></div>
              <div><span>CHARACTERS</span><strong><AnimatedNumber :value="context.selectedTotalCharacters" immediate /></strong></div>
              <div><span>SCANNED FILES</span><strong><AnimatedNumber :value="context.selectedScannedLanguage?.files ?? 0" immediate /></strong></div>
              <div><span>WORDS</span><strong><AnimatedNumber :value="context.selectedScannedLanguage?.words ?? 0" immediate /></strong></div>
            </div>
            <section v-if="context.selectedEstimateAreas.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><span>SUPPLIED PROJECT ESTIMATES</span><strong>{{ context.selectedEstimateAreas.length }} areas</strong></div>
              <div v-for="entry in context.selectedEstimateAreas" :key="entry.project.id + '-' + entry.area.name" class="tech-modal-row"><span><strong>{{ entry.project.name }}</strong><small>{{ entry.area.name }} / {{ entry.project.classification }}</small></span><span><strong>{{ context.formatted(entry.area.lines) }} lines</strong><small>{{ context.estimateCharacters(entry.area) === null ? "Character estimate unavailable" : "≈ " + context.formatted(context.estimateCharacters(entry.area) || 0) + " characters" }}</small></span></div>
            </section>
            <section v-if="context.selectedRepositories.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><span>REPOSITORY SCAN</span><strong>{{ context.selectedRepositories.length }} repositories</strong></div>
              <a v-for="entry in context.selectedRepositories" :key="entry.project.fullName" class="tech-modal-row" :href="entry.project.url" target="_blank" rel="noreferrer"><span><strong>{{ entry.project.name }}</strong><small>{{ entry.project.role || (entry.project.relationship === "contributor" ? "Major contributor" : "Owned / " + entry.project.branch) }}</small></span><span><strong>{{ context.formatted(entry.language.lines) }}</strong><small>lines / {{ entry.language.files }} files</small></span></a>
            </section>
            <section v-if="context.selectedFrameworkRepositories.length" class="tech-modal-section">
              <div class="tech-modal-section-heading"><span>FRAMEWORK DETECTION</span><strong>{{ context.selectedFrameworkRepositories.length }} repositories</strong></div>
              <a v-for="project in context.selectedFrameworkRepositories" :key="project.fullName" class="tech-modal-row" :href="project.url" target="_blank" rel="noreferrer"><span><strong>{{ project.name }}</strong><small>{{ project.relationship === "contributor" ? project.role || "Contributor project" : "Owned project" }}</small></span><span><strong>{{ (project.frameworks || []).filter((item: string) => item.toLowerCase() === context.selectedTech?.name.toLowerCase()).length }}</strong><small>framework matches</small></span></a>
            </section>
            <p class="tech-modal-footnote">Scanned repository totals and supplied project estimates are shown separately.</p>
          </section>
        </div>
      </Transition>
    </Teleport>
</template>
