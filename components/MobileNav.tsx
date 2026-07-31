"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const drawerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const drawerId = useId();

  // Um painel com aria-modal precisa se comportar como modal: Esc fecha, o foco
  // fica preso dentro dele e a página atrás não rola.
  useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    const trigger = buttonRef.current;
    const focusables = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (e.shiftKey && (current === first || !drawer?.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        ref={buttonRef}
        type="button"
        className="hamburger"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div
          id={drawerId}
          ref={drawerRef}
          className="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
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
