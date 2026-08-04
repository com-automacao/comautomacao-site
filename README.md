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
  (`[data-mascot-cheer]`). Clicar no mascote também alterna. Durante a
  comemoração o **palco acende** (as luzes de contorno sobem, a exposição
  acompanha, o halo em CSS clareia via `:has([data-cheering])`) e a **cabeça
  para de seguir o cursor** para encarar a frente — o rastreamento some na mesma
  curva em que os braços sobem, então ela centraliza junto com o gesto em vez de
  dar um solavanco;
- **arrastar gira o corpo** no próprio eixo, sem limite (dá voltas completas);
  2s depois de soltar ele volta sozinho para a frente. O alvo do retorno é a
  volta inteira mais próxima, não zero: quem deu três voltas não vê as três
  desenrolarem, só a atual se completar. De costas, a cabeça para de procurar o
  cursor (o ganho cai com o cosseno do giro) e volta a segui-lo sozinha.
  Os listeners do arrasto ficam na **janela**, não no canvas: quem arrasta sai
  da caixa do mascote no meio do gesto e o giro travaria ali. Um arrasto não
  conta como clique (limiar de 4px), senão girar também comemorava.

**No toque (celular/tablet):**

- **arrastar gira o corpo**, igual ao desktop, com o mesmo retorno automático;
- **tocar no mascote comemora** — sem hover não há como usar o botão como
  gatilho, então o toque no próprio personagem dispara a pose; um segundo toque
  relaxa;
- **a cabeça não segue nada.** Não há ponteiro para acompanhar.

> O **giroscópio foi removido** (existia até 2026-07-31). A leitura de
> `deviceorientation` não se mostrou confiável nos aparelhos reais, mesmo com
> calibração relativa. Não reintroduza sem testar em hardware.

O que faz arrastar-para-girar conviver com a rolagem é **`touch-action: pan-y`
no `<canvas>`**: o navegador continua dono do gesto vertical (a página rola) e
entrega o horizontal para o mascote. Precisa estar no `<canvas>` e não no
wrapper — o `touch-action` que vale é o do elemento onde o toque começa, e o
`style` do `<Canvas>` do R3F vai para o wrapper, não para o canvas.

A distinção desktop/toque é feita por `(hover: none), (pointer: coarse)` —
capacidade de interação, não largura de tela. São perguntas diferentes: a
largura decide só **qual GLB baixar**.

**Como as poses funcionam.** O rig do Meshy vem em T-pose e com rotações de bind
irregulares, então as poses **não** são clipes de animação: são ângulos escritos
em *eixos de mundo* (`z` = levantar/baixar o braço, `x` = frente/trás) e
convertidos para o espaço do pai em runtime. Por isso os números em
`POSE_RELAXED` / `POSE_CELEBRATE` são legíveis — `z: -74` é literalmente "braço
74° abaixo da horizontal". Para reajustar a pose, mexa só nesses dois objetos.

O campo `t` é a exceção: é a **torção em torno do próprio osso**, aplicada no
espaço local. Ela existe porque a T-pose tem as palmas viradas para BAIXO — sem
torcer, o braço sobe com a palma para fora. E ela fica no **antebraço**, não no
úmero: é onde a pronação acontece de verdade e é o único ponto onde ela gira só
a mão. Torcer o úmero levaria junto o plano de dobra do cotovelo, e os braços
fechariam para dentro.

> **As rotações ACUMULAM pela cadeia — é aqui que é fácil errar.** O antebraço é
> filho do úmero, que é filho do ombro, então ele já herda as rotações dos dois.
> O ângulo real de cada segmento é a **soma**:
>
> ```
> úmero     = ombro + braço              = 10 + 38 = 48° acima da horizontal
> antebraço = ombro + braço + antebraço
> ```
>
> Logo, **braço reto não é repetir o ângulo do úmero no antebraço** (isso dobra
> o cotovelo pelo dobro do ângulo) — é deixar a rotação própria do antebraço em
> **zero**. Para mudar a altura do gesto, mexa só em `CELEBRATE_ARM_Z`.
> `t` é a exceção que pode ficar no antebraço: é torção no eixo do próprio osso,
> gira só a mão e não tira o braço da linha.

**Cabeça.** O giro vai até 40° de yaw, repartido entre `neck` (35%) e `Head`
(65%), e o tronco (`Spine01`) acompanha com uma fração disso. O tronco importa:
só a cabeça virando quase não se lê à distância que o mascote ocupa na página.

