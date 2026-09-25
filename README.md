# S.kosif — Fusion Operations & Decision OS

S.kosif is the production application shell for the encrypted business dataset and the unified operations, pricing, customer, reporting, governance and Jev decision modules.

- Production source branch: `main`
- Build command: `python3 build.py`
- Output directory: `dist`
- The full business dataset is committed only in encrypted form.
- The unlock password is not stored in this repository.
- PBKDF2-HMAC-SHA-256 derives independent encryption and authentication keys.
- The dataset uses ChaCha20 encryption plus HMAC-SHA-256 authentication.
- The browser decrypts the data only after the correct password is entered.
- Jev remains a decision-support layer; deterministic calculations are performed locally first.

## Layout

- `payload/` — the core app (one HTML file, gzip + base64 parts). Edit it with
  `python3 tools/payload.py decode core.html` → edit → `python3 tools/payload.py encode core.html`.
  The core owns the side menu (daily work / advanced tools), the view registry
  (`SKosifCore.registerView`) and a read-only data bridge (`SKosifCore.catalog()`).
- `ui/` — the S.kosif screens, bundled by `build.py` into `skosif.js` and `skosif.css`:
  `shell.js` (shared helpers, themes, auto-lock, updates), `jev.js`, `offers.js`,
  `inventory.js`, `supply.js`, `meatops.js`, `smartmatch.js`, `pricing-core.js`,
  `kernel.js`, `tools.js`, `enterprise.js`, `reports.js`, `erp-plus.js`, `operations.js`, and `capabilities-v2.js`. ERP+ extends the existing inventory, cash, supplier, report, Jev and settings screens; Capabilities v2 adds RBAC, workspace revisioning, integrity checks and optional D1 synchronization without floating controls. Each screen is a normal menu entry; there are no floating
  buttons, docks or overlay hubs.
- Themes: one theme system for the whole app (default «تراث الوادي» plus ten others), chosen in Settings.

## Accounting & audit

`ui/audit/` is generated from `kosif199022-jpg/kosif-audit-studio` by
`python3 tools/vendor_audit.py /path/to/kosif-audit-studio` (do not edit it by
hand). It holds three apps that open as S.kosif screens under «المحاسبة
والمراجعة», each inside its own Shadow DOM and loaded only on first use:
the v5 audit workspace (six screens), the analysis studio (Benford, sampling,
journal tests, agent, voice) and the standards research lab.
`ui/audit-bridge.js` registers the screens and builds a trial balance from the
app's sales, supplier shipments, expenses and credit customers for the
studio's intake (the user reviews the mapping before importing).
## Capabilities v2

The port from `kosif-stable-capabilities-v2` is implemented in `capabilities-v2/worker.js`, with its D1 schema in `capabilities-v2/schema.sql`. The in-app center uses a privacy-minimized local fallback until a protected Worker URL is configured. When connected, Cloudflare Access, tenant isolation, server RBAC, optimistic workspace revisions and the append-only integrity chain are enforced by the Worker.
