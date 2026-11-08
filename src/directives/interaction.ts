import type { Directive } from "vue";

interface TactileState {
  frame: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  move: (event: PointerEvent) => void;
  reset: () => void;
  tick: () => void;
}

const tactileStates = new WeakMap<HTMLElement, TactileState>();

export const tactileDirective: Directive<HTMLElement> = {
  mounted(element) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const state: TactileState = { frame: 0, x: 0, y: 0, targetX: 0, targetY: 0, move: () => undefined, reset: () => undefined, tick: () => undefined };
    state.tick = () => {
      state.x += (state.targetX - state.x) * 0.18;
      state.y += (state.targetY - state.y) * 0.18;
      element.style.setProperty("--tactile-x", state.x.toFixed(2) + "px");
      element.style.setProperty("--tactile-y", state.y.toFixed(2) + "px");
      if (Math.abs(state.targetX - state.x) > 0.025 || Math.abs(state.targetY - state.y) > 0.025) state.frame = window.requestAnimationFrame(state.tick);
      else {
        state.x = state.targetX; state.y = state.targetY;
        element.style.setProperty("--tactile-x", state.x.toFixed(2) + "px");
        element.style.setProperty("--tactile-y", state.y.toFixed(2) + "px");
        state.frame = 0;
      }
    };
    const schedule = () => { if (!state.frame) state.frame = window.requestAnimationFrame(state.tick); };
    state.move = (event) => {
      if (event.pointerType !== "mouse") return;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      state.targetX = ((event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 5;
      state.targetY = ((event.clientY - bounds.top - bounds.height / 2) / bounds.height) * 3;
      schedule();
    };
    state.reset = () => { state.targetX = 0; state.targetY = 0; schedule(); };
    element.addEventListener("pointermove", state.move, { passive: true });
    element.addEventListener("pointerleave", state.reset, { passive: true });
    tactileStates.set(element, state);
  },
  unmounted(element) {
    const state = tactileStates.get(element);
    if (!state) return;
    if (state.frame) window.cancelAnimationFrame(state.frame);
    element.removeEventListener("pointermove", state.move);
    element.removeEventListener("pointerleave", state.reset);
    element.style.removeProperty("--tactile-x");
    element.style.removeProperty("--tactile-y");
    tactileStates.delete(element);
  }
};

const revealObservers = new WeakMap<HTMLElement, IntersectionObserver>();
export const revealDirective: Directive<HTMLElement> = {
  mounted(element) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      element.classList.add("nothing-reveal-in");
      return;
    }
    element.classList.add("nothing-reveal-pending");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        element.classList.add("nothing-reveal-in");
        observer.unobserve(element);
        observer.disconnect();
        revealObservers.delete(element);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    revealObservers.set(element, observer);
    observer.observe(element);
  },
  unmounted(element) {
    revealObservers.get(element)?.disconnect();
    revealObservers.delete(element);
  }
};