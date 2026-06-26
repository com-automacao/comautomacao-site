"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";


export default function NavScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".nav");
    if (!nav) return;
    const hero = document.querySelector<HTMLElement>(".hero");


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
