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
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), f.x), mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float value = 0.0, amplitude = 0.5;
  for (int i=0;i<5;i++) { value += noise(p)*amplitude; p=p*2.03+vec2(17.2,9.3); amplitude*=0.5; }
  return value;
}
void main() {
  vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/max(1.0,u_resolution.y);
  vec2 p=uv; p.x+=0.34+u_pointer.x*0.10; p.y+=u_pointer.y*0.055;
  float t=u_time*u_motion;
  float field=fbm(p*2.0+vec2(t*0.12,-t*0.08));
  float drift=fbm(p*3.3+vec2(-t*0.07,t*0.11));
  float waveA=p.y+sin(p.x*2.4+t*0.16+field*2.2)*0.22+sin(p.x*4.8-t*0.10+drift)*0.065;
  float waveB=p.y*0.82+sin(p.x*1.85-t*0.12+drift*1.7)*0.29-0.27;
  float sheetA=exp(-abs(waveA)*4.0), sheetB=exp(-abs(waveB)*3.4);
  float edgeA=exp(-abs(waveA+0.075+field*0.025)*18.0), edgeB=exp(-abs(waveB-0.09)*14.0);
  float fibers=pow(max(0.0,0.5+0.5*cos(waveA*34.0+drift*8.0)),18.0)*sheetA;
  float glow=exp(-length((p-vec2(0.42,0.04))*vec2(1.0,0.85))*2.0);
  float fade=smoothstep(-0.60,0.30,p.x);
  vec3 color=vec3(0.006,0.007,0.009);
  color+=vec3(0.12,0.13,0.145)*sheetA+vec3(0.065,0.07,0.078)*sheetB;
  color+=vec3(0.31,0.33,0.35)*edgeA+vec3(0.18,0.19,0.205)*edgeB;
  color+=vec3(0.045,0.048,0.052)*fibers+vec3(0.075,0.078,0.084)*glow;
  float alpha=fade*clamp(0.08+sheetA*0.22+sheetB*0.15+edgeA*0.20+edgeB*0.12,0.0,0.68);
  outColor=vec4(clamp(color,0.0,0.8),alpha);
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
