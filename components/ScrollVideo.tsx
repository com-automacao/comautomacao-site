"use client";

import { useEffect, useRef } from "react";

type Props = {
  dir: string;
  frameCount: number;
  prefix?: string;
  pad?: number;
  ext?: string;
  /** altura da faixa de scroll, em vh (quanto maior, mais devagar o scrub) */
  scrollVh?: number;
};

export default function ScrollVideo({
  dir,
  frameCount,
  prefix = "frame-",
  pad = 4,
  ext = "webp",
  scrollVh = 300,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const url = (i: number) =>
      `${dir}/${prefix}${String(i + 1).padStart(pad, "0")}.${ext}`;

    const images: HTMLImageElement[] = [];
    let current = -1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const draw = (idx: number, force = false) => {
      const i = Math.max(0, Math.min(frameCount - 1, idx));
      if (i === current && !force) return;
      const img = images[i];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      current = i;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw(current < 0 ? 0 : current, true);
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = url(i);
      img.onload = () => {
        if (i === 0 && current < 0) draw(0, true);
        else if (i === current) draw(i, true);
      };
      images[i] = img;
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const rect = wrap.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const progress =
          total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
        draw(Math.round(progress * (frameCount - 1)));
      });
    };

    resize();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, [dir, frameCount, prefix, pad, ext]);

  return (
    <div
      ref={wrapRef}
      className="scrollvid"
      style={{ height: `${scrollVh}vh` }}
    >
      <div className="scrollvid-sticky">
        <canvas ref={canvasRef} className="scrollvid-canvas" aria-hidden />
      </div>
    </div>
  );
}
