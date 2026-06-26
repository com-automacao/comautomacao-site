"use client";

import { useState } from "react";
import Link from "next/link";
import { TextScramble } from "@/components/ui/text-scramble";
import type { Product } from "@/lib/products";

/**
 * Faixa de produto da section "Produtos".
 * - Desktop: expande no hover e revela 5 palavras-chave (text-scramble) + CTA.
 * - Mobile (≤820px): 1º toque ABRE (e recolhe os outros via estado do pai);
 *   2º toque ACESSA. A seta (▼/▲) recolhe/expande sem navegar.
 */
export default function ProductStripe({
  product,
  accent,
  open,
  onToggle,
}: {
  product: Product;
  accent: string;
  open: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const isMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 820px)").matches;

  const handleClick = (e: React.MouseEvent) => {
    // mobile: 1º toque abre (recolhe os outros); 2º toque navega
    if (isMobile() && !open) {
      e.preventDefault();
      onToggle();
    }
  };

  const handleArrow = (e: React.MouseEvent) => {
    // a seta recolhe/expande sem navegar
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  const expanded = hovered || open;

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className={`stripe${open ? " is-open" : ""}`}
      style={{ background: accent }}
      onMouseEnter={() => {
        if (
          typeof window !== "undefined" &&
          window.matchMedia("(hover: hover)").matches
        ) {
          setHovered(true);
        }
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {product.mark && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className="stripe-bg-mark" src={product.mark} alt="" aria-hidden />
      )}
      <div className="info">
        <b>{product.name}</b>
        <span className="cat">{product.category}</span>

        {expanded && (
          <>
            <div className="kw" aria-hidden>
              {product.keywords.map((k) => (
                <TextScramble
                  key={k}
                  as="span"
                  className="kw-item"
                  duration={0.5}
                  speed={0.03}
                >
                  {k}
                </TextScramble>
              ))}
            </div>
            <span className="more">clique e saiba mais →</span>
          </>
        )}
      </div>

      <span
        className="stripe-arrow"
        aria-label={open ? "Recolher" : "Abrir"}
        role="button"
        onClick={handleArrow}
      />
    </Link>
  );
}
