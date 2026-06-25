/* global React, Button */
const { useState, useEffect } = React;

function Header({ assetsBase = '../../assets' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const el = document.querySelector('[data-scroll-container]') || window;
    const onScroll = () => {
      const y = el === window ? window.scrollY : el.scrollTop;
      setScrolled(y > 10);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Serviços', 'Casos', 'Sobre', 'Contato'];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      padding: '14px 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0)',
      backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
      transition: 'background 300ms, backdrop-filter 300ms, border-color 300ms',
    }}>
      <img src={`${assetsBase}/logo-horizontal-black.png`} alt="Com Automação" style={{ height: 20 }} />

      <nav className="desktop-only" style={{ display: 'flex', gap: 28, fontSize: 14 }}>
        {links.map(l => (
          <a key={l} href={`#${l}`} style={{ color: '#000', textDecoration: 'none', transition: 'opacity 200ms' }}
             onMouseEnter={e => e.currentTarget.style.opacity = 0.6}
             onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            {l}
          </a>
        ))}
      </nav>

      <div className="desktop-only">
        <Button size="sm">Vamos decolar</Button>
      </div>

      <button className="mobile-only" onClick={() => setOpen(o => !o)} aria-label="menu"
        style={{ background: 'transparent', border: 0, padding: 8, cursor: 'pointer' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.75" strokeLinecap="round">
          {open ? <><path d="M18 6 6 18"/><path d="M6 6l12 12"/></> : <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>}
        </svg>
      </button>

      {open && (
        <div className="mobile-only" style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          padding: '12px 22px 20px', borderBottom: '1px solid rgba(0,0,0,0.08)',
          animation: 'slideDown 300ms cubic-bezier(.16,1,.3,1)',
        }}>
          {links.map(l => (
            <a key={l} href={`#${l}`} onClick={() => setOpen(false)} style={{
              display: 'block', padding: '14px 0', fontSize: 20, color: '#000',
              fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid #E5E5EA',
              letterSpacing: '-0.01em',
            }}>
              {l}
            </a>
          ))}
          <div style={{ paddingTop: 18 }}>
            <Button size="lg" icon>Vamos decolar</Button>
          </div>
        </div>
      )}
    </header>
  );
}

Object.assign(window, { Header });
