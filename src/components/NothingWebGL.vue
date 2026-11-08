<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

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
float hash(vec2 point) {
  point = fract(point * vec2(123.34, 456.21));
  point += dot(point, point + 45.32);
  return fract(point.x * point.y);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / max(1.0, u_resolution.y);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float time = u_time * u_motion;
  float radius = length(p);
  float angle = atan(p.y, p.x);
  float warp = 0.016 * sin(angle * 8.0 + time * 0.62) + 0.008 * cos(angle * 15.0 - time * 0.31);
  float ringA = 1.0 - smoothstep(0.003, 0.012, abs(radius + warp - 0.285));
  float ringB = 1.0 - smoothstep(0.003, 0.010, abs(radius - 0.405));
  float dashA = step(0.24, fract((angle + 3.14159) * 3.8 + time * 0.035));
  float dashB = step(0.34, fract((angle + 3.14159) * 2.7 - time * 0.025));
  ringA *= dashA;
  ringB *= dashB;
  vec2 cell = fract(p * 19.0) - 0.5;
  float dotField = 1.0 - smoothstep(0.035, 0.115, length(cell));
  float dotMask = 0.42 + 0.58 * smoothstep(0.12, 0.48, radius);
  float grid = 1.0 - smoothstep(0.0, 0.012, min(
    abs(fract(p.x * 5.5) - 0.5),
    abs(fract(p.y * 5.5) - 0.5)
  ));
  float pointerDistance = length(p - u_pointer);
  float pointerRipple = exp(-pointerDistance * 5.2)
                      * (0.5 + 0.5 * sin(pointerDistance * 42.0 - time * 2.2));
  float scanY = 0.22 * sin(time * 0.25);
  float scan = 1.0 - smoothstep(0.001, 0.006, abs(p.y - scanY));
  float fleck = step(0.986, hash(floor(gl_FragCoord.xy / 5.0))) * smoothstep(0.18, 0.58, radius);
  float alpha = dotField * dotMask * 0.12 + grid * 0.035 + ringA * 0.28
              + ringB * 0.17 + pointerRipple * 0.20 + scan * 0.035 + fleck * 0.16;
  alpha *= 1.0 - smoothstep(0.48, 0.82, radius);
  outColor = vec4(vec3(0.96), clamp(alpha, 0.0, 0.58));
}`;

let dispose: (() => void) | null = null;

onMounted(() => {
  const element = canvas.value;
  const surface = element?.parentElement;
  if (!element || !surface) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = element.getContext("webgl2", {
    alpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power"
  });
  if (!gl) {
    surface.dataset.webgl = "fallback";
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
    surface.dataset.webgl = "fallback";
    return;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    surface.dataset.webgl = "fallback";
    return;
  }

  const vao = gl.createVertexArray();
  if (!vao) {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    surface.dataset.webgl = "fallback";
    return;
  }
  gl.bindVertexArray(vao);
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const resolution = gl.getUniformLocation(program, "u_resolution");
  const pointer = gl.getUniformLocation(program, "u_pointer");
  const time = gl.getUniformLocation(program, "u_time");
  const motion = gl.getUniformLocation(program, "u_motion");
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let running = false;
  let startedAt = 0;
  let lastFrameAt = 0;

  const draw = (now: number) => {
    const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(resolution, element.width, element.height);
    gl.uniform2f(pointer, pointerX, pointerY);
    gl.uniform1f(time, elapsed);
    gl.uniform1f(motion, reduceMotion ? 0 : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    const bounds = element.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (element.width !== width || element.height !== height) {
      element.width = width;
      element.height = height;
      gl.viewport(0, 0, width, height);
    }
    draw(performance.now());
  };
  const move = (event: PointerEvent) => {
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * (bounds.width / bounds.height);
    pointerY = 0.5 - (event.clientY - bounds.top) / bounds.height;
    if (reduceMotion) draw(performance.now());
  };
  const leave = () => {
    pointerX = 0;
    pointerY = 0;
    if (reduceMotion) draw(performance.now());
  };
  const animate = (now: number) => {
    if (!running) return;
    if (now - lastFrameAt >= 33) {
      draw(now);
      lastFrameAt = now;
    }
    frame = window.requestAnimationFrame(animate);
  };
  const start = () => {
    if (reduceMotion || document.hidden || running) return;
    startedAt = performance.now();
    lastFrameAt = 0;
    running = true;
    frame = window.requestAnimationFrame(animate);
  };
  const visibility = () => {
    if (document.hidden) {
      running = false;
      window.cancelAnimationFrame(frame);
    } else if (reduceMotion) {
      draw(performance.now());
    } else {
      start();
    }
  };
  const target = element.closest<HTMLElement>(".hero-art") ?? surface;
  target.addEventListener("pointermove", move, { passive: true });
  target.addEventListener("pointerleave", leave, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  const observer = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  observer?.observe(surface);
  window.addEventListener("resize", resize, { passive: true });
  surface.dataset.webgl = "ready";
  resize();
  if (reduceMotion) draw(performance.now());
  else start();

  dispose = () => {
    running = false;
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("resize", resize);
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", visibility);
    gl.deleteVertexArray(vao);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    delete surface.dataset.webgl;
  };
});

onBeforeUnmount(() => {
  dispose?.();
  dispose = null;
});
</script>

<template>
  <canvas ref="canvas" class="nothing-webgl-canvas" aria-hidden="true"></canvas>
</template>