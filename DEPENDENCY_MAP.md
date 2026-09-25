# Dependency Map

## Canonical direction
```
Encrypted / Local / D1 Data
        ↓
Domain calculations and business rules
        ↓
Storage / API / integration services
        ↓
Capabilities
        ↓
Unified product navigation + contextual workspaces
        ↓
Presentation components
```

## Production contracts
- Encrypted seed/private blocks → unlock flow → core runtime.
- `SKosifCore.catalog()` → catalog consumers such as offers, inventory, supply and analytics.
- IndexedDB `aghnam-app-v7` → customers/sales lines → reports and audit bridge.
- Supplier batches → cash/report/yield/audit bridge.
- Cold-chain and traceability stores → command center/reporting/quality workflows.
- Ledger → receivables/B2B/command center/audit bridge.
- Pricing core → offers/sensitivity/box and margin decisions.
- Audit bridge → S.kosif operational books → reviewable TB intake → audit workspace.
- Capabilities v2 Worker → Access identity → role authorization → workspace revisions → audit integrity chain.

## Deletion rule
A UI component may be removed only when its capability has an alternate registered path and its data/service dependencies remain reachable and tested. “No menu link” is not evidence of dead code.
