# AGENTS.md — Com Automação Design System

> Instruction file for AI UX/UI agents (Claude Code, Cursor, v0, Lovable, etc.).
> Read this first. It tells you how to design and build **on-brand** for **Com Automação**.

**Tagline:** *Empresas organizadas decolam.* (Organized companies take off.)
**Company:** Software & web development studio. Sells custom software, web/mobile apps, and automations.
**Aesthetic target:** Apple-grade minimalism — monochrome, generous whitespace, fluid motion, type-driven hierarchy.

---

## Non-negotiable rules

1. **Monochrome only.** Black `#000`, white `#FFF`, and the gray scale in `design-tokens.json`. **Never introduce a hue.** The only "accent" is absolute black (light theme) / white (dark theme).
2. **No gradients** except `black↔transparent` or `white↔transparent`, and only as a *protection mask* over media for text contrast. Never a colorful/rainbow gradient.
3. **No emoji** in product UI. Especially **never the rocket 🚀** — the rocket lives exclusively inside the logo mark.
4. **Icons = Lucide**, `stroke-width: 1.75`, `currentColor`, sizes in multiples of 4 (16/20/24/28/32). No filled icons.
5. **Cards never** use a colored left-border accent or a colored shadow. Shadows are always neutral and restrained.
6. **Voice is PT-BR.** Direct, confident, Apple-like. Reader = "você". Company = "a gente" (casual) / "Com Automação" (formal). Declarative hero titles end with a period.
7. **Logo is never redrawn.** Copy a file from `assets/`. Match logo color to background (white logo on dark, black logo on light).
8. **Respect `prefers-reduced-motion`** — collapse durations to ~0.01ms.

---

## How to consume this system

| You need… | Use |
|---|---|
| Machine-readable tokens | `design-tokens.json` (W3C DTCG format) |
| Drop-in CSS variables + base styles | `colors_and_type.css` — `@import` it, then use `var(--token)` |
| Component specs (variants, states, measurements) | `components.json` |
| Full human-readable brand guide | `README.md` |
| Reference implementations | `ui_kits/marketing_site/*.jsx` (React) |
| Live token/component swatches | `preview/*.html` |
| Brand assets (logos, banner) | `assets/` |

**Recommended:** if your target stack supports it, run `design-tokens.json` through Style Dictionary (or your tokens pipeline) to emit native variables (CSS / Tailwind theme / SwiftUI / Compose). Otherwise import `colors_and_type.css` directly and reference `var(--…)`.

---

## Token quick reference (full set in `design-tokens.json`)

**Type:** Inter (⚠️ *substitute* for SF Pro — swap if licensed). Weights 200 / 400 / 500 / 600. Big titles use negative tracking (`-0.03em`); brand caps use wide tracking (`0.08em`–`0.16em`).

**Scale (px):** caption 12 · footnote 13 · subhead 15 · body 17 · title-3 20 · title-2 22 · title-1 28 · large-title 34 · display 56–128 (clamp).

**Spacing:** 4px base → 4·8·12·16·20·24·32·40·48·64·80·96·128.

**Radius:** 4·8·12·**18 (cards ★)**·24·32·pill.

**Motion:** default easing `cubic-bezier(0.16, 1, 0.3, 1)`. Durations 150 / 250 / 450 / 700ms. Entrances = fade + 8–16px translateY. No bounce, no rotation, no zoom-blur.

**Themes:** `light` (default) and `dark` (inverted neutrals). Toggle via `[data-theme="dark"]` on a root element. Both are native — the client's own banner is dark.

---

## Build checklist (before you ship a screen)

- [ ] Zero non-neutral colors (grep your output for hex values outside the gray scale).
- [ ] All copy in PT-BR, in the brand voice; CTAs are imperative ("Vamos decolar", "Peça um orçamento").
- [ ] Type uses the scale + correct tracking (tight on display, wide on eyebrows).
- [ ] Mobile-first; layout holds at 390px and scales up. Tap targets ≥ 44px.
- [ ] Reveals/transitions use the standard easing + reduced-motion fallback.
- [ ] Icons are Lucide, stroke 1.75, currentColor. No emoji.
- [ ] Logo asset matches background; never stretched or recolored ad hoc.
- [ ] Both light and dark render correctly if the screen supports theming.

---

## Substitutions flagged (ask the client to resolve)

1. **Inter → SF Pro.** Inter is the closest Google Font; swap if SF Pro is licensed.
2. **Lucide icons.** No proprietary icon set was provided.
3. **Logo source.** Transparent PNGs were keyed from JPEGs. Request the original **SVG/AI** for crisp large-scale/print use.
4. **No codebase/Figma was provided** — the system was inferred from the brand banner + logos + brief. Calibrate against any real product the client shares.
