"use client";

import { useState } from "react";
import Link from "next/link";
import { TextScramble } from "@/components/ui/text-scramble";
import type { Product } from "@/lib/products";


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

  // No mobile a faixa é um acordeão: o primeiro toque expande e o segundo
  // navega. A seta é só um sinal visual — não um controle aninhado dentro do
  // link, o que seria HTML inválido e inalcançável por teclado —, mas continua
  // servindo para recolher o que está aberto.
  const handleClick = (e: React.MouseEvent) => {
    if (!isMobile()) return;

    const onArrow = (e.target as HTMLElement).closest(".stripe-arrow") !== null;

    if (!open || onArrow) {
      e.preventDefault();
      onToggle();
    }
  };

  const expanded = hovered || open;

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className={`stripe${open ? " is-open" : ""}`}
      data-slug={product.slug}
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
        <span
          className="stripe-bg-mark"
          aria-hidden
          style={
            {
              "--mark-src": `url("${product.mark}")`,
              "--card-accent": accent,
            } as React.CSSProperties
          }
        />
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

      <span className="stripe-arrow" aria-hidden />
    </Link>
  );
}
