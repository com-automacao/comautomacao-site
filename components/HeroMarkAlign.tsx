"use client";

import { useEffect } from "react";


const V_W = 1920;
const V_H = 1080;
const P_CX = 566;
const P_CY = 808;
const P_R = 687;
const EMBLEM_RATIO = 0.49;

export default function HeroMarkAlign() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const mark = document.querySelector<HTMLElement>(".hero-mark");
    if (!hero || !mark) return;

    const apply = () => {
      const W = hero.clientWidth;
      const H = hero.clientHeight;
      if (!W || !H) return;
      if (W <= 820) return;
      const scale = Math.max(W / V_W, H / V_H);
      const offX = (W - V_W * scale) / 2;
      const offY = (H - V_H * scale) / 2;
      const cx = offX + P_CX * scale;
      const cy = offY + P_CY * scale;
      const r = P_R * scale;
      const hPx = r / EMBLEM_RATIO;

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
