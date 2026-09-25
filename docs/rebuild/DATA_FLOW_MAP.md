# DATA FLOW MAP

The rebuild changes **no storage key, schema or calculation**. All flows below are preserved.

## Stores

| Store | Owner | Written by | Read by |
|---|---|---|---|
| `aghnam-pricing-v3` (localStorage) | core Store | catalog, builder, costs, memo, settings, import | Engine → every pricing view, `SKosifCore.catalog()` → offers, kernel, labels, palette |
| `aghnam-pricing-ui-v3`, `-prints-v1`, `aghnam-v12-*`, `aghnam-v15-*`, `aghnam-v18-*`, `aghnam-v19-*`, `aghnam-econ-fees-v1`, `aghnam-typesafe-v2`, `aghnam-district-alias-v1` | core | core views | core views |
| IndexedDB `aghnam-app-v7` (12 stores) | core AghnamDB/DataHub | customer/sales imports, commerce | customers, intelligence, salesintel, economics, execreports, audit bridge |
| `skosif_v31_supplier_batches`, `skosif_v31_monthly_opex`, `skosif_v33_season_factors` | ui/supply.js | suppliers, cash | execreports (yield), audit bridge (TB) |
| `skosif_v32_offers`, `_cart`, `_cols`, `_cust_*` | ui/offers.js | offers, scanner, POS | zatca |
| `skosif_v38_ledger`, `_batches`, `_coldchain` | ui/enterprise.js | b2bcredit, traceability | Command Center, execreports, audit bridge |
| `skosif_ops_*` | ui/operations.js | operations | operations |
| `aghnam_v29_inventory`, `skosif_inv_expiry_batches` | ui/inventory.js | inventory | jev context, erp-plus |
| `skosif_erp_*`, `skosif_income_statements_v1` | ui/erp-plus.js | inventory/cash/suppliers extensions | capabilities-v2, audit bridge |
| `skosif_rep_pl` | ui/reports.js | execreports | execreports |
| `skosif_ar_paste`, `skosif_v34_product_aliases`, `skosif_v33_decision` | meatops / smartmatch / tools | their screens | their screens |
| `aghnam_v29_jev_log`, `skosif_jev_draft`, session `aghnamJevSession` | ui/jev.js | jev | jev, health |
| `skosif_cap_v2_*` | capabilities-v2 | capabilitiesv2 | capabilitiesv2 |
| **new** `skosif_prefs` | ui/layouts/shell.js | settings (appearance) | shell |
| **new** `skosif_audit_trail` | ui/core/audit.js | bus events | governance |
| **new** `skosif_error_log` | ui/core/errors.js | error handler | health |
| **new** `skosif_palette_recent` | palette | palette | palette |
| migrated `aghnam-v21-density` → `skosif_prefs.density`; `skosif_theme*`, `aghnam-v21-accent/tour/whatsnew/ux-v1` → removed on first run (UI-only preferences, no business data) |

## Flows

```
Excel/CSV ─▶ DataHub.import ─▶ IDB(customers, sales_lines, orders…) ─▶ intelligence / salesintel / execreports / audit TB
Price edit ─▶ S (Store) ─▶ Engine.compute ─▶ views; logEvent ─▶ archive; memo ─▶ approve ─▶ price snapshot (IDB)
Supplier batch ─▶ skosif_v31_supplier_batches ─▶ yield in execreports ─▶ TB builder (auditdocs)
UI events ─▶ SK.bus ─▶ SK.audit (trail)          Errors ─▶ SK.errors ─▶ toast + skosif_error_log ─▶ health
Aggregate context (no PII, SK.redact) ─▶ jev-api worker ─▶ JEV_BRIDGE ─▶ structured decision
```
