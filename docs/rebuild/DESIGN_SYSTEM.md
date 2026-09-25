# DESIGN SYSTEM — «تراث الوادي» + five themes

One design system, one token architecture, six complete themes chosen in Settings (and the moon button toggles a theme with its night counterpart):

| Theme | `html[data-look]` | Mode | Character |
|---|---|---|---|
| تراث الوادي (default) | `heritage` | light | parchment, brown ink, valley art, Amiri / Aref Ruqaa |
| ليل الوادي | `heritage` + `data-theme=dark` | dark | same identity at night |
| التنفيذي | `executive` | light | bright workspace, purple/blue accents, strong KPIs (from the Aghnam sales-dashboard reference) |
| المراجعة الاحترافية | `audit` | light | dense tables, navy rail, small radii |
| ليل التحليل | `midnight` | dark | dashboards and long sessions |
| الدفتر | `notebook` | light | ruled paper, handwritten headings, legible body font |

A theme changes tokens only (colour, type, radii, elevation, density); data, navigation and permissions never change. Files:

- `ui/ds/tokens.css` — all tokens. Nothing else defines a colour.
- `ui/ds/components.css` — components (cards, buttons, fields, tables, badges, banners, modals, toasts, charts, print).
- `ui/ds/shell.css` — app frame: rail, topbar, drawer, command palette, command center, screen states.

## Tokens

| Group | Tokens |
|---|---|
| Surfaces | `--sk-bg` `--sk-surface` `--sk-surface-2` `--sk-surface-3` `--sk-line` `--sk-line-2` |
| Text | `--sk-ink` `--sk-ink-2` `--sk-ink-3` |
| Brand | `--sk-brand` (#8a5a2b) `--sk-brand-2` (#b8864e) `--sk-brand-soft` `--sk-on-brand` |
| Status | `--sk-ok` `--sk-warn` `--sk-bad` `--sk-info` + `-soft` variants |
| Rail | `--sk-rail` `--sk-rail-ink` `--sk-rail-mute` `--sk-rail-active` |
| Spacing | `--sk-1` 4 · `--sk-2` 8 · `--sk-3` 12 · `--sk-4` 16 · `--sk-5` 24 · `--sk-6` 32 · `--sk-7` 48 px |
| Radius | `--sk-r-s` 8 · `--sk-r` 12 · `--sk-r-l` 16 |
| Type | body `Amiri` 16px/1.7 (mobile inputs 16px to avoid iOS zoom); headings `Aref Ruqaa`; numbers `tabular-nums` |
| Elevation | `--sk-shadow-1` (cards) · `--sk-shadow-2` (menus) · `--sk-shadow-3` (dialogs) |
| Motion | `--sk-ease`, 120–200 ms; all motion off under `prefers-reduced-motion` |

Legacy variable names used by the core views (`--ground`, `--surface`, `--ink`, `--brand`, `--ex`, `--ls`, …) are **aliases** of these tokens, declared once in `tokens.css`, so every old screen follows the design system without per-screen overrides and without `!important`.

## Rules

- RTL first; logical properties (`inline-start/end`).
- No fixed/floating element over content. The only fixed layers are the modal, the command palette and toasts (top, non-blocking); the mobile rail is an off-canvas drawer with a scrim.
- Safe areas: `env(safe-area-inset-*)` on topbar, drawer and dialogs.
- Tables scroll inside their card on narrow screens (`.tbl-wrap`), never the page.
- Focus ring `--sk-focus` on every interactive element; hit targets ≥ 40px on touch.
- Contrast ≥ 4.5:1 for text in both modes.

## Brand assets

| Asset | File | Source | Decision |
|---|---|---|---|
| Emblem (ram head, spiral horn, brown on cream) | `ui/art/ram.svg` | generated in Canva (media `MAHWPfyXAcw`), recreated as vector so it stays sharp at every size | direction chosen by Jev (0.97 over monogram / engraved sheep / geometric S); Canva render scored 3.84/4, vector 3.79/4 |
| PWA / home-screen icons 192, 512, apple-touch 180 | `payload/*.png.b64` | rendered from the emblem (full-bleed, maskable-safe) | — |
| Favicon, lock-screen logo, rail logo in non-heritage themes | `ui/art/ram.svg` | — | — |
| Dusk valley artwork (lavender sky, palms, flock) | `ui/art/valley-dusk.svg` | generated in Canva (media `MAHWPa7XzEk`), recreated as vector | Command Center banner in «التنفيذي» and «ليل التحليل» |
| Heritage sheep / landscape / hero | `ui/art/*.webp` | earlier heritage design | unchanged («تراث الوادي» stays default) |

Jev chose this work item first (brand assets 0.84 over print templates 0.15) and approved publishing (0.87).

## Identity rules (unification pass)

| Area | Rule |
|---|---|
| Colour | Feature screens use semantic tokens only (`--sk-ok/bad/warn/info/brand/violet/ink/surface/line…`). A hex value is allowed only as a `var()` fallback, inside a print window, or as pure black/white. 173 hard-coded colours were migrated. |
| Icons | One SVG icon set (`SK.icon(id)` / `SK.icons`) for navigation, hub tabs, buttons and cards; sheep items use the ram emblem. Emoji are not used in headings, buttons or tabs (151 removed); they remain only in toasts and WhatsApp message text, where they are content. |
| Print | Every print window calls `SK.brandPrint(w, title)`: it replaces the window's own styles with one heritage print sheet, adds the ornament strip (`ui/art/ornament.svg`, recreated from a Canva letterhead render), the emblem medallion, business name, VAT / CR numbers from pricing settings, date, a double rule and a footer. `@media print` forces the light heritage tokens under any theme. |
| Guidelines | Brand-guidelines deck in Canva (design `DAHWPRxTgOM`). |

Jev consistency score after the pass: 2.55 / 3 (0.56 «fully unified»). Remaining exception: the core view templates inside the payload (phase 11 of the rebuild plan).
