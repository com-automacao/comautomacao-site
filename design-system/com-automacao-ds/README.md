# Com Automação — Design System

> **Empresas organizadas decolam.**
> Sistema de design para a **Com Automação** — uma empresa de **venda de software e desenvolvimento Web** (páginas web, aplicações mobile-first).

---

## Sobre a marca

**Com Automação** entrega software e desenvolvimento web para empresas que querem "decolar" — ganhar escala removendo atrito operacional. O logo é uma wordmark "**COM**" cuja letra **O** vira uma moldura circular contendo a silhueta de um **foguete** em decolagem; abaixo, "**AUTOMAÇÃO**" em caixa-alta fina e bem espaçada. O recado visual é **lançamento, aceleração, clareza**.

A identidade é **rigorosamente preto-e-branco**, com cinzas como apoio. A inspiração de execução é **Apple**: tipografia de peso variável, muito respiro, layouts centrados, transições suaves e fluidas, ausência quase total de cor — a emoção vem da escala do tipo e do timing da animação, não de paletas.

### Produtos representados neste sistema
1. **Site institucional / marketing** (Com Automação). Mobile-first. Objetivo: gerar leads para projetos de software sob demanda e licenciamento.

> Não há codebase nem Figma anexado. Este sistema foi inferido a partir do **banner + cinco assets de logo** fornecidos e das diretrizes "tons de preto/branco/cinza, minimalista, Apple-like".

### Fontes de verdade fornecidas
| Arquivo | Uso |
|---|---|
| `uploads/banner-com-automacao.png` | Banner com tagline "EMPRESAS ORGANIZADAS DECOLAM" + logo |
| `uploads/logo-banner-1290x189.jpeg` | Logo horizontal, fundo preto |
| `uploads/logo-banner-1290x709.jpeg` | Logo em bloco, fundo preto |
| `uploads/logo-banner-white.jpeg` | Logo horizontal + tagline, fundo branco |
| `uploads/logo-simples.jpeg` | Símbolo (foguete na "O"), fundo preto |

Cópias normalizadas vivem em `assets/`, incluindo versões **PNG com fundo transparente** (branco-sobre-transparente e preto-sobre-transparente) geradas a partir dos JPEGs originais para uso sobre qualquer superfície.

---

## Conteúdo — como escrevemos

**Idioma primário:** Português brasileiro. Copys curtas em inglês são aceitáveis em pontos técnicos (`Deploy`, `Dashboard`), mas a voz institucional é PT-BR.

**Voz e tom.** Direto, confiante, objetivo. Escrevemos como a Apple escreve em pt-BR: **frases curtas, afirmativas, sem rodeio**. Preferimos verbos no imperativo em CTAs e títulos ("Decole.", "Peça um orçamento", "Converse com a gente"). Evitamos marketingês ("solução inovadora 360°"), superlativos vazios e jargão técnico desnecessário.

**Pronomes.** Tratamos o leitor por **"você"** (nunca "vós"). A empresa se refere a si mesma como **"a gente"** em contextos conversacionais e como **"Com Automação"** em contextos formais. Evitamos "nós" burocrático.

**Caixa.**
- **Títulos hero**: caixa mista, frase curta, ponto final. Ex.: *"Empresas organizadas decolam."*
- **Eyebrows / rótulos de seção**: **CAIXA ALTA** com tracking largo (`letter-spacing: 0.16em`). Ex.: *"O QUE FAZEMOS"*.
- **Botões**: caixa mista, sem ponto final. Ex.: *"Começar agora"*.
- **Navegação**: caixa mista, sem ícones decorativos.

**Pontuação.** Usamos ponto final em títulos declarativos (estilo Apple). Travessão `—` em vez de dois-pontos quando dá ritmo. Zero emoji no produto final. Zero exclamação dupla.

**Números.** Sempre por extenso de 1 a 9 em prosa ("três projetos"); dígitos em contextos de dado, preço, ano. Cifrões BRL com espaço não-quebrável: `R$ 2.400`.

**Exemplos de cópias canônicas**
- Hero: **"Empresas organizadas decolam."** · *Software sob medida e desenvolvimento web para times que querem escalar sem travar.*
- Seção: **"O QUE A GENTE FAZ"** · *Desenvolvimento web, automações e integrações. Você escolhe o ritmo.*
- CTA primária: **"Vamos decolar"**.
- CTA secundária: **"Ver como funciona"**.
- Vazio em dashboard: *"Ainda sem automações por aqui. Comece pelo seu primeiro fluxo."*

**O que evitamos**
- Emoji (🚀 em especial — ironicamente, dado o logo; a metáfora fica só na marca).
- "Revolucionário", "disruptivo", "ecossistema".
- CTAs de duas palavras vagas ("Saiba mais" genérico sem complemento).
- Textos em inglês-portunhol sem motivo.

