# System Capability Inventory

| ID | Capability | Module | Data Used | Dependencies | Status | Disposition |
|---|---|---|---|---|---|---|
| CAP-001 | Product/catalog pricing | core + pricing-core | encrypted catalog / pricing stores | SKosifCore, pricing kernel | Working | Keep + unify |
| CAP-002 | Offers/cart/catalog sharing | offers | catalog, offers, cart | pricing core | Working | Keep + merge into Commercial Operations |
| CAP-003 | Inventory reorder/expiry | inventory | inventory + expiry stores | catalog | Working | Keep + merge |
| CAP-004 | Suppliers/purchases | supply | supplier batches, master lists, IDB | catalog | Working | Keep + merge |
| CAP-005 | Cash flow | supply | sales, purchases, opex | IDB/local stores | Working | Keep + finance |
| CAP-006 | Receivables | meatops/ERP | ledger | customers | Working | Keep + finance |
| CAP-007 | ZATCA invoice | enterprise | catalog/transaction input | tax rules | Working | Keep + finance |
| CAP-008 | Labels/barcodes/scanner | enterprise | product/batch data | browser capabilities | Working | Keep + production |
| CAP-009 | Traceability/cold chain | enterprise | batch + cold-chain logs | local stores | Working | Keep + production |
| CAP-010 | Blending/culinary operations | enterprise | formulas/input | deterministic calculations | Working | Keep + production |
| CAP-011 | B2B credit | enterprise | ledger/customer inputs | customer records | Working | Keep + finance |
| CAP-012 | Executive/financial reports | reports | IDB sales/customers, supply, ledger | multiple modules | Working | Keep + unify |
| CAP-013 | Event/BBQ/PO/butchery/subscriptions | operations | ops stores | catalog/supply | Working | Keep + operations |
| CAP-014 | Sensitivity/decision support | tools | pricing/catalog | pricing engine | Working | Keep + intelligence |
| CAP-015 | Smart sales reconciliation | smartmatch | pasted sales + catalog + aliases | Arabic normalization | Working | Keep + intelligence |
| CAP-016 | Jev decision support | jev | redacted app context | Jev API | Working | Keep + contextual intelligence |
| CAP-017 | Capabilities/RBAC/workspaces/integrity | capabilities-v2 | config/workspace/D1 | Worker + Access optional | Working | Keep + system |
| CAP-018 | Audit engagement workspace | audit studio | engagement/doc/evidence state | lazy audit app | Working | Keep, remove nested chrome |
| CAP-019 | Audit analytics | audit classic | TB/journals/analytics | audit engine | Working | Keep, local context nav |
| CAP-020 | Standards research | audit lab | standards/research state | lab engine | Working | Keep, local context nav |
| CAP-021 | Settings/theme/backup/autolock | shell/core | local settings | browser storage | Working | Keep + system |
| CAP-022 | Unified command/search | fusion shell | navigation + local catalog/customer/order indexes | existing registered views | New | Implemented |
| CAP-023 | Unified command center | fusion shell | catalog, cold chain, expiry, ledger, supplier batches | existing stores | New | Implemented |

Pages are not treated as capabilities. This table is the migration control surface and must be expanded when additional hidden handlers or routes are discovered.
