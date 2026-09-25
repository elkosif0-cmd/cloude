# Migration Plan

## Strategy: Strangler / Controlled Replacement

### Phase 0 — Safety
- Rollback branch: `legacy-before-zero-ui-rebuild-20260925`.
- No user-data schema changes during shell reconstruction.
- Preserve encrypted source and unlock flow.

### Phase 1 — Discovery
- Inventory capabilities and stores.
- Map dependencies and hidden integrations.
- Identify duplicate navigation/chrome.

### Phase 2 — Fusion Shell
- Introduce `ui/fusion-shell.js` and `ui/fusion.css` last in the production bundle.
- Reuse/move existing registered navigation buttons so handlers/permissions survive.
- Replace daily/advanced split with domain-based information architecture.
- Add local Command Palette.
- Replace dashboard decoration with operational Command Center.
- Suppress nested audit app chrome and keep audit stages as contextual navigation.

### Phase 3 — Feature Presentation Migration
For each domain: extract pure business logic → define adapter → rebuild UI → parity test → switch presentation.

### Phase 4 — Legacy Purge
Only after Core Capability Coverage = 100%:
- remove obsolete core menu markup,
- remove redundant audit chrome at source,
- consolidate CSS/tokens,
- remove duplicate components/routes/assets,
- update build to source only the new presentation.

## Rollback
If any Golden Test fails, do not remove old source and do not promote. Revert to the rollback branch/main prior commit. User/browser data is not mutated by the shell tranche.
