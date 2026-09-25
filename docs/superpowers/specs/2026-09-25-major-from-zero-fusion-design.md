# S.kosif Major From-Zero Fusion — Design Contract

Date: 2026-09-25
Design branch: `rebuild/major-from-zero-20260925`
Execution branch: a new clean-slate successor branch created only after this written design and its implementation plan are approved.
Production project after cutover: Cloudflare Pages `s-kosif`
Production URL after cutover: `https://s-kosif.pages.dev`
Latest safety snapshot before this refoundation: `backup/pre-grand-fusion-20260925-1358`

## 1. Product decision — true clean slate

The currently published S.kosif application is **not** the visual, architectural, routing, component, or build baseline. The product will be re-founded from zero.

The execution branch must begin as a **clean application root**. Existing S.kosif application files, legacy UI trees, runtime presentation bundles, old shells, old routes, old component hierarchies, and old screen implementations are not inherited into the new application merely because they exist in Git.

Git history and backup branches remain intact for recovery and source mining. They are reference archives, not implementation dependencies.

The goal is not to stack applications together. The goal is to extract the best proven capabilities, data models, controls, calculations, workflows, and interaction ideas from the source products, then rebuild them as one coherent product.

No existing S.kosif screen is assumed to survive. Every retained capability must earn its place through the capability acceptance rule below.

## 2. Four source products / snapshots to mine

The new product may extract only proven value from these four source inputs:

1. Current and historical S.kosif in `kosif199022-jpg/cloude`, including preserved pre-rebuild branches and backups.
2. KOSIF Audit Studio as represented by `kosif199022-jpg/kosif-audit-studio` and the historical `kosif-audit-studio.taunt-apron-speak.chatgpt.site` product snapshot.
3. The Audit Studio Pages product snapshot historically published at `kosif-audit-studio.pages.dev`, including materially different audit/review flows that are not duplicated elsewhere.
4. The historical Aghnam Al-Wadi operations/sales product family, including the sales-analysis dashboard visual reference and its validated business capabilities.

Nothing is copied merely because it exists. Every migrated capability must justify its business value, data value, control value, or user-flow value.

## 3. What is discarded from the execution branch

The new clean-slate application must not inherit:

- Existing page layouts, sidebars, headers, bottom bars, floating controls, modals, card systems, dashboards, navigation hierarchy, or visual tokens as implementation dependencies.
- `skosif.js` / `skosif.css` as runtime presentation bundles.
- Existing S.kosif route trees, screen registrations, old feature folders, old UI registries, or generated presentation artifacts.
- Nested-app shells, iframe-style embedding, redirects to side applications, duplicated navigation, or multiple competing design systems.
- Dead features, fabricated demo data presented as real data, duplicated calculators, duplicate reports, duplicate settings, or modules without a clear product owner/use case.
- Legacy compatibility code whose only purpose is to preserve obsolete presentation behavior.
- A feature merely because it appears in a capability list or because its screen renders.

Existing repositories/branches remain available only for read-only extraction and comparison until an explicitly approved migration step copies/reimplements proven logic.

## 4. Capability acceptance rule

A capability is not considered retained or complete until its full operational path works.

For each approved capability, validation must cover the applicable chain:

**input/import -> validation -> processing/calculation -> persistence -> retrieval -> permissions -> audit trail -> output/report/export -> error/recovery path**.

A screen that opens but does not complete its real workflow is classified as **REBUILD**, not KEEP.

Each source capability is classified as one of:

- **KEEP-LOGIC** — proven business logic worth preserving behind a new service.
- **MERGE** — valuable behavior duplicated across sources and consolidated into one canonical implementation.
- **REBUILD** — valuable idea/workflow whose current implementation is incomplete, fragile, or visually coupled to legacy code.
- **DROP** — duplicate, dead, misleading, fabricated, low-value, or obsolete.

## 5. What may be preserved or reimplemented

Only these classes of assets may survive, after review:

- Real user/business data and historical storage keys where migration is required.
- Correct deterministic business rules and calculation engines.
- Audit/accounting logic: evidence models, TB/GL workflows, materiality, journal tests, Benford, sampling, PBC, issues, adjustments, reviewer workflow, standards research, completion/report gates, document intelligence gateway, financial-statement and journal workflows where validated.
- Operations logic: inventory, purchasing, receiving, carcass economics, butcher yield, pricing, POS/ZATCA, customer/order flows, receivables, subscriptions, barcode, finance, supplier and cash workflows where validated.
- Security, permissions, audit trail, integrity, backup/restore, Cloudflare integration, and tested service contracts.
- Useful tests and fixtures that validate retained business behavior rather than old UI behavior.

Preserved logic must be reimplemented or wrapped behind new typed services/repositories. It must not be imported through old screens or old presentation bundles.

## 6. New product architecture

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

