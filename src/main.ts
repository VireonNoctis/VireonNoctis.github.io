import { createApp } from "vue";
import App from "./App.vue";
import SignatureStudio from "./components/signature/SignatureStudio.vue";
import { revealDirective, tactileDirective } from "./directives/interaction";
import "lenis/dist/lenis.css";
import "./styles/portfolio-base.css";
import "./styles/intro-motion.css";
import "./styles/system-effects.css";
import "./styles/media-telemetry.css";
import "./styles/collections.css";
import "./styles/responsive.css";
import "./styles/signature-studio.css";

document.documentElement.dataset.theme = "nothing";
document.documentElement.style.colorScheme = "dark";
document.body.dataset.theme = "nothing";

const isSignatureStudio = /^\/signature(?:\/|\/index\.html)?$/i.test(window.location.pathname);
const app = createApp(isSignatureStudio ? SignatureStudio : App);
app.directive("tactile", tactileDirective);
app.directive("reveal", revealDirective);
app.mount("#app");
