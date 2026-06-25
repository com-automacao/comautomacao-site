"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Revela os elementos `.reveal` (alterna a classe `.in`) conforme entram/saem
 * da viewport. Como NÃO faz `unobserve`, a animação se repete toda vez que a
 * section volta a aparecer.
 *
 * Rede de segurança: uma varredura no load (rAF) revela o que já está visível,
 * caso o callback inicial do observer atrase. Sem suporte a IntersectionObserver
 * (ou ambiente sem window), revela tudo de imediato.
 *
 * Re-escaneia a cada navegação de rota.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const all = () =>
      Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (all().length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      all().forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("in", entry.isIntersecting);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );
    all().forEach((el) => io.observe(el));

    // Revela imediatamente o que já está visível no carregamento.
    const raf = requestAnimationFrame(() => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (const el of all()) {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add("in");
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
