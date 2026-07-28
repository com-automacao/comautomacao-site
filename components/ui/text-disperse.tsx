"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
};

// hash determinístico por índice — evita re-randomizar e mismatch de hidratação
function rnd(seed: number) {
  const x = Math.sin(seed * 99.13 + 3.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function TextDisperse({ text, className }: Props) {
  const [active, setActive] = useState(false);
  const timer = useRef<number | null>(null);
  const chars = useMemo(() => Array.from(text), [text]);

  const offsets = useMemo(
    () =>
      chars.map((_, i) => {
        const angle = rnd(i + 1) * Math.PI * 2;
        const dist = 18 + rnd(i + 7) * 28;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          rot: (rnd(i + 13) - 0.5) * 55,
        };
      }),
    [chars],
  );

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const disperse = () => setActive(true);
  const reform = () => setActive(false);
  // no touch não há "sair" confiável: dispara e volta sozinho
  const onTouchStart = () => {
    setActive(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(false), 1400);
  };

  return (
    <span
      className={"td-wrap" + (className ? " " + className : "")}
      onMouseEnter={disperse}
      onMouseLeave={reform}
      onTouchStart={onTouchStart}
      aria-label={text}
      role="text"
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          className="td-char"
          aria-hidden
          animate={
            active
              ? { x: offsets[i].x, y: offsets[i].y, rotate: offsets[i].rot }
              : { x: 0, y: 0, rotate: 0 }
          }
          transition={{ type: "spring", stiffness: 220, damping: 12, mass: 0.6 }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}
