# CAPABILITY COVERAGE MATRIX

Generated against baseline `ccd155f9bd2cbe74632607a9fcdf3d12956595d4`.

**Gate rule:** a row is only `VERIFIED` when the new presentation/service exists and its test or production-build assertion passes. `PARTIAL` never counts as coverage for deleting legacy source.

| Old capability | New capability / owner | Status | Verification |
|---|---|---|---|
| Encrypted unlock | New secure gate + existing crypto core | IMPLEMENTED | production build marker + crypto source preserved |
| Private catalog injection | Rebuild bootstrap adapter | IMPLEMENTED | exact private placeholder contract |
| Raw materials | CatalogView + repositories | IMPLEMENTED | strict rebuild typecheck |
| Raw pricing/VAT/waste/margin | Existing pricingEngine/corePricing | VERIFIED | 13 pricing kernel tests |
| Boxes pricing/nesting | Existing pricing engine + read view | PARTIAL | engine verified; create/edit UI pending |
| Rounding policies | corePricing | VERIFIED | pricing tests |
| Circular dependency guard | corePricing | VERIFIED | pricing tests |
| NRV/yield trial | corePricing | VERIFIED ENGINE / UI PENDING | pricing tests |
| Carcass economics | meatOps | VERIFIED ENGINE / UI PENDING | meat tests |
| Customer list/search | SalesView + repositories | IMPLEMENTED | build/typecheck |
| Customer create/edit | SalesView | IMPLEMENTED | build/typecheck |
| Customer purchase history | Sales context | PARTIAL | entity drill-down pending |
| Orders | SalesView | IMPLEMENTED BASIC | build/typecheck |
| Collections/open balances | Sales/Finance | IMPLEMENTED | derived from recorded orders |
| POS split payments | POSPanel | IMPLEMENTED CORE | build/typecheck; persistence flow pending |
| ZATCA TLV | specialist service | VERIFIED | specialist golden test |
| ZATCA QR image | — | PENDING | no new QR renderer yet |
| Thermal receipt | POSPanel print | IMPLEMENTED | manual preview QA pending |
| WhatsApp invoice | — | PENDING | new contextual share pending |
| B2B credit | CreditPanel | IMPLEMENTED | build/typecheck |
| Inventory current stock | InventoryView | IMPLEMENTED | build/typecheck |
| Inventory movements | inventory service | IMPLEMENTED | audit event emitted |
| Reorder thresholds | InventoryView | IMPLEMENTED | build/typecheck |
| Physical stock count | InventoryView + service | IMPLEMENTED | build/typecheck |
| Count variance adjustment | inventory service | IMPLEMENTED | build/typecheck |
| Expiry/FIFO radar | InventoryView | IMPLEMENTED | build/typecheck |
| Supplier receiving | InventoryView | IMPLEMENTED | build/typecheck |
| Supplier waste variance | InventoryView | IMPLEMENTED | build/typecheck |
| Supplier comparison | — | PENDING | analytics UI/service pending |
| Purchase order composer | — | PENDING | new PO flow pending |
| Blending calculator | ProductionPanel + specialist service | VERIFIED | specialist test |
| Batch work order | ProductionPanel | IMPLEMENTED | persistence store |
| Barcode labels | ProductionPanel + Code128 service | VERIFIED ENGINE | specialist test; print QA pending |
| Barcode camera scanner | — | PENDING | browser camera adapter pending |
| Cold-chain log | TraceabilityPanel | IMPLEMENTED | user-entered data only |
| Lot traceability | TraceabilityPanel | IMPLEMENTED | user-entered data only |
| Culinary guide | — | PENDING | content/service migration pending |
| Dry-aging chamber | AgingPanel + specialist service | VERIFIED ENGINE/UI | specialist test + typecheck |
| Catering/BBQ quote | CateringPanel + specialist service | VERIFIED | specialist test |
| Meat subscriptions | — | PENDING | new workflow pending |
| Butcher yield shift | meat engine available | PARTIAL | new shift UI pending |
| Cash flow | FinanceView | IMPLEMENTED | build/typecheck |
| Manual receipts/payments | FinanceView | IMPLEMENTED | repository/event |
| Seasonal cash forecast | — | PENDING | new forecast service pending |
| Payables | FinanceView | IMPLEMENTED | build/typecheck |
| Receivables ageing | meatOps engine | PARTIAL | open balances shown; ageing bands UI pending |
| Income statement | FinanceView + service | IMPLEMENTED | materials + other expenses + save |
| Material COGS | finance service | IMPLEMENTED | pricing-data based |
| Other expenses | FinanceView | IMPLEMENTED | monthly P&L |
| VAT report | — | PENDING | new report view pending |
| EOD report | — | PENDING | new report view pending |
| Trend analytics | — | PENDING | new charts pending |
| CSV export | system/core utility | PARTIAL | backup export done; per-table export pending |
| Excel import/reconciliation | — | PENDING | clean importer pending |
| Product matching | — | PENDING | matcher engine migration pending |
| Jev yes/no | IntelligenceView | IMPLEMENTED | server contract preserved |
| Jev choice | IntelligenceView | IMPLEMENTED | server contract preserved |
| Jev score | IntelligenceView | IMPLEMENTED | server contract preserved |
| Jev monitor | IntelligenceView | IMPLEMENTED | deterministic metrics first |
| Jev simulation | IntelligenceView | IMPLEMENTED | local calculation; no auto-write |
| Jev history | IntelligenceView | IMPLEMENTED | preserved log key |
| Data redaction before AI | IntelligenceView | IMPLEMENTED BASIC | phone/email/long-number redaction |
| Audit workspace | AuditView | PARTIAL | new shell only |
| Audit evidence | AuditView | PARTIAL | source registry only |
| Audit issues | — | PENDING | new workflow pending |
| Reviewer council | — | PENDING | new council UI/service pending |
| Statements/entries | — | PENDING | accounting UI pending |
| Audit reports/issuance | — | PENDING | new report flow pending |
| Benford | legacy audit engine | PENDING NEW UI | must port engine |
| Sampling | legacy audit engine | PENDING NEW UI | must port engine |
| Journal-entry tests | legacy audit engine | PENDING NEW UI | must port engine |
| Standards lab | legacy audit source | PENDING NEW UI | must port capability |
| Unified search | command palette + search service | IMPLEMENTED | registry/customer/product/order search |
| Command palette | AppShell | IMPLEMENTED | Ctrl/Cmd+K |
| Daily vs advanced IA | AppShell | IMPLEMENTED | new navigation model |
| Responsive/mobile navigation | AppShell/design system | IMPLEMENTED CODE | device QA pending |
| Light/dark | new token system | IMPLEMENTED | no old theme dependency |
| Central error handling | — | PENDING | error boundary/service pending |
| Offline asset cache | clean service worker | IMPLEMENTED | build validation |
| Backup export | SystemView | IMPLEMENTED | JSON export |
| Backup restore | — | PENDING | validation/restore UI pending |
| Data migration diagnostics | SystemView + adapters | IMPLEMENTED | non-destructive migration |
| RBAC model | capabilities v2 + new system matrix | PARTIAL | server backend preserved; UI sync wiring pending |
| Cloudflare Access | capabilities-v2 Worker | VERIFIED SOURCE | CI marker checks |
| D1 workspace revisions | capabilities-v2 Worker | VERIFIED SOURCE | CI marker checks |
| Integrity chain | capabilities-v2 Worker | VERIFIED SOURCE | CI marker checks |

## Current gate

- Deterministic business engines: **preserved and tested**.
- New shell/design system: **implemented and CI-building**.
- Core daily operations: **substantially implemented**.
- Specialized operational capabilities: **partially migrated**.
- Audit/standards capabilities: **not yet fully rebuilt**.
- Browser visual/E2E QA: **pending preview validation**.

Therefore:

**Core Capability Coverage ≠ 100% yet.**
**Zero Legacy Purge = BLOCKED.**
**Production merge = BLOCKED until pending rows are closed or proven unused.**

This file is intentionally strict: no legacy capability is considered deleted simply because the new shell looks complete.
