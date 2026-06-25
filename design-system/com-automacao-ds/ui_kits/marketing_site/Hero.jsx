/* global React, Button, Reveal */
const { useEffect, useState } = React;

function Hero({ assetsBase = '../../assets' }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const fadeIn = (d) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 900ms cubic-bezier(.16,1,.3,1) ${d}ms, transform 900ms cubic-bezier(.16,1,.3,1) ${d}ms`,
  });

  return (
    <section style={{
      background: '#000', color: '#fff', position: 'relative',
      padding: '120px 22px 100px', textAlign: 'center', overflow: 'hidden',
    }}>
      {/* Faint mark behind text */}
      <img src={`${assetsBase}/logo-mark-white.png`} alt=""
        style={{
          position: 'absolute', right: '-40%', top: '50%', transform: 'translateY(-50%)',
          height: '60%', opacity: 0.025, pointerEvents: 'none',
        }} />
      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
        <div style={fadeIn(0)}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: '#86868B', marginBottom: 28 }}>
            Com Automação
          </div>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 'clamp(44px, 9vw, 96px)', lineHeight: 1.02, letterSpacing: '-0.03em',
          margin: 0, textWrap: 'balance',
          ...fadeIn(120),
        }}>
          Empresas<br/>organizadas<br/>
          <span style={{ fontWeight: 200 }}>decolam.</span>
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 2.2vw, 20px)', color: '#A1A1A6', lineHeight: 1.5,
          maxWidth: 560, margin: '28px auto 0', ...fadeIn(260),
        }}>
          Software sob medida e desenvolvimento web para times que querem escalar sem travar.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap', ...fadeIn(380) }}>
          <Button variant="inverse" size="lg" icon>Vamos decolar</Button>
          <Button variant="ghost-inverse" size="lg">Ver como funciona</Button>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
