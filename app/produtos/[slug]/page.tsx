import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Arrow, FeatureIcon } from "@/components/Icons";
import { FlowButton } from "@/components/ui/flow-button";
import { getProduct, products, PRODUCT_FAQ } from "@/lib/products";
import { WHATSAPP_URL } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const ogTitle = `${product.name} — Com Automação`;
  const url = `/produtos/${slug}/`;
  return {
    title: product.name,
    description: product.lead,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "Com Automação",
      title: ogTitle,
      description: product.lead,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: product.lead,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const others = products.filter((p) => p.slug !== product.slug);

  return (
    <div style={{ ["--accent" as string]: product.accent }}>
      {/* ===== DOBRA 1 · HERO (acento) ===== */}
      <header className="hero" id="top" style={{ minHeight: "82vh" }}>
        <div
          className="hero-bg"
          style={{
            background: `radial-gradient(ellipse 90% 70% at 50% 0%, color-mix(in srgb, var(--accent) 30%, #050505), #050505 70%)`,
          }}
        />
        <div className="grid-bg" />
        <div className="hero-veil accent" />
        <Image
          className="hero-mark hero-mark--product"
          src="/logos/logo-mark-white.png"
          alt=""
          aria-hidden
          width={764}
          height={740}
        />
        <div className="hero-in">
          <div className="eyebrow reveal in">
            <span className="dot" style={{ background: "var(--accent)" }} />
            {product.category}
          </div>
          {product.wordmark ? (
            <h1 className="reveal in" data-d="1" style={{ margin: "22px auto 0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero-wordmark"
                src={product.wordmark}
                alt={product.name}
              />
            </h1>
          ) : (
            <h1 className="display display--product reveal in" data-d="1">
              {product.name}
            </h1>
          )}
          <p className="lead reveal in" data-d="2">
            {product.lead}
          </p>
          <div className="hero-cta reveal in" data-d="3">
            <FlowButton variant="accent" href={WHATSAPP_URL}>
              Fale conosco
              <Arrow />
            </FlowButton>
            <FlowButton variant="ghost" href="#features">
              Ver recursos
            </FlowButton>
          </div>
          <div className="hero-pills reveal in" data-d="4">
            {product.keywords.map((k) => (
              <span className="pill" key={k}>
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="scroll-cue">
          <span className="mono-label">Role</span>
          <span className="bar" />
        </div>
      </header>

      {/* ===== DOBRA 2 · SOLUÇÃO (bloco único branco + mockup) ===== */}
      <section
        className="s-light"
        style={{ paddingBlock: "clamp(56px, 7vw, 96px)" }}
      >
        <div className="wrap prod-solution">
          <div className="prod-solution-text">
            <div
              className="mono-label reveal r-left"
              style={{ color: "var(--accent)" }}
            >
              A SOLUÇÃO · {product.name.toUpperCase()}
            </div>
            <h2 className="section-title reveal r-left" data-d="1">
              {product.solution.title}
            </h2>
            <p className="lead reveal r-left" data-d="2">
              {product.solution.body}
            </p>
            <ul className="check-list reveal r-left" data-d="3">
              {product.solution.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          {product.mockup && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="prod-solution-img reveal r-right"
              data-d="1"
              src={product.mockup}
              alt={`${product.name} — telas do sistema`}
              loading="lazy"
            />
          )}
        </div>
      </section>

      {/* ===== DOBRA 3 · FEATURES (grid de acento) — anim: dobra 3D (flip) ===== */}
      <section id="features" className="s-dark pad">
        <div className="wrap">
          <div className="eyebrow reveal r-flip">Recursos</div>
          <h2 className="section-title reveal r-flip" data-d="1">
            O que o {product.name} faz por você.
          </h2>
          <div className="feat-grid">
            {product.features.map((f, i) => (
              <div
                key={f.title}
                className="card feat reveal r-flip"
                data-d={Math.min((i % 3) + 1, 3)}
              >
                <div className="ic">
                  <FeatureIcon name={f.icon} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARA QUEM É ===== */}
      <section className="s-dark pad" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="eyebrow reveal r-left">Para quem é</div>
          <h2 className="section-title reveal r-left" data-d="1">
            Feito para a sua operação.
          </h2>
          <div className="audience-grid">
            {product.audience.map((a, i) => (
              <div
                key={a}
                className="audience-item reveal r-left"
                data-d={String(Math.min(i + 1, 5))}
              >
                <span className="audience-dot" />
                {a}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALERIA / PRINTS (prints reais do sistema) ===== */}
      {product.gallery && product.gallery.length > 0 && (
        <section id="galeria" className="s-dark pad" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="eyebrow reveal r-rise">Por dentro</div>
            <h2 className="section-title reveal r-rise" data-d="1">
              O {product.name} por dentro.
            </h2>
            <div className="gallery reveal r-rise" data-d="1">
              {product.gallery.map((g) => (
                <figure
                  key={g.src}
                  className={`gallery-tile${g.portrait ? " is-portrait" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.src} alt={g.caption} loading="lazy" />
                  <figcaption className="mono-label">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FAQ (acordeão nativo) ===== */}
      <section className="s-dark pad">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="eyebrow reveal r-left">Dúvidas frequentes</div>
          <h2 className="section-title reveal r-left" data-d="1">
            Perguntas que ajudam a decidir.
          </h2>
          <div className="faq reveal r-left" data-d="2">
            {PRODUCT_FAQ.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>
                  <span>{f.q}</span>
                  <span className="faq-icon" aria-hidden />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DOBRA 5 · CTA (acento) — anim: crescer com mola ===== */}
      <section className="s-dark pad">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2
            className="reveal r-scale"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "clamp(34px,6vw,64px)",
              letterSpacing: "var(--ls-tighter)",
              lineHeight: 1,
            }}
          >
            Pronto para colocar {product.ctaSubject ?? `o ${product.name}`}{" "}
            <span style={{ color: "var(--accent)" }}>no ar</span>?
          </h2>
          <p
            className="lead reveal r-scale"
            data-d="1"
            style={{ margin: "18px auto 0" }}
          >
            {product.ctaNote ??
              "Implantação, treinamento e suporte local inclusos. Fale com a gente e comece hoje."}
          </p>
          <div
            className="hero-cta reveal r-scale"
            data-d="2"
            style={{ marginTop: 30 }}
          >
            <FlowButton variant="accent" href={WHATSAPP_URL}>
              Vamos decolar
              <Arrow />
            </FlowButton>
            <FlowButton variant="ghost" href="/#produtos">
              Ver todos os produtos
            </FlowButton>
          </div>
        </div>
      </section>

      {/* ===== DOBRA 6 · OUTRAS MARCAS (lista índice) ===== */}
      <section className="s-dark pad" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="eyebrow reveal r-rise">Outros produtos</div>
          <div className="rows" style={{ marginTop: 32 }}>
            {others.map((p, i) => (
              <Link
                key={p.slug}
                className="brow reveal r-rise"
                data-d={String(Math.min(i + 1, 5))}
                href={`/produtos/${p.slug}`}
                style={{ ["--c" as string]: p.accent }}
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
    </div>
  );
}
