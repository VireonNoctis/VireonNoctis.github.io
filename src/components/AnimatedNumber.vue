<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(defineProps<{
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  notation?: "standard" | "compact";
}>(), { decimals: 0, duration: 1250, prefix: "", suffix: "", notation: "standard" });

const element = ref<HTMLElement | null>(null);
const displayed = ref(0);
const visible = ref(false);
let observer: IntersectionObserver | null = null;
let frame = 0;
let current = 0;

const formatter = computed(() => new Intl.NumberFormat("en-US", {
  minimumFractionDigits: props.decimals,
  maximumFractionDigits: props.decimals,
  notation: props.notation,
  compactDisplay: "short"
}));
const targetText = computed(() => formatter.value.format(props.value));

function stop() {
  if (frame) window.cancelAnimationFrame(frame);
  frame = 0;
}

function animate() {
  stop();
  if (!Number.isFinite(props.value)) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    current = props.value;
    displayed.value = props.value;
    return;
  }
  const from = current;
  const start = performance.now();
  const duration = Math.max(250, props.duration);
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    const next = from + (props.value - from) * eased;
    displayed.value = next;
    current = next;
    if (progress < 1) frame = window.requestAnimationFrame(tick);
    else {
      current = props.value;
      displayed.value = props.value;
      frame = 0;
    }
  };
  frame = window.requestAnimationFrame(tick);
}

onMounted(() => {
  if (!element.value) return;
  if (!("IntersectionObserver" in window)) {
    visible.value = true;
    animate();
    return;
  }
  observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    visible.value = true;
    observer?.disconnect();
    observer = null;
    animate();
  }, { threshold: 0.25 });
  observer.observe(element.value);
});
watch(() => props.value, () => { if (visible.value) animate(); });
watch(() => props.decimals, () => { if (visible.value) animate(); });
onBeforeUnmount(() => {
  stop();
  observer?.disconnect();
});
</script>

<template>
  <span ref="element" class="animated-number" :aria-label="prefix + targetText + suffix" aria-live="off">
    {{ prefix }}{{ formatter.format(displayed) }}{{ suffix }}
  </span>
</template>