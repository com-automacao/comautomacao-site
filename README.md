# Com Automação — Site institucional

Site institucional multipágina da **Com Automação**, empresa que **representa e
revende os melhores sistemas de gestão** (com implantação, treinamento e suporte
local) e oferece **Desenvolvimento Web** como serviço próprio.

> ⚠️ A Com Automação **não desenvolve os sistemas de gestão** — ela os representa/
> revende. A única oferta desenvolvida internamente é o **Desenvolvimento Web**
> (sites e landing pages). Manter esse posicionamento em todo o copy.

Repositório: <https://github.com/com-automacao/comautomacao-site> · branch `main`

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Linguagem | TypeScript + React 19 |
| Estilo | Tailwind v4 (CSS-first, `@theme`) + `app/globals.css` |
| Fontes | `next/font` — Inter + Space Grotesk |
| Animações | IntersectionObserver (reveals), framer-motion, CSS |
| Hospedagem | **Export estático** na HostGator (cPanel/Apache) |

---

## Como rodar (desenvolvimento)

```bash
npm install
npm run dev          # http://localhost:3000
```

Demais scripts:

```bash
npm run build        # gera o export estático em out/ (ver Deploy)
npm run lint         # ESLint
```

---

## Estrutura

```
app/
  layout.tsx              # shell: <html>, fontes, metadata, Nav/Footer/FAB, ScrollReveal
  page.tsx                # home (todas as dobras da landing)
  globals.css             # design system + estilos de todas as sections
  produtos/[slug]/page.tsx# página dinâmica de cada produto (SSG)
  icon.png, apple-icon.png# favicon (foguete da marca)

components/
  Nav.tsx, NavScroll.tsx, MobileNav.tsx   # header (sólido fora do hero) + menu mobile
  Footer.tsx, WhatsAppFab.tsx             # rodapé + botão flutuante de WhatsApp
  ScrollReveal.tsx                        # revela elementos .reveal ao entrar na viewport
  HeroVideo.tsx, HeroMarkAlign.tsx        # vídeo do hero + alinhamento do foguete na home
  ProductStripe.tsx, ProductStripes.tsx   # vitrine de produtos (faixas acordeão)
  Icons.tsx                               # ícones (incl. ícones de feature)
  ui/                                     # componentes de efeito (flow-button, scramble, etc.)

lib/
  products.ts             # FONTE DA VERDADE dos produtos + FAQ (todo o conteúdo)
  site.ts                 # contato (WhatsApp, e-mail) + banner "Equipe 360"
  utils.ts                # helpers (cn / clsx+tailwind-merge)

public/
  logos/                  # logos da Com Automação (marca + horizontal, b/w)
  products/gourmetsa/     # assets do GourmetSA (mockup, wordmark, prints da galeria, logo G)
  equipe360/              # logo do projeto Equipe 360 (banner)
  .htaccess               # config Apache do export (404, gzip, cache)

next.config.mjs           # output:'export' + trailingSlash + images.unoptimized
```

---

## Editando o conteúdo

### Produtos
Tudo vem de [`lib/products.ts`](lib/products.ts). Cada produto tem cor-assinatura
(`accent`), `lead`, `solution`, `features`, `audience`, FAQ compartilhada
(`PRODUCT_FAQ`) e, opcionalmente, `wordmark`, `mockup` e `gallery` (prints reais —
só o GourmetSA tem hoje). Adicionar/editar produto = editar esse arquivo; as rotas
`/produtos/[slug]` são geradas automaticamente (`generateStaticParams`).

Produtos atuais: GourmetSA, Finances Web, PDV Plus, FaloApp, CRM Com,
Desenvolvimento Web.

### Contato (WhatsApp / e-mail)
Em [`lib/site.ts`](lib/site.ts). O número de WhatsApp pode vir da variável
`NEXT_PUBLIC_WHATSAPP_NUMBER` (ver `.env.example`) ou do fallback no arquivo.
Formato internacional, só dígitos: `55 + DDD + número`.

### Favicon
`app/icon.png` (aba do navegador) e `app/apple-icon.png` (iOS) — gerados a partir
do logo-mark da marca. O Next injeta as tags `<link>` automaticamente.

---

## Deploy (HostGator — export estático)

O site é 100% estático, então roda em hospedagem compartilhada sem Node.

1. **Build:** `npm run build` → gera a pasta `out/` (HTML/CSS/JS puro).
2. **Zipar** o conteúdo de `out/` (arquivos na raiz do zip, incluindo `.htaccess`).
3. No **cPanel → Gerenciador de Arquivos → `public_html`**: limpe o conteúdo
   antigo, faça **Upload** do zip e **Extract** ali mesmo. Apague o zip depois.
4. Para atualizar, repita os passos (build → zip → upload/extract).

`out/` e o `.zip` de deploy são ignorados pelo Git (são artefatos de build).

---

## Pendências (corrigir depois)

- [ ] `metadataBase` + Open Graph/Twitter (preview ao compartilhar link)
- [ ] `favicon.ico` legado (hoje usamos `icon.png`, suficiente p/ navegadores modernos)
- [ ] Hero da home usa vídeo remoto (Pexels) — avaliar self-host

---

## Convenção

Ao alterar o projeto (conteúdo, estrutura, deploy), **atualize este README junto**
para manter a documentação fiel ao estado atual.
