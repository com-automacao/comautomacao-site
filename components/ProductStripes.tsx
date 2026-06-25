"use client";

import { useState } from "react";
import ProductStripe from "@/components/ProductStripe";
import type { Product } from "@/lib/products";

/**
 * Lista de faixas de produto com estado compartilhado: só um card aberto por
 * vez (abrir um recolhe o outro). O fluxo de toque vive no ProductStripe.
 */
export default function ProductStripes({
  items,
}: {
  items: { product: Product; accent: string }[];
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <div className="stripes">
      {items.map(({ product, accent }) => (
        <ProductStripe
          key={product.slug}
          product={product}
          accent={accent}
          open={openSlug === product.slug}
          onToggle={() =>
            setOpenSlug((cur) => (cur === product.slug ? null : product.slug))
          }
        />
      ))}
    </div>
  );
}
