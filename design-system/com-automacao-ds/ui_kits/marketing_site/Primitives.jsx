/* global React */
const { useState, useEffect, useRef } = React;

// ---------- primitives ----------
function Button({ variant = 'primary', size = 'md', children, onClick, icon, style: styleOverride, ...rest }) {
  const base = {
    fontFamily: 'var(--font-sans)', fontWeight: 500, border: 0, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999,
    transition: 'all 200ms cubic-bezier(.16,1,.3,1)',
  };
  const sizes = {
    sm: { fontSize: 13, padding: '7px 16px' },
    md: { fontSize: 15, padding: '11px 22px' },
    lg: { fontSize: 17, padding: '14px 28px' },
  };
  const variants = {
    primary:        { background: '#000', color: '#fff' },
    secondary:      { background: 'transparent', color: '#000', border: '1px solid #A1A1A6' },
    ghost:          { background: 'transparent', color: '#000', padding: sizes[size].padding },
    'ghost-inverse':{ background: 'transparent', color: '#fff', padding: sizes[size].padding },
    inverse:        { background: '#fff', color: '#000' },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...(styleOverride || {}) }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onMouseUp={e => e.currentTarget.style.transform = ''}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
      {...rest}
    >
      {children}
      {icon && <Arrow />}
    </button>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  );
}

function Pill({ children }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 500, padding: '5px 12px',
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 999, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em',
    }}>
      {children}
    </span>
  );
}

function Eyebrow({ children, color = '#6E6E73' }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 500, color, textTransform: 'uppercase',
      letterSpacing: '0.16em', marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

// hook for scroll-reveal
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 700ms cubic-bezier(.16,1,.3,1) ${delay}ms, transform 700ms cubic-bezier(.16,1,.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

Object.assign(window, { Button, Arrow, Pill, Eyebrow, Reveal, useReveal });
