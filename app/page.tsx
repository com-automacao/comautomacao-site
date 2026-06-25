import Link from "next/link";
import Image from "next/image";
import HeroVideo from "@/components/HeroVideo";
import HeroMarkAlign from "@/components/HeroMarkAlign";
import { GooeyText } from "@/components/ui/gooey-text-morphing";
import { MagneticText } from "@/components/ui/morphing-cursor";
import { FlowButton } from "@/components/ui/flow-button";
import ProductStripes from "@/components/ProductStripes";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { Arrow } from "@/components/Icons";
import { products } from "@/lib/products";
import { OTHER_PROJECT } from "@/lib/site";

// ⚠️ Depoimentos e fotos ILUSTRATIVOS — substituir por reais (a foto é o campo `src`).
const testimonials = [
  {
    quote:
      "Implantaram o sistema no nosso restaurante em um dia. Quando precisamos, o suporte responde na hora.",
    name: "Marina S.",
    designation: "Restaurante · Maringá",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&q=80",
  },
  {
    quote:
      "Trocamos a planilha pelo controle financeiro e, pela primeira vez, enxergamos o caixa de verdade.",
    name: "Carlos R.",
    designation: "Comércio · Sarandi",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&q=80",
  },
  {
    quote:
      "A fila no balcão acabou. O caixa ficou rápido e o estoque finalmente bate.",
    name: "Ana P.",
    designation: "Varejo · Maringá",
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=600&fit=crop&q=80",
  },
];

const accentVar: Record<string, string> = {
  gourmetsa: "var(--color-gourmet)",
  "finances-web": "var(--color-finances)",
  "pdv-mais": "var(--color-pdv)",
  faloapp: "var(--color-falo)",
  "crm-com": "var(--color-crm)",
  "desenvolvimento-web": "var(--color-web)",
};

