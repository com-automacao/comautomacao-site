"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  sx: number;
  sy: number;
};

// Texto revelado em partículas: monta quando entra na tela e dispersa no
// hover/toque. Renderiza o texto num canvas offscreen, amostra os pixels e
// anima cada partícula entre a posição "montada" (tx/ty) e a "dispersa" (sx/sy).
export default function MagicTextReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let dot = 2;
    let fill = "#fff";
    let revealed = false;
    let hovered = false;
    let rafId = 0;
    let running = false;
    let alive = true;

    const build = () => {
      if (!alive) return;
      const cs = getComputedStyle(root);
      fill = cs.color || "#fff";
      const fontSize = parseFloat(cs.fontSize) || 48;
      const font = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
      dot = Math.max(2, fontSize / 19);

      const meas = document.createElement("canvas").getContext("2d");
      if (!meas) return;
      meas.font = font;
      const m = meas.measureText(text);
      const ascent = m.actualBoundingBoxAscent || fontSize * 0.78;
      const descent = m.actualBoundingBoxDescent || fontSize * 0.22;
      const pad = Math.ceil(fontSize * 0.6);
      w = Math.ceil(m.width) + pad * 2;
      h = Math.ceil(ascent + descent) + pad * 2;

      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.scale(dpr, dpr);
      octx.fillStyle = "#fff";
      octx.font = font;
      octx.textBaseline = "alphabetic";
      octx.fillText(text, pad, pad + ascent);
      const img = octx.getImageData(0, 0, off.width, off.height).data;

      const stepCss = Math.max(1.4, fontSize / 33);
      const step = Math.max(1, Math.round(stepCss * dpr));
      const next: Particle[] = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (img[(y * off.width + x) * 4 + 3] > 80) {
            const tx = x / dpr;
            const ty = y / dpr;
            const ang = Math.random() * Math.PI * 2;
            const rad = fontSize * (0.4 + Math.random() * 1.2);
            const sx = tx + Math.cos(ang) * rad;
            const sy = ty + Math.sin(ang) * rad;
            // se já revelado, nasce montado (rebuild não re-espalha)
            next.push({
              x: revealed ? tx : sx,
              y: revealed ? ty : sy,
              tx,
              ty,
              sx,
              sy,
            });
          }
        }
      }
      particles = next;
      kick();
    };

    const frame = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;
      const assemble = revealed && !hovered;
      ctx.globalAlpha = assemble ? 1 : 0.5;
      const r = dot / 2;
      let moving = false;
      // pontos redondos (batched) — bordas suaves, sem serrilhado
      ctx.beginPath();
      for (const p of particles) {
        const gx = assemble ? p.tx : p.sx;
        const gy = assemble ? p.ty : p.sy;
        p.x += (gx - p.x) * 0.12;
        p.y += (gy - p.y) * 0.12;
        if (Math.abs(gx - p.x) > 0.3 || Math.abs(gy - p.y) > 0.3) moving = true;
        const cx = p.x + r;
        const cy = p.y + r;
        ctx.moveTo(cx + r, cy);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
      ctx.fill();
      if (moving) rafId = requestAnimationFrame(frame);
      else running = false;
    };
    function kick() {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
    }

    // reveal determinístico pelo scroll (mais confiável que IO async)
    const evalReveal = () => {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      const nowIn = r.top < vh * 0.88 && r.bottom > vh * 0.12;
      if (nowIn !== revealed) {
        revealed = nowIn;
        kick();
      }
    };

    const doBuild = () => {
      build();
      evalReveal();
    };
    doBuild();
    if (document.fonts?.ready) document.fonts.ready.then(doBuild);

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        evalReveal();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const ro = new ResizeObserver(() => build());
    ro.observe(root);

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      hovered = true;
      kick();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      hovered = false;
      kick();
    };
    let tt: number | null = null;
    const onTouch = () => {
      hovered = true;
      kick();
      if (tt) window.clearTimeout(tt);
      tt = window.setTimeout(() => {
        hovered = false;
        kick();
      }, 1400);
    };
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("touchstart", onTouch, { passive: true });

    return () => {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (tt) window.clearTimeout(tt);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("touchstart", onTouch);
    };
  }, [text]);

  return (
    <span
      ref={rootRef}
      className={"mtr" + (className ? " " + className : "")}
      aria-label={text}
    >
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {text}
      </span>
      <canvas ref={canvasRef} aria-hidden />
    </span>
  );
}
