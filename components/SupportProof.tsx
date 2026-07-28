import { SUPPORT } from "@/lib/social-proof";
import { LEGAL, WHATSAPP_URL } from "@/lib/site";
import { FlowButton } from "@/components/ui/flow-button";
import { Arrow } from "@/components/Icons";

export default function SupportProof() {
  return (
    <section id="suporte" className="s-dark pad" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="eyebrow reveal r-left">Suporte local</div>
        <h2 className="section-title reveal r-left" data-d="1">
          Suporte de verdade, com nome e rosto.
        </h2>
        <p className="lead reveal r-left" data-d="2">
          Nada de central distante ou ticket sem fim. Você fala com quem conhece
          a sua operação, nos canais e no horário abaixo.
        </p>

        <div className="support-grid reveal r-left" data-d="3">
          <div className="support-item">
            <span className="support-k">Atendimento</span>
            <span className="support-v">{SUPPORT.canais.join(" · ")}</span>
          </div>
          <div className="support-item">
            <span className="support-k">Horário</span>
            <span className="support-v">{LEGAL.horario}</span>
          </div>
          <div className="support-item">
            <span className="support-k">Telefone direto</span>
            <span className="support-v">{LEGAL.telefone}</span>
          </div>
          {SUPPORT.tempoPrimeiraResposta && (
            <div className="support-item">
              <span className="support-k">Tempo médio de 1ª resposta</span>
              <span className="support-v">{SUPPORT.tempoPrimeiraResposta}</span>
            </div>
          )}
          {SUPPORT.politicaPico && (
            <div className="support-item">
              <span className="support-k">Em horário de pico</span>
              <span className="support-v">{SUPPORT.politicaPico}</span>
            </div>
          )}
        </div>

        <FlowButton
          variant="primary"
          href={WHATSAPP_URL}
          className="reveal r-left"
          data-d="3"
          style={{ marginTop: 34 }}
        >
          Falar com o suporte
          <Arrow />
        </FlowButton>
      </div>
    </section>
  );
}
