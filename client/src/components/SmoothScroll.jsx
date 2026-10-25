import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const shouldUseNativeScroll = (node) => {
  let element = node instanceof Element ? node : node?.parentElement;

  while (element && element !== document.body) {
    const { overflowY } = window.getComputedStyle(element);
    const canScroll =
      /auto|scroll|overlay/.test(overflowY) &&
      element.scrollHeight > element.clientHeight;

    if (canScroll) return true;
    element = element.parentElement;
  }

  return false;
};

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      duration: 0.8,
      easing: (progress) => 1 - (1 - progress) ** 4,
      smoothWheel: true,
      wheelMultiplier: 1.05,
      prevent: shouldUseNativeScroll,
      allowNestedScroll: true,
    });
    const update = (time) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  return null;
}
