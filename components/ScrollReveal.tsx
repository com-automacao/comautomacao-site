"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";


export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (all.length === 0) return;

    const reveal = (el: HTMLElement) => el.classList.add("in");
    const repeatEls = all.filter((el) => el.classList.contains("reveal-repeat"));
    const onceEls = all.filter((el) => !el.classList.contains("reveal-repeat"));

    if (typeof IntersectionObserver === "undefined") {
      all.forEach(reveal);
      return;
    }


    const onceIO = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -4% 0px" },
    );
    onceEls.forEach((el) => onceIO.observe(el));


    const repeatIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("in", entry.isIntersecting);
        }
      },
      { threshold: 0.15 },
    );
    repeatEls.forEach((el) => repeatIO.observe(el));


    let ticking = false;
    const sweep = () => {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (const el of onceEls) {
        if (el.classList.contains("in")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) {
          reveal(el);
          onceIO.unobserve(el);
        }
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sweep);
      }
    };
    sweep();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      onceIO.disconnect();
      repeatIO.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
