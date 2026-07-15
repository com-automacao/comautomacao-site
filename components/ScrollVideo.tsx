"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** conjunto de frames padrão (mobile) */
  dir: string;
  /** conjunto opcional para telas grandes; usado se largura >= 1024px */
  dirLarge?: string;
  frameCount: number;
  prefix?: string;
  pad?: number;
  ext?: string;
  className?: string;
  /** fator de suavização (0-1); menor = mais suave/preguiçoso */
  ease?: number;
};

export default function ScrollVideo({
  dir,
  dirLarge,
  frameCount,
  prefix = "frame-",
  pad = 4,
  ext = "webp",
  className,
  ease = 0.18,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const region =
      (canvas.closest("[data-scrollvid-region]") as HTMLElement | null) ??
      canvas.parentElement;
    if (!region) return;

    // telas grandes recebem o conjunto maior; mobile/tablet ficam no leve
    const src = dirLarge && window.innerWidth >= 1024 ? dirLarge : dir;
    const url = (i: number) =>
      `${src}/${prefix}${String(i + 1).padStart(pad, "0")}.${ext}`;

    const images: HTMLImageElement[] = [];
    let drawn = -1;
    let target = 0; // frame-alvo (do scroll)
    let currentF = 0; // frame exibido (interpolado)
    let rafId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const paint = (idx: number, force = false) => {
      const i = Math.max(0, Math.min(frameCount - 1, idx));
      if (i === drawn && !force) return;
      const img = images[i];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      drawn = i;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    // loop de suavização: desliza currentF até target e para quando estabiliza
    const tick = () => {
      const diff = target - currentF;
      if (Math.abs(diff) < 0.02) {
        currentF = target;
        paint(Math.round(currentF));
        rafId = 0;
        return;
      }
      currentF += diff * ease;
      paint(Math.round(currentF));
      rafId = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const updateTarget = () => {
      const rect = region.getBoundingClientRect();
      const total = region.offsetHeight - window.innerHeight;
      const progress =
        total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
      target = progress * (frameCount - 1);
      region.classList.toggle("hero-revealed", progress >= 0.85);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      paint(drawn < 0 ? 0 : drawn, true);
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = url(i);
      img.onload = () => {
        if (i === Math.round(currentF)) paint(i, true);
      };
      // pré-decodifica pra o scrub não travar ao trocar de frame
      img.decode?.().catch(() => {});
      images[i] = img;
    }

    const onScroll = () => {
      updateTarget();
      kick();
    };
    const onResize = () => {
      resize();
      updateTarget();
      kick();
    };

    resize();
    updateTarget();
    currentF = target;
    paint(Math.round(currentF), true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [dir, dirLarge, frameCount, prefix, pad, ext, ease]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "scrollvid-canvas"}
      aria-hidden
    />
  );
}
