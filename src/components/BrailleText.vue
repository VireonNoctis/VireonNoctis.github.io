<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ label: string }>();
const letters: Record<string, string> = {
  a:"⠁",b:"⠃",c:"⠉",d:"⠙",e:"⠑",f:"⠋",g:"⠛",h:"⠓",i:"⠊",j:"⠚",
  k:"⠅",l:"⠇",m:"⠍",n:"⠝",o:"⠕",p:"⠏",q:"⠟",r:"⠗",s:"⠎",t:"⠞",
  u:"⠥",v:"⠧",w:"⠺",x:"⠭",y:"⠽",z:"⠵"
};
const encoded = computed(() => Array.from(props.label, (character) => {
  const glyph = letters[character.toLowerCase()];
  if (!glyph) return character;
  return character !== character.toLowerCase() ? "⠠" + glyph : glyph;
}).join(""));
</script>

<template>
  <span class="braille-text" aria-hidden="true">{{ encoded }}</span>
  <span class="braille-sr-only">{{ label }}</span>
</template>