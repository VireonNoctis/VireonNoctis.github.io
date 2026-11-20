<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(defineProps<{ paused?: boolean }>(), { paused: false });
const surface = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

const vertexShaderSource = `#version 300 es
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_motion;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += noise(p) * amplitude;
    p = p * 2.03 + vec2(17.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / max(1.0, u_resolution.y);
  vec2 p = vec2(uv.x * aspect, uv.y);
  p += u_pointer * vec2(0.035, 0.024);

  float t = u_time * u_motion;
  vec2 cloudPoint = p * vec2(1.35, 1.75);
  float cloudA = fbm(cloudPoint * 1.55 + vec2(t * 0.045, -t * 0.075));
  float cloudB = fbm(cloudPoint * 3.45 + vec2(-t * 0.08, t * 0.035));
  float cloudC = fbm(cloudPoint * 6.2 + vec2(t * 0.025, t * 0.09));
  float cloudField = cloudA * 0.55 + cloudB * 0.32 + cloudC * 0.13;

  vec3 color = mix(
    vec3(0.026, 0.071, 0.101),
    vec3(0.006, 0.015, 0.031),
    smoothstep(0.12, 0.96, uv.y)
  );

  float lowerHaze = exp(-pow((uv.y - (0.33 + (cloudA - 0.5) * 0.105)) / 0.19, 2.0));
  float highHaze = exp(-pow((uv.y - (0.58 + (cloudB - 0.5) * 0.13)) / 0.23, 2.0));
  float cloudMask = smoothstep(0.40, 0.76, cloudField);
  float mist = lowerHaze * cloudMask;
  float upperMist = highHaze * smoothstep(0.46, 0.78, cloudA * 0.66 + cloudB * 0.34);

  color = mix(color, vec3(0.11, 0.23, 0.31), mist * 0.74);
  color = mix(color, vec3(0.065, 0.15, 0.22), upperMist * 0.46);

  float bloomLeft = exp(-length((uv - vec2(0.055, 0.08)) * vec2(1.12, 1.38)) * 4.1);
  float bloomMiddle = exp(-length((uv - vec2(0.57, 0.39)) * vec2(0.92, 1.1)) * 4.0);
  float bloomRight = exp(-length((uv - vec2(0.92, 0.53)) * vec2(1.0, 1.3)) * 4.6);
  color += vec3(0.31, 0.53, 0.67) * bloomLeft * 0.76;
  color += vec3(0.10, 0.29, 0.42) * bloomMiddle * 0.52;
  color += vec3(0.035, 0.15, 0.24) * bloomRight * 0.62;

  float farNoise = fbm(vec2(p.x * 2.6 + 3.0, 4.1));
  float nearNoise = fbm(vec2(p.x * 4.3 + 9.0, 8.7));
  float farRidge = 0.175
    + sin(p.x * 1.45 + 1.15) * 0.052
    + sin(p.x * 3.85 + 0.25) * 0.028
    + (farNoise - 0.5) * 0.072;
  float nearRidge = 0.095
    + sin(p.x * 2.25 + 2.4) * 0.047
    + sin(p.x * 6.2 + 0.75) * 0.021
    + (nearNoise - 0.5) * 0.058;
  float farMountain = 1.0 - smoothstep(farRidge - 0.009, farRidge + 0.012, uv.y);
  float nearMountain = 1.0 - smoothstep(nearRidge - 0.006, nearRidge + 0.009, uv.y);

  color = mix(color, vec3(0.018, 0.045, 0.066), farMountain * 0.88);
  color = mix(color, vec3(0.006, 0.013, 0.023), nearMountain);

  float ridgeFog = exp(-abs(uv.y - farRidge - 0.035) * 22.0) * (1.0 - nearMountain);
  color += vec3(0.07, 0.14, 0.18) * ridgeFog * 0.28;

  float vignette = 1.0 - smoothstep(
    0.60,
    1.28,
    length(vec2((uv.x - 0.5) * aspect, (uv.y - 0.52) * 1.12))
  );
  float grain = (hash(gl_FragCoord.xy) - 0.5) * 0.018;
  color = color * (0.79 + vignette * 0.21) + grain;
  color = clamp(color, 0.0, 1.0);

  outColor = vec4(color, 1.0);
}`;

