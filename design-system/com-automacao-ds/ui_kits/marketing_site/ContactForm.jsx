/* global React, Reveal, Eyebrow, Button */
const { useState } = React;

function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const inputStyle = {
    fontFamily: 'var(--font-sans)', fontSize: 16, padding: '13px 16px',
    borderRadius: 12, border: '1px solid #D2D2D7', background: '#fff',
    color: '#000', outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'border-color 200ms, box-shadow 200ms',
  };
  const onFocus = e => { e.target.style.borderColor = '#000'; e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.08)'; };
  const onBlur = e => { e.target.style.borderColor = '#D2D2D7'; e.target.style.boxShadow = ''; };

  return (
    <section id="Contato" style={{ padding: '120px 22px', background: '#fff' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Reveal>
          <Eyebrow>Vamos conversar</Eyebrow>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.05,
            margin: '0 0 14px', color: '#000', textWrap: 'balance',
          }}>
            Conte sobre o projeto.
          </h2>
          <p style={{ fontSize: 17, color: '#6E6E73', margin: '0 0 40px', lineHeight: 1.5 }}>
            Resposta em até 24h. A primeira conversa é gratuita.
          </p>
        </Reveal>

        {sent ? (
          <Reveal>
            <div style={{
              padding: '40px 24px', background: '#000', color: '#fff', borderRadius: 18,
              textAlign: 'center',
            }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 14px', display: 'block' }}>
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 6px' }}>Mensagem recebida.</h3>
              <p style={{ fontSize: 15, color: '#A1A1A6', margin: 0 }}>A gente responde até o fim do dia útil.</p>
            </div>
          </Reveal>
        ) : (
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: '#6E6E73', display: 'block', marginBottom: 6 }}>Nome</label>
                <input style={inputStyle} onFocus={onFocus} onBlur={onBlur} value={form.name} onChange={upd('name')} placeholder="Seu nome" required />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#6E6E73', display: 'block', marginBottom: 6 }}>E-mail</label>
                <input style={inputStyle} onFocus={onFocus} onBlur={onBlur} type="email" value={form.email} onChange={upd('email')} placeholder="voce@empresa.com" required />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#6E6E73', display: 'block', marginBottom: 6 }}>O que você quer resolver?</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }} onFocus={onFocus} onBlur={onBlur}
                  value={form.message} onChange={upd('message')} placeholder="Conte em poucas linhas." required />
              </div>
              <div style={{ marginTop: 8 }}>
                <Button size="lg" icon>Enviar</Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { ContactForm });
