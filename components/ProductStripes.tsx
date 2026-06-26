"use client";

import { useState } from "react";
import ProductStripe from "@/components/ProductStripe";
import type { Product } from "@/lib/products";


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
