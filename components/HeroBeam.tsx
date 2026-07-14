"use client";

import dynamic from "next/dynamic";

const PhotonBeam = dynamic(() => import("@/components/ui/photon-beam"), {
  ssr: false,
});

function shade(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `#${[f(r), f(g), f(b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

export default function HeroBeam({ accent }: { accent: string }) {
  return (
    <div className="hero-beam" aria-hidden>
      <PhotonBeam
        colorBg="#060608"
        colorLine={shade(accent, 0.42)}
        colorSignal={accent}
        useColor2
        colorSignal2={shade(accent, 1.3)}

        curveLength={90}
        straightLength={150}
        spreadHeight={40}
        lineCount={100}
      />
    </div>
  );
}
