"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; age: number; life: number };

// Flow field: partículas seguem um campo de fluxo curvo (pseudo curl-noise) e
// deixam TRILHAS (o canvas não é limpo, só desvanece) formando streamlines. No
// hover do [data-absorb-target] da mesma zona, são sugadas em direção a ele.
export default function FlowFieldBackground({
  color = "128, 162, 255",
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

    const scope = (root.parentElement as HTMLElement | null) ?? document.body;
    const btn = scope.querySelector(
      "[data-absorb-target]",
    ) as HTMLElement | null;

    const spawn = (p: P) => {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.age = 0;
      p.life = 500 + Math.random() * 500;
    };

    const resize = () => {
      const r = root.getBoundingClientRect();
      w = r.width;
      h = r.height;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const count = Math.min(460, Math.max(140, Math.round((w * h) / 2500)));
      ps = Array.from({ length: count }, () => {
        const p: P = { x: 0, y: 0, age: 0, life: 0 };
        spawn(p);
        p.age = Math.random() * p.life;
        return p;
      });
    };

    const updateBtn = () => {
      if (!btn) return;
      const b = btn.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      bx = b.left + b.width / 2 - c.left;
      by = b.top + b.height / 2 - c.top;
    };

    // campo de fluxo (pseudo curl-noise via senos em camadas) -> ângulo
    const field = (x: number, y: number) =>
      (Math.sin(x * 0.005 + Math.cos(y * 0.006 + t * 0.0022) * 1.7) +
        Math.cos(y * 0.0055 - Math.sin(x * 0.0052 - t * 0.0018) * 1.7)) *
      1.15;

    const speed = 1.05;

    const step = () => {
      if (!alive || paused) {
        raf = 0;
        return;
      }
      absorb += (absorbTarget - absorb) * 0.06;
      updateBtn();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // fade das trilhas: baixo no normal (linhas contínuas/persistentes) e
      // alto no hover (as linhas se desfazem)
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${0.018 + absorb * 0.16})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = `rgba(${color}, ${0.3 + absorb * 0.4})`;
      ctx.beginPath();
      for (const p of ps) {
        const ang = field(p.x, p.y) * Math.PI;
        let vx = Math.cos(ang) * speed;
        let vy = Math.sin(ang) * speed;

        if (absorb > 0.002) {
          const dx = bx - p.x;
          const dy = by - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const pull = absorb * (1.4 + 42 / d);
          vx = vx * (1 - absorb) + (dx / d) * pull;
          vy = vy * (1 - absorb) + (dy / d) * pull;
          if (d < 14) {
            spawn(p);
            continue;
          }
        }

        p.x += vx;
        p.y += vy;
        p.age++;
        if (
          p.age > p.life ||
          p.x < -8 ||
          p.x > w + 8 ||
          p.y < -8 ||
          p.y > h + 8
        ) {
          spawn(p);
          continue;
        }
        ctx.moveTo(p.x + 1, p.y);
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
      }
      ctx.fill();

      t += 1;
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
