/* @ds-bundle: {"format":3,"namespace":"ComAutomaODesignSystem_a2b66e","components":[],"sourceHashes":{"ui_kits/marketing_site/CaseStudy.jsx":"fd7e4988a7a3","ui_kits/marketing_site/ContactForm.jsx":"f537085712a5","ui_kits/marketing_site/Footer.jsx":"9a971aa7deb7","ui_kits/marketing_site/Header.jsx":"458b6d42de22","ui_kits/marketing_site/Hero.jsx":"882c70669f06","ui_kits/marketing_site/Primitives.jsx":"0a59567e3e09","ui_kits/marketing_site/Process.jsx":"4beaa8cbcf14","ui_kits/marketing_site/Services.jsx":"5f8833f93910"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ComAutomaODesignSystem_a2b66e = window.ComAutomaODesignSystem_a2b66e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/marketing_site/CaseStudy.jsx
try { (() => {
/* global React, Reveal, Button, Pill */

function CaseStudy({
  assetsBase = '../../assets'
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "Casos",
    style: {
      background: '#000',
      color: '#fff',
      padding: '120px 22px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${assetsBase}/logo-mark-white.png`,
    alt: "",
    style: {
      position: 'absolute',
      left: '-60px',
      bottom: '-60px',
      height: 360,
      opacity: 0.05
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 900,
      margin: '0 auto',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement(Pill, null, "Caso \xB7 Log\xEDstica"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(28px, 4.4vw, 44px)',
      fontWeight: 400,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      margin: '28px 0 40px',
      textWrap: 'balance'
    }
  }, "\u201CAutomatizamos o roteiro de entregas e a emiss\xE3o de notas. Economizamos ", /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 600
    }
  }, "18 horas por semana"), " \u2014 e ningu\xE9m esquece mais um pedido.\u201D"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 999,
      background: '#2E2E2E'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 500
    }
  }, "Rafael Andrade"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#86868B'
    }
  }, "Diretor de opera\xE7\xF5es, Transportes XYZ")))), /*#__PURE__*/React.createElement(Reveal, {
    delay: 200
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 24,
      padding: '40px 0 0',
      borderTop: '1px solid #2E2E2E'
    }
  }, [['18h', 'Economizadas/semana'], ['0', 'Pedidos esquecidos'], ['6 sem.', 'Do zero ao ar'], ['3×', 'Capacidade sem contratar']].map(([n, l]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 40,
      fontWeight: 600,
      letterSpacing: '-0.03em'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#86868B',
      marginTop: 4
    }
  }, l)))))));
}
Object.assign(window, {
  CaseStudy
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/CaseStudy.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/ContactForm.jsx
try { (() => {
/* global React, Reveal, Eyebrow, Button */
const {
  useState
} = React;
function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const upd = k => e => setForm({
    ...form,
    [k]: e.target.value
  });
  const submit = e => {
    e.preventDefault();
    setSent(true);
  };
  const inputStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    padding: '13px 16px',
    borderRadius: 12,
    border: '1px solid #D2D2D7',
    background: '#fff',
    color: '#000',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 200ms, box-shadow 200ms'
  };
  const onFocus = e => {
    e.target.style.borderColor = '#000';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.08)';
  };
  const onBlur = e => {
    e.target.style.borderColor = '#D2D2D7';
    e.target.style.boxShadow = '';
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "Contato",
    style: {
      padding: '120px 22px',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement(Eyebrow, null, "Vamos conversar"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(32px, 5vw, 52px)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.05,
      margin: '0 0 14px',
      color: '#000',
      textWrap: 'balance'
    }
  }, "Conte sobre o projeto."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: '#6E6E73',
      margin: '0 0 40px',
      lineHeight: 1.5
    }
  }, "Resposta em at\xE9 24h. A primeira conversa \xE9 gratuita.")), sent ? /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px 24px',
      background: '#000',
      color: '#fff',
      borderRadius: 18,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "44",
    height: "44",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      margin: '0 auto 14px',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: '-0.015em',
      margin: '0 0 6px'
    }
  }, "Mensagem recebida."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: '#A1A1A6',
      margin: 0
    }
  }, "A gente responde at\xE9 o fim do dia \xFAtil."))) : /*#__PURE__*/React.createElement("form", {
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      color: '#6E6E73',
      display: 'block',
      marginBottom: 6
    }
  }, "Nome"), /*#__PURE__*/React.createElement("input", {
    style: inputStyle,
    onFocus: onFocus,
    onBlur: onBlur,
    value: form.name,
    onChange: upd('name'),
    placeholder: "Seu nome",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      color: '#6E6E73',
      display: 'block',
      marginBottom: 6
    }
  }, "E-mail"), /*#__PURE__*/React.createElement("input", {
    style: inputStyle,
    onFocus: onFocus,
    onBlur: onBlur,
    type: "email",
    value: form.email,
    onChange: upd('email'),
    placeholder: "voce@empresa.com",
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      color: '#6E6E73',
      display: 'block',
      marginBottom: 6
    }
  }, "O que voc\xEA quer resolver?"), /*#__PURE__*/React.createElement("textarea", {
    style: {
      ...inputStyle,
      resize: 'vertical',
      minHeight: 110
    },
    onFocus: onFocus,
    onBlur: onBlur,
    value: form.message,
    onChange: upd('message'),
    placeholder: "Conte em poucas linhas.",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: true
  }, "Enviar"))))));
}
Object.assign(window, {
  ContactForm
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/ContactForm.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Footer.jsx
try { (() => {
/* global React */

function Footer({
  assetsBase = '../../assets'
}) {
  const cols = [{
    h: 'Empresa',
    items: ['Sobre', 'Casos', 'Contato']
  }, {
    h: 'Serviços',
    items: ['Desenvolvimento web', 'Automações', 'Aplicativos']
  }, {
    h: 'Legal',
    items: ['Privacidade', 'Termos']
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: '#000',
      color: '#fff',
      padding: '80px 22px 40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 40,
      paddingBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: `${assetsBase}/logo-horizontal-white.png`,
    alt: "Com Automa\xE7\xE3o",
    style: {
      height: 22,
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#86868B',
      fontSize: 13,
      lineHeight: 1.5,
      margin: 0,
      maxWidth: 260
    }
  }, "Empresas organizadas decolam.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: '#86868B',
      marginBottom: 14
    }
  }, c.h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'grid',
      gap: 10
    }
  }, c.items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: '#fff',
      fontSize: 14,
      textDecoration: 'none',
      transition: 'opacity 200ms'
    },
    onMouseEnter: e => e.currentTarget.style.opacity = 0.6,
    onMouseLeave: e => e.currentTarget.style.opacity = 1
  }, i))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 24,
      borderTop: '1px solid #1F1F1F',
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      color: '#6E6E73',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 ", new Date().getFullYear(), " Com Automa\xE7\xE3o. Todos os direitos reservados."), /*#__PURE__*/React.createElement("span", null, "Feito no Brasil."))));
}
Object.assign(window, {
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Header.jsx
try { (() => {
/* global React, Button */
const {
  useState,
  useEffect
} = React;
function Header({
  assetsBase = '../../assets'
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const el = document.querySelector('[data-scroll-container]') || window;
    const onScroll = () => {
      const y = el === window ? window.scrollY : el.scrollTop;
      setScrolled(y > 10);
    };
    el.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  const links = ['Serviços', 'Casos', 'Sobre', 'Contato'];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      padding: '14px 22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: scrolled ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0)',
      backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
      transition: 'background 300ms, backdrop-filter 300ms, border-color 300ms'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${assetsBase}/logo-horizontal-black.png`,
    alt: "Com Automa\xE7\xE3o",
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement("nav", {
    className: "desktop-only",
    style: {
      display: 'flex',
      gap: 28,
      fontSize: 14
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: `#${l}`,
    style: {
      color: '#000',
      textDecoration: 'none',
      transition: 'opacity 200ms'
    },
    onMouseEnter: e => e.currentTarget.style.opacity = 0.6,
    onMouseLeave: e => e.currentTarget.style.opacity = 1
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "desktop-only"
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "Vamos decolar")), /*#__PURE__*/React.createElement("button", {
    className: "mobile-only",
    onClick: () => setOpen(o => !o),
    "aria-label": "menu",
    style: {
      background: 'transparent',
      border: 0,
      padding: 8,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#000",
    strokeWidth: "1.75",
    strokeLinecap: "round"
  }, open ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12"
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 7h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 12h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 17h16"
  })))), open && /*#__PURE__*/React.createElement("div", {
    className: "mobile-only",
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      padding: '12px 22px 20px',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      animation: 'slideDown 300ms cubic-bezier(.16,1,.3,1)'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: `#${l}`,
    onClick: () => setOpen(false),
    style: {
      display: 'block',
      padding: '14px 0',
      fontSize: 20,
      color: '#000',
      fontWeight: 500,
      textDecoration: 'none',
      borderBottom: '1px solid #E5E5EA',
      letterSpacing: '-0.01em'
    }
  }, l)), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: true
  }, "Vamos decolar"))));
}
Object.assign(window, {
  Header
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Hero.jsx
try { (() => {
/* global React, Button, Reveal */
const {
  useEffect,
  useState
} = React;
function Hero({
  assetsBase = '../../assets'
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  const fadeIn = d => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 900ms cubic-bezier(.16,1,.3,1) ${d}ms, transform 900ms cubic-bezier(.16,1,.3,1) ${d}ms`
  });
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: '#000',
      color: '#fff',
      position: 'relative',
      padding: '120px 22px 100px',
      textAlign: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${assetsBase}/logo-mark-white.png`,
    alt: "",
    style: {
      position: 'absolute',
      right: '-40%',
      top: '50%',
      transform: 'translateY(-50%)',
      height: '60%',
      opacity: 0.025,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 900,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: fadeIn(0)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: '#86868B',
      marginBottom: 28
    }
  }, "Com Automa\xE7\xE3o")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'clamp(44px, 9vw, 96px)',
      lineHeight: 1.02,
      letterSpacing: '-0.03em',
      margin: 0,
      textWrap: 'balance',
      ...fadeIn(120)
    }
  }, "Empresas", /*#__PURE__*/React.createElement("br", null), "organizadas", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 200
    }
  }, "decolam.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'clamp(16px, 2.2vw, 20px)',
      color: '#A1A1A6',
      lineHeight: 1.5,
      maxWidth: 560,
      margin: '28px auto 0',
      ...fadeIn(260)
    }
  }, "Software sob medida e desenvolvimento web para times que querem escalar sem travar."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      marginTop: 40,
      flexWrap: 'wrap',
      ...fadeIn(380)
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    size: "lg",
    icon: true
  }, "Vamos decolar"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost-inverse",
    size: "lg"
  }, "Ver como funciona"))));
}
Object.assign(window, {
  Hero
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Primitives.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState,
  useEffect,
  useRef
} = React;

// ---------- primitives ----------
function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  icon,
  style: styleOverride,
  ...rest
}) {
  const base = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    border: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    transition: 'all 200ms cubic-bezier(.16,1,.3,1)'
  };
  const sizes = {
    sm: {
      fontSize: 13,
      padding: '7px 16px'
    },
    md: {
      fontSize: 15,
      padding: '11px 22px'
    },
    lg: {
      fontSize: 17,
      padding: '14px 28px'
    }
  };
  const variants = {
    primary: {
      background: '#000',
      color: '#fff'
    },
    secondary: {
      background: 'transparent',
      color: '#000',
      border: '1px solid #A1A1A6'
    },
    ghost: {
      background: 'transparent',
      color: '#000',
      padding: sizes[size].padding
    },
    'ghost-inverse': {
      background: 'transparent',
      color: '#fff',
      padding: sizes[size].padding
    },
    inverse: {
      background: '#fff',
      color: '#000'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClick,
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      ...(styleOverride || {})
    },
    onMouseDown: e => e.currentTarget.style.transform = 'scale(0.98)',
    onMouseUp: e => e.currentTarget.style.transform = '',
    onMouseLeave: e => e.currentTarget.style.transform = ''
  }, rest), children, icon && /*#__PURE__*/React.createElement(Arrow, null));
}
function Arrow() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  }));
}
function Pill({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 500,
      padding: '5px 12px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 999,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '0.12em'
    }
  }, children);
}
function Eyebrow({
  children,
  color = '#6E6E73'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.16em',
      marginBottom: 14
    }
  }, children);
}

