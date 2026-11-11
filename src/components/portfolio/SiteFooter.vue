<script setup lang="ts">
import type { PortfolioPageContext } from "../../types/PortfolioPageContext";
const props = defineProps<{ context: PortfolioPageContext }>();
const context = props.context;
</script>

<template>
<footer class="site-footer section-shell">
      <a class="footer-mark" href="#top">VIREON<span> / </span>NOCTIS</a>
      <span>© {{ context.year }} / ALL RIGHTS RESERVED</span><a class="footer-top" href="#top">BACK TO TOP ↑</a>
    </footer>
</template>
