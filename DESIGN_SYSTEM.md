# DESIGN SYSTEM — S.kosif 2026

## Principles

- Arabic-first RTL.
- low cognitive load; daily work first.
- no decorative floating controls.
- dense data remains readable.
- every state has loading/empty/error/offline/no-permission/partial/success treatment.

## Tokens

Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.

Radius: 8 / 12 / 16 / 24.

Typography:
- Display 32/42 800
- H1 26/36 800
- H2 22/32 750
- H3 18/28 700
- Body 15/25 500
- Secondary 13/21 500
- Caption 11/18 600
- Numbers use tabular numerals.

Semantic colors are separate from brand colors.

## Required components

Button, IconButton, Input, Select, Search, DateInput, Card, KPI, DataTable, Drawer, Modal, Sheet, Tooltip, Dropdown, Tabs, Badge, Alert, EmptyState, Loading, Skeleton, Toast, CommandPalette, Breadcrumb, Pagination, FilterBar, EntityHeader.

## Responsive

- mobile: bottom sheet/drawer, single-column task flow, priority columns.
- tablet: two-column workspace where useful.
- laptop/desktop: navigation rail + contextual content, max readable widths.
- tables use priority columns and controlled horizontal scrolling, never page overflow.

## Motion

120–220ms for state/route feedback only.
`prefers-reduced-motion` disables nonessential motion.

## Accessibility

Visible focus, semantic labels, 44px touch targets, WCAG contrast, keyboard command palette, no color-only status communication.
