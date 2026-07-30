"use client";

import { useEffect, useState } from "react";
import {
  InteractiveRobot,
  type RobotPose,
} from "@/components/ui/interactive-robot";

// Mascote da CTA do produto: relaxado por padrão e LEVANTA as mãos (clip
// ArmsUp_Celebrate) enquanto o mouse está no botão "Vamos decolar"
// ([data-mascot-cheer]); volta a relaxar ao sair. Clique no robô também alterna.
// A cabeça acompanha o cursor (followPointer). Só desktop (≥1200px via CSS),
// então força a variante HQ desktop.
export default function CtaMascot({ name }: { name: string }) {
  const [pose, setPose] = useState<RobotPose>("relaxed");
  const [trigger, setTrigger] = useState(0);

  const play = (next: RobotPose) => {
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
    <InteractiveRobot
      className="h-full w-full"
      quality="desktop"
      pose={pose}
      animationTrigger={trigger}
      scale={0.62}
      position={[0, -0.98, 0]}
      onRobotClick={() => play(pose === "relaxed" ? "celebrate" : "relaxed")}
      ariaLabel={`Mascote 3D interativo — ${name}`}
    />
  );
}
