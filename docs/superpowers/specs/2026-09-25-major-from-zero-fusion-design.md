# S.kosif Major From-Zero Fusion — Design Contract

Date: 2026-09-25
Branch: `rebuild/major-from-zero-20260925`
Target production project: Cloudflare Pages `s-kosif`
Target public URL after release: `https://s-kosif.pages.dev`

## 1. Product decision

The currently published S.kosif application is **not** the visual or architectural baseline. The product will be re-founded from zero.

Git history and backup branches remain intact for recovery and source mining, but the current UI, shell, route structure, generated bundles, and legacy presentation layers are not inherited by default.

## 2. Source applications to mine

The new product may extract only proven value from:

1. Current/historical S.kosif in `kosif199022-jpg/cloude`.
2. `kosif199022-jpg/kosif-audit-studio` and its deployed Audit Studio variants.
3. The historical operations/sales application family that includes the Aghnam Al-Wadi sales-analysis dashboard references and business capabilities.

Nothing is copied merely because it exists. Every migrated capability must justify its business value, data value, control value, or user-flow value.

## 3. What is discarded

The new foundation must not inherit:

- Existing page layouts, sidebars, headers, bottom bars, floating controls, modals, card systems, dashboards, navigation hierarchy, or visual tokens as implementation dependencies.
- `skosif.js` / `skosif.css` as runtime presentation bundles.
- Nested-app shells, iframe-style embedding, redirects to side applications, duplicated navigation, or multiple competing design systems.
- Dead features, fabricated demo data presented as real data, duplicated calculators, duplicate reports, duplicate settings, or modules without a clear product owner/use case.
- Legacy compatibility code whose only purpose is to preserve obsolete presentation behavior.

## 4. What may be preserved or reimplemented

Only these classes of assets may survive, after review:

- Real user/business data and historical storage keys where migration is required.
- Correct deterministic business rules and calculation engines.
- Audit/accounting logic, evidence models, materiality, journal tests, Benford, sampling, PBC, issues, adjustments, reviewer workflow, standards research, completion/report gates, document intelligence gateway.
- Operations logic such as inventory, purchasing, receiving, carcass economics, butcher yield, pricing, POS/ZATCA, customer/order flows, subscriptions, barcode, and finance where validated.
- Security, permissions, audit trail, integrity, backup/restore, Cloudflare integration, and tested service contracts.
- Useful tests and fixtures that validate retained business behavior rather than old UI behavior.

Preserved logic should be wrapped behind new typed services/repositories instead of imported through old screens.

## 5. New product architecture

One product, one shell, one navigation model, one permission model, one search/command layer, one design system, one data-access layer.

Primary product domains:

- Command Center
- Sales & Customers
- Inventory & Production
- Procurement & Suppliers
- Finance & Accounting
- Audit & Assurance
- Catalog, Costing & Pricing
- Intelligence / Jev / AI Council
- Reports & Executive Analytics
- System, Data, Permissions & Integrations

Routes are capability-driven; a capability belongs to one domain and must not create a nested application.

## 6. Visual foundation

The new visual language uses the historical Aghnam Al-Wadi sales-analysis dashboard as the preferred inspiration for the overall product shell: right-side RTL navigation, very light workspace, restrained purple/blue gradient accents, strong KPI numbers, clean large cards, clear Arabic hierarchy, polished motion and depth.

Audit Studio contributes professional typography, information density, tables, evidence/report ergonomics, and serious review states — not its entire shell.

The current S.kosif contributes proven navigation/search interaction ideas only when they fit the new architecture.

No old stylesheet or component tree is considered canonical.

## 7. Data migration rule

The rebuild is destructive only to the **presentation/application layer**, not to recoverable user data.

Before production cutover:

- Inventory all IndexedDB/localStorage/database keys and server-side stores in the three sources.
- Classify each as migrate / archive / discard.
- Never overwrite unknown user data destructively.
- Migrations must be idempotent and recoverable.
- Backup/restore must be tested before cutover.

## 8. Build and release rule

Development occurs on `rebuild/major-from-zero-20260925` or successor integration branches. `main` is not the development scratchpad.

Cloudflare Pages project remains `s-kosif`. The production URL remains the same after the final cutover.

No production merge until the new app passes:

- typecheck
- unit/service tests
- migration tests
- data integrity/backup restore tests
- capability parity gate for approved capabilities
- RTL/mobile/accessibility checks
- no-legacy-presentation source gate
- production build validation
- smoke test on a Cloudflare preview deployment

## 9. Execution phases

### Phase A — Extraction map
Catalog capabilities, data contracts, tests, integrations, and dependencies across all three sources. Mark each KEEP / REBUILD / MERGE / DROP.

### Phase B — Empty foundation
Create a new application root and design system with no imports from old UI trees. Establish app shell, capability registry, router, permissions boundary, repositories, telemetry/error boundary, and test harness.

### Phase C — Domain fusion
Port approved capabilities domain by domain through new services and screens. Prefer one canonical implementation for duplicated behavior.

### Phase D — Data migration
Implement read-only discovery first, then explicit migrations with rollback.

### Phase E — Product polish
Apply the Aghnam-inspired visual system, responsive RTL behavior, motion, charts, command palette, and accessibility.

### Phase F — Cutover
Preview QA, compare against capability matrix, back up production data, merge to `main`, let the connected Cloudflare Pages project publish to the same `s-kosif.pages.dev` URL, and verify production.

## 10. Non-negotiable acceptance criteria

- No `skosif.js` or other legacy presentation bundle required by production.
- No iframe / nested-app user experience.
- No duplicate sidebars, headers, floating docks, or overlapping navigation systems.
- No copied module without a KEEP/MERGE justification.
- No fabricated operational/audit data presented as real.
- All retained core calculations covered by tests.
- All retained user data has an explicit migration/archive decision.
- New UI is built from the new design system only.
- Production remains deployable to the existing Cloudflare Pages project and URL after cutover.