export default function Home() {
  return (
    <>
      {/* ===== DOBRA 1 · HERO — animação: fade + rise + blur (padrão) ===== */}
      <header className="hero" id="top">
        <HeroVideo />
        <HeroMarkAlign />
        <div className="hero-veil" />
        {/* posição/tamanho calculados por HeroMarkAlign (cover math) */}
        <div className="hero-mark-layer" aria-hidden>
          <Image
            className="hero-mark"
            src="/logos/logo-mark-white.png"
            alt=""
            width={764}
            height={740}
          />
        </div>
        <div className="hero-in">
          <h1 className="display reveal in" data-d="1">
            Empresas <span className="hl">organizadas</span>
          </h1>
          <GooeyText
            texts={["decolam.", "crescem.", "escalam.", "lucram.", "prosperam."]}
            className="hero-morph"
            textClassName="hero-morph-word"
            morphTime={1}
            cooldownTime={1.6}
          />
          <p className="lead reveal in" data-d="2">
            A Com Automação representa os melhores sistemas de gestão do mercado 
            e cuida da implantação, do treinamento e do suporte local. Você
            adota o que já funciona e foca em crescer.
          </p>
          <div className="hero-cta reveal in" data-d="3">
            <FlowButton variant="primary" href="#produtos">
              Conhecer os produtos
              <Arrow />
            </FlowButton>
            <FlowButton variant="ghost" href="#frentes">
              Como funciona
            </FlowButton>
          </div>
        </div>
        <div className="scroll-cue">
          <span className="mono-label">Role</span>
          <span className="bar" />
        </div>
      </header>

      {/* ===== DOBRA 2 · O QUE FAZEMOS (bloco único) — animação: slide da esquerda ===== */}
      <section id="frentes" className="s-dark pad">
        <div className="wrap">
          <div className="eyebrow reveal r-left">O que a gente faz</div>
          <h2 className="section-title reveal r-left" data-d="1">
            Os melhores sistemas,{" "}
            <span style={{ fontWeight: 200, color: "var(--color-fg-2)" }}>
              reunidos
            </span>
            .
          </h2>
          <div className="frentes-grid">
            <p className="lead reveal r-left" data-d="2" style={{ marginTop: 0 }}>
              A gente não vende promessa: representa softwares de gestão
              consolidados, escolhidos a dedo para o varejo, o food service, o
              financeiro, o atendimento e as vendas. Você adota o que já provou
              que funciona — e ainda conta com implantação, treinamento e suporte
              local. Sem risco de projeto.
            </p>
            <ul className="check-list reveal r-left" data-d="3">
              <li>Softwares que agregam valor a sua empresa</li>
              <li>Um sistema certo para cada frente</li>
              <li>Implantação, treinamento e suporte inclusos</li>
              <li>GourmetSA · Finances Web · PDV+ · e mais</li>
            </ul>
          </div>
          <FlowButton
            variant="primary"
            className="reveal r-left"
            data-d="3"
            href="#produtos"
            style={{ marginTop: 40 }}
          >
            Ver os produtos
            <Arrow />
          </FlowButton>
        </div>
      </section>

      {/* ===== DOBRA 3 · PRODUTOS — animação: wipe por clip-path ===== */}
      <section id="produtos" className="s-dark pad">
        <div className="wrap cor-head">
          <div>
            <div className="eyebrow reveal r-right">Produtos</div>
            <h2 className="section-title reveal r-right" data-d="1">
              Seis frentes.
              <br />
              Uma operação inteira.
            </h2>
          </div>
          <p className="lead reveal r-right" data-d="2" style={{ margin: 0 }}>
            Gestão, caixa, finanças, atendimento e vendas — um sistema certo para
            cada frente do seu negócio. Passe o mouse e clique para conhecer.
          </p>
        </div>
        {/* wrapper observado (área cheia, sem clip → IO confiável);
            a cortina clip-path fica no .stripes interno via transition */}
        <div className="stripes-reveal reveal" data-d="1">
          <ProductStripes
            items={products.map((p) => ({ product: p, accent: accentVar[p.slug] }))}
          />
        </div>
      </section>

      {/* ===== DOBRA 4 · POR QUE ORGANIZAR — animação: crescer com mola ===== */}
      <section id="manifesto" className="s-light pad">
        <div className="wrap">
          <div className="eyebrow reveal r-scale">Por que organizar</div>
          <h2 className="section-title reveal r-scale" data-d="1">
            Organização vira velocidade.
          </h2>
          <div className="spec">
            <div className="reveal r-scale" data-d="1">
              <MagneticText
                className="magnetic-why"
                text="Organize."
                hoverText="Decole."
              />
            </div>
            <div className="reveal r-scale" data-d="2">
              <p style={{ color: "var(--color-fg-2)", fontWeight: 300, lineHeight: 1.65, maxWidth: "42ch", marginBottom: 28 }}>
                Empresa travada perde dinheiro em silêncio: pedido errado, caixa
                que não bate, cliente sem resposta. Com o sistema certo no lugar
                certo, o improviso vira processo — e o que sobra é tempo para
                crescer.
              </p>
              <div className="type-row">
                <div className="meta">01</div>
                <div className="sample" style={{ fontSize: 22, fontWeight: 600 }}>
                  Implantação rápida
                </div>
              </div>
              <div className="type-row">
                <div className="meta">02</div>
                <div className="sample" style={{ fontSize: 22, fontWeight: 600 }}>
                  Suporte local de verdade
                </div>
              </div>
              <div className="type-row">
                <div className="meta">03</div>
                <div className="sample" style={{ fontSize: 22, fontWeight: 600 }}>
                  Sistemas que se conversam
                </div>
              </div>
              <div className="type-row">
                <div className="meta">04</div>
                <div className="sample" style={{ fontSize: 22, fontWeight: 600 }}>
                  Feito para escalar
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DOBRA 5 · DIFERENCIAIS — animação: dobra 3D (flip) ===== */}
      <section id="diferenciais" className="s-dark pad">
        <div className="wrap">
          <div className="eyebrow reveal r-flip">Por que a Com Automação</div>
          <h2 className="section-title reveal r-flip" data-d="1">
            Você adota. A gente faz funcionar.
          </h2>
          <div className="bento">
            <div className="card b-a reveal r-flip">
              <div className="mono-label">REPRESENTAÇÃO COM SUPORTE</div>
              <div>
                <h3 style={{ fontSize: 26, fontWeight: 600, margin: "12px 0 10px", letterSpacing: "var(--ls-tight)" }}>
                  Mais que uma licença.
                </h3>
                <p style={{ color: "var(--color-fg-2)", fontWeight: 300, fontSize: 15, lineHeight: 1.6 }}>
                  A gente indica o sistema certo para a sua operação, configura,
                  treina a equipe e dá suporte local. Um parceiro perto, não um
                  fornecedor distante.
                </p>
              </div>
              <div className="btn-col">
                <FlowButton variant="primary" href="#produtos">
                  Ver produtos
                  <Arrow />
                </FlowButton>
              </div>
            </div>
            <div className="card b-b reveal r-flip" data-d="1" style={{ position: "relative", overflow: "hidden" }}>
              <div className="beam-h" style={{ top: 0 }} />
              <div className="mono-label">SUPORTE QUE ATENDE</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: "10px 0 14px" }}>
                Gente perto de você.
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <span className="pill">WhatsApp</span>
                <span className="pill">Telefone</span>
                <span className="pill">Presencial</span>
                <span className="pill">Remoto</span>
              </div>
            </div>
            <div className="card b-c reveal r-flip" data-d="2">
              <div className="mono-label">IMPLANTAÇÃO</div>
              <div>
                <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "var(--ls-tighter)", marginTop: 8 }}>
                  Rápida
                </div>
                <p style={{ color: "var(--color-fg-2)", fontSize: 13, fontWeight: 300, marginTop: 4 }}>
                  Casa rodando sem espera.
                </p>
              </div>
            </div>
            <div className="card b-d reveal r-flip" data-d="3">
              <div className="mono-label">TREINAMENTO</div>
              <div>
                <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "var(--ls-tighter)", marginTop: 8 }}>
                  Incluso
                </div>
                <p style={{ color: "var(--color-fg-2)", fontSize: 13, fontWeight: 300, marginTop: 4 }}>
                  Equipe operando rápido.
                </p>
              </div>
            </div>
            <div className="card b-e reveal r-flip" data-d="2">
              <div className="mono-label">INTEGRAÇÃO</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, margin: "12px 0 6px" }}>
                Tudo conversa.
              </h3>
              <p style={{ color: "var(--color-fg-2)", fontSize: 14, fontWeight: 300, lineHeight: 1.55 }}>
                Atendimento, vendas, caixa e financeiro num fluxo só. A gente
                ajuda a integrar os sistemas ao que a sua empresa já usa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEPOIMENTOS — animação: crescer com mola ===== */}
      <section id="depoimentos" className="s-light pad">
        <div className="wrap">
          <div className="eyebrow reveal r-scale">Depoimentos</div>
          <h2 className="section-title reveal r-scale" data-d="1">
            Quem organizou, decolou.
          </h2>
          <div className="testimonials-wrap reveal r-scale" data-d="1">
            <CircularTestimonials
              testimonials={testimonials}
              autoplay
              colors={{
                name: "#000",
                designation: "#6e6e73",
                testimony: "#4b5563",
                arrowBackground: "#000",
                arrowForeground: "#fff",
                arrowHoverBackground: "#2e2e2e",
              }}
              fontSizes={{ name: "1.6rem", quote: "1.15rem" }}
            />
          </div>
        </div>
      </section>

      {/* ===== DOBRA 6 · DIRETÓRIO DE PRODUTOS — animação: subir alto, em cascata ===== */}
      <section id="marcas" className="s-dark pad">
        <div className="wrap">
          <div className="eyebrow reveal r-rise">Diretório</div>
          <h2 className="section-title reveal r-rise" data-d="1">
            Escolha por onde decolar.
          </h2>
          <p className="lead reveal r-rise" data-d="2">
            Cada sistema resolve uma frente do negócio. Comece pela dor mais
            urgente — e expanda quando fizer sentido.
          </p>
          <div className="rows">
            {products.map((p, i) => (
              <Link
                key={p.slug}
                className="brow reveal r-rise"
                data-d={String(Math.min(i + 1, 5))}
                href={`/produtos/${p.slug}`}
                style={{ ["--c" as string]: accentVar[p.slug] }}
              >
                <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                <div className="mid">
                  <span className="name">{p.name}</span>
                  <span className="desc">{p.short}</span>
                </div>
                <div className="end">
                  <span className="meta">{p.category}</span>
                  <span className="accent-dot" />
                  <span className="arrow">
                    <Arrow width={22} height={22} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONHEÇA TAMBÉM — banner de outro projeto — animação: slide da direita ===== */}
      <section id="conheca-tambem" className="s-dark pad" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <a
            className="banner reveal r-right"
            href={OTHER_PROJECT.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="banner-beams" aria-hidden>
              <span className="beam-h" style={{ top: "26%" }} />
              <span className="beam-h" style={{ top: "70%" }} />
              <span className="beam-v" style={{ left: "32%" }} />
              <span className="banner-glow" />
            </span>
            <div className="banner-body">
              <div className="eyebrow banner-eyebrow">Conheça também</div>
              <Image
                className="banner-logo"
                src="/equipe360/logo-white.png"
                alt={OTHER_PROJECT.name}
                width={1807}
                height={526}
                priority={false}
              />
              <div className="banner-tagline">{OTHER_PROJECT.tagline}</div>
              <p className="banner-desc">{OTHER_PROJECT.description}</p>
              <span className="banner-cta">
                {OTHER_PROJECT.cta}
                <Arrow />
              </span>
            </div>
            <Image
              className="banner-photo"
              src="/equipe360/joao-paulino.jpeg"
              alt="João Paulino"
              width={1200}
              height={1200}
            />
          </a>
        </div>
      </section>
    </>
  );
}
