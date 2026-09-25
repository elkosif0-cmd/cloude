# Capability Coverage Matrix

| Old Capability | New Domain | Status | Verification |
|---|---|---|---|
| Core dashboard | Command | Fusion implemented | bundle marker + runtime hook |
| Daily/Advanced menu | Unified domain navigation | Fusion implemented | existing nav nodes moved, handlers preserved |
| Offers/catalog | Commercial Operations | Preserved | existing screen registration |
| Inventory | Commercial Operations | Preserved | existing screen registration |
| Suppliers | Commercial Operations | Preserved | existing screen registration |
| Operations | Commercial Operations | Preserved | existing screen registration |
| Cash/receivables | Finance & Compliance | Preserved | existing screen registration |
| ZATCA/B2B/reports | Finance & Compliance | Preserved | existing screen registration |
| Sensitivity/Jev/reconciliation | Intelligence | Preserved | existing screen registration |
| Labels/scanner/traceability/blending/culinary | Production & Quality | Preserved | existing screen registration |
| Audit studio stages | Accounting & Assurance | Fused | same lazy apps, nested global chrome suppressed |
| Audit analytics/lab | Accounting & Assurance | Fused | same engines, contextual surface |
| Capabilities v2 | System | Preserved | Worker/schema CI markers |
| Settings/backup/health | System | Preserved | core hooks + shell |
| Global search/command | Command | New implemented | Fusion bundle marker |

“Preserved” is not permission to purge the old implementation. Physical removal requires functional parity tests for that capability.
