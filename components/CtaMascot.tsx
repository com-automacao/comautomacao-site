"use client";

import { useEffect, useState } from "react";
import { InteractiveRobot } from "@/components/ui/interactive-robot";
import { MascotSprite } from "@/components/ui/mascote-v2/mascot-sprite";

type Variant = "robot" | "sprite";

// Alternador para comparar as duas versões do mascote na CTA:
//   ?mascot=robot  (padrão) -> InteractiveRobot (GLB + React Three Fiber)
//   ?mascot=sprite (ou v2)  -> MascotSprite (folha de sprites pré-renderizada)
export default function CtaMascot({
  accent,
  name,
}: {
  accent: string;
  name: string;
}) {
  const [variant, setVariant] = useState<Variant>("robot");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("mascot");
    if (q === "sprite" || q === "v2") setVariant("sprite");
    else if (q === "robot" || q === "v1") setVariant("robot");
  }, []);

  if (variant === "sprite") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ width: "100%", aspectRatio: "1 / 1", margin: "auto" }}>
          <MascotSprite basePath="/mascote" frames={25} cols={5} priority />
        </div>
      </div>
    );
  }

  return (
    <InteractiveRobot
      accentColor={accent}
      ariaLabel={`Mascote 3D interativo — ${name}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        minHeight: 0,
      }}
    />
  );
}
