"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";

type Props = {
  text: string;
  className?: string;
};

// hash determinístico por índice — mesmo resultado no SSR e no cliente
function rnd(seed: number) {
  const x = Math.sin(seed * 99.13 + 3.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function TextDisperse({ text, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);
  const chars = Array.from(text);

  // no touch não há "sair": dispara e volta sozinho
  const onTouchStart = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("is-active");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => el.classList.remove("is-active"),
      1400,
    );
  };

  return (
    <span
      ref={ref}
      className={"td-wrap" + (className ? " " + className : "")}
      onTouchStart={onTouchStart}
      aria-label={text}
    >
      {chars.map((ch, i) => {
        const angle = rnd(i + 1) * Math.PI * 2;
        const dist = 18 + rnd(i + 7) * 28;
        const style = {
          "--tx": `${(Math.cos(angle) * dist).toFixed(1)}px`,
          "--ty": `${(Math.sin(angle) * dist).toFixed(1)}px`,
          "--tr": `${((rnd(i + 13) - 0.5) * 55).toFixed(1)}deg`,
        } as CSSProperties;
        return (
          <span key={i} className="td-char" aria-hidden style={style}>
            {ch === " " ? " " : ch}
          </span>
        );
      })}
    </span>
  );
}
