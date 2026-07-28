"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; l: number };

// Flow field de partículas (streaks) que fluem num sentido fixo. Quando o
// elemento [data-absorb-target] da mesma section recebe hover, as partículas
// são "sugadas" em direção a ele (efeito de absorção).
export default function FlowFieldBackground({
  color = "150, 180, 255",
}: {
  color?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let paused = false;
    let alive = true;
    let t = 0;
    let absorb = 0;
    let absorbTarget = 0;
    let bx = 0;
    let by = 0;
    let ps: P[] = [];

    const section =
      (root.closest("section") as HTMLElement | null) ?? root.parentElement;
    const btn = section?.querySelector(
      "[data-absorb-target]",
    ) as HTMLElement | null;

    const baseAngle = -0.5;
    const speed = 0.55;

    const spawnEdge = (p: P) => {
      const s = Math.floor(Math.random() * 4);
      if (s === 0) {
        p.x = -10;
        p.y = Math.random() * h;
      } else if (s === 1) {
        p.x = w + 10;
        p.y = Math.random() * h;
      } else if (s === 2) {
        p.y = -10;
        p.x = Math.random() * w;
      } else {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
    };

    const resize = () => {
      const r = root.getBoundingClientRect();
      w = r.width;
      h = r.height;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const count = Math.min(220, Math.max(70, Math.round((w * h) / 5200)));
      ps = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        l: 8 + Math.random() * 9,
      }));
    };

    const updateBtn = () => {
      if (!btn) return;
      const b = btn.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      bx = b.left + b.width / 2 - c.left;
      by = b.top + b.height / 2 - c.top;
    };

    const step = () => {
      if (!alive || paused) {
        raf = 0;
        return;
      }
      absorb += (absorbTarget - absorb) * 0.07;
      updateBtn();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const p of ps) {
        const ang =
          baseAngle +
          Math.sin(p.x * 0.006 + t) * 0.5 +
          Math.cos(p.y * 0.008 - t * 0.6) * 0.4;
        let vx = Math.cos(ang) * speed;
        let vy = Math.sin(ang) * speed;

        if (absorb > 0.002) {
          const dx = bx - p.x;
          const dy = by - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          const pull = absorb * (1.6 + 46 / dist);
          vx = vx * (1 - absorb) + (dx / dist) * pull;
          vy = vy * (1 - absorb) + (dy / dist) * pull;
          if (dist < 16) {
            spawnEdge(p);
            continue;
          }
        }

        p.x += vx;
        p.y += vy;

        if (p.x < -24 || p.x > w + 24 || p.y < -24 || p.y > h + 24) {
          if (absorb > 0.3) {
            spawnEdge(p);
          } else {
            if (p.x < -24) p.x = w + 12;
            else if (p.x > w + 24) p.x = -12;
            if (p.y < -24) p.y = h + 12;
            else if (p.y > h + 24) p.y = -12;
          }
        }

        const sp = Math.hypot(vx, vy);
        const len = Math.min(p.l + sp * 2.4, 40);
        const nx = vx / (sp || 1);
        const ny = vy / (sp || 1);
        const a = (0.2 + absorb * 0.5) * Math.min(1, sp / 1.1);
        ctx.strokeStyle = `rgba(${color}, ${a})`;
        ctx.lineWidth = 1 + absorb * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x - nx * len, p.y - ny * len);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      t += 0.006;
      raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf && !paused && alive) raf = requestAnimationFrame(step);
    };

    resize();
    updateBtn();

    const ro = new ResizeObserver(resize);
    ro.observe(root);

    const io = new IntersectionObserver(
      (entries) => {
        paused = !entries[0].isIntersecting;
        if (!paused) kick();
      },
      { threshold: 0 },
    );
    io.observe(root);

    const onEnter = () => {
      absorbTarget = 1;
    };
    const onLeave = () => {
      absorbTarget = 0;
    };
    btn?.addEventListener("pointerenter", onEnter);
    btn?.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", updateBtn, { passive: true });

    kick();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      btn?.removeEventListener("pointerenter", onEnter);
      btn?.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", updateBtn);
    };
  }, [color]);

  return (
    <div ref={rootRef} className="flowfield" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
}
