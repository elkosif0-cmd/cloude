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

"Keep the brain, keep the data, rebuild the body" — see `docs/rebuild/` for the audit, the
capability inventory, the new information architecture and the rebuild plan.

- `payload/` — the brain: engine, state, IndexedDB, core screens and their actions (one HTML
  file, gzip + base64). Edit with `python3 tools/payload.py decode core.html` → edit →
  `python3 tools/payload.py encode core.html`. It holds no stylesheets and no shell layers; it
  exposes `window.SKosifCore` (view registry, read-only catalog, signals, exceptions, actions).
- `ui/core/capabilities.json` — the single list of screens (group, tier, roles, data). The
  menu, the command palette, permissions and `docs/rebuild/*CAPABILITY*.md`
  (`python3 tools/capability_docs.py`) are generated from it.
- `ui/ds/` — the design system «تراث الوادي»: `tokens.css` (light/dark, spacing, type),
  `components.css`, `elements.css`, `shell.css`.
- `ui/core/` — services: `sk.js` helpers, `bus.js` events, `errors.js` central error handling,
  `store.js` full backup with dry-run restore and rollback, `registry.js`, `perm.js`
  (role → capability → action), `audit.js` audit trail.
- `ui/layouts/shell.js` — rail/drawer, topbar, appearance, no-permission gate, update notice.
- `ui/components/` — `palette.js` (Ctrl+K / ⌘K / `/`), `states.js` (loading, empty, error,
  offline, no-permission, partial, success; inline validation).
- `ui/features/` — Command Center and every screen module (offers, inventory, supply, meat ops,
  matching, pricing core, kernel, tools, enterprise, reports, ERP+, operations, capabilities v2,
  Jev, audit bridge). `build.py` refuses UI files that are not wired into the bundle.
- `app/src/engine/fusion/` — tested engines for finance, procurement, sales, stock, audit and intelligence
  (from the Grand Fusion branch); `node tools/build_engines.mjs` compiles them to `ui/core/engines.js`
  (`window.SKEngines`), and CI checks the compiled file is current.
- `app/` — the strict TypeScript engines and their tests (run in CI).
- Navigation: 10 domains (مركز القيادة · المبيعات والعملاء · المخزون والإنتاج · المشتريات والموردون · المالية
  والمحاسبة · الكتالوج والتسعير · Jev والذكاء · التقارير والتحليلات · المراجعة والتأكيد · النظام والتكاملات),
  each screen daily or advanced; `docs/rebuild/CAPABILITY_COVERAGE_ALL_VERSIONS.md` lists every capability of every past version.

## Accounting & audit

`ui/audit/` is generated from `kosif199022-jpg/kosif-audit-studio` by
`python3 tools/vendor_audit.py /path/to/kosif-audit-studio` (do not edit it by
hand). It holds three apps that open as S.kosif screens under «المحاسبة
والمراجعة», each inside its own Shadow DOM and loaded only on first use:
the v5 audit workspace (six screens), the analysis studio (Benford, sampling,
journal tests, agent, voice) and the standards research lab.
`ui/features/audit-bridge.js` registers the screens and builds a trial balance from the
app's sales, supplier shipments, expenses and credit customers for the
studio's intake (the user reviews the mapping before importing).
## Capabilities v2

The port from `kosif-stable-capabilities-v2` is implemented in `capabilities-v2/worker.js`, with its D1 schema in `capabilities-v2/schema.sql`. The in-app center uses a privacy-minimized local fallback until a protected Worker URL is configured. When connected, Cloudflare Access, tenant isolation, server RBAC, optimistic workspace revisions and the append-only integrity chain are enforced by the Worker.