---

## Fundações visuais

### Paleta
Monocromática, sem exceção. Três planos:
- **Preto absoluto** `#000` — fundos fortes, mark, tipografia display em fundo claro.
- **Branco absoluto** `#FFF` — fundos padrão, tipografia sobre preto.
- **Escala de cinza** (`--gray-50` … `--gray-950`) — superfícies elevadas/afundadas, bordas, texto secundário.

Semânticas derivadas (`--fg-1`, `--fg-2`, `--fg-3`, `--bg`, `--bg-elev`, `--bg-sunken`, `--border`, `--divider`, `--accent`). Tema **light** é o padrão; **dark** inverte os neutros — o próprio banner do cliente é dark, então ambos são nativos da marca.

Nenhum azul, nenhum roxo, nenhum gradiente colorido. **Gradientes são permitidos apenas quando vão de preto para preto-transparente** (máscaras de proteção sobre imagem) ou **branco↔branco-transparente**. Nunca RGB rainbow.

### Tipografia
- **Família display + sans**: `Inter` (substituição mais próxima de SF Pro disponível no Google Fonts). *Se você puder licenciar SF Pro, troque `--font-display` e `--font-sans` — este sistema foi desenhado para casar com as métricas da SF.* **⚠️ substituição sinalizada.**
- **Mono**: `ui-monospace` / SF Mono / JetBrains Mono.
- **Pesos usados**: 200 (display fino, Apple-style), 400 (body), 500, 600 (títulos), 700 (raro).
- **Escala**: mini-sistema Apple-HIG (`--fs-caption` 12 → `--fs-body` 17 → `--fs-title-1` 28 → `--fs-large-title` 34 → `--fs-display-l` até 128px).
- **Tracking**: títulos grandes usam tracking **negativo** (`-0.03em`); caps institucionais usam tracking **largo** (`0.08em` na marca, `0.16em` em eyebrows) — essa é a assinatura da palavra "AUTOMAÇÃO" sob o logo.
- **Balanced wrapping**: títulos grandes usam `text-wrap: balance` para cair bem em mobile.

### Espaçamento & layout
Grid de **4px**. Escala 4 → 128 (`--space-1` a `--space-32`). Gutter fluido `clamp(16px, 4vw, 32px)`. Larguras de conteúdo: 640 (prosa) · 980 (padrão) · 1200 (wide) · 1440 (page max). Densidade de Apple: muito respiro vertical entre seções (`--space-20`/`--space-24`).

### Raios
Escala suave: 4 · 8 · 12 · **18 (card padrão, Apple-like)** · 24 · 32 · pill. Nunca cards "afiados" (0) em superfícies primárias, exceto divisores full-bleed.

### Sombras
Muito sutis, sempre neutras, nunca coloridas. Cinco níveis (`xs` → `xl`). Em superfícies escuras as sombras são mais profundas mas permanecem pretas. Um card padrão usa `--shadow-sm`.

### Backgrounds
- **Padrão**: branco sólido ou preto sólido.
- **Fundo de seção alternado**: `--bg-sunken` (`#F2F2F2` light / `#141414` dark).
- **Imagens**: full-bleed, preto-e-branco ou dessaturadas. Sem imagens pastéis ou saturadas. Quando usadas, uma **máscara de proteção** vertical (`linear-gradient(180deg, transparent, rgba(0,0,0,0.6))`) garante contraste de texto.
- **Texturas / patterns**: ausentes. Ilustrações desenhadas à mão: ausentes. **Blur/transparência**: permitido em sticky navs (iOS-style `backdrop-filter: saturate(180%) blur(20px)`), nunca em elementos de conteúdo.

### Animação (a marca pede "profissionais e fluidas")
- **Easings**: `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) é o default — desacelera elegantemente, tipo iOS. `--ease-spring` (leve overshoot) para reveals lúdicos. Nunca `ease-in-out` "genérico".
- **Durações**: 150ms (micro), 250ms (base — hovers, toggles), 450ms (page reveals), 700ms+ (parallax/scroll hero).
- **Entradas**: fade + translate 8–16px vertical. Sem bounce grande. Sem rotação. Sem "zoom blur".
- **Scroll**: revelações via `IntersectionObserver` com stagger (80–120ms entre filhos).
- **Hover**: opacidade leve (0.7) em links de texto; `transform: scale(1.02)` + `--shadow-md` em cards.
- **Press**: `scale(0.98)` + transição 120ms. Nunca mudança drástica de cor.
- **Reduce-motion**: respeitamos `prefers-reduced-motion`; durações caem para 0.01ms.

### Estados interativos
- **Link**: underline `currentColor` 1px com offset `3px`; hover → `opacity: 0.7`.
- **Botão primário (black-fill)**: bg `--black`, fg `--white`; hover → `--gray-900`; active → `scale(0.98)`.
- **Botão secundário (outline)**: border `--border-strong`; hover → bg `--gray-100`; active → scale(0.98).
- **Focus**: `box-shadow: 0 0 0 3px rgba(0,0,0,0.12)` — halo neutro, nunca cor.

### Bordas
1px é o padrão, `--border` em light (`#D2D2D7`, idêntico ao Apple.com) e `--gray-800` em dark. Bordas mais fortes (`--border-strong`) para inputs. Nada de bordas 2px "chunky".