let dispose: (() => void) | null = null;
let applyPause: ((paused: boolean) => void) | null = null;

watch(() => props.paused, (paused) => applyPause?.(paused));

onMounted(() => {
  const host = surface.value;
  const element = canvas.value;
  if (!host || !element) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = element.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power"
  });

  if (!gl) {
    host.dataset.webgl = "fallback";
    return;
  }

  const compile = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, vertexShaderSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();

  if (!vertex || !fragment || !program) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    if (program) gl.deleteProgram(program);
    host.dataset.webgl = "fallback";
    return;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    host.dataset.webgl = "fallback";
    return;
  }

  const vao = gl.createVertexArray();
  if (!vao) {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    host.dataset.webgl = "fallback";
    return;
  }

  gl.bindVertexArray(vao);
  gl.useProgram(program);
  gl.clearColor(0, 0, 0, 1);

  const resolution = gl.getUniformLocation(program, "u_resolution");
  const pointer = gl.getUniformLocation(program, "u_pointer");
  const time = gl.getUniformLocation(program, "u_time");
  const motion = gl.getUniformLocation(program, "u_motion");

  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let running = false;
  let startTime = performance.now();
  let lastDraw = 0;
  let paused = props.paused;

  const draw = (now: number) => {
    gl.viewport(0, 0, element.width, element.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(resolution, element.width, element.height);
    gl.uniform2f(pointer, pointerX, pointerY);
    gl.uniform1f(time, (now - startTime) / 1000);
    gl.uniform1f(motion, !reducedMotion && !paused ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    const bounds = host.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.35);
    const scale = Math.min(pixelRatio, 1500 / Math.max(bounds.width, bounds.height, 1));
    element.width = Math.max(1, Math.round(bounds.width * scale));
    element.height = Math.max(1, Math.round(bounds.height * scale));
    draw(performance.now());
  };

  const move = (event: PointerEvent) => {
    const bounds = host.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointerY = (0.5 - (event.clientY - bounds.top) / bounds.height) * 2;
    if (reducedMotion || paused) draw(performance.now());
  };

  const leave = () => {
    pointerX = 0;
    pointerY = 0;
    if (reducedMotion || paused) draw(performance.now());
  };

  const animate = (now: number) => {
    if (!running) return;
    if (now - lastDraw >= 33) {
      draw(now);
      lastDraw = now;
    }
    frame = window.requestAnimationFrame(animate);
  };

  const start = () => {
    if (reducedMotion || paused || document.hidden || running) return;
    running = true;
    lastDraw = 0;
    frame = window.requestAnimationFrame(animate);
  };

  const stop = () => {
    running = false;
    window.cancelAnimationFrame(frame);
    draw(performance.now());
  };

  applyPause = (nextPaused: boolean) => {
    paused = nextPaused;
    if (paused || reducedMotion) stop();
    else start();
  };

  const visibility = () => {
    if (document.hidden) {
      running = false;
      window.cancelAnimationFrame(frame);
    } else if (paused || reducedMotion) {
      draw(performance.now());
    } else {
      start();
    }
  };

  const contextLost = (event: Event) => {
    event.preventDefault();
    running = false;
    window.cancelAnimationFrame(frame);
    host.dataset.webgl = "fallback";
  };

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("blur", leave);
  element.addEventListener("webglcontextlost", contextLost, false);
  document.addEventListener("visibilitychange", visibility);

  const observer = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  observer?.observe(host);
  window.addEventListener("resize", resize, { passive: true });

  host.dataset.webgl = "ready";
  resize();
  if (!reducedMotion && !paused) start();

  dispose = () => {
    running = false;
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("blur", leave);
    element.removeEventListener("webglcontextlost", contextLost);
    document.removeEventListener("visibilitychange", visibility);
    gl.deleteVertexArray(vao);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    delete host.dataset.webgl;
  };
});

onBeforeUnmount(() => {
  dispose?.();
  dispose = null;
  applyPause = null;
});
</script>

<template>
  <div ref="surface" class="signature-atmosphere" aria-hidden="true">
    <canvas ref="canvas" class="signature-atmosphere-canvas"></canvas>
  </div>
</template>
