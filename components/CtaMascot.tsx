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
 * Desktop: a cabeça segue o cursor, arrastar gira o corpo, e os braços sobem em
 * comemoração enquanto o mouse está no botão "Vamos decolar"
 * (`[data-mascot-cheer]`).
 *
 * Toque (celular/tablet): arrastar gira e TOCAR comemora. Não há gatilho de
 * hover, então o toque no mascote é o que dispara a pose; um segundo toque
 * relaxa. A cabeça não segue nada (sem ponteiro, e o giroscópio foi removido —
 * não funcionava de forma confiável nos aparelhos reais).
 */
export default function CtaMascot({
  name,
  accent,
}: {
  name: string;
  accent?: string;
}) {
  const hoverless = useHoverless();
  const [pose, setPose] = useState<MascotPose>("relaxed");
  const [trigger, setTrigger] = useState(0);

  const play = (next: MascotPose) => {
    setPose(next);
    setTrigger((t) => t + 1);
  };

  // só no desktop: em aparelho de toque não existe hover para escutar
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
      pose={pose}
      animationTrigger={trigger}
      accent={accent}
      onMascotClick={() => play(pose === "relaxed" ? "celebrate" : "relaxed")}
      ariaLabel={`Mascote 3D interativo — ${name}`}
    />
  );
}
