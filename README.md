# Com Automação — Site institucional

Site institucional multipágina da **Com Automação**, empresa que **representa e
revende os melhores sistemas de gestão** (com implantação, treinamento e suporte
local) e oferece desenvolvimento web próprio sob a marca **Pedra & Pixel**.

> ⚠️ A Com Automação **não desenvolve os sistemas de gestão** — ela os representa/
> revende. A única oferta desenvolvida internamente é o desenvolvimento web, sob a
> marca **Pedra & Pixel** (sites e landing pages). Manter esse posicionamento no copy.

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
| Efeitos de hero | framer-motion — background paths (produtos) · grid animado CSS (Pedra & Pixel) |
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
npm run deploy       # build + zip pronto para o cPanel (ver Deploy)
npm run lint         # ESLint (flat config em eslint.config.mjs)
```

> `next lint` foi removido no Next 16 — o lint roda direto pelo binário do
> ESLint, com `eslint-config-next` em flat config.

---

## Estrutura

```
app/
  layout.tsx              # shell: <html>, fontes, metadata, Nav/Footer/FAB, ScrollReveal
  page.tsx                # home (todas as dobras da landing)
  globals.css             # design system + estilos de todas as sections
  produtos/[slug]/page.tsx# página dinâmica de cada produto (SSG)
  produtos/[slug]/template.tsx # remonta a cada navegação -> fade-in ao abrir o produto
  icon.png, apple-icon.png# favicon (foguete da marca)

components/
  Nav.tsx, NavScroll.tsx, MobileNav.tsx   # header (sólido fora do hero) + menu mobile
  Footer.tsx, WhatsAppFab.tsx             # rodapé + botão flutuante de WhatsApp
  ScrollReveal.tsx                        # revela elementos .reveal ao entrar na viewport
  HeroVideo.tsx, HeroMarkAlign.tsx        # vídeo do hero + alinhamento do foguete na home
  ProductStripe.tsx, ProductStripes.tsx   # vitrine de produtos (faixas acordeão)
  Icons.tsx                               # ícones (incl. ícones de feature)
  HeroPaths.tsx, AcquirersCarousel.tsx    # fundo background-paths do hero (produtos) + carrossel de maquininhas (PDV+)
  ProductGallery.tsx                      # galeria "por dentro" com lightbox
  ScrollVideo.tsx                         # vídeo em frames sincronizado ao scroll (canvas) — Pedra & Pixel
  CtaMascot.tsx                           # wrapper do mascote na CTA; carrega o componente 3D por next/dynamic (ssr:false), mantendo three+R3F+drei (~250KB gzip) FORA do bundle inicial da página
  ui/interactive-mascot.tsx               # mascote astronauta 3D (GLB riggado + R3F) — ver "Mascote 3D" abaixo
  ui/                                     # efeitos: flow-button, scramble, background-paths, data-grid-hero, glowing-effect, accordion (Radix), etc.

lib/
  products.ts             # FONTE DA VERDADE dos produtos + FAQ (todo o conteúdo)
  site.ts                 # contato (WhatsApp, e-mail) + banner "Equipe 360"
  utils.ts                # helpers (cn / clsx+tailwind-merge)

app/robots.ts             # gera out/robots.txt no build
app/sitemap.ts            # gera out/sitemap.xml (home + 6 produtos)

public/
  logos/                  # logos da Com Automação (marca + horizontal, b/w)
  products/<slug>/        # assets por produto: wordmark/mark (logo), mockup, prints da galeria
                          #   (gourmetsa, pdv-mais, finances-web, faloapp, crm-com, desenvolvimento-web)
  equipe360/              # logo do projeto Equipe 360 (banner)
  .htaccess               # config Apache do export (404, gzip, cache)

