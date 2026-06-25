"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon, WhatsApp, Arrow } from "@/components/Icons";
import { WHATSAPP_URL } from "@/lib/site";

const links = [
  { href: "/#frentes", label: "O que fazemos" },
  { href: "/#produtos", label: "Produtos" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#marcas", label: "Diretório" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="hamburger"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <nav className="mobile-links">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            className="mobile-cta"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <WhatsApp width={18} height={18} />
            Fale conosco
            <Arrow />
          </a>
        </div>
      )}
    </div>
  );
}
