import Link from "next/link";
import Image from "next/image";
import { Arrow } from "@/components/Icons";
import MobileNav from "@/components/MobileNav";
import { WHATSAPP_URL } from "@/lib/site";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="beam-h" />
      <div className="nav-in">
        <Link className="brand" href="/" aria-label="Com Automação — início">
          <Image
            className="logo-h"
            src="/logos/logo-horizontal-white.png"
            alt="Com Automação"
            width={1280}
            height={189}
            priority
          />
        </Link>
        <div className="nav-links">
          <Link href="/#frentes">O que fazemos</Link>
          <Link href="/#produtos">Produtos</Link>
          <Link href="/#diferenciais">Diferenciais</Link>
          <Link href="/#marcas">Diretório</Link>
        </div>
        <a
          className="btn-shimmer nav-cta"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="ring" />
          <span className="inset" />
          Fale conosco
          <Arrow />
        </a>
        <MobileNav />
      </div>
    </nav>
  );
}
