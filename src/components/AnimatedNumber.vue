<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
const props=withDefaults(defineProps<{value:number;decimals?:number;duration?:number;prefix?:string;suffix?:string;notation?:"standard"|"compact";immediate?:boolean;}>(),{decimals:0,duration:1250,prefix:"",suffix:"",notation:"standard",immediate:false});
const element=ref<HTMLElement|null>(null),displayed=ref(0),visible=ref(false);
let observer:IntersectionObserver|null=null,frame=0,generation=0;
const safeValue=computed(()=>Number.isFinite(props.value)?Math.max(0,props.value):0);
const formatter=computed(()=>new Intl.NumberFormat("en-US",{minimumFractionDigits:props.decimals,maximumFractionDigits:props.decimals,notation:props.notation,compactDisplay:"short"}));
const targetText=computed(()=>formatter.value.format(safeValue.value));
function stop(){generation++;if(frame)window.cancelAnimationFrame(frame);frame=0;}
function animate(){
  stop();const run=generation,target=safeValue.value;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){displayed.value=target;return;}
  const from=Math.max(0,displayed.value);if(from===target)return;
  const start=performance.now(),duration=Math.max(250,props.duration);
  const tick=(now:number)=>{
    if(run!==generation)return;
    const progress=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-progress,4);
    displayed.value=Math.max(0,from+(target-from)*eased);
    if(progress<1)frame=window.requestAnimationFrame(tick);else{displayed.value=target;frame=0;}
  };
  frame=window.requestAnimationFrame(tick);
}
onMounted(()=>{
  if(!element.value)return;
  if(props.immediate || !("IntersectionObserver"in window)){visible.value=true;animate();return;}
  observer=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;
    visible.value=true;observer?.disconnect();observer=null;animate();
  },{threshold:.01});
  observer.observe(element.value);
});
watch(()=>safeValue.value,()=>{if(visible.value)animate();});
watch(()=>props.decimals,()=>{if(visible.value)animate();});
onBeforeUnmount(()=>{stop();observer?.disconnect();});
</script>
<template><span ref="element" class="animated-number" :aria-label="prefix + targetText + suffix" aria-live="off">{{ prefix }}{{ formatter.format(displayed) }}{{ suffix }}</span></template>
