# S.kosif — System Audit

## Scope
This audit covers the production path in `main`: encrypted payload → `build.py` → `dist/app-safe.html` plus the bundled `ui/` capabilities and lazy audit workspaces.

## Findings
- The production source of business data remains the encrypted payload and browser stores. No production-data schema is changed by this reconstruction tranche.
- `SKosifCore` is the runtime contract for view registration, navigation and read-only catalog access.
- `ui/*.js` contains working operational capabilities layered on the core: offers, inventory, supply, cash, receivables, Jev, pricing engines, reconciliation, ZATCA, traceability, reports, operations and governance.
- `capabilities-v2/` provides server-oriented RBAC, tenant/workspace revisioning, integrity checks and optional D1 synchronization.
- `ui/audit/` contains three vendored audit applications mounted in Shadow DOM. Their internal chrome is a major source of the “apps inside an app” experience.
- `app/` is a modern React/Vite implementation with useful domain/UI concepts, but it is not the production shell and does not yet cover the entire encrypted production runtime.

## Primary Risks
1. Hard-cutting production to `app/` would risk capability and encrypted-data regression.
2. Keeping multiple navigation systems preserves the fragmented product feel.
3. Duplicated style systems can conflict if allowed to own global chrome.
4. Client-side business stores must not be renamed or migrated without a reversible migration.

## Decision
Use Controlled Fusion:
1. keep the verified core and data contracts,
2. introduce one canonical information architecture and product shell,
3. move existing registered capability controls rather than recreate behavior,
4. suppress nested application chrome,
5. migrate feature presentation behind parity gates,
6. purge legacy presentation only after 100% capability coverage is verified.

## Data Safety
No user-data deletion, storage-key rename, D1 migration or production database mutation is included in this tranche. The pre-rebuild rollback branch is `legacy-before-zero-ui-rebuild-20260925`.
