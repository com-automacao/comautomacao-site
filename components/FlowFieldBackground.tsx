"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; trail: number[] };

// Flow field: partículas seguem um campo de fluxo curvo e cada uma desenha o
// seu próprio traçado (buffer de posições) como grão fino de pontos — estilo
// "fluid particles", sem rastro cinza (o canvas é limpo a cada frame). No hover
// do [data-absorb-target] os rastros encurtam e são sugados em direção a ele.
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

    // reduced-motion: sem fundo animado
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // downgrade em mobile/touch: menos partículas p/ manter fluido
    const lowPower =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 820px)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const TRAIL = lowPower ? 110 : 150;
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

    // máscara de occlusion pré-renderizada (borrada uma vez, fora do loop):
    // no frame só compomos por drawImage, sem reaplicar blur a cada quadro.
    const occCanvas = document.createElement("canvas");
    const occCtx = occCanvas.getContext("2d");

    // "recorta" o flow de trás do texto solto (fora dos cards, que já ocultam
    // pelo fundo opaco). Posição relativa ao canvas (constante no scroll), então
    // só precisa recalcular em resize / quando o reveal assenta — não no scroll.
    const computeOcc = () => {
      const c = canvas.getBoundingClientRect();
      const els = scope.querySelectorAll<HTMLElement>(
        ".eyebrow, .section-title, .lead",
      );
      occ = Array.from(els).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
      });
      if (!occCtx) return;
      if (occCanvas.width !== canvas.width || occCanvas.height !== canvas.height) {
        occCanvas.width = canvas.width;
        occCanvas.height = canvas.height;
      }
      occCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      occCtx.clearRect(0, 0, w, h);
      occCtx.filter = "blur(6px)";
      occCtx.fillStyle = "#000";
      for (const o of occ) occCtx.fillRect(o.x - 12, o.y - 8, o.w + 24, o.h + 16);
      occCtx.filter = "none";
    };
    const btn = scope.querySelector(
      "[data-absorb-target]",
    ) as HTMLElement | null;

    // (re)nasce FORA da tela, numa borda aleatória, já com velocidade apontando
    // para dentro (evita acúmulo na borda) e some quando sai da tela
    const spawn = (p: P) => {
      const s = Math.floor(Math.random() * 4);
      if (s === 0) {
        p.x = -22;
        p.y = Math.random() * h;
        p.vx = speed;
        p.vy = 0;
      } else if (s === 1) {
        p.x = w + 22;
        p.y = Math.random() * h;
        p.vx = -speed;
        p.vy = 0;
      } else if (s === 2) {
        p.y = -22;
        p.x = Math.random() * w;
        p.vx = 0;
        p.vy = speed;
      } else {
        p.y = h + 22;
        p.x = Math.random() * w;
        p.vx = 0;
        p.vy = -speed;
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
      const count = lowPower
        ? Math.min(75, Math.max(30, Math.round((w * h) / 16000)))
        : Math.min(160, Math.max(60, Math.round((w * h) / 8600)));
      ps = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return { x, y, vx: 0, vy: 0, trail: [x, y] };
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // no hover os rastros encurtam (se desfazem)
      const maxLen = Math.max(2, Math.round(TRAIL * (1 - absorb * 0.9)));
      // grão fino e discreto de partículas (estilo "fluid particles")
      const r = 0.8;
      ctx.fillStyle = `rgba(${color}, ${0.32 + absorb * 0.16})`;
      ctx.beginPath();

      for (const p of ps) {
        const ang = field(p.x, p.y) * Math.PI * 1.5;
        let tvx = Math.cos(ang) * speed;
        let tvy = Math.sin(ang) * speed;

        if (absorb > 0.002) {
          const dx = bx - p.x;
          const dy = by - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const pull = absorb * (3 + 90 / d);
          tvx = tvx * (1 - absorb) + (dx / d) * pull;
          tvy = tvy * (1 - absorb) + (dy / d) * pull;
          if (d < 16) {
            spawn(p);
            continue;
          }
        }

        // inércia: a velocidade persegue o campo em vez de saltar -> fluidez
        p.vx += (tvx - p.vx) * 0.12;
        p.vy += (tvy - p.vy) * 0.12;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -28 || p.x > w + 28 || p.y < -28 || p.y > h + 28) {
          spawn(p);
          continue;
        }

        p.trail.push(p.x, p.y);
        if (p.trail.length > maxLen * 2)
          p.trail.splice(0, p.trail.length - maxLen * 2);

        // um ponto por amostra -> grão denso (quadradinho: bem mais barato que
        // arc, visualmente igual neste tamanho)
        const tr = p.trail;
        const s = r * 2;
        for (let i = 0; i < tr.length; i += 2) {
          ctx.rect(tr[i] - r, tr[i + 1] - r, s, s);
        }
      }
      ctx.fill();

      // recorta o flow de trás do texto solto compondo a máscara já borrada
      if (occ.length && occCtx) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(occCanvas, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    // o botão e o texto rolam junto com o canvas -> posição relativa constante;
    // no scroll não recalculamos occ (caro), só a âncora do botão.
    const onScroll = () => {
      updateBtn();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // recalcula depois que os reveals assentam (a máscara é feita 1x aqui)
    const occTimer1 = window.setTimeout(computeOcc, 900);
    const occTimer2 = window.setTimeout(computeOcc, 1800);

    kick();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      btn?.removeEventListener("pointerenter", onEnter);
      btn?.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(occTimer1);
      window.clearTimeout(occTimer2);
    };
  }, [color]);

  return (
    <div ref={rootRef} className="flowfield" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
}
