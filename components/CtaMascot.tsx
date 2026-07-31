"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { MascotPose } from "@/components/ui/interactive-mascot";

// three.js + R3F + drei pesam ~250KB gzip. Com dynamic() eles saem do grafo de
// scripts da página de produto e só baixam quando o mascote entra em cena.
const InteractiveMascot = dynamic(
  () =>
    import("@/components/ui/interactive-mascot").then((m) => m.InteractiveMascot),
  { ssr: false },
);

const HOVERLESS = "(hover: none), (pointer: coarse)";

function subscribeHoverless(onChange: () => void) {
  const media = window.matchMedia(HOVERLESS);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** true em aparelhos de toque, onde "passar o mouse" não existe. */
function useHoverless(): boolean {
  return useSyncExternalStore(
    subscribeHoverless,
    () => window.matchMedia(HOVERLESS).matches,
    () => false, // no servidor não há como saber: assume ponteiro
  );
}

/**
 * Mascote da CTA do produto.
 *
 * Desktop: a cabeça segue o cursor e os braços sobem em comemoração enquanto o
 * mouse está no botão "Vamos decolar" (`[data-mascot-cheer]`); clique no mascote
 * também alterna.
 *
 * Toque (celular/tablet): não existe hover, então a comemoração simplesmente
 * não tem gatilho e fica fora — nada de simular com tap, que roubaria o toque
 * de quem só quer rolar a página. A única interação é a cabeça seguindo o
 * GIROSCÓPIO do aparelho.
 */
export default function CtaMascot({ name }: { name: string }) {
  const hoverless = useHoverless();
  const [pose, setPose] = useState<MascotPose>("relaxed");
  const [trigger, setTrigger] = useState(0);

  const play = (next: MascotPose) => {
    setPose(next);
    setTrigger((t) => t + 1);
  };

  useEffect(() => {
    if (hoverless) return;

    const btn = document.querySelector("[data-mascot-cheer]");
    if (!btn) return;
    const up = () => play("celebrate");
    const down = () => play("relaxed");
    btn.addEventListener("pointerenter", up);
    btn.addEventListener("pointerleave", down);
    return () => {
      btn.removeEventListener("pointerenter", up);
      btn.removeEventListener("pointerleave", down);
    };
  }, [hoverless]);

  return (
    <InteractiveMascot
      className="h-full w-full"
      pose={hoverless ? "relaxed" : pose}
      animationTrigger={trigger}
      onMascotClick={
        hoverless ? undefined : () => play(pose === "relaxed" ? "celebrate" : "relaxed")
      }
      ariaLabel={`Mascote 3D interativo — ${name}`}
    />
  );
}
