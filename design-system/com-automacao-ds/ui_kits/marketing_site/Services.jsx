/* global React, Reveal, Eyebrow */

function Services() {
  const items = [
    {
      title: 'Desenvolvimento web',
      body: 'Sites e aplicações sob medida. Performance, acessibilidade e um código que seu próximo dev vai agradecer.',
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 18v3h8v-3"/></svg>),
    },
    {
      title: 'Automações sob medida',
      body: 'Fluxos que tiram tarefas repetitivas da sua rotina. Integrações entre sistemas que conversam pouco.',
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h10l3 3v9H4z"/><path d="M14 6v3h3M8 13h6M8 16h4"/></svg>),
    },
    {
      title: 'Aplicativos mobile',
      body: 'Produtos mobile-first para iOS e Android. Prototipação rápida, validação com usuários reais.',
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>),
    },
  ];

  return (
    <section id="Serviços" style={{ padding: '100px 22px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <Eyebrow>O que a gente faz</Eyebrow>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.05,
            margin: '0 0 56px', color: '#000', maxWidth: 720, textWrap: 'balance',
          }}>
            Três frentes. Um objetivo: tirar o que trava do caminho.
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 100}>
              <div className="service-card" style={{
                background: '#F7F7F8', border: '1px solid #E5E5EA', borderRadius: 18,
                padding: 28, height: '100%', transition: 'all 350ms cubic-bezier(.16,1,.3,1)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F7F7F8'; e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}>
                <div style={{ width: 28, height: 28, marginBottom: 24 }}>{it.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 8px', color: 'inherit' }}>
                  {it.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, color: 'inherit', opacity: 0.7 }}>
                  {it.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Services });
