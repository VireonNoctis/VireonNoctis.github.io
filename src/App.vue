<script setup lang="ts">
import { proxyRefs } from "vue";
import IntroLoader from "./components/portfolio/IntroLoader.vue";
import HeroSection from "./components/portfolio/HeroSection.vue";
import ProfileSection from "./components/portfolio/ProfileSection.vue";
import WorkSection from "./components/portfolio/WorkSection.vue";
import StackSection from "./components/portfolio/StackSection.vue";
import ArchiveSection from "./components/portfolio/ArchiveSection.vue";
import SiteFooter from "./components/portfolio/SiteFooter.vue";
import TechDetailsModal from "./components/portfolio/TechDetailsModal.vue";
import { usePortfolioPage } from "./composables/usePortfolioPage";
const page: any = proxyRefs(usePortfolioPage());
</script>

<template>
  <IntroLoader />
  <main id="main-content" tabindex="-1" @click.capture="page.handleInternalNavigation">
    <a class="skip-link" href="#profile">Skip to content</a>
    <div class="reading-progress" :style="{ transform: 'scaleX(' + page.scrollProgress + ')' }" aria-hidden="true"></div>
    <HeroSection />
    <ProfileSection />
    <WorkSection :context="page" />
    <StackSection :context="page" />
    <ArchiveSection :context="page" />
    <SiteFooter :context="page" />
  </main>
  <TechDetailsModal :context="page" />
</template>
