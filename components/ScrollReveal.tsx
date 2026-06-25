"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Revela os elementos `.reveal` (adiciona a classe `.in`) conforme entram na
 * viewport — uma vez só, e permanecem revelados (sem re-esconder). Isso evita
 * o "espaço vazio" que aparecia quando o conteúdo já estava visível mas ainda
 * sem `.in` (observer não disparava / re-escondia ao sair).
 *
 * Duas camadas de garantia:
 *  1. IntersectionObserver revela ao entrar (anima na rolagem).
 *  2. Varredura em cada scroll/resize: qualquer `.reveal` dentro da viewport
 *     recebe `.in` na hora — rede de segurança à prova de falha do observer.
 *
 * Sem IntersectionObserver (ou sem window), revela tudo de imediato.
 * Re-escaneia a cada navegação de rota.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const reveal = (el: HTMLElement) => el.classList.add("in");

    if (typeof IntersectionObserver === "undefined") {
      els.forEach(reveal);
      return;
    }

    const io = new IntersectionObserver(
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
    els.forEach((el) => io.observe(el));

    // Rede de segurança: revela na hora tudo que está dentro da viewport,
    // no load e a cada scroll/resize. Cobre o caso do observer não disparar.
    let ticking = false;
    const sweep = () => {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (const el of els) {
        if (el.classList.contains("in")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) {
          reveal(el);
          io.unobserve(el);
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
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
