/* global React */

function Footer({ assetsBase = '../../assets' }) {
  const cols = [
    { h: 'Empresa', items: ['Sobre', 'Casos', 'Contato'] },
    { h: 'Serviços', items: ['Desenvolvimento web', 'Automações', 'Aplicativos'] },
    { h: 'Legal', items: ['Privacidade', 'Termos'] },
  ];
  return (
    <footer style={{ background: '#000', color: '#fff', padding: '80px 22px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, paddingBottom: 48 }}>
          <div>
            <img src={`${assetsBase}/logo-horizontal-white.png`} alt="Com Automação" style={{ height: 22, marginBottom: 16 }} />
            <p style={{ color: '#86868B', fontSize: 13, lineHeight: 1.5, margin: 0, maxWidth: 260 }}>
              Empresas organizadas decolam.
            </p>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#86868B', marginBottom: 14 }}>
                {c.h}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {c.items.map(i => (
                  <li key={i}><a href="#" style={{ color: '#fff', fontSize: 14, textDecoration: 'none', transition: 'opacity 200ms' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 0.6}
                    onMouseLeave={e => e.currentTarget.style.opacity = 1}>{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 24, borderTop: '1px solid #1F1F1F', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, color: '#6E6E73', fontSize: 12 }}>
          <span>© {new Date().getFullYear()} Com Automação. Todos os direitos reservados.</span>
          <span>Feito no Brasil.</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
