# Capability coverage — every version ever built

Sources reviewed (all branches and history of `kosif199022-jpg/cloude`, 946 commits, 35 branches):

| # | Source | Where | Screens / capabilities |
|---|---|---|---|
| A | Core app, 7 historical payloads (v9 → v32) | `payload/` history (`4dfa180` … `a03680d`) | 28 core views incl. `magiclab`, `capabilities`, `unified`, `recon` |
| B | Five embedded apps (`v25-modules`) | payload `4dfa180`/`60d56ed` | Sales analytics dashboard · CRM V8.2 · Dynamic sales & costs platform V31 / V33 / V40 |
| C | Screen modules | `ui/*.js` history | 21 screens (all present today) |
| D | KOSIF Audit Studio (v5 + classic + lab) | `ui/audit/` | 8 screens |
| E | React UI v1 | `app/src/components` (deleted) | 18 views, all duplicates of A |
| F | React "zero-legacy" rebuild | `backup/react-rebuild-before-merge` | 36 capabilities |
| G | Grand Fusion OS (preview `97c54986`) | `rebuild/grand-fusion-complete-sol-20260925` | 49 capabilities / 49 tested engines |

Legend — ✅ present in S.kosif · 🟡 partial · ➕ added in this round · ⛔ dropped on purpose (reason given).

## Operations and sales

| Capability | Sources | S.kosif |
|---|---|---|
| Command center / daily decisions | A, F, G | ✅ `dash`, `decision` |
| Orders & collections, Tabby settlements | A, E, F, G | ✅ `commerce` |
| Customers 360, imports | A, E, F, G | ✅ `customers` |
| **Customer follow-up (daily call lists, contact log, daily achievement report, priority list)** | B (CRM V8.2) | ➕ `followup` |
| **Tasks with due date / priority** | B (V40), CRM | ➕ `tasks` |
| Tax invoice / POS, split payments, QR (TLV) verify | C, F, G | ✅ `zatca` |
| **Sales order posting to the ledger** | G | ➕ in `journals` (post from sales) |
| Offers & catalogue, WhatsApp | C, G | ✅ `offers` |
| B2B credit, subscriptions | C, F, G | ✅ `b2bcredit`, `operations` |
| Events / catering (BBQ), shifts, dry aging | C, F, G | ✅ `operations` |
| Sales by channel | B (V40) | ✅ `economics` + `salesintel` |

## Stock, production, procurement

| Capability | Sources | S.kosif |
|---|---|---|
| Inventory, movements, counts, expiry FIFO | C, F, G | ✅ `inventory` (+ ERP+) |
| Traceability & cold chain | C, G | ✅ `traceability` |
| Blending & production orders | C, F, G | ✅ `blending` |
| Carcass economics, butcher yield, NRV | A, C, G | ✅ `carcass`, `yieldlab`, `nrv` |
| Suppliers & receipts | A, C, F, G | ✅ `suppliers` |
| **Purchase orders (lines, approval, receipt)** | G (C had a WhatsApp composer only) | ➕ `purchasing` |
| **Receiving inspection (temperature, quality, accept/reject)** | G | ➕ `purchasing` |
| **Supplier price list with effective dates** | B (V40) | ➕ `purchasing` |

## Finance and accounting

| Capability | Sources | S.kosif |
|---|---|---|
| Cash flow, income statement | C, F, G | ✅ `cash` (+ ERP+) |
| Receivables aging | C, F, G | ✅ `receivables` |
| Payables | C, F, G | ✅ ERP+ in `suppliers`/`cash` |
| **Chart of accounts** | G | ➕ `ledger` |
| **Journal entries (balanced double entry), general ledger** | G | ➕ `ledger` |
| **Native trial balance** (was only a bridge into the audit studio) | D, G | ➕ `ledger` |
| **Bank / settlement reconciliation** | G | ➕ `ledger` |
| **Companies & fiscal periods** | G | ➕ `companies` |

## Pricing and catalogue — all ✅

Items, pricing engine, strict kernel, box builder, analyzer, compare, costs, memo/approval, archive, labels, scanner, Excel reconciliation, smart matching (A, C, E, F, G).

## Intelligence and reports

| Capability | Sources | S.kosif |
|---|---|---|
| Jev decisions, decision center | A, C, F, G | ✅ `jev`, `decision` |
| **Jev council (several voters, weighted decision)** | G | ➕ `council` |
| Sales / customer intelligence, finance, risk, sensitivity | A, C, F, G | ✅ |
| Executive reports, print center | A, C, G | ✅ `execreports`, `reports` |
| **Export center (every entity to CSV / full JSON)** | G | ➕ `exports` |

## Audit and assurance — all ✅ (D)

Planning, materiality, journal tests, Benford, sampling, PBC, evidence, issues, adjustments, reviewer council, workpapers, standards lab, report.

## System — all ✅

Roles & permissions, audit trail, governance, health, cloud workspace (Capabilities v2), full backup with dry-run restore and rollback, appearance.

## Dropped on purpose

| Capability | Source | Reason |
|---|---|---|
| `magiclab` (animated sheep / sky) | A | decorative only, no business value |
| `capabilities` (v19.7 task router) | A | replaced by the registry + Ctrl+K palette + Jev |
| `unified` module hub (opened the five apps in a frame) | A | nested-app pattern; its apps' capabilities are listed above |
| core `recon` | A | same job as `excelrecon` |
| Legacy React UIs (E, F) and Grand Fusion screens | E, F, G | presentation only; Grand Fusion **engines** are reused (`app/src/engine/fusion`, tested in CI) |
| Per-app style editors, background animations (V40) | B | one design system with themes instead |