// hook for scroll-reveal
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, {
      threshold: 0.15
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}
function Reveal({
  children,
  delay = 0
}) {
  const [ref, visible] = useReveal();
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 700ms cubic-bezier(.16,1,.3,1) ${delay}ms, transform 700ms cubic-bezier(.16,1,.3,1) ${delay}ms`
    }
  }, children);
}
Object.assign(window, {
  Button,
  Arrow,
  Pill,
  Eyebrow,
  Reveal,
  useReveal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Process.jsx
try { (() => {
/* global React, Reveal, Eyebrow */

function Process() {
  const steps = [{
    n: '01',
    t: 'Descoberta',
    b: 'Entendemos o problema antes de propor a solução. Uma conversa, nada de formulário gigante.'
  }, {
    n: '02',
    t: 'Desenho',
    b: 'Prototipamos o fluxo. Você vê e testa em dias, não em meses.'
  }, {
    n: '03',
    t: 'Construção',
    b: 'Entregas semanais. Você acompanha cada passo em um painel simples.'
  }, {
    n: '04',
    t: 'Decolagem',
    b: 'Colocamos no ar, medimos, ajustamos. O projeto nunca "termina" — evolui.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '100px 22px',
      background: '#F7F7F8'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement(Eyebrow, null, "Como funciona"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(32px, 5vw, 52px)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.05,
      margin: '0 0 56px',
      color: '#000',
      maxWidth: 720,
      textWrap: 'balance'
    }
  }, "Quatro passos, sem surpresa.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 2
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: s.n,
    delay: i * 80
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '72px 1fr',
      gap: 24,
      padding: '28px 0',
      borderTop: '1px solid #D2D2D7',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: '#6E6E73',
      fontWeight: 500
    }
  }, s.n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'clamp(22px, 3vw, 32px)',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      margin: '0 0 6px',
      color: '#000'
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: '#6E6E73',
      margin: 0,
      lineHeight: 1.5,
      maxWidth: 640
    }
  }, s.b))))))));
}
Object.assign(window, {
  Process
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Process.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing_site/Services.jsx
try { (() => {
/* global React, Reveal, Eyebrow */

function Services() {
  const items = [{
    title: 'Desenvolvimento web',
    body: 'Sites e aplicações sob medida. Performance, acessibilidade e um código que seu próximo dev vai agradecer.',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "14",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 9h18M8 18v3h8v-3"
    }))
  }, {
    title: 'Automações sob medida',
    body: 'Fluxos que tiram tarefas repetitivas da sua rotina. Integrações entre sistemas que conversam pouco.',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 6h10l3 3v9H4z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 6v3h3M8 13h6M8 16h4"
    }))
  }, {
    title: 'Aplicativos mobile',
    body: 'Produtos mobile-first para iOS e Android. Prototipação rápida, validação com usuários reais.',
    icon: /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "7",
      y: "3",
      width: "10",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M11 18h2"
    }))
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "Servi\xE7os",
    style: {
      padding: '100px 22px',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Reveal, null, /*#__PURE__*/React.createElement(Eyebrow, null, "O que a gente faz"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(32px, 5vw, 52px)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.05,
      margin: '0 0 56px',
      color: '#000',
      maxWidth: 720,
      textWrap: 'balance'
    }
  }, "Tr\xEAs frentes. Um objetivo: tirar o que trava do caminho.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 18,
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: it.title,
    delay: i * 100
  }, /*#__PURE__*/React.createElement("div", {
    className: "service-card",
    style: {
      background: '#F7F7F8',
      border: '1px solid #E5E5EA',
      borderRadius: 18,
      padding: 28,
      height: '100%',
      transition: 'all 350ms cubic-bezier(.16,1,.3,1)',
      cursor: 'pointer'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = '#000';
      e.currentTarget.style.color = '#fff';
      e.currentTarget.style.transform = 'translateY(-4px)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = '#F7F7F8';
      e.currentTarget.style.color = '';
      e.currentTarget.style.transform = '';
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      marginBottom: 24
    }
  }, it.icon), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: '-0.015em',
      margin: '0 0 8px',
      color: 'inherit'
    }
  }, it.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: 1.5,
      margin: 0,
      color: 'inherit',
      opacity: 0.7
    }
  }, it.body)))))));
}
Object.assign(window, {
  Services
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing_site/Services.jsx", error: String((e && e.message) || e) }); }

})();
