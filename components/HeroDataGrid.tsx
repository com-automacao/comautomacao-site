"use client";

import dynamic from "next/dynamic";

const DataGridHero = dynamic(
  () => import("@/components/ui/data-grid-hero"),
  { ssr: false },
);

export default function HeroDataGrid({ accent }: { accent: string }) {
  return <DataGridHero accent={accent} />;
}
