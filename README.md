# S.kosif — Operations & Decision OS

S.kosif is the production application for encrypted business operations, pricing, inventory, suppliers, customers, reporting, governance and Jev-assisted decisions.

## Canonical structure

The runtime is organized by responsibility instead of historical version numbers:

- `operations.*` — daily operations and executive workspace
- `catalog.*` — catalog and offers
- `pricing-core.js` + `pricing.*` — deterministic pricing
- `inventory.*` — inventory and Jev decision log
- `supply.*` — suppliers and cash flow
- `sales-matching.*` — Arabic sales matching and Pareto
- `meat-economics.*` — carcass economics and receivables aging
- `session-health.*` — browser/session diagnostics
- `motion.*` — optional adaptive motion
- `ux.*` + `shell.*` + `mobile.*` — navigation, themes, responsive UI
- `jev.*` + `jev-question.*` — decision-support UI
- `core-bridge.js` + `react-import.js` — build-time private-scope integration

The UI has two top-level workspaces: **العمل اليومي** and **أدوات متقدمة**. Floating launchers are intentionally not part of the canonical UI.

## Production

- Source branch: `main`
- Build command: `python3 build.py`
- Output directory: `dist`
- Cloudflare Pages project: `s-kosif`
- Production URL: `https://s-kosif.pages.dev`

## Security and calculation policy

- The full business dataset is committed only in encrypted form.
- The unlock password is not stored in this repository.
- PBKDF2-HMAC-SHA-256 derives independent encryption and authentication keys.
- The dataset uses authenticated encrypted storage and is decrypted in browser memory after unlock.
- Deterministic business calculations run locally first.
- Jev is used as decision support, not as the source of accounting or pricing calculations.
