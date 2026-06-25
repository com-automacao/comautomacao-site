/* global React, Reveal, Eyebrow */

function Process() {
  const steps = [
    { n: '01', t: 'Descoberta', b: 'Entendemos o problema antes de propor a solução. Uma conversa, nada de formulário gigante.' },
    { n: '02', t: 'Desenho', b: 'Prototipamos o fluxo. Você vê e testa em dias, não em meses.' },
    { n: '03', t: 'Construção', b: 'Entregas semanais. Você acompanha cada passo em um painel simples.' },
    { n: '04', t: 'Decolagem', b: 'Colocamos no ar, medimos, ajustamos. O projeto nunca "termina" — evolui.' },
  ];

  return (
    <section style={{ padding: '100px 22px', background: '#F7F7F8' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <Eyebrow>Como funciona</Eyebrow>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.05,
            margin: '0 0 56px', color: '#000', maxWidth: 720, textWrap: 'balance',
          }}>
            Quatro passos, sem surpresa.
          </h2>
        </Reveal>
        <div style={{ display: 'grid', gap: 2 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div style={{
                display: 'grid', gridTemplateColumns: '72px 1fr', gap: 24,
                padding: '28px 0', borderTop: '1px solid #D2D2D7',
                alignItems: 'baseline',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13, color: '#6E6E73', fontWeight: 500,
                }}>
                  {s.n}
                </div>
                <div>
                  <h3 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#000' }}>
                    {s.t}
                  </h3>
                  <p style={{ fontSize: 16, color: '#6E6E73', margin: 0, lineHeight: 1.5, maxWidth: 640 }}>
                    {s.b}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Process });
