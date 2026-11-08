import { onBeforeUnmount, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

let lenis: Lenis | null = null;
let ticker: ((time: number) => void) | null = null;
let context: gsap.Context | null = null;

export function useCinematicMotion() {
  onMounted(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({
      autoRaf: false,
      duration: 1.08,
      easing: (progress) => 1 - Math.pow(1 - progress, 4),
      smoothWheel: true,
      wheelMultiplier: 0.88,
      syncTouch: false
    });
    lenis.on("scroll", ScrollTrigger.update);

    ticker = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(ticker);

    context = gsap.context(() => {
      gsap.fromTo(
        ".hero-copy",
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 1.1, delay: 0.16, ease: "power4.out", clearProps: "transform,opacity,visibility" }
      );
      gsap.fromTo(
        ".hero-art",
        { autoAlpha: 0, y: 28, scale: 0.975 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.3, delay: 0.3, ease: "power4.out", clearProps: "transform,opacity,visibility" }
      );

      const selector = [
        ".profile-identity-band",
        ".manifesto-content",
        ".work-heading",
        ".project-expand",
        ".website-stack-feature",
        ".website-stack-module",
        ".project-language-tile",
        ".learning-card",
        ".archive-card",
        ".signal-panel",
        ".contact-main",
        ".social-list > a"
      ].join(", ");

      gsap.utils.toArray<HTMLElement>(selector).forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.92,
            delay: Math.min((index % 4) * 0.045, 0.135),
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
            scrollTrigger: {
              trigger: element,
              start: "top 89%",
              once: true
            }
          }
        );
      });
    }, document.body);

    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  function scrollTo(target: HTMLElement, offset = -96): boolean {
    if (!lenis) return false;
    lenis.scrollTo(target, { offset, duration: 1.08 });
    return true;
  }

  onBeforeUnmount(() => {
    context?.revert();
    context = null;
    if (ticker) gsap.ticker.remove(ticker);
    ticker = null;
    lenis?.destroy();
    lenis = null;
  });

  return { scrollTo };
}
