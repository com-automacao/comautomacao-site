"use client";

import { useEffect, useRef } from "react";

type Particle = { tx: number; ty: number; sx: number; sy: number };

// Em repouso o número é TEXTO nítido (anti-aliased, sem pixel). As partículas
// só aparecem na transição: montam ao entrar na tela e dispersam no hover/toque.
// Um valor `disperse` (0 = montado/texto, 1 = disperso/partículas) dirige tudo,
// com crossfade entre o texto e as partículas.
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
    let ps: Particle[] = [];
    let w = 0;
    let h = 0;
    let pad = 0;
    let baseline = 0;
    let dot = 2;
    let fill = "#fff";
    let fontStr = "";
    let revealed = false;
    let hovered = false;
    let disperse = 1; // começa disperso; monta ao revelar
    let raf = 0;
    let running = false;
    let alive = true;

    const build = () => {
      if (!alive) return;
      const cs = getComputedStyle(root);
      fill = cs.color || "#fff";
      const fontSize = parseFloat(cs.fontSize) || 48;
      fontStr = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
      dot = Math.max(1.8, fontSize / 22);

      const meas = document.createElement("canvas").getContext("2d");
      if (!meas) return;
      meas.font = fontStr;
      const m = meas.measureText(text);
      const ascent = m.actualBoundingBoxAscent || fontSize * 0.78;
      const descent = m.actualBoundingBoxDescent || fontSize * 0.22;
      pad = Math.ceil(fontSize * 0.9);
      baseline = pad + ascent;
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
      octx.font = fontStr;
      octx.textBaseline = "alphabetic";
      octx.fillText(text, pad, baseline);
      const img = octx.getImageData(0, 0, off.width, off.height).data;

      const step = Math.max(1, Math.round(Math.max(1.4, fontSize / 26) * dpr));
      const next: Particle[] = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (img[(y * off.width + x) * 4 + 3] > 90) {
            const tx = x / dpr;
            const ty = y / dpr;
            const ang = Math.random() * Math.PI * 2;
            const rad = fontSize * (0.2 + Math.random() * 0.6);
            next.push({
              tx,
              ty,
              sx: tx + Math.cos(ang) * rad,
              sy: ty + Math.sin(ang) * rad,
            });
          }
        }
      }
      ps = next;
      kick();
    };

    const frame = () => {
      const target = hovered ? 1 : revealed ? 0 : 1;
      disperse += (target - disperse) * 0.12;
      if (Math.abs(target - disperse) < 0.004) disperse = target;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // texto nítido quando montado (some no início da dispersão)
      const textA = Math.max(0, 1 - disperse / 0.12);
      if (textA > 0.01) {
        ctx.globalAlpha = textA;
        ctx.fillStyle = fill;
        ctx.font = fontStr;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(text, pad, baseline);
      }

      // partículas na transição/dispersão
      const pA = Math.min(1, disperse / 0.1);
      if (pA > 0.01 && ps.length) {
        ctx.globalAlpha = pA;
        ctx.fillStyle = fill;
        const r = dot / 2;
        ctx.beginPath();
        for (const p of ps) {
          const px = p.tx + (p.sx - p.tx) * disperse;
          const py = p.ty + (p.sy - p.ty) * disperse;
          ctx.moveTo(px + r, py);
          ctx.arc(px, py, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      if (disperse !== target) raf = requestAnimationFrame(frame);
      else running = false;
    };
    function kick() {
      if (!running && alive) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }

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
      if (raf) cancelAnimationFrame(raf);
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
