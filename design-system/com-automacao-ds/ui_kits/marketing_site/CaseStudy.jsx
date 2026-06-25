/* global React, Reveal, Button, Pill */

function CaseStudy({ assetsBase = '../../assets' }) {
  return (
    <section id="Casos" style={{ background: '#000', color: '#fff', padding: '120px 22px', position: 'relative', overflow: 'hidden' }}>
      <img src={`${assetsBase}/logo-mark-white.png`} alt=""
        style={{ position: 'absolute', left: '-60px', bottom: '-60px', height: 360, opacity: 0.05 }} />
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
        <Reveal>
          <Pill>Caso · Logística</Pill>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4.4vw, 44px)',
            fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.2,
            margin: '28px 0 40px', textWrap: 'balance',
          }}>
            “Automatizamos o roteiro de entregas e a emissão de notas. Economizamos <strong style={{ fontWeight: 600 }}>18 horas por semana</strong> — e ninguém esquece mais um pedido.”
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 40 }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: '#2E2E2E' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Rafael Andrade</div>
              <div style={{ fontSize: 13, color: '#86868B' }}>Diretor de operações, Transportes XYZ</div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, padding: '40px 0 0', borderTop: '1px solid #2E2E2E' }}>
            {[
              ['18h', 'Economizadas/semana'],
              ['0', 'Pedidos esquecidos'],
              ['6 sem.', 'Do zero ao ar'],
              ['3×', 'Capacidade sem contratar'],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 600, letterSpacing: '-0.03em' }}>{n}</div>
                <div style={{ fontSize: 13, color: '#86868B', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

Object.assign(window, { CaseStudy });
