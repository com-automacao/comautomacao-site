import { WhatsApp } from "@/components/Icons";
import { WHATSAPP_URL } from "@/lib/site";

/** Botão flutuante de WhatsApp — visível só no mobile (canto inferior direito). */
export default function WhatsAppFab() {
  return (
    <a
      className="wa-fab"
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
    >
      <WhatsApp width={28} height={28} />
    </a>
  );
}