Routes are capability-driven. A capability belongs to one canonical domain and must not create a nested application.

## 7. Visual foundation

The default visual direction takes its strongest inspiration from the historical Aghnam Al-Wadi sales-analysis dashboard: right-side RTL navigation, very light workspace, restrained purple/blue gradient accents, strong KPI numbers, clean large cards, clear Arabic hierarchy, polished motion and depth.

Audit Studio contributes professional typography, information density, tables, evidence/report ergonomics, and serious review states — not its entire shell.

Historical S.kosif contributes proven interaction ideas such as useful search/command behavior only when they fit the new architecture.

No old stylesheet or component tree is canonical.

### Five complete themes

The design system must support five first-class themes. A theme changes the whole visual language — not only colors — while preserving identical information architecture and functionality:

1. **Aghnam Executive Light** — the default: bright, spacious, purple/blue accents, strong KPIs, subtle depth.
2. **Audit Professional** — restrained professional palette, denser evidence/report tables, high legibility, minimal motion.
3. **Midnight Intelligence** — dark analytical theme optimized for dashboards, Jev, charts, and long sessions.
4. **Desert Gold** — warm sand/cream surfaces with restrained gold/brown accents for an executive Arabic identity.
5. **Handwritten Notebook** — paper/notebook-inspired surfaces and a handwritten Arabic display style for headings, annotations and personal notes; transactional tables, amounts, controls, and long-form body text keep a highly legible UI font.

Theme tokens cover typography, color, elevation, radii, borders, surfaces, charts, icon treatment, spacing density, motion character, and document/report accents. Switching themes must not change data or permissions.

## 8. Data migration rule

The rebuild is destructive only to the **application/presentation layer in the clean execution branch**, not to recoverable user data or Git history.

Before production cutover:

- Inventory all IndexedDB, localStorage, database keys, server-side stores, files, and connector-backed records used by the four source products/snapshots.
- Classify every store as migrate / archive / discard.
- Never overwrite unknown user data destructively.
- Migrations must be idempotent and recoverable.
- Backup/restore must be tested before cutover.
- Unknown or ambiguous records remain archived until explicitly classified.

## 9. Session and security baseline

The new product keeps one authentication/session model. Where device-session persistence is enabled, successful unlock may persist for up to 24 hours on the same device without storing the plaintext password. Session expiry, explicit lock/logout, role changes, and security-sensitive actions must invalidate or re-check access appropriately.

## 10. Build and release rule

Development occurs on a clean-slate execution branch created after approval of this spec and its implementation plan. `main` is not the development scratchpad.

Cloudflare Pages project remains `s-kosif`. The public URL remains `https://s-kosif.pages.dev` after final cutover.

No production merge until the new app passes:

- typecheck
- unit/service tests
- end-to-end capability tests for approved workflows
- migration tests
- data integrity and backup/restore tests
- capability parity gate for approved capabilities
- RTL/mobile/accessibility checks
- theme matrix checks across all five themes
- no-legacy-presentation source gate
- production build validation
- smoke test on a Cloudflare preview deployment

## 11. Execution phases

### Phase A — Extraction map
Catalog capabilities, data contracts, tests, integrations, dependencies, and real usage across all four source products/snapshots. Mark each KEEP-LOGIC / MERGE / REBUILD / DROP.

### Phase B — Empty foundation
Create a brand-new application root with no inherited production UI tree. Establish the new design system, app shell, capability registry, router, permissions boundary, repositories, telemetry/error boundary, theme engine, and test harness.

### Phase C — Domain fusion
Port approved capabilities domain by domain through new services and new screens. Prefer one canonical implementation for duplicated behavior.

### Phase D — Data migration
Implement read-only discovery first, then explicit migrations with rollback.

### Phase E — Product polish
Apply the Aghnam-inspired default visual system, all five themes, responsive RTL behavior, motion, charts, command palette, accessibility, and print/report treatment.

### Phase F — Cutover
Preview QA, compare against the capability matrix, back up production data again, merge the clean-slate product to `main`, let the connected Cloudflare Pages project publish to the same `s-kosif.pages.dev` URL, and verify production.

## 12. Non-negotiable acceptance criteria

- The execution branch starts from a clean application root, not from an inherited S.kosif UI implementation.
- No `skosif.js` or other legacy presentation bundle required by production.
- No iframe / nested-app user experience.
- No duplicate sidebars, headers, floating docks, or overlapping navigation systems.
- No copied module without a KEEP-LOGIC / MERGE / REBUILD justification.
- No fabricated operational/audit data presented as real.
- No capability marked complete merely because its screen renders.
- All retained core calculations covered by tests.
- All retained user data has an explicit migration/archive decision.
- New UI is built from the new design system only.
- Five complete themes are available from the same design-token architecture.
- Production remains deployable to the existing Cloudflare Pages project and URL after cutover.
