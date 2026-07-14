"use client";

import dynamic from "next/dynamic";

const BackgroundPaths = dynamic(
  () => import("@/components/ui/background-paths"),
  { ssr: false },
);

export default function HeroPaths({ accent }: { accent: string }) {
  return <BackgroundPaths accent={accent} />;
}
