"use client";

import { useEffect, useRef, useState } from "react";

const CELL = 42;
const GAP = 6;

export default function DataGridHero({
  accent = "#2080F0",
}: {
  accent?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(0);
  const [cells, setCells] = useState<number[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const build = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const c = Math.max(1, Math.floor(w / (CELL + GAP)));
      const r = Math.max(1, Math.floor(h / (CELL + GAP)));
      const cx = (c - 1) / 2;
      const cy = (r - 1) / 2;
      const maxD = Math.hypot(cx, cy) || 1;
      const delays: number[] = [];
      for (let y = 0; y < r; y++) {
        for (let x = 0; x < c; x++) {
          delays.push((Math.hypot(x - cx, y - cy) / maxD) * 2.4);
        }
      }
      setCols(c);
      setCells(delays);
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="grid-hero"
      aria-hidden
      style={{ ["--accent" as string]: accent }}
    >
      <div
        className="grid-hero-cells"
        style={
          cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined
        }
      >
        {cells.map((delay, i) => (
          <span
            key={i}
            className="grid-hero-cell"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
      <div className="grid-hero-glow" />
    </div>
  );
}
