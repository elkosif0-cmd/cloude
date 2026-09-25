# SYSTEM AUDIT — S.kosif Zero-Legacy Reconstruction

Baseline commit: `ccd155f9bd2cbe74632607a9fcdf3d12956595d4`
Safety branch: `legacy-before-zero-ui-rebuild-20260925`
Rebuild branch: `rebuild/zero-legacy-ui-20260925`

## Executive finding

The product contains two useful layers mixed together:

1. **Valuable brain/data**: encrypted seed, private catalog, IndexedDB/localStorage business records, deterministic pricing/meat engines, Cloudflare workers, D1 capability backend, audit studio logic, import/export, report logic and operational workflows.
2. **Accumulated presentation**: a compressed legacy HTML payload plus many UI modules that register screens and contain a mixture of rendering, storage access and business rules.

The reconstruction freezes the legacy presentation and replaces it with a new React shell. The encrypted seed and private catalog remain encrypted and are exposed to the new application only after the existing unlock flow succeeds.

## Current production architecture

- `unlock.html`: PBKDF2-HMAC-SHA-256 + ChaCha20-IETF + HMAC verification.
- `secure/crypto.json` + encrypted seed parts: protected business seed.
- `payload/index.html.gz.b64.part*`: legacy UI/core shell currently used to generate `app-safe.html`.
- `private_blocks.py`: extracts private catalog and v25 data blocks and encrypts them during build.
- `ui/*.js/css`: feature screens registered through the legacy shell.
- `app/`: cleaner TypeScript/React domain engines and storage code; currently not the production presentation.
- `capabilities-v2/worker.js`: Cloudflare Access, RBAC, workspace revisions, D1 and integrity chain.
- `jev-api/worker.js`: server-side Jev bridge.
- `ui/audit/`: vendored audit applications.
- Cloudflare Pages project: `s-kosif`.

## Valuable core to preserve

### Deterministic engines
- VAT extraction and net/gross pricing.
- yield/markup waste methods.
- six rounding policies with floor invariants.
- raw item pricing.
- box pricing including nested boxes.
- circular dependency detection.
- NRV allocation.
- yield trials.
- carcass cost allocation and dressing percentage.
- receivables ageing.
- integer-halalah money boundaries.

### Business data
- company/settings/currencies/suppliers.
- raw items, boxes and recipes.
- expenses.
- orders, order lines, payments.
- customers and sales lines.
- approval memos and price rules.
- audit logs.
- product mappings/import sessions.
- inventory planning, movements/counts and expiry lots.
- supplier batches and waste measurements.
- finance flows/payables/income statements.
- operational records: POs, shifts, subscriptions, dry-aging lots.
- cold-chain/traceability records where actually recorded.
- capabilities workspace revisions and audit chain.

### Integrations
- Cloudflare Pages.
- Cloudflare Workers.
- Cloudflare Access.
- D1 capability storage.
- Jev Bridge.
- Excel/CSV import/export.
- PDF/print outputs.
- WhatsApp share links.
- QR/barcode generation.
- GitHub Actions production validation.

## Legacy risks discovered

- multiple data stores/names for similar domains.
- localStorage helpers reimplemented in several UI modules.
- business calculations inside render modules.
- legacy HTML payload owns navigation and view registry.
- presentation files combine UI, persistence, side effects and calculations.
- seeded/demo data exists in some modules and must not be presented as recorded facts.
- some features exist in both React app and production UI modules.
- historical UI names and concepts differ across modules.
- production build still reconstructs legacy HTML before adding newer screens.
- mobile behavior is implemented inconsistently across old screens.

## Reconstruction decision

Jev selected: **Strangler rebuild on an isolated branch with a frozen legacy snapshot, capability contracts, adapters, a new shell, then replace legacy only after coverage tests**.

The target production architecture is:

`Encrypted Bootstrap -> Migration Adapter -> Repositories -> Domain/Services -> Capability Registry -> New Design System -> New App Shell`

No legacy UI component is a dependency of the target shell.
