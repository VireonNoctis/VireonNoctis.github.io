import { onBeforeUnmount, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

let lenis: Lenis | null = null;
let ticker: ((time: number) => void) | null = null;
let context: gsap.Context | null = null;
let introFallbackTimer: number | null = null;

export function useCinematicMotion() {
  onMounted(() => {
    const introLayer = document.querySelector<HTMLElement>(".intro-loader");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finishIntro = () => {
      if (introFallbackTimer !== null) {
        window.clearTimeout(introFallbackTimer);
        introFallbackTimer = null;
      }
      if (introLayer) {
        introLayer.classList.remove("is-active");
        introLayer.remove();
      }
    };

    if (introLayer) {
      if (reducedMotion) finishIntro();
      else {
        introLayer.classList.add("is-active");
        introFallbackTimer = window.setTimeout(finishIntro, 13600);
      }
    }
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({
      autoRaf: false,
      duration: 1.05,
      easing: (progress) => 1 - Math.pow(1 - progress, 4),
      smoothWheel: true,
      wheelMultiplier: 0.88,
      syncTouch: false
    });
    lenis.on("scroll", ScrollTrigger.update);
    ticker = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(ticker);

    context = gsap.context(() => {
      if (introLayer) {
        const counter = { value: 0 };
        const readout = introLayer.querySelector<HTMLElement>("#intro-count");
        const fill = introLayer.querySelector<HTMLElement>("#intro-fill");
        const stage = introLayer.querySelector<HTMLElement>("#intro-stage");
        const expansion = introLayer.querySelector<HTMLElement>("#intro-expansion");
        const intro = gsap.timeline({ onComplete: finishIntro });

        intro
          .to(counter, {
            value: 100,
            duration: 9.4,
            ease: "power1.inOut",
            onUpdate: () => {
              const progress = Math.round(counter.value);
              if (readout) readout.textContent = progress.toString().padStart(2, "0") + "%";
              if (stage) stage.textContent = progress < 24
                ? "GATHERING THE ESSENTIALS"
                : progress < 52
                  ? "FORMING THE INTERFACE"
                  : progress < 82
                    ? "CALIBRATING THE DETAILS"
                    : "READY TO EXPLORE";
            }
          }, 0)
          .fromTo(".intro-loader-kicker", { autoAlpha: 0, y: 12 }, {
            autoAlpha: 1, y: 0, duration: 1.05, clearProps: "transform,opacity,visibility"
          }, 0.35)
          .fromTo(".intro-loader-title-line", { autoAlpha: 0, yPercent: 112 }, {
            autoAlpha: 1, yPercent: 0, duration: 1.45, stagger: 0.16,
            ease: "power4.out", clearProps: "transform,opacity,visibility"
          }, 0.62)
          .fromTo(".intro-loader-subline", { autoAlpha: 0, y: 10 }, {
            autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out",
            clearProps: "transform,opacity,visibility"
          }, 1.25)
          .to(introLayer, {
            autoAlpha: 0,
            duration: 0.95,
            ease: "power2.inOut"
          }, 10.25);

        if (fill) intro.to(fill, { scaleX: 1, duration: 9.4, ease: "power1.inOut" }, 0);
        if (expansion) intro.fromTo(expansion, { scale: 0.12, autoAlpha: 0.25 }, {
          scale: 1.08, autoAlpha: 0.9, duration: 9.4, ease: "power1.inOut"
        }, 0);
      }

      const heroIntro = gsap.timeline({ delay: 0.18, defaults: { ease: "power4.out" } });
      heroIntro
        .fromTo(".hero-kicker", { autoAlpha: 0, y: 18 }, {
          autoAlpha: 1, y: 0, duration: 0.75, clearProps: "transform,opacity,visibility"
        }, 0.12)
        .fromTo(".hero-title-line", { autoAlpha: 0, yPercent: 115 }, {
          autoAlpha: 1, yPercent: 0, duration: 1.15, stagger: 0.12,
          clearProps: "transform,opacity,visibility"
        }, 0.22)
        .fromTo(".hero-intro-row", { autoAlpha: 0, y: 22 }, {
          autoAlpha: 1, y: 0, duration: 0.85, clearProps: "transform,opacity,visibility"
        }, 0.68)
        .fromTo(".hero-art", { autoAlpha: 0, scale: 1.035, filter: "blur(10px)" }, {
          autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.35,
          ease: "power3.out", clearProps: "transform,opacity,visibility,filter"
        }, 0.9)
        .fromTo(".hero-foot", { autoAlpha: 0, y: 12 }, {
          autoAlpha: 1, y: 0, duration: 0.7, clearProps: "transform,opacity,visibility"
        }, 1.45);

      const revealSelector = [
        ".profile-layout", ".role-item", ".work-intro", ".stack-module",
        ".project-stack-card", ".project-language-tile", ".archive-card",
        ".social-row", ".contact-main"
      ].join(", ");
      gsap.utils.toArray<HTMLElement>(revealSelector).forEach((element, index) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1, y: 0, duration: 0.82,
          delay: Math.min((index % 4) * 0.045, 0.13),
          ease: "power3.out", clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: element, start: "top 91%", once: true }
        });
      });
    }, document.body);

    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  function scrollTo(target: HTMLElement, offset = -104): boolean {
    if (!lenis) return false;
    lenis.scrollTo(target, { offset, duration: 1.05 });
    return true;
  }

  onBeforeUnmount(() => {
    if (introFallbackTimer !== null) {
      window.clearTimeout(introFallbackTimer);
      introFallbackTimer = null;
    }
    context?.revert();
    context = null;
    if (ticker) gsap.ticker.remove(ticker);
    ticker = null;
    lenis?.destroy();
    lenis = null;
  });

  return { scrollTo };
}
