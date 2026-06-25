import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Icons";
import { FlowButton } from "@/components/ui/flow-button";
import { WHATSAPP_URL, EMAIL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="glow" style={{ width: "40vw", height: "40vw", bottom: "-15%", right: "-5%" }} />
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Image
              className="foot-logo reveal"
              src="/logos/logo-horizontal-white.png"
              alt="Com Automação"
              width={1280}
              height={189}
            />
            <h2 className="foot-cta reveal" data-d="1" style={{ marginTop: 28 }}>
              Sua operação,
              <br />
              <span className="thin">pronta para</span> decolar.
            </h2>
          </div>
          <div className="reveal" data-d="2">
            <p style={{ color: "var(--color-fg-2)", fontWeight: 300, lineHeight: 1.6, maxWidth: "34ch" }}>
              Representamos os melhores sistemas de gestão e cuidamos da
              implantação e do suporte. Conte o seu desafio — a gente indica o
              caminho.
            </p>
            <div className="foot-contacts">
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <Link href="/#produtos">Ver todos os produtos</Link>
            </div>
            <FlowButton variant="primary" href={WHATSAPP_URL} style={{ marginTop: 22 }}>
              Fale conosco
              <Arrow />
            </FlowButton>
          </div>
        </div>
      </div>
      <div className="watermark">DECOLE</div>
      <div className="foot-bottom">
        <span>© 2026 Com Automação</span>
        <span>Empresas organizadas decolam</span>
      </div>
    </footer>
  );
}
