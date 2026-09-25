# Data Flow Map

## Sources of truth
- Encrypted payload/private blocks: protected seed/business data shipped with production.
- IndexedDB `aghnam-app-v7`: high-volume browser records including customers/sales lines where available.
- Existing localStorage keys: capability-specific operational state.
- Capabilities v2 D1: optional protected server workspace state when configured.

## Read paths
Catalog → offers / inventory / suppliers / intelligence.
Sales + customers → reports / command center / audit bridge.
Supplier batches + expenses → cash / yield / reports / audit bridge.
Ledger → collections / B2B credit / command center.
Cold-chain + traceability → quality / reports / command center.

## Write paths
Each capability continues writing through its existing verified store/service in this tranche. The Fusion Shell is presentation/orchestration only and does not introduce a competing data store.

## Safety
No silent duplication of core records. No storage-key rename. Future schema consolidation requires explicit migration, dry run, validation and rollback.
