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
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .fromTo(".hero-kicker", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .75 }, .12)
        .fromTo(".hero-title-line", { autoAlpha: 0, yPercent: 115 }, {
          autoAlpha: 1, yPercent: 0, duration: 1.15, stagger: .12, clearProps: "transform,opacity,visibility"
        }, .22)
        .fromTo(".hero-intro-row", { autoAlpha: 0, y: 22 }, {
          autoAlpha: 1, y: 0, duration: .85, clearProps: "transform,opacity,visibility"
        }, .68);

      intro.fromTo(".hero-reveal-frame", { clipPath: "inset(100% 0 0 0)" }, {
        clipPath: "inset(0% 0 0 0)", duration: 1.05, stagger: .14,
        ease: "power4.out", clearProps: "clipPath"
      }, .48);
      intro.fromTo(".hero-frame-mark img", { scale: 1.2 }, {
        scale: 1, duration: 1.2, stagger: .14, ease: "power4.out", clearProps: "transform"
      }, .48);
      intro.fromTo(".hero-foot", { autoAlpha: 0, y: 12 }, {
        autoAlpha: 1, y: 0, duration: .7, clearProps: "transform,opacity,visibility"
      }, 1.05);

      const revealSelector = [
        ".profile-layout", ".role-item", ".work-intro", ".project-stack-card",
        ".repo-live-row", ".stack-module", ".language-tile", ".archive-card",
        ".social-row", ".contact-main"
      ].join(", ");
      gsap.utils.toArray<HTMLElement>(revealSelector).forEach((element, index) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1, y: 0, duration: .82,
          delay: Math.min((index % 4) * .045, .13),
          ease: "power3.out", clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: element, start: "top 91%", once: true }
        });
      });

      const cards = gsap.utils.toArray<HTMLElement>(".project-stack-card");
      if (cards.length > 1 && window.matchMedia("(min-width: 801px)").matches) {
        const lastCard = cards[cards.length - 1];
        const pinTop = () => getComputedStyle(cards[0]).top;
        cards.forEach((card, index) => {
          const depth = cards.length - 1 - index;
          if (depth <= 0) return;
          const trigger = {
            trigger: card,
            start: () => "top " + pinTop(),
            endTrigger: lastCard,
            end: () => "top " + pinTop(),
            scrub: true,
            invalidateOnRefresh: true
          };
          gsap.to(card, { scale: 1 - .035 * depth, y: -16 * depth, ease: "none", scrollTrigger: trigger });
          gsap.to(card.querySelector(".project-card-copy"), { opacity: .65, ease: "none", scrollTrigger: trigger });
        });
      }
    }, document.body);

    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  function scrollTo(target: HTMLElement, offset = -104): boolean {
    if (!lenis) return false;
    lenis.scrollTo(target, { offset, duration: 1.05 });
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
