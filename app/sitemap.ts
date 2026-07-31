import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://comautomacao.com";

// Gerado no build (output: 'export' escreve out/sitemap.xml). As URLs levam
// barra final para bater com `trailingSlash: true` e com os canonicals.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...products.map((p) => ({
      url: `${SITE_URL}/produtos/${p.slug}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