O vertical é **assimétrico** — 34° para cima e 18° para baixo. Olhar para cima é
o gesto expressivo (abre o peito, o queixo sobe, a silhueta muda); para baixo o
queixo esbarra no peito e passar de ~20° só piora. Com um valor único para os
dois lados a subida ficava discreta demais.

E os alcances do ponteiro são **separados por eixo**: o vertical sai da ALTURA
da janela, não da largura. Saindo da largura ele ficava grande demais — acima da
cabeça do mascote sobram ~300px de página, então o cursor nunca chegava perto do
limite e o olhar para cima parecia tímido mesmo com o ângulo alto.

> Atenção ao sinal do pitch: girar **positivo** em torno do X de mundo inclina o
> rosto para **baixo** (regra da mão direita). O código guarda a intenção
> ("cursor acima = olhar para cima") e inverte na hora de virar rotação. Trocar
> isso faz o mascote olhar para o lado oposto do cursor.

**Material — leia antes de mexer na luz.** O que o Meshy exporta precisa de três
correções. Elas são aplicadas **no asset**, pelo `scripts/build-mascot.mjs`; o
componente só as repete como rede de segurança para um GLB não processado. Sem
elas nenhum ajuste de iluminação funciona:

1. `emissiveFactor: [1,1,1]` com a própria textura como mapa emissivo — o modelo
   **se auto-ilumina em cheio**, o que anula sombra, volume e contorno.
2. `metallicFactor` e `roughnessFactor` **ausentes**. No glTF isso não é zero: o
   default é **1.0 nos dois**, ou seja, o traje inteiro era metal totalmente
   fosco, sem albedo difuso — daí o aspecto de giz.
3. `doubleSided: true` numa malha fechada só dobra o trabalho de fragmento.

> ⚠️ Com o modelo processado, **não** mexa em `roughness`/`metalness` no
> componente: em three.js esses escalares **multiplicam** o mapa de acabamento,
> então um `roughness = 0.5` deixaria tudo brilhante demais em vez de respeitar
> visor, traje e anéis. Por isso o override só roda quando não há `roughnessMap`.

**Luz.** Esquema de 4 pontos montado para um traje branco sobre fundo preto — o
problema não é iluminar, é separar do fundo sem estourar o branco. Chave morna à
frente-esquerda, preenchimento frio baixo, e duas luzes de **contorno** por trás
desenhando a silhueta, uma delas na cor do produto (prop `accent`, que a página
passa a partir de `product.accent`), amarrando o mascote ao halo da seção. A
`ambientLight` fica quase zerada de propósito: subi-la achata tudo de novo.

**Composição (o "palco").** Um personagem 3D solto num fundo preto lê como
adesivo colado. O que o integra à página está no CSS, em `.mascot3d::before` e
`::after`:

- **poça de luz achatada nos pés** + `ContactShadows` por cima dela — sem um
  chão para receber a sombra, ela é invisível no preto e ele parece flutuar;
- **atmosfera** atrás do corpo, para ele emergir do fundo em vez de ser recortado;
- **linha de horizonte** na altura dos pés, no mesmo vocabulário de hairline dos
  `.beam-h` do site — é o que faz ele pertencer à página;
- no desktop (≥1200px) a dobra vira **duas colunas**: `.cta-mascot .wrap` ganha
  `padding-right`, então o texto ocupa a coluna da esquerda e o mascote a da
  direita, em vez de texto centralizado com uma figura sobrando na margem;
- o mascote se alinha à **coluna de conteúdo**, não à borda da janela — em
  monitor largo o texto para em 1280px e ele ficava colado no canto do monitor,
  sozinho. A largura vive na variável `--mascot-w` (em `.cta-mascot`), de onde a
  coluna de texto reserva o espaço: as duas nunca saem de sincronia.

> As porcentagens dos gradientes são do pseudo-elemento, que o `inset` negativo
> estica para além da caixa — por isso a poça fica em `90%`, não em `100%`.
> E `.mascot3d` precisa ser `position: relative` também no mobile: com `static`
> o palco se ancora na seção inteira e o chão vai parar no rodapé dela.

Motion: a transição entre poses é uma **mola** (subida levemente subamortecida,
~8% de overshoot; descida criticamente amortecida e mais curta), a cabeça usa
amortecimento exponencial com dead zone, e há uma respiração sutil no repouso.
Tudo respeita `prefers-reduced-motion`. O `frameloop` é `"demand"`: nada é
renderizado com o mascote fora da viewport ou com a aba em segundo plano.

