"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Header transparente apenas sobre o Hero. Ao rolar para além do hero (ou em
 * páginas sem hero), o nav fica sólido (fundo + blur) via classe `.nav-solid`.
 */
export default function NavScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".nav");
    if (!nav) return;
    const hero = document.querySelector<HTMLElement>(".hero");

    // sem hero (ex.: páginas internas sem header de vídeo) → sempre sólido
    if (!hero) {
      nav.classList.add("nav-solid");
      return;
    }

    const update = () => {
      const navH = nav.offsetHeight || 72;
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      nav.classList.toggle("nav-solid", window.scrollY > heroBottom - navH);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return null;
}
