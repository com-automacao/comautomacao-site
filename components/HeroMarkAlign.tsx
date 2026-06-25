"use client";

import { useEffect } from "react";

/**
 * Alinha o emblema (logo) ao DISCO da Terra do vídeo do hero, por cálculo —
 * para qualquer tamanho de tela (responsivo + mobile), sem breakpoints chutados.
 *
 * Como funciona: o vídeo (1920×1080) entra com object-fit:cover na caixa do hero.
 * A posição/raio do planeta no frame do vídeo é fixa (invariante). Derivamos essas
 * constantes do alinhamento manual feito em 1920×911 (left 29.5% / top 79.5% /
 * height 154%). Em cada resize recomputamos onde o planeta cai na tela (mesma
 * matemática do cover) e posicionamos a logo com o MESMO centro e raio.
 */
const V_W = 1920; // largura do vídeo
const V_H = 1080; // altura do vídeo
const P_CX = 566; // centro do planeta no frame (px)
const P_CY = 808;
const P_R = 687; // raio do planeta no frame (px)
const EMBLEM_RATIO = 0.49; // raio do círculo do emblema ÷ altura do PNG

export default function HeroMarkAlign() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const mark = document.querySelector<HTMLElement>(".hero-mark");
    if (!hero || !mark) return;

    const apply = () => {
      const W = hero.clientWidth;
      const H = hero.clientHeight;
      if (!W || !H) return;
      if (W <= 820) return; // mobile: logo escondida via CSS, não recalcula
      const scale = Math.max(W / V_W, H / V_H); // cover
      const offX = (W - V_W * scale) / 2;
      const offY = (H - V_H * scale) / 2;
      const cx = offX + P_CX * scale; // centro do planeta na tela
      const cy = offY + P_CY * scale;
      const r = P_R * scale; // raio do planeta na tela
      const hPx = r / EMBLEM_RATIO; // altura do PNG p/ o círculo do emblema = r

      mark.style.left = `${(cx / W) * 100}%`;
      mark.style.top = `${(cy / H) * 100}%`;
      mark.style.height = `${(hPx / H) * 100}%`;
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(hero);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  return null;
}
