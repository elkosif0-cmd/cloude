# S.kosif Design System — Reconstruction Baseline

## Principles
One visual language, Arabic-first RTL, calm hierarchy, data clarity before decoration, contextual advanced controls, touch-safe mobile behavior.

## Tokens
Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48.
Radii: 8 / 12 / 16 / 20.
Semantic colors: brand, surface, background, border, ink, muted, success, warning, danger, info.
Modes: light and dark through shared semantic tokens. Feature modules must not invent global palette ownership.

## Typography
Display → H1 → H2 → H3 → Section → Body → Secondary → Caption.
Tabular numerals for financial/KPI values. Arabic typography must preserve readable line height and RTL alignment.

## Components
Button, field, select, search/command, card, KPI, table/list, modal/sheet, tabs, badge, alert, empty/error/loading states, toast, breadcrumb/context nav, pagination.

## Interaction
- Frequent actions visible.
- Rare/advanced actions discoverable by domain or Command Palette.
- No floating tool clusters.
- Modal/sheet locks background scroll.
- Minimum touch target 44px.
- Reduced-motion respected.
- Keyboard focus is visible.

## Mobile
Command Palette becomes a bottom sheet. Large tables use controlled scrolling or responsive representations. The global shell owns navigation; embedded capabilities may only use contextual local navigation.