### Cards
Raio **18px**, fundo `--bg` (ou `--bg-elev` sobre fundo principal), borda `1px solid --border`, sombra `--shadow-sm`. Sem sombra colorida. Sem "borda-esquerda-colorida". Título `h3`, body `p`, espaço interno `--space-6`.

### Cápsulas vs gradientes de proteção
- **Cápsulas** (pill) são usadas para tags, chips e CTAs em mobile.
- **Gradientes de proteção** (`linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)`) são usados sobre mídia para garantir contraste de texto — preferimos gradiente a caixa sólida.

### Iconografia — veja seção abaixo
### Transparência & blur
Reservado para: **header sticky** (`backdrop-filter: blur(20px)`), **modais/sheets** (overlay `rgba(0,0,0,0.4)`), e a **máscara de proteção** sobre mídia. Nunca em conteúdo informacional.

---

## Iconografia

A marca **não possui um set proprietário de ícones**. Para este sistema adotamos **Lucide** (via CDN) como substituto — estilo **traço 1.5–2px, terminações arredondadas, sem preenchimento** — alinhado com o espírito Apple-SF-Symbols e consistente com a estética fina e geométrica do logo. **⚠️ substituição sinalizada; se houver um set próprio, sinalize.**

- **Cor**: sempre `currentColor`. Preto, branco, ou um cinza — nunca colorido.
- **Tamanho**: múltiplos de 4 (16 · 20 · 24 · 28 · 32).
- **Traço**: `stroke-width: 1.75` por padrão.
- **Uso de emoji**: **não**. Evitamos 🚀 especificamente — a metáfora do foguete é monopólio do logotipo.
- **Unicode decorativo**: aceitamos travessão `—`, bullet `·`, arrow `→` como tipografia (não como ícone).
- **Logo-mark** (`assets/logo-mark-white.png` / `logo-mark-black.png`) é o único "ícone" proprietário; nunca substitua um ícone genérico pelo mark — ele é reservado para presença de marca.

CDN:
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="arrow-right"></i>
```

---

## Arquivos deste sistema

```
/
├── README.md                      ← você está aqui
├── SKILL.md                       ← cross-compat com Claude Code / Agent Skills
├── colors_and_type.css            ← tokens (CSS custom properties) + base styles
├── assets/
│   ├── logo-mark.jpeg                  (mark original, fundo preto)
│   ├── logo-mark-white.png             (mark branco, fundo transparente)
│   ├── logo-mark-black.png             (mark preto, fundo transparente)
│   ├── logo-horizontal-dark.jpeg       (horizontal, fundo preto)
│   ├── logo-horizontal-white.png       (horizontal branco, transparente)
│   ├── logo-horizontal-black.png       (horizontal preto, transparente)
│   ├── logo-horizontal-light.jpeg      (com tagline, fundo branco)
│   ├── logo-stacked-dark.jpeg          (empilhado, fundo preto)
│   └── banner-tagline.png              (banner original com tagline)
├── preview/                       ← cards do Design System tab (auto-registrados)
│   ├── colors-neutrals.html
│   ├── colors-semantic.html
│   ├── type-display.html
│   ├── type-scale.html
│   ├── type-brand-caps.html
│   ├── spacing.html
│   ├── radii.html
│   ├── shadows.html
│   ├── motion.html
│   ├── buttons.html
│   ├── forms.html
│   ├── cards.html
│   ├── navigation.html
│   ├── logo-usage.html
│   └── iconography.html
└── ui_kits/
    └── marketing_site/
        ├── README.md
        ├── index.html              ← demo interativa mobile-first
        └── *.jsx                   ← componentes
```

## Ressalvas (caveats)
1. **Sem codebase e sem Figma.** Todas as decisões foram inferidas do banner + logos + briefing. Convido o cliente a anexar qualquer site existente, Figma ou repositório para calibrarmos.
2. **Fonte**: `Inter` é **substituição** de SF Pro. Se houver preferência por outra (Manrope, Geist, SF Pro licenciada), sinalize.
3. **Ícones**: `Lucide` é **substituição** — nenhum set proprietário foi fornecido.
4. **Logo**: as versões transparentes foram geradas por keying a partir dos JPEGs. Para nitidez máxima em impressão/tela grande, **peça ao cliente o SVG/AI original**.
