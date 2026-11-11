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

mat2 rotate2(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float sdRoundBox(vec3 p, vec3 bounds, float radius) {
  vec3 q = abs(p) - bounds;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - radius;
}

float smoothUnion(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float mapScene(vec3 p, out float material) {
  float time = u_time * u_motion;

  // A single folded metal slab twists along its vertical axis.
  vec3 ribbon = p;
  float twist = ribbon.y * 0.82 + 0.16 * sin(time * 0.18) + u_pointer.x * 0.16;
  ribbon.xz = rotate2(twist) * ribbon.xz;
  ribbon.xy = rotate2(0.055 * sin(time * 0.13) + u_pointer.y * 0.055) * ribbon.xy;

  float width = 0.455 + 0.035 * sin(ribbon.y * 2.1 + time * 0.12);
  float blade = sdRoundBox(ribbon, vec3(width, 0.94, 0.078), 0.055);

  // A bevelled negative channel cuts a clean opening through the blade.
  float channel = sdRoundBox(ribbon - vec3(0.0, 0.0, 0.105), vec3(0.17, 0.67, 0.075), 0.035);
  blade = max(blade, -channel);

  // A slim, offset rear fold gives the sculpture real depth and parallax.
  vec3 spine = p;
  spine.xz = rotate2(-spine.y * 0.56 - 0.46 + 0.08 * sin(time * 0.16)) * spine.xz;
  spine.z -= 0.19;
  float spineDistance = sdRoundBox(spine, vec3(0.105, 0.82, 0.052), 0.038);

  float sculpture = smoothUnion(blade, spineDistance, 0.065);
  float floorDistance = p.y + 1.045;
  if (sculpture < floorDistance) {
    material = 1.0;
    return sculpture;
  }
  material = 2.0;
  return floorDistance;
}

float rayMarch(vec3 origin, vec3 direction, out float material, out vec3 position) {
  float distanceTravelled = 0.0;
  material = 0.0;
  position = vec3(0.0);
  for (int step = 0; step < 88; step++) {
    vec3 samplePosition = origin + direction * distanceTravelled;
    float sampleMaterial;
    float distanceToScene = mapScene(samplePosition, sampleMaterial);
    if (distanceToScene < 0.0017) {
      material = sampleMaterial;
      position = samplePosition;
      return distanceTravelled;
    }
    distanceTravelled += max(distanceToScene * 0.82, 0.001);
    if (distanceTravelled > 10.5) break;
  }
  return -1.0;
}

vec3 surfaceNormal(vec3 p) {
  float material;
  const float epsilon = 0.0024;
  float x1 = mapScene(p + vec3(epsilon, 0.0, 0.0), material);
  float x2 = mapScene(p - vec3(epsilon, 0.0, 0.0), material);
  float y1 = mapScene(p + vec3(0.0, epsilon, 0.0), material);
  float y2 = mapScene(p - vec3(0.0, epsilon, 0.0), material);
  float z1 = mapScene(p + vec3(0.0, 0.0, epsilon), material);
  float z2 = mapScene(p - vec3(0.0, 0.0, epsilon), material);
  return normalize(vec3(x1 - x2, y1 - y2, z1 - z2));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / max(1.0, u_resolution.y);
  float time = u_time * u_motion;

  float yaw = 0.18 * sin(time * 0.14) + u_pointer.x * 0.13;
  float pitch = 0.035 * sin(time * 0.11) + u_pointer.y * 0.07;
  vec3 cameraOrigin = vec3(sin(yaw) * 4.05, 0.08 + pitch, cos(yaw) * 4.05);
  vec3 target = vec3(0.0, -0.03, 0.0);
  vec3 forward = normalize(target - cameraOrigin);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  vec3 rayDirection = normalize(uv.x * right * 1.08 + uv.y * up * 1.08 + forward * 1.72);

  float material;
  vec3 hitPosition;
  float hitDistance = rayMarch(cameraOrigin, rayDirection, material, hitPosition);

  float vignette = 1.0 - smoothstep(0.38, 1.15, length(uv));
  vec3 background = vec3(0.008, 0.009, 0.011);
  float haze = exp(-length(uv - vec2(0.12, 0.05)) * 2.8) * 0.10;
  background += vec3(0.16, 0.17, 0.18) * haze;
  vec3 color = background * vignette;
  float alpha = haze * 0.42;

  if (hitDistance > 0.0 && material < 1.5) {
    vec3 normal = surfaceNormal(hitPosition);
    vec3 viewDirection = normalize(cameraOrigin - hitPosition);
    vec3 lightA = normalize(vec3(-0.58, 0.82, 0.52));
    vec3 lightB = normalize(vec3(0.78, 0.18, 0.38));
    float diffuseA = max(dot(normal, lightA), 0.0);
    float diffuseB = max(dot(normal, lightB), 0.0);
    vec3 halfA = normalize(lightA + viewDirection);
    vec3 halfB = normalize(lightB + viewDirection);
    float specularA = pow(max(dot(normal, halfA), 0.0), 72.0);
    float specularB = pow(max(dot(normal, halfB), 0.0), 34.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 4.0);

    vec3 reflectedDirection = reflect(-viewDirection, normal);
    float reflectionBand = 0.5 + 0.5 * cos(reflectedDirection.x * 10.0 + reflectedDirection.y * 4.0);
    vec3 environment = mix(vec3(0.018, 0.022, 0.026), vec3(0.76, 0.79, 0.82), smoothstep(-0.28, 0.62, reflectedDirection.y));
    environment += vec3(0.22, 0.23, 0.24) * pow(reflectionBand, 12.0);

    color = environment * vec3(0.72, 0.75, 0.78);
    color += vec3(0.15, 0.16, 0.17) * diffuseA;
    color += vec3(0.08, 0.085, 0.09) * diffuseB;
    color += vec3(1.0) * specularA * 1.35;
    color += vec3(0.78, 0.82, 0.86) * specularB * 0.48;
    color += vec3(0.68, 0.72, 0.76) * fresnel * 0.58;
    color = clamp(color, 0.0, 1.55);
    alpha = 1.0;
  } else if (hitDistance > 0.0 && material > 1.5) {
    float distanceFromOrigin = length(hitPosition.xz);
    float floorLight = exp(-distanceFromOrigin * 1.7) * 0.16;
    float reflectionLine = exp(-abs(uv.y + 0.47) * 24.0) * exp(-abs(uv.x) * 1.5);
    color += vec3(0.22, 0.23, 0.24) * floorLight;
    color += vec3(0.28, 0.29, 0.30) * reflectionLine;
    alpha = 0.72;
  }

  outColor = vec4(color, alpha);
}`;

let dispose: (() => void) | null = null;

onMounted(() => {
  const element = canvas.value;
  const surface = element?.parentElement;
  if (!element || !surface) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = element.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
    premultipliedAlpha: false
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
      console.error("NothingWebGL shader compile failed:", gl.getShaderInfoLog(shader));
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
    console.error("NothingWebGL program link failed:", gl.getProgramInfoLog(program));
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
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
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
    gl.viewport(0, 0, element.width, element.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
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
    const deviceRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    const pixelRatio = Math.min(deviceRatio, 1100 / Math.max(bounds.width, bounds.height, 1));
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));
    if (element.width !== width || element.height !== height) {
      element.width = width;
      element.height = height;
    }
    draw(performance.now());
  };

  const move = (event: PointerEvent) => {
    const bounds = surface.getBoundingClientRect();
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
    if (now - lastFrameAt >= 42) {
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

  surface.addEventListener("pointermove", move, { passive: true });
  surface.addEventListener("pointerleave", leave, { passive: true });
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
    surface.removeEventListener("pointermove", move);
    surface.removeEventListener("pointerleave", leave);
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
