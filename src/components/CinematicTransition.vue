<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";

const active = ref(false);
const root = ref<HTMLElement | null>(null);
const leftPanel = ref<HTMLElement | null>(null);
const rightPanel = ref<HTMLElement | null>(null);
const stamp = ref<HTMLElement | null>(null);

let timeline: gsap.core.Timeline | null = null;
let transitioning = false;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function transitionTo(action: () => void): Promise<void> {
  if (reducedMotion()) {
    action();
    return;
  }
  if (transitioning) {
    action();
    return;
  }

  transitioning = true;
  active.value = true;
  await nextTick();

  const rootElement = root.value;
  const left = leftPanel.value;
  const right = rightPanel.value;
  const title = stamp.value;
  if (!rootElement || !left || !right || !title) {
    active.value = false;
    transitioning = false;
    action();
    return;
  }

  timeline?.kill();
  gsap.set(rootElement, { autoAlpha: 1 });
  gsap.set(left, { xPercent: -104, rotateY: 0 });
  gsap.set(right, { xPercent: 104, rotateY: 0 });
  gsap.set(title, { autoAlpha: 0, y: 16 });

  timeline = gsap.timeline({
    onComplete: () => {
      active.value = false;
      transitioning = false;
    }
  });
  timeline
    .to(left, { xPercent: 0, duration: 0.48, ease: "power3.inOut" }, 0)
    .to(right, { xPercent: 0, duration: 0.48, ease: "power3.inOut" }, 0)
    .to(title, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out" }, 0.3)
    .add(action, 0.62)
    .to(title, { autoAlpha: 0, y: -12, duration: 0.2, ease: "power2.in" }, 0.82)
    .to(left, { rotateY: -96, xPercent: -15, duration: 0.72, ease: "power4.inOut" }, 0.86)
    .to(right, { rotateY: 96, xPercent: 15, duration: 0.72, ease: "power4.inOut" }, 0.86)
    .to(rootElement, { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, 1.52);
}

async function playIntro(): Promise<void> {
  let alreadyPlayed = false;
  try {
    alreadyPlayed = window.sessionStorage.getItem("vireon-cinematic-transition") === "played";
  } catch {
    alreadyPlayed = false;
  }
  if (alreadyPlayed || reducedMotion()) return;

  active.value = true;
  await nextTick();
  const rootElement = root.value;
  const left = leftPanel.value;
  const right = rightPanel.value;
  const title = stamp.value;
  if (!rootElement || !left || !right || !title) {
    active.value = false;
    return;
  }

  gsap.set(rootElement, { autoAlpha: 1 });
  gsap.set([left, right], { xPercent: 0, rotateY: 0 });
  gsap.set(title, { autoAlpha: 0, y: 24, scale: 0.96, filter: "blur(12px)" });

  timeline = gsap.timeline({
    onComplete: () => {
      active.value = false;
      try {
        window.sessionStorage.setItem("vireon-cinematic-transition", "played");
      } catch {
        // The intro remains a visual enhancement when storage is unavailable.
      }
    }
  });
  timeline
    .to(title, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.82, ease: "power3.out" }, 0.18)
    .to(title, { autoAlpha: 0, y: -10, duration: 0.3, ease: "power2.in" }, 1.16)
    .to(left, { rotateY: -96, xPercent: -15, duration: 0.92, ease: "power4.inOut" }, 1.28)
    .to(right, { rotateY: 96, xPercent: 15, duration: 0.92, ease: "power4.inOut" }, 1.28)
    .to(rootElement, { autoAlpha: 0, duration: 0.28, ease: "power1.out" }, 2.02);
}

onMounted(() => {
  void playIntro();
});

onBeforeUnmount(() => {
  timeline?.kill();
  timeline = null;
});

defineExpose({ transitionTo });
</script>

<template>
  <div v-if="active" ref="root" class="cinematic-transition" aria-hidden="true">
    <div ref="leftPanel" class="cinematic-transition__panel cinematic-transition__panel--left"></div>
    <div ref="rightPanel" class="cinematic-transition__panel cinematic-transition__panel--right"></div>
    <div class="cinematic-transition__orbit cinematic-transition__orbit--outer"></div>
    <div class="cinematic-transition__orbit cinematic-transition__orbit--inner"></div>
    <div ref="stamp" class="cinematic-transition__stamp">
      <span class="cinematic-transition__wordmark">VIREON</span>
      <span class="cinematic-transition__line">MAKE THE SIGNAL MATTER</span>
      <span class="cinematic-transition__braille">⠿</span>
    </div>
  </div>
</template>
