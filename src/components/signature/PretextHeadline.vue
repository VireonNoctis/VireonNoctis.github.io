<script setup lang="ts">
import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";
import { onBeforeUnmount, onMounted, ref } from "vue";

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasAvailable = ref(true);
const canvasHeight = ref(104);
const headline = "Stand out in\nevery inbox.";
const srText = headline.replace(/\s+/g, " ");

let resizeObserver: ResizeObserver | null = null;
let animationFrame = 0;
let disposed = false;
let hasStarted = false;
let typingComplete = false;
let visibleCharacters = 0;
let totalCharacters = 0;
let width = 0;
let height = 0;
let pixelRatio = 1;
let fontSize = 64;
let lineHeight = 72;
let font = "";
let context: CanvasRenderingContext2D | null = null;
let lines: { text: string }[] = [];
let startTime = 0;

function getCharacters(value: string): string[] {
  return Array.from(value);
}

function draw(revealCount: number) {
  const ctx = context;
  const element = canvas.value;
  if (!ctx || !element) return;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(246, 249, 250, 0.97)";
  ctx.shadowColor = "rgba(128, 206, 236, 0.22)";
  ctx.shadowBlur = 16;

  let consumed = 0;
  let caretX = width / 2;
  let caretY = 0;
  let caretVisible = false;

  for (let index = 0; index < lines.length; index++) {
    const lineCharacters = getCharacters(lines[index].text);
    const remaining = Math.max(0, revealCount - consumed);
    const shownCount = Math.min(lineCharacters.length, remaining);
    const shown = lineCharacters.slice(0, shownCount).join("");
    const y = index * lineHeight;

    if (shown) {
      ctx.fillText(shown, width / 2, y);
      caretX = width / 2 + ctx.measureText(shown).width / 2 + 5;
      caretY = y + Math.max(5, fontSize * 0.08);
      caretVisible = true;
    }

    consumed += lineCharacters.length;
    if (shownCount < lineCharacters.length) break;
  }

  ctx.shadowBlur = 0;
  if (caretVisible && revealCount < totalCharacters) {
    ctx.fillStyle = "rgba(169, 220, 227, 0.95)";
    ctx.fillRect(caretX, caretY, 1.6, fontSize * 0.72);
  } else if (revealCount >= totalCharacters) {
    const finalLine = lines[lines.length - 1];
    if (finalLine) {
      const finalText = finalLine.text;
      caretX = width / 2 + ctx.measureText(finalText).width / 2 + 5;
      caretY = (lines.length - 1) * lineHeight + Math.max(5, fontSize * 0.08);
      ctx.fillStyle = "rgba(169, 220, 227, 0.95)";
      ctx.fillRect(caretX, caretY, 1.6, fontSize * 0.72);
    }
  }
}

function layout() {
  const element = canvas.value;
  const host = element?.parentElement;
  if (!element || !host) return;

  const bounds = host.getBoundingClientRect();
  width = Math.max(240, bounds.width);
  fontSize = Math.min(84, Math.max(38, width * 0.078));
  lineHeight = fontSize * 1.12;
  font = '500 ' + fontSize + 'px "Satoshi", "Helvetica Neue", Arial, sans-serif';

  const prepared = prepareWithSegments(headline, font, { whiteSpace: "pre-wrap", letterSpacing: -1.1 });
  const result = layoutWithLines(prepared, Math.max(220, width - 4), lineHeight);
  lines = result.lines;
  totalCharacters = lines.reduce((sum, line) => sum + getCharacters(line.text).length, 0);
  height = Math.max(lineHeight, result.height) + 10;
  canvasHeight.value = height;

  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.7);
  element.width = Math.max(1, Math.round(width * pixelRatio));
  element.height = Math.max(1, Math.round(height * pixelRatio));
  element.style.width = "100%";
  context = element.getContext("2d", { alpha: true });
  if (!context) {
    canvasAvailable.value = false;
    typingComplete = true;
    return;
  }

  if (typingComplete || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    visibleCharacters = totalCharacters;
  }
  draw(visibleCharacters);
}

function animate(now: number) {
  if (disposed || typingComplete) return;
  const elapsed = now - startTime;
  visibleCharacters = Math.min(totalCharacters, Math.floor(elapsed / 57));
  draw(visibleCharacters);

  if (visibleCharacters >= totalCharacters) {
    typingComplete = true;
    animationFrame = 0;
    return;
  }
  animationFrame = window.requestAnimationFrame(animate);
}

async function startTyping() {
  if (hasStarted || disposed) return;
  hasStarted = true;
  try {
    await document.fonts.ready;
  } catch {
    // The system font fallback is still measured and rendered.
  }
  if (disposed) return;
  layout();
  if (!canvasAvailable.value) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typingComplete = true;
    visibleCharacters = totalCharacters;
    draw(visibleCharacters);
    return;
  }

  startTime = performance.now();
  animationFrame = window.requestAnimationFrame(animate);
}

onMounted(() => {
  layout();
  const host = canvas.value?.parentElement;
  if ("ResizeObserver" in window && host) {
    resizeObserver = new ResizeObserver(() => {
      layout();
      if (!typingComplete && hasStarted) {
        startTime = performance.now() - visibleCharacters * 57;
      }
    });
    resizeObserver.observe(host);
  } else {
    window.addEventListener("resize", layout, { passive: true });
  }
  void startTyping();
});

onBeforeUnmount(() => {
  disposed = true;
  if (animationFrame) window.cancelAnimationFrame(animationFrame);
  resizeObserver?.disconnect();
  window.removeEventListener("resize", layout);
});
</script>

<template>
  <div class="signature-pretext-headline">
    <h1 v-if="canvasAvailable" class="signature-visually-hidden">{{ srText }}</h1>
    <h1 v-else class="signature-pretext-fallback">Stand out in <span>every inbox.</span></h1>
    <canvas v-if="canvasAvailable"
      ref="canvas"
      class="signature-pretext-canvas"
      :style="{ height: canvasHeight + 'px' }"
      role="presentation"
      aria-hidden="true"
    ></canvas>
  </div>
</template>
