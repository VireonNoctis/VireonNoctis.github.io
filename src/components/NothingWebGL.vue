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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
  for (int i = 0; i < 4; i++) {
    value += noise(p) * amplitude;
    p = p * 2.04 + vec2(19.1, 7.7);
    amplitude *= 0.5;
  }
  return value;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / max(1.0, u_resolution.y);
  vec2 p = uv;
  p.x += 0.34 + u_pointer.x * 0.12;
  p.y += u_pointer.y * 0.065;

  float t = u_time * u_motion;
  float cloud = fbm(p * 2.15 + vec2(t * 0.11, -t * 0.075));
  float turbulence = fbm(p * 4.25 + vec2(-t * 0.085, t * 0.13));
  float fineNoise = noise(p * 74.0 + vec2(t * 0.3, -t * 0.19));
  vec2 warped = p + vec2((cloud - 0.5) * 0.28, (turbulence - 0.5) * 0.19);

  float waveA = warped.y
    + sin(warped.x * 2.25 + t * 0.17 + cloud * 3.0) * 0.24
    + sin(warped.x * 5.2 - t * 0.13 + turbulence * 2.4) * 0.068;
  float waveB = warped.y * 0.82
    + sin(warped.x * 1.72 - t * 0.135 + turbulence * 2.1) * 0.31 - 0.29;
  float waveC = warped.y * 1.18
    + sin(warped.x * 3.1 + t * 0.105 + cloud * 1.8) * 0.17 + 0.31;
  float waveD = warped.y * 0.66
    + cos(warped.x * 1.35 + t * 0.09 + cloud) * 0.19 - 0.56;

  float sheetA = exp(-abs(waveA) * 3.65);
  float sheetB = exp(-abs(waveB) * 3.1);
  float sheetC = exp(-abs(waveC) * 4.1);
  float sheetD = exp(-abs(waveD) * 4.7);
  float edgeA = exp(-abs(waveA + 0.062 + cloud * 0.036) * 23.0);
  float edgeB = exp(-abs(waveB - 0.105) * 17.0);
  float edgeC = exp(-abs(waveC + 0.042) * 19.0);
  float contourA = pow(max(0.0, 0.5 + 0.5 * cos(waveA * 42.0 + turbulence * 9.0)), 12.0) * sheetA;
  float contourB = pow(max(0.0, 0.5 + 0.5 * cos(waveB * 31.0 - cloud * 7.0)), 10.0) * sheetB;
  float filaments = exp(-abs(sin(warped.x * 9.0 + t * 0.11 + turbulence * 5.0) * 0.16 + waveC) * 28.0);
  float bloomA = exp(-length((warped - vec2(0.48, 0.12)) * vec2(0.84, 1.15)) * 2.0);
  float bloomB = exp(-length((warped - vec2(0.92, -0.25)) * vec2(1.4, 0.7)) * 2.8);
  float grain = (fineNoise - 0.5) * 0.035;
  float visibility = smoothstep(-0.76, 0.24, p.x);

  vec3 color = vec3(0.012, 0.013, 0.015);
  color += vec3(0.31, 0.33, 0.36) * sheetA;
  color += vec3(0.20, 0.215, 0.235) * sheetB;
  color += vec3(0.17, 0.185, 0.205) * sheetC;
  color += vec3(0.115, 0.125, 0.14) * sheetD;
  color += vec3(0.54, 0.57, 0.61) * edgeA;
  color += vec3(0.42, 0.45, 0.49) * edgeB;
  color += vec3(0.34, 0.37, 0.41) * edgeC;
  color += vec3(0.18, 0.195, 0.22) * contourA;
  color += vec3(0.13, 0.145, 0.165) * contourB;
  color += vec3(0.26, 0.28, 0.31) * filaments;
  color += vec3(0.22, 0.235, 0.26) * bloomA;
  color += vec3(0.14, 0.15, 0.17) * bloomB;
  color += vec3(grain);
  color = clamp(color * 1.26, 0.0, 1.0);

  float alpha = visibility * clamp(
    0.13 + sheetA * 0.25 + sheetB * 0.2 + sheetC * 0.18 +
    edgeA * 0.26 + edgeB * 0.18 + edgeC * 0.16 + filaments * 0.14 +
    bloomA * 0.2 + bloomB * 0.12,
    0.0, 0.92
  );
  outColor = vec4(color, alpha);
}`;

let dispose: (() => void) | null = null;
onMounted(() => {
  const element=canvas.value, surface=element?.parentElement;
  if(!element||!surface)return;
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl=element.getContext("webgl2",{alpha:true,antialias:false,depth:false,stencil:false,powerPreference:"low-power",premultipliedAlpha:false});
  if(!gl){surface.dataset.webgl="fallback";return;}
  const compile=(type:number,source:string):WebGLShader|null=>{
    const shader=gl.createShader(type); if(!shader)return null;
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.error("Hero wave shader failed:",gl.getShaderInfoLog(shader));gl.deleteShader(shader);return null;}
    return shader;
  };
  const vertex=compile(gl.VERTEX_SHADER,vertexShaderSource),fragment=compile(gl.FRAGMENT_SHADER,fragmentShaderSource),program=gl.createProgram();
  if(!vertex||!fragment||!program){
    if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);if(program)gl.deleteProgram(program);
    surface.dataset.webgl="fallback";return;
  }
  gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    console.error("Hero wave program failed:",gl.getProgramInfoLog(program));gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);surface.dataset.webgl="fallback";return;
  }
  const vao=gl.createVertexArray();
  if(!vao){gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);surface.dataset.webgl="fallback";return;}
  gl.bindVertexArray(vao);gl.useProgram(program);gl.clearColor(0,0,0,0);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  const resolution=gl.getUniformLocation(program,"u_resolution"),pointer=gl.getUniformLocation(program,"u_pointer"),time=gl.getUniformLocation(program,"u_time"),motion=gl.getUniformLocation(program,"u_motion");
  let px=0,py=0,frame=0,running=false,startedAt=0,lastAt=0;
  const draw=(now:number)=>{
    const elapsed=startedAt?(now-startedAt)/1000:0;
    gl.viewport(0,0,element.width,element.height);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.bindVertexArray(vao);
    gl.uniform2f(resolution,element.width,element.height);gl.uniform2f(pointer,px,py);gl.uniform1f(time,elapsed);gl.uniform1f(motion,reduceMotion?0:1);gl.drawArrays(gl.TRIANGLES,0,3);
  };
  const resize=()=>{
    const b=surface.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,1.2),scale=Math.min(ratio,1200/Math.max(b.width,b.height,1));
    element.width=Math.max(1,Math.round(b.width*scale));element.height=Math.max(1,Math.round(b.height*scale));draw(performance.now());
  };
  const move=(e:PointerEvent)=>{
    const b=surface.getBoundingClientRect();if(!b.width||!b.height)return;
    px=((e.clientX-b.left)/b.width-0.5)*(b.width/b.height);py=0.5-(e.clientY-b.top)/b.height;
    if(reduceMotion)draw(performance.now());
  };
  const leave=()=>{px=0;py=0;if(reduceMotion)draw(performance.now());};
  const animate=(now:number)=>{
    if(!running)return;if(now-lastAt>=42){draw(now);lastAt=now;}frame=window.requestAnimationFrame(animate);
  };
  const start=()=>{if(reduceMotion||document.hidden||running)return;startedAt=performance.now();lastAt=0;running=true;frame=window.requestAnimationFrame(animate);};
  const visibility=()=>{
    if(document.hidden){running=false;window.cancelAnimationFrame(frame);}
    else if(reduceMotion)draw(performance.now());else start();
  };
  surface.addEventListener("pointermove",move,{passive:true});surface.addEventListener("pointerleave",leave,{passive:true});
  document.addEventListener("visibilitychange",visibility);
  const observer="ResizeObserver"in window?new ResizeObserver(resize):null;observer?.observe(surface);
  window.addEventListener("resize",resize,{passive:true});surface.dataset.webgl="ready";resize();
  if(reduceMotion)draw(performance.now());else start();
  dispose=()=>{
    running=false;window.cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener("resize",resize);
    surface.removeEventListener("pointermove",move);surface.removeEventListener("pointerleave",leave);document.removeEventListener("visibilitychange",visibility);
    gl.deleteVertexArray(vao);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);delete surface.dataset.webgl;
  };
});
onBeforeUnmount(()=>{dispose?.();dispose=null;});
</script>
<template><canvas ref="canvas" class="nothing-webgl-canvas" aria-hidden="true"></canvas></template>
