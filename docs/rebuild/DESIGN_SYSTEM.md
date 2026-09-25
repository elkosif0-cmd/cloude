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
