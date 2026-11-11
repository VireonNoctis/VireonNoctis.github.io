<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(defineProps<{
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  notation?: "standard" | "compact";
  immediate?: boolean;
}>(), {
  decimals: 0,
  duration: 1750,
  prefix: "",
  suffix: "",
  notation: "standard",
  immediate: false
});

const element = ref<HTMLElement | null>(null);
const displayed = ref(0);
const isCounting = ref(false);
const safeValue = computed(() => Number.isFinite(props.value) ? Math.max(0, props.value) : 0);
const formatter = computed(() => new Intl.NumberFormat("en-US", {
  minimumFractionDigits: props.decimals,
  maximumFractionDigits: props.decimals,
  notation: props.notation,
  compactDisplay: "short"
}));
const targetText = computed(() => formatter.value.format(safeValue.value));

let frame = 0;
let pulseFrame = 0;
let pulseTimer = 0;
let generation = 0;
let mounted = false;

function stopFrame() {
  generation += 1;
  if (frame) window.cancelAnimationFrame(frame);
  frame = 0;
}

function pulse() {
  isCounting.value = false;
  if (pulseFrame) window.cancelAnimationFrame(pulseFrame);
  if (pulseTimer) window.clearTimeout(pulseTimer);
  pulseFrame = window.requestAnimationFrame(() => {
    isCounting.value = true;
    pulseTimer = window.setTimeout(() => {
      isCounting.value = false;
      pulseTimer = 0;
      pulseFrame = 0;
    }, 680);
  });
}

function animate(fromZero = false) {
  stopFrame();
  const run = generation;
  const target = safeValue.value;
  const from = fromZero ? 0 : displayed.value;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    displayed.value = target;
    isCounting.value = false;
    return;
  }

  if (from === target) {
    displayed.value = target;
    return;
  }

  displayed.value = from;
  pulse();
  const start = performance.now();
  const duration = Math.max(650, props.duration);

  const tick = (now: number) => {
    if (run !== generation) return;
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    const next = from + (target - from) * eased;
    displayed.value = props.decimals > 0
      ? Number(next.toFixed(props.decimals + 2))
      : Math.round(next);

    if (progress < 1) {
      frame = window.requestAnimationFrame(tick);
    } else {
      displayed.value = target;
      frame = 0;
    }
  };

  frame = window.requestAnimationFrame(tick);
}

onMounted(() => {
  mounted = true;
  // Start after the first paint so the zero-to-value transition is visible.
  frame = window.requestAnimationFrame(() => animate(true));
});

watch(() => safeValue.value, () => {
  if (mounted) animate(false);
});
watch(() => props.decimals, () => {
  if (mounted) pulse();
});

onBeforeUnmount(() => {
  mounted = false;
  stopFrame();
  if (pulseFrame) window.cancelAnimationFrame(pulseFrame);
  if (pulseTimer) window.clearTimeout(pulseTimer);
});
</script>

<template>
  <span
    ref="element"
    class="animated-number"
    :class="{ 'is-counting': isCounting }"
    :aria-label="prefix + targetText + suffix"
    aria-live="off"
  >{{ prefix }}{{ formatter.format(displayed) }}{{ suffix }}</span>
</template>
