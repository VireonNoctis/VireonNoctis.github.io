import { createApp } from "vue";
import App from "./App.vue";
import { revealDirective, tactileDirective } from "./directives/interaction";
import "../app/globals.css";
import "../app/themes.css";
import "../app/themes/nothing.css";
import "../app/nothing-webgl.css";
import "../app/profile-identity.css";
import "../app/editorial-cleanup.css";
import "../app/telemetry-responsive.css";
import "./styles.css";

document.documentElement.dataset.theme = "nothing";
document.documentElement.style.colorScheme = "dark";
document.body.dataset.theme = "nothing";

const app = createApp(App);
app.directive("tactile", tactileDirective);
app.directive("reveal", revealDirective);
app.mount("#app");