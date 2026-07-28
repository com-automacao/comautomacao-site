"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; age: number; life: number; trail: number[] };

// Flow field: partículas seguem um campo de fluxo curvo e cada uma desenha o
// seu próprio traçado (buffer de posições) — linhas sólidas e contínuas, sem
// rastro cinza (o canvas é limpo a cada frame). No hover do [data-absorb-target]
// as linhas encurtam e são sugadas em direção a ele (se desfazem).
export default function FlowFieldBackground({
  color = "206, 214, 236",
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
    const TRAIL = 210;
    const speed = 2.3;
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
    let occ: { x: number; y: number; w: number; h: number }[] = [];

    const scope = (root.parentElement as HTMLElement | null) ?? document.body;

    // "recorta" o flow de trás do texto solto (fora dos cards, que já ocultam
    // pelo fundo opaco). Posição relativa ao canvas (constante no scroll).
    const computeOcc = () => {
      const c = canvas.getBoundingClientRect();
      const els = scope.querySelectorAll<HTMLElement>(
        ".eyebrow, .section-title, .lead",
      );
      occ = Array.from(els).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
      });
    };
    const btn = scope.querySelector(
      "[data-absorb-target]",
    ) as HTMLElement | null;

    // (re)nasce FORA da tela, numa borda aleatória, e some quando sai da tela
    const spawn = (p: P) => {
      const s = Math.floor(Math.random() * 4);
      if (s === 0) {
        p.x = -22;
        p.y = Math.random() * h;
      } else if (s === 1) {
        p.x = w + 22;
        p.y = Math.random() * h;
      } else if (s === 2) {
        p.y = -22;
        p.x = Math.random() * w;
      } else {
        p.y = h + 22;
        p.x = Math.random() * w;
      }
      p.trail = [p.x, p.y];
    };

    const resize = () => {
      const r = root.getBoundingClientRect();
      w = r.width;
      h = r.height;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(280, Math.max(80, Math.round((w * h) / 5200)));
      ps = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return { x, y, age: 0, life: 0, trail: [x, y] };
      });
      computeOcc();
    };

    const updateBtn = () => {
      if (!btn) return;
      const b = btn.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      bx = b.left + b.width / 2 - c.left;
      by = b.top + b.height / 2 - c.top;
    };

    // campo de baixa frequência (linhas longas e coerentes) porém com o ângulo
    // amplificado abaixo -> curvas que percorrem grandes arcos e dobram em
    // laços/U suaves, orgânicas, sem virar ruído.
    const field = (x: number, y: number) =>
      Math.sin(x * 0.0024 + Math.cos(y * 0.002 + t * 0.0015) * 1.2) +
      Math.cos(y * 0.0022 - Math.sin(x * 0.0019 + t * 0.001) * 1.2);

    const step = () => {
      if (!alive || paused) {
        raf = 0;
        return;
      }
      absorb += (absorbTarget - absorb) * 0.11;
      updateBtn();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // no hover os rastros encurtam (se desfazem)
      const maxLen = Math.max(2, Math.round(TRAIL * (1 - absorb * 0.9)));
      // linhas contínuas ao longo do rastro
      ctx.strokeStyle = `rgba(${color}, ${0.5 + absorb * 0.2})`;
      ctx.lineWidth = 1.3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (const p of ps) {
        const ang = field(p.x, p.y) * Math.PI * 1.5;
        let vx = Math.cos(ang) * speed;
        let vy = Math.sin(ang) * speed;

        if (absorb > 0.002) {
          const dx = bx - p.x;
          const dy = by - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const pull = absorb * (3 + 90 / d);
          vx = vx * (1 - absorb) + (dx / d) * pull;
          vy = vy * (1 - absorb) + (dy / d) * pull;
          if (d < 16) {
            spawn(p);
            continue;
          }
        }

        p.x += vx;
        p.y += vy;
        if (p.x < -28 || p.x > w + 28 || p.y < -28 || p.y > h + 28) {
          spawn(p);
          continue;
        }

        p.trail.push(p.x, p.y);
        if (p.trail.length > maxLen * 2)
          p.trail.splice(0, p.trail.length - maxLen * 2);

        const tr = p.trail;
        if (tr.length >= 4) {
          ctx.moveTo(tr[0], tr[1]);
          for (let i = 2; i < tr.length; i += 2) ctx.lineTo(tr[i], tr[i + 1]);
        }
      }
      ctx.stroke();

      // recorta o flow de trás do texto solto (bordas suaves)
      if (occ.length) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.filter = "blur(6px)";
        ctx.fillStyle = "#000";
        for (const o of occ) {
          ctx.fillRect(o.x - 12, o.y - 8, o.w + 24, o.h + 16);
        }
        ctx.filter = "none";
        ctx.globalCompositeOperation = "source-over";
      }

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

    let stick = false;
    const onScroll = () => {
      updateBtn();
      if (stick) return;
      stick = true;
      requestAnimationFrame(() => {
        stick = false;
        computeOcc();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const occTimer = window.setTimeout(computeOcc, 900);

    kick();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      btn?.removeEventListener("pointerenter", onEnter);
      btn?.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(occTimer);
    };
  }, [color]);

  return (
    <div ref={rootRef} className="flowfield" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
}
