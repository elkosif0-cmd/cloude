# SYSTEM CAPABILITY INVENTORY

Baseline: `ccd155f9bd2cbe74632607a9fcdf3d12956595d4`

Status values: Keep / Merge / Rebuild / Remove after verification.

| ID | Capability | Module | Current location | Data used | Dependencies | Status | Decision |
|---|---|---|---|---|---|---|---|
| CAP-001 | Unlock encrypted business dataset | Security | unlock.html | secure seed | WebCrypto, PBKDF2, ChaCha20, HMAC | Working | Keep core / Rebuild UI |
| CAP-002 | Restore encrypted private catalog | Security/Data | private_blocks.py + payload | catalog/private blocks | build secret | Working | Keep data path / remove legacy UI dependency |
| CAP-003 | Company/settings | System | app storage + legacy core | settings | localStorage | Working | Rebuild |
| CAP-004 | Theme/light-dark | System | shell.js / app | preferences | localStorage | Duplicate | Merge |
| CAP-005 | Backup/export local data | System | shell.js + app/backup | local stores | Blob/FileReader | Working | Merge/Rebuild |
| CAP-006 | Restore backup | System | app/backup + shell | backup JSON | validation | Working | Rebuild |
| CAP-007 | Audit log of business changes | Governance | app/localStorage | audit entries | business services | Working | Keep/Rebuild |
| CAP-008 | Role/capability permissions | System | ERP+/Capabilities v2 | roles | RBAC | Partial | Merge/Rebuild |
| CAP-009 | Cloudflare Access authentication | System | capabilities-v2 Worker | JWT | Access JWK | Ready | Keep |
| CAP-010 | Workspace revision sync | System | capabilities-v2 Worker | workspace snapshot | D1 | Ready | Keep |
| CAP-011 | Workspace integrity chain | System | capabilities-v2 Worker | audit chain | SHA-256 | Ready | Keep |
| CAP-012 | Provider registry | Intelligence/System | capabilities-v2 | provider config | Workers | Ready | Keep |
| CAP-013 | Raw item create/edit/archive | Catalog | app + legacy catalog | raw items | storage | Working | Rebuild |
| CAP-014 | Raw item purchase VAT extraction | Pricing | corePricing | item cost | pricing engine | Tested | Keep |
| CAP-015 | Waste/yield costing | Pricing | corePricing | raw item | pricing engine | Tested | Keep |
| CAP-016 | Break-even calculation | Pricing | corePricing | costs/prices | pricing engine | Tested | Keep |
| CAP-017 | Target price calculation | Pricing | corePricing | margin rules | pricing engine | Tested | Keep |
| CAP-018 | Price rounding policies | Pricing | corePricing | price | pricing engine | Tested | Keep |
| CAP-019 | Box create/edit | Catalog | app | box recipes | storage | Working | Rebuild |
| CAP-020 | Nested boxes | Pricing | corePricing | box graph | dependency guard | Tested | Keep |
| CAP-021 | Circular recipe detection | Pricing | corePricing | box graph | engine | Tested | Keep |
| CAP-022 | Packaging cost | Pricing | corePricing | packaging | engine | Tested | Keep |
| CAP-023 | Linked expense allocation | Pricing | corePricing | expenses | engine | Tested | Keep |
| CAP-024 | Price approval memo | Governance | app | memos/catalog | audit log | Working | Rebuild |
| CAP-025 | Apply approved price changes | Governance | app | approved memo | catalog repo | Working | Rebuild |
| CAP-026 | Price comparison/simulation | Analysis | app/tools | items | pricing engine | Working | Rebuild |
| CAP-027 | Sensitivity analysis | Analysis | tools/ERP+ | cost/price | pricing engine | Working | Merge/Rebuild |
| CAP-028 | Carcass dressing percentage | Meat economics | meatOps | live/carcass kg | engine | Tested | Keep |
| CAP-029 | Carcass cost allocation | Meat economics | meatOps | cuts | engine | Tested | Keep |
| CAP-030 | NRV allocation | Meat economics | corePricing | cuts/joint cost | engine | Tested | Keep |
| CAP-031 | Yield trial | Meat economics | corePricing | input/usable kg | engine | Tested | Keep |
| CAP-032 | Customer master | Sales/CRM | app/IndexedDB | customers | repository | Working | Rebuild |
| CAP-033 | Customer create/edit | Sales/CRM | app | customers | repository | Working | Rebuild |
| CAP-034 | Customer search/filter | Sales/CRM | app/legacy | customers | search service | Working | Rebuild |
| CAP-035 | City/district analytics | CRM | legacy/app | customers | analytics | Working | Rebuild |
| CAP-036 | Customer purchase history | CRM | app/legacy | orders/sales | repository | Working | Rebuild |
| CAP-037 | Customer statement | Finance/CRM | legacy/ERP+ | orders/payments | finance service | Partial | Rebuild |
| CAP-038 | RFM/customer intelligence | Intelligence | app | sales/customers | analytics | Working | Rebuild |
| CAP-039 | Churn radar | Intelligence | reports.js | sales/customers | real-data adapter | Working | Rebuild |
| CAP-040 | Orders create/update | Sales | app | orders/items | repository | Working | Rebuild |
| CAP-041 | Payment status/remaining amount | Sales/Finance | app | orders/payments | finance | Working | Rebuild |
| CAP-042 | Split payments POS | Sales/Finance | enterprise.js | invoice/payment state | ZATCA UI | New | Rebuild |
| CAP-043 | ZATCA simplified invoice/QR | Sales | enterprise.js | invoice | TLV/QR | Working | Rebuild |
| CAP-044 | Thermal receipt print | Sales | enterprise.js | invoice | browser print | Working | Rebuild |
| CAP-045 | WhatsApp invoice share | Sales | enterprise.js | invoice | wa.me | Working | Rebuild |
| CAP-046 | Credit customers ledger | Sales/Finance | enterprise.js | B2B credit | local store | Working | Rebuild |
| CAP-047 | Receivables ageing | Finance | meatOps | receivables | engine | Tested | Keep/Rebuild |
| CAP-048 | Inventory reorder planning | Inventory | inventory.js | stock/velocity | formula | Working | Rebuild |
| CAP-049 | Inventory movement ledger | Inventory | ERP+ | movements | local store | Working | Rebuild |
| CAP-050 | Physical stock count | Inventory | ERP+ | count lines | ledger | Working | Rebuild |
| CAP-051 | Count variance/adjustment | Inventory | ERP+ | count vs book | ledger | Working | Rebuild |
| CAP-052 | Reorder threshold | Inventory | ERP+ | stock/min | repo | Working | Rebuild |
| CAP-053 | Expiry/FIFO radar | Inventory | inventory.js | lots/expiry | date logic | New | Rebuild |
| CAP-054 | Supplier master/batches | Procurement | supply.js | batches | local store | Working | Rebuild |
| CAP-055 | Actual vs agreed waste | Procurement | supply.js | batches | batch calc | Working | Rebuild |
| CAP-056 | Supplier comparison | Procurement | supply.js | batches/catalog | analytics | Working | Rebuild |
| CAP-057 | Purchase order composer | Procurement | supply.js/operations | supplier/items | WhatsApp | Working | Merge/Rebuild |
| CAP-058 | Receiving inspection | Procurement | operations.js | PO/received data | rules | Working | Rebuild |
| CAP-059 | Monthly cash flow | Finance | supply.js/ERP+ | sales/purchases/flows | IDB/local | Duplicate | Merge/Rebuild |
| CAP-060 | Seasonal cash forecast | Finance | supply.js | history/season factors | Hijri calendar | Working | Rebuild |
| CAP-061 | Manual finance flows | Finance | ERP+ | receipts/payments | local store | Working | Rebuild |
| CAP-062 | Supplier payables | Finance | ERP+ | payable rows | local store | Working | Rebuild |
| CAP-063 | Income statement builder | Finance | ERP+ | sales/materials/expenses | pricing/catalog | Working | Rebuild |
| CAP-064 | Material COGS from sold quantity | Finance | ERP+ | item qty/cost | catalog | Working | Rebuild |
| CAP-065 | Other expenses entry | Finance | ERP+/app | expenses | local store | Working | Merge/Rebuild |
| CAP-066 | VAT draft report | Reports | reports.js | transactions | report logic | Working | Rebuild |
| CAP-067 | End-of-day report | Reports | reports.js | real sales/customers | report logic | Working | Rebuild |
| CAP-068 | Trend charts | Reports | reports.js | sales | SVG | New | Rebuild |
| CAP-069 | CSV export | Utilities | shell/modules | tables | safe CSV | Working | Keep/Rebuild |
| CAP-070 | Excel/import reconciliation | Utilities | tools/app | imports | parsing/matching | Working | Rebuild |
| CAP-071 | Product matching | Utilities/AI | smartmatch | descriptions/catalog | NLP/fuzzy | Working | Rebuild |
| CAP-072 | Barcode/label generation | Operations | enterprise.js | product/label | Code128/SVG | Working | Rebuild |
| CAP-073 | Barcode scanner | Operations | enterprise.js | camera/barcode | browser APIs | Working | Rebuild |
| CAP-074 | Cold-chain traceability | Operations | enterprise.js | readings | local store | Working | Rebuild |
| CAP-075 | Culinary guide | Operations | enterprise.js | cuts | reference data | Working | Rebuild |
| CAP-076 | Meat blending calculator | Production | enterprise.js | recipe/cost | calculator | Working | Rebuild |
| CAP-077 | Batch work order print | Production | enterprise.js | blend state | print | New | Rebuild |
| CAP-078 | Catering/BBQ calculator | Operations | operations.js | guest/recipe | calculator | Working | Rebuild |
| CAP-079 | Butcher yield benchmark | Production | operations.js | shifts/yield | analytics | Working | Rebuild |
| CAP-080 | Meat subscriptions | Sales/Operations | operations.js | subscriptions | local store | Working | Rebuild |
| CAP-081 | Dry-aging chamber | Production | operations.js | aging lots | aging calc | New | Rebuild |
| CAP-082 | Jev yes/no decision | Intelligence | jev.js | redacted context | Worker | Working | Rebuild |
| CAP-083 | Jev choice | Intelligence | jev.js | redacted context | Worker | Working | Rebuild |
| CAP-084 | Jev score | Intelligence | jev.js | redacted context | Worker | Working | Rebuild |
| CAP-085 | Jev decision history | Intelligence | jev.js | decision log | local store | Working | Rebuild |
| CAP-086 | Jev daily monitor | Intelligence | ERP+ | aggregated metrics | Jev | Working | Rebuild |
| CAP-087 | Jev scenario simulation | Intelligence | ERP+ | cost/price/margin | deterministic + Jev | Working | Rebuild |
| CAP-088 | Data redaction before AI | Security | shell.js | text/context | regex policy | Working | Keep |
| CAP-089 | Audit engagement workspace | Audit | ui/audit | audit data | audit studio | Working | Rebuild shell / preserve engine |
| CAP-090 | Audit documents/evidence | Audit | ui/audit + bridge | source records | audit intake | Working | Rebuild |
| CAP-091 | Audit issues | Audit | ui/audit | issues | audit workflow | Working | Rebuild |
| CAP-092 | Audit reviewer council | Audit/AI | ui/audit | evidence/issues | council | Working | Rebuild |
| CAP-093 | Statements/entries | Audit/Accounting | ui/audit | TB/GL | audit engine | Working | Rebuild |
| CAP-094 | Audit report/issuance | Audit | ui/audit | engagement | report engine | Working | Rebuild |
| CAP-095 | Benford analysis | Audit analytics | ui/audit/classic | GL values | analytics | Working | Preserve/Rebuild |
| CAP-096 | Sampling | Audit analytics | ui/audit/classic | population | analytics | Working | Preserve/Rebuild |
| CAP-097 | Journal-entry tests | Audit analytics | ui/audit/classic | GL | analytics | Working | Preserve/Rebuild |
| CAP-098 | Standards research lab | Audit research | ui/audit/lab | standards corpus | lab | Working | Preserve/Rebuild |
| CAP-099 | Unified search | Navigation | partial top search | mixed entities | no unified service | Partial | Rebuild |
| CAP-100 | Command palette | Navigation | not canonical | capabilities/entities | registry | Missing | Build |
| CAP-101 | Central error handling | Platform | fragmented | errors | toast/console | Partial | Build |
| CAP-102 | Offline state handling | Platform | implicit local-first | local stores | service worker | Partial | Build |
| CAP-103 | Update/service-worker cache | Platform | shell/build | assets | SW | Working | Keep/Rebuild |
| CAP-104 | Mobile drawer/safe-area | Platform | fragmented | UI | CSS | Partial | Rebuild |
| CAP-105 | Capability registry | Platform | view registry/Capabilities v2 | capability metadata | shell | Partial | Build |
| CAP-106 | Event bus | Platform | implicit callbacks | domain events | services | Missing | Build |
| CAP-107 | Migration diagnostics | Platform | migrations/backup | old stores | adapters | Partial | Build |
| CAP-108 | Golden capability coverage gate | QA | workflow | registry/tests | CI | Missing | Build |

## Coverage rule

No legacy presentation source is deleted until each row marked Keep/Merge/Rebuild has:
1. a target owner module,
2. implemented status,
3. automated or manual verification evidence,
4. a migration/data-preservation result when it writes data.
