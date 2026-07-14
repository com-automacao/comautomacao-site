"use client";

import { useEffect, useRef, useState } from "react";

const CELL = 42;
const GAP = 6;

// raio da zona central escura (atrás da logo/texto), em unidades normalizadas
const DARK_AX = 0.5;
const DARK_AY = 0.46;

type Cell = { delay: number; dark: boolean };

export default function DataGridHero({
  accent = "#1B6FD6",
}: {
  accent?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dims = useRef({ c: 0, r: 0 });
  const [cols, setCols] = useState(0);
  const [cells, setCells] = useState<Cell[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const build = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const c = Math.max(1, Math.floor(w / (CELL + GAP)));
      const r = Math.max(1, Math.floor(h / (CELL + GAP)));
      if (c === dims.current.c && r === dims.current.r) return;
      dims.current = { c, r };

      const cx = (c - 1) / 2;
      const cy = (r - 1) / 2;
      const halfC = Math.max(cx, 0.5);
      const halfR = Math.max(cy, 0.5);

      const next: Cell[] = [];
      for (let y = 0; y < r; y++) {
        for (let x = 0; x < c; x++) {
          const nx = (x - cx) / halfC;
          const ny = (y - cy) / halfR;
          const dark =
            (nx / DARK_AX) ** 2 + (ny / DARK_AY) ** 2 < 1;
          // onda sincronizada: atraso só pela distância radial (centro -> bordas)
          const radial = Math.hypot(nx, ny);
          next.push({
            dark,
            delay: radial * 2.2,
          });
        }
      }
      setCols(c);
      setCells(next);
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
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
        {cells.map((cell, i) => (
          <span
            key={i}
            className={
              "grid-hero-cell" + (cell.dark ? " grid-hero-cell--dark" : "")
            }
            style={
              cell.dark ? undefined : { animationDelay: `${cell.delay}s` }
            }
          />
        ))}
      </div>
    </div>
  );
}