next.config.mjs           # output:'export' + trailingSlash + images.unoptimized
```

---

## Editando o conteúdo

### Produtos
Tudo vem de [`lib/products.ts`](lib/products.ts). Cada produto tem cor-assinatura
(`accent`), `lead`, `solution`, `features`, `audience`, `faq` **próprio por produto**
(com `PRODUCT_FAQ` só como fallback) e, opcionalmente, `wordmark`/`mark` (logo),
`mockup`, `gallery` (com flag `light` p/ mockups de fundo branco) e `acquirers`
(carrossel de maquininhas do PDV+). Adicionar/editar produto = editar esse arquivo;
as rotas `/produtos/[slug]` são geradas automaticamente (`generateStaticParams`).

Produtos atuais: GourmetSA, Finances Web, PDV Plus, FaloApp, CRM Com e
**Pedra & Pixel** (desenvolvimento web — slug `pedra-e-pixel`; as pastas de
assets em `public/products/` seguem com os nomes antigos `pdv-mais` e
`desenvolvimento-web`).

### Vídeo sincronizado ao scroll (Pedra & Pixel)
O hero da página do Pedra & Pixel usa o componente
[`ScrollVideo`](components/ScrollVideo.tsx): um `<canvas>` de fundo que faz *scrub*
de uma sequência de frames conforme o scroll, com o hero "fixo" (sticky) enquanto o
vídeo roda — o progresso é medido na região com `data-scrollvid-region`. Técnica que
roda em export estático, sem depender de seek de `<video>`. O quadro exibido é
suavizado por interpolação (lerp) e os frames são pré-decodificados, pra um scrub
bem fluido. **Responsivo**: telas grandes (largura ≥ 1024px) carregam a versão QHD;
mobile/tablet ficam na leve — o `ScrollVideo` baixa um único conjunto no
carregamento (props `dir` = mobile e `dirLarge` = grande). O vídeo sempre preenche a
tela (cover) — cada tier tem um vídeo no aspecto certo: **desktop 16:9**
(`pedra-pixel-video.mp4`) e **mobile 9:16 vertical** (`pedra-pixel-video-mobile.mp4`),
com a logo centralizada. Os frames são gerados **com ffmpeg** a partir dos
vídeos-fonte em `media/` (fora de `public/`, para não ir ao deploy):

```bash
# desktop 16:9 (telas grandes) → scroll-lg/
node scripts/extract-scroll-frames.mjs media/pedra-pixel-video.mp4 90 2560 scroll-lg
# mobile 9:16 vertical → scroll-sm/
node scripts/extract-scroll-frames.mjs media/pedra-pixel-video-mobile.mp4 90 1080 scroll-sm
```

(`90` = nº de frames; o 4º arg é a pasta de saída). Ao final, o script imprime o
total de frames — ajuste `frameCount` da `<ScrollVideo />` se mudar esse número.
Requer `ffmpeg`/`ffprobe` no PATH.

### Mascote 3D (astronauta na CTA do produto)

O componente [`ui/interactive-mascot.tsx`](components/ui/interactive-mascot.tsx)
renderiza um astronauta riggado com React Three Fiber. Duas interações:

**No desktop (com ponteiro):**

- **cabeça segue o cursor** — lido na janela inteira, não só sobre o canvas, para
  o mascote acompanhar quem lê o texto ao lado;
- **braços para cima** — enquanto o mouse está no botão "Vamos decolar"
  (`[data-mascot-cheer]`). Clicar no mascote também alterna.

**No toque (celular/tablet):**

- **cabeça segue o giroscópio** — no iOS 13+ a permissão é pedida no primeiro toque;
- **a comemoração não existe.** Sem hover não há gatilho, e simular com tap
  roubaria o toque de quem só quer rolar a página. O mascote fica sempre relaxado.

A distinção é feita por `(hover: none), (pointer: coarse)` — capacidade de
interação, não largura de tela. São perguntas diferentes: a largura decide só
**qual GLB baixar**. Se fossem a mesma query, uma janela de desktop estreita
perderia o rastreamento da cabeça sem ganhar giroscópio em troca.

**Como as poses funcionam.** O rig do Meshy vem em T-pose e com rotações de bind
irregulares, então as poses **não** são clipes de animação: são ângulos escritos
em *eixos de mundo* (`z` = levantar/baixar o braço, `x` = frente/trás) e
convertidos para o espaço do pai em runtime. Por isso os números em
`POSE_RELAXED` / `POSE_CELEBRATE` são legíveis — `z: -74` é literalmente "braço
74° abaixo da horizontal". Para reajustar a pose, mexa só nesses dois objetos.

Motion: a transição entre poses é uma **mola** (subida levemente subamortecida,
~8% de overshoot; descida criticamente amortecida e mais curta), a cabeça usa
amortecimento exponencial com dead zone, e há uma respiração sutil no repouso.
Tudo respeita `prefers-reduced-motion`. O `frameloop` é `"demand"`: nada é
renderizado com o mascote fora da viewport ou com a aba em segundo plano.

**Gerando os GLBs.** O arquivo cru do Meshy tem ~17MB (288.776 triângulos +
textura PNG de 5,69MB) e **não vai para o repo** (ver `.gitignore`). Guarde-o fora
do projeto e gere as versões web com:

```bash
node scripts/build-mascot.mjs caminho/para/o-modelo-cru.glb
```

Isso escreve `public/models/com-automation-astronaut.glb` (~527KB, 58.624 tri,
textura 1024) e `-mobile.glb` (~187KB, 14.438 tri, textura 512) — só um baixa por
device. A compressão é **meshopt** (não Draco): o decoder é empacotado junto do
three, sem depender de CDN de terceiros.

### Contato (WhatsApp / e-mail)
Em [`lib/site.ts`](lib/site.ts). O número de WhatsApp pode vir da variável
`NEXT_PUBLIC_WHATSAPP_NUMBER` (ver `.env.example`) ou do fallback no arquivo.
Formato internacional, só dígitos: `55 + DDD + número`. Há duas mensagens
pré-definidas: `WHATSAPP_MESSAGE` (venda, usada nos botões "Fale conosco") e
`WHATSAPP_MESSAGE_SUPORTE` (botão "Falar com o suporte").

### Favicon
`app/icon.png` (aba do navegador) e `app/apple-icon.png` (iOS) — gerados a partir
do logo-mark da marca. O Next injeta as tags `<link>` automaticamente.

---

## Deploy (HostGator — export estático)

O site é 100% estático, então roda em hospedagem compartilhada sem Node.

```bash
npm run deploy       # build + empacota out/ em comautomacao-site-export.zip
```

Depois, no **cPanel → Gerenciador de Arquivos → `public_html`**: limpe o conteúdo
antigo, faça **Upload** do zip e **Extract** ali mesmo. Apague o zip depois.

O empacotamento é o [`scripts/pack-deploy.mjs`](scripts/pack-deploy.mjs). Ele põe
os arquivos na **raiz** do zip (é o que o Extract do cPanel espera), garante que
o `.htaccess` entrou e confere que nenhum caminho saiu com barra invertida.

> ⚠️ Não troque por `Compress-Archive` do PowerShell: ele grava os caminhos
> internos com `\`, e o extrator do cPanel (Linux/PHP) criaria arquivos chamados
> `models\arquivo.glb` em vez de pastas — o site sobe quebrado. O script usa o
> `tar.exe` do Windows (bsdtar), chamado pelo caminho absoluto porque num shell
> tipo Git Bash o `tar` do PATH é o GNU tar, que não escreve zip.

`out/` e o `.zip` de deploy são ignorados pelo Git (são artefatos de build).

---

## SEO / compartilhamento

- **Open Graph + Twitter Card** configurados em [`app/layout.tsx`](app/layout.tsx)
  (site) e por produto em [`app/produtos/[slug]/page.tsx`](app/produtos/[slug]/page.tsx).
- Imagem de preview: `app/opengraph-image.png` e `app/twitter-image.png` (1200×630).
  ⚠️ Declarar `openGraph` em `generateMetadata` **anula** a convenção de arquivo
  do `opengraph-image.png` — por isso as páginas de produto passam `images`
  explicitamente. Sem isso o link compartilhado sai sem preview.
- **robots.txt** e **sitemap.xml** saem de `app/robots.ts` e `app/sitemap.ts`.
  Produto novo em `lib/products.ts` entra no sitemap automaticamente.
- **FAQPage (JSON-LD)** por produto, gerado do próprio `faq` de `products.ts`;
  dados da empresa (LocalBusiness) em [`components/JsonLd.tsx`](components/JsonLd.tsx).
- A base das URLs vem de `NEXT_PUBLIC_SITE_URL` (default `https://comautomacao.com`) —
  lida no build. Se mudar o domínio, ajuste e rebuilde.

## Pendências (corrigir depois)

- [ ] `favicon.ico` legado (hoje usamos `icon.png`, suficiente p/ navegadores modernos)
- [ ] Hero da home usa vídeo remoto (Pexels) + poster do Unsplash — avaliar self-host
- [ ] `media/*.mp4` (35MB de vídeos-fonte) está versionado e responde por boa parte
      dos ~200MB do `.git`. Tirar do índice não encolhe o histórico e arriscaria
      perder a única cópia num clone limpo — se for mexer, migrar para Git LFS.
- [ ] `npm audit`: postcss e sharp (dependências transitivas do Next, só de build)
      com avisos altos — resolve num bump do Next.

---

## Convenção

Ao alterar o projeto (conteúdo, estrutura, deploy), **atualize este README junto**
para manter a documentação fiel ao estado atual.
