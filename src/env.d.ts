/// <reference types="vite/client" />
import type { Directive } from "vue";

declare module "vue" {
  interface GlobalDirectives {
    vTactile: Directive<HTMLElement>;
    vReveal: Directive<HTMLElement>;
  }
}

export {};