> **Resolução:** o `dpr` do Canvas é uma **faixa**, não um valor fixo — no
> celular `[1.5, 2]`. Fixar em 1 num aparelho de tela 2x/3x não é "modo
> econômico", é borrão: era a causa do mascote sair serrilhado no mobile.

**Gerando os GLBs.** O arquivo cru do Meshy tem ~17MB (288.776 triângulos +
textura PNG de 5,69MB) e **não vai para o repo** (ver `.gitignore`). Guarde-o fora
do projeto e gere as versões web com:

```bash
node scripts/build-mascot.mjs caminho/para/o-modelo-cru.glb
```

Isso escreve `public/models/com-automation-astronaut.glb` (~920KB, 58.624 tri,
textura 2048) e `-mobile.glb` (~290KB, 17.326 tri, textura 1024) — só um baixa
por device. A compressão é **meshopt** (não Draco): o decoder é empacotado junto
do three, sem depender de CDN de terceiros.

O script faz mais do que encolher o arquivo:

- **cor dos detalhes** — o azul não é material, é pintura na textura. Só dá para
  mudar ali, em `BLUE`, no topo do script. A transformação é um **ganho linear
  por canal**, não uma conversão para HSL: a primeira versão fazia RGB→HSL→RGB e
  o arredondamento de volta para 8 bits espalhava ruído de quantização, dobrando
  o WebP (0,27MB → 0,54MB) sem diferença visual nenhuma;
- **mapa de acabamento** — o modelo tem um material só, então visor, traje e
  anéis brilhavam igual. O script classifica o albedo e gera um
  metallic-roughness (`ROUGHNESS` no topo do script). Ele sai em 512² e
  desfocado de propósito: são três valores chapados em áreas grandes, e na
  resolução do albedo custava 0,44MB só de bordas duras;
- **ordem dos passos** — textura primeiro, malha depois. Rodando o `webp` num
  arquivo já otimizado, ele descomprime a geometria meshopt para reescrever e
  não a recomprime (a malha saltava de 0,45MB para 1,16MB). O meshopt é sempre o
  último passo, e a qualidade do WebP é fixada explicitamente porque o padrão do
  encoder muda conforme o formato de entrada.

> Requer `sharp` (devDependency) para o processamento das texturas.

**Cache — por que o nome tem hash.** Os arquivos saem como
`com-automation-astronaut.<hash>.glb`, e o script gera
[`lib/mascot-model.ts`](lib/mascot-model.ts) com os caminhos (arquivo gerado,
não edite à mão). O Next versiona o próprio JS/CSS, mas **arquivos em `public/`
mantêm o nome para sempre**: com um nome fixo, quem já tinha o mascote em cache
continuava vendo o modelo antigo depois de cada atualização, sem jeito de
forçar — e o sintoma aparecia só em alguns aparelhos, conforme o estado do
cache de cada um. Com o hash, modelo novo é URL nova: atualiza na hora para
todo mundo e o antigo pode ser cacheado por um ano com segurança (regra no
`public/.htaccess`, junto de um `AddType` porque nem todo Apache conhece
`.glb`).

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

Depois, no **cPanel → Gerenciador de Arquivos → `public_html`**: faça **Upload**
do zip, **Extract** ali mesmo (confirmando a sobrescrita) e apague o zip.

> ⚠️ **Não limpe o `public_html` antes de extrair.** Entre apagar e terminar de
> extrair existe uma janela de segundos em que o site fica quebrado para quem
> acessa — e os sintomas confundem, porque parecem bug de código:
>
> - `ERR_CONTENT_DECODING_FAILED` nas páginas: o Apache comprime um HTML ainda
>   incompleto e o navegador recebe um gzip truncado;
> - `404` em `__next.produtos/$d$slug.txt` e afins: são os arquivos de prefetch
>   do Next, que ainda não tinham sido extraídos.
>
> Extrair por cima resolve: os arquivos são substituídos um a um e nenhum
> chega a faltar. Isso é seguro porque JS, CSS e modelos têm hash no nome —
> versões novas nunca colidem com as antigas.
>
> De vez em quando vale apagar os órfãos (chunks e modelos de builds
> anteriores), mas isso é limpeza, não parte do deploy.

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
