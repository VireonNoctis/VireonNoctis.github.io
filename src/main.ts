import { createApp } from "vue";
import App from "./App.vue";
import { revealDirective, tactileDirective } from "./directives/interaction";
import "lenis/dist/lenis.css";

document.documentElement.dataset.theme = "nothing";
document.documentElement.style.colorScheme = "dark";
document.body.dataset.theme = "nothing";

const app = createApp(App);
app.directive("tactile", tactileDirective);
app.directive("reveal", revealDirective);
app.mount("#app");
