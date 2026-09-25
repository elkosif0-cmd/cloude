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
  `kernel.js`, `tools.js`, `enterprise.js`, `reports.js`, `erp-plus.js`. ERP+ extends the existing inventory, cash, supplier, report, Jev and settings screens without adding floating controls. Each screen is a normal menu entry; there are no floating
  buttons, docks or overlay hubs.
- Themes: the base theme system plus six full-scene visual presets (nature, playful farm, science magazine, heritage, night valley and pastel), chosen in Settings.
