---
name: com-automacao-design
description: Use this skill to generate well-branded interfaces and assets for Com Automação, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

Key points about Com Automação:
- Monochrome only — black, white, grays. No accent color, no gradients (except black↔transparent for media overlays).
- Typography: Inter (substitute for SF Pro). Tight tracking on large display; wide-tracked uppercase on brand eyebrows like "AUTOMAÇÃO".
- Voice: PT-BR. Direct, confident, Apple-like. "Você" for the reader, "a gente" for the company. No emoji. Period at the end of declarative hero titles.
- Motion: easeOut (`cubic-bezier(0.16, 1, 0.3, 1)`) is default; fades + 8–16px translate; 250ms base, 450ms reveals.
- Logo: the "O" in "COM" is a circle containing a rocket silhouette. Available in `assets/` as transparent PNGs (white and black). Never redraw the logo; copy the file.
- Icons: Lucide (substitute — no proprietary set exists). Stroke 1.75, currentColor, 16/20/24/28/32px.
- Cards: 18px radius, 1px --border, --shadow-sm. Never left-border color accents.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

File map:
- `README.md` — full brand guide (content, visual, iconography, caveats)
- `colors_and_type.css` — CSS custom-property tokens + base styles; `@import` this in any artifact.
- `assets/` — logos (horizontal/stacked/mark × white/black/transparent) and the tagline banner.
- `preview/` — standalone cards demonstrating each token/component.
- `ui_kits/marketing_site/` — interactive React prototype of the marketing website; components are reusable.
