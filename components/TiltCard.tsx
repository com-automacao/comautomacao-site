"use client";

import { useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

// Card com inclinação 3D seguindo o cursor (só mouse). Reseta suave ao sair.
export default function TiltCard({
  className,
  children,
  max = 8,
}: {
  className?: string;
  children: ReactNode;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(820px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(6px)`;
  };

  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (el) el.style.transition = "transform 0.08s ease-out";
  };

  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className={"tilt" + (className ? " " + className : "")}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}
