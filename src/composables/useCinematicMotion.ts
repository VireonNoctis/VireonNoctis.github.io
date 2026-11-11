import { onBeforeUnmount, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

let lenis: Lenis | null = null;
let ticker: ((time: number) => void) | null = null;
let context: gsap.Context | null = null;
let introFallbackTimer: number | null = null;

export function useCinematicMotion() {
  let paginationRefresh: (() => void) | null = null;
  onMounted(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({ autoRaf:false, duration:1.05, easing:(progress)=>1-Math.pow(1-progress,4), smoothWheel:true, wheelMultiplier:.88, syncTouch:false });
    lenis.on("scroll",ScrollTrigger.update);
    ticker=(time)=>lenis?.raf(time*1000);
    gsap.ticker.add(ticker);

    context=gsap.context(()=>{
      const introLayer=document.querySelector<HTMLElement>(".intro-loader");
      if(introLayer){
        introLayer.classList.add("is-active");
        const finishIntro=()=>{
          if(introFallbackTimer!==null){
            window.clearTimeout(introFallbackTimer);
            introFallbackTimer=null;
          }
          introLayer.classList.remove("is-active");
          introLayer.remove();
        };
        introFallbackTimer=window.setTimeout(finishIntro,3600);
        const counter={value:0};
        const readout=introLayer.querySelector<HTMLElement>("#intro-count");
        const fill=introLayer.querySelector<HTMLElement>("#intro-fill");
        const intro=gsap.timeline({onComplete:finishIntro});
        intro
          .to(".intro-loader-panel",{clipPath:"polygon(0 0,100% 0,100% 100%,0 100%)",duration:.95,stagger:.075,ease:"power4.out"},0)
          .to(counter,{value:100,duration:1.55,ease:"power2.inOut",onUpdate:()=>{if(readout)readout.textContent=Math.round(counter.value).toString().padStart(2,"0")+"%";}},0)
          .fromTo(".intro-loader-kicker",{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.65,clearProps:"transform,opacity,visibility"},.12)
          .fromTo(".intro-loader-title-line",{autoAlpha:0,yPercent:120},{autoAlpha:1,yPercent:0,duration:.95,stagger:.12,ease:"power4.out",clearProps:"transform,opacity,visibility"},.2)
          .to(".intro-loader",{clipPath:"polygon(0 0,100% 0,100% 0,0 0)",duration:.88,ease:"power4.inOut"},1.55);
        if(fill) intro.to(fill,{scaleX:1,duration:1.55,ease:"power2.inOut"},0);
      }

      const heroIntro=gsap.timeline({delay:.96,defaults:{ease:"power4.out"}});
      heroIntro
        .fromTo(".hero-kicker",{autoAlpha:0,y:18},{autoAlpha:1,y:0,duration:.75,clearProps:"transform,opacity,visibility"},.12)
        .fromTo(".hero-title-line",{autoAlpha:0,yPercent:115},{autoAlpha:1,yPercent:0,duration:1.15,stagger:.12,clearProps:"transform,opacity,visibility"},.22)
        .fromTo(".hero-intro-row",{autoAlpha:0,y:22},{autoAlpha:1,y:0,duration:.85,clearProps:"transform,opacity,visibility"},.68)
        .fromTo(".hero-reveal-frame",{clipPath:"inset(100% 0 0 0)"},{clipPath:"inset(0% 0 0 0)",duration:1.05,stagger:.12,ease:"power4.out",clearProps:"clipPath"},1.42)
        .fromTo(".hero-frame-mark img,.hero-frame-wordmark",{scale:1.18,autoAlpha:0},{scale:1,autoAlpha:1,duration:1.15,stagger:.12,ease:"power4.out",clearProps:"transform,opacity,visibility"},1.42)
        .fromTo(".hero-foot",{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.7,clearProps:"transform,opacity,visibility"},1.78);

      const revealSelector=[".profile-layout",".role-item",".work-intro",".repo-live-row",".stack-module",".project-language-tile",".archive-card",".social-row",".contact-main"].join(", ");
      gsap.utils.toArray<HTMLElement>(revealSelector).forEach((element,index)=>{
        gsap.fromTo(element,{autoAlpha:0,y:24},{
          autoAlpha:1,y:0,duration:.82,delay:Math.min((index%4)*.045,.13),ease:"power3.out",clearProps:"transform,opacity,visibility",
          scrollTrigger:{trigger:element,start:"top 91%",once:true}
        });
      });
    },document.body);

    paginationRefresh=()=>window.requestAnimationFrame(()=>ScrollTrigger.refresh());
    window.addEventListener("portfolio:pagination",paginationRefresh);
    window.requestAnimationFrame(()=>ScrollTrigger.refresh());
  });

  function scrollTo(target:HTMLElement,offset=-104):boolean{
    if(!lenis)return false;
    lenis.scrollTo(target,{offset,duration:1.05});
    return true;
  }
  onBeforeUnmount(()=>{
    if(paginationRefresh)window.removeEventListener("portfolio:pagination",paginationRefresh);
    paginationRefresh=null;
    if(introFallbackTimer!==null){window.clearTimeout(introFallbackTimer);introFallbackTimer=null;}
    context?.revert();context=null;
    if(ticker)gsap.ticker.remove(ticker);ticker=null;
    lenis?.destroy();lenis=null;
  });
  return {scrollTo};
}
