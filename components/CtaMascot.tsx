"use client";

import { useEffect, useState } from "react";
import {
  InteractiveMascot,
  type MascotPose,
} from "@/components/ui/interactive-mascot";

// Mascote da CTA do produto: relaxado por padrão e LEVANTA as mãos (clip
// ArmsUp_Celebrate) enquanto o mouse está no botão "Vamos decolar"
// ([data-mascot-cheer]); volta a relaxar ao sair. Clique/toque no robô alterna.
// Desktop: cabeça segue o cursor. Mobile: cabeça segue o giroscópio.
export default function CtaMascot({ name }: { name: string }) {
  const [pose, setPose] = useState<MascotPose>("relaxed");
  const [trigger, setTrigger] = useState(0);

  const play = (next: MascotPose) => {
    setPose(next);
    setTrigger((t) => t + 1);
  };

  useEffect(() => {
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
  }, []);

  return (
    <InteractiveMascot
      className="h-full w-full"
      pose={pose}
      animationTrigger={trigger}
      scale={0.62}
      position={[0, -0.98, 0]}
      onMascotClick={() => play(pose === "relaxed" ? "celebrate" : "relaxed")}
      ariaLabel={`Mascote 3D interativo — ${name}`}
    />
  );
}
