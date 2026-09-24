# S.kosif — Clean Architecture

S.kosif now uses **semantic modules** instead of release-number layers.

## Navigation

The application exposes two primary tool groups:

- **العمل اليومي**: Command Center, Catalog & Offers, Quick Pricing, Customers, Suppliers, Cash.
- **الأدوات المتقدمة**: Pricing Kernel, Decision Lab, Carcass Economics, Price Governance, POS Matching, Excel Reconciliation, Reports, Storage Health.

Global settings such as themes and lock remain outside the business-tool taxonomy.

## UI policy

- No floating launcher icons in production.
- Compatibility launchers may remain in the DOM for existing integrations, but are always hidden.
- User access is through the normal application shell/taskbar and categorized launcher.
- Motion is decorative and subtle; there is no floating motion-control button.
- Four curated themes are supported: Professional Light, Pasture Green, Professional Dark, Najdi Qahwa.

## Source layout

- `modules/app/` — application core, session, bridges.
- `modules/ui/` — mobile, workspace, shell, motion.
- `modules/features/` — supply, catalog, matching, pricing, meat operations.
- `modules/decision/` — Jev bridge and decision-question UI.
- `modules/tools/` — smart utility tools.

Do not add new files named `vXX`, `VXX`, or duplicate override layers. Extend the semantic module that owns the behavior.

## Collaboration workflow

1. Branch from the latest `main`.
2. Make changes in the owning semantic module.
3. Open a pull request.
4. CI runs syntax, pricing, meat-economics, security, architecture, theme, and floating-control checks.
5. Merge only after CI is green and the branch is current enough to avoid overwriting another programmer's work.

Cloudflare Pages production remains connected to `main`.
