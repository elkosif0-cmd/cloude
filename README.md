# S.kosif — KOSIF · مراجعة أذكى، ثقة أكبر

S.kosif (brand: **KOSIF**) is the production application shell for the encrypted business dataset and the
unified operations, pricing, customer, finance, audit & compliance, reporting, governance and Jev decision
modules — one offline-first app with the same data on the iPhone and the laptop, in the **KOSIF Luxe**
design (`docs/design/KOSIF-LUXE.md`, mockups in `docs/design/mockups/`). Roadmap and the Jev-scored value of
every next idea: `docs/ROADMAP-ar.md`.

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

## KOSIF Luxe

The approved KOSIF mockups as shared components (Jev chose the typeface and the phone tab bar; the sky
artwork was generated in Canva and redrawn as vector art):

- `ui/ds/tokens.css` (KOSIF look) + `ui/ds/luxe.css` — palette, IBM Plex Sans Arabic with tabular figures,
  top bar, page head, menus, notification rows, charts, heatmap, donut, KPI tiles with rings, table toolbar,
  status/severity pills, and the luxe finish of rail, cards, buttons and tables.
- `ui/layouts/topbar.js` (`SKosifTopbar`) — company ▾ · period ▾ (the ledger's active company/period) ·
  search ⌘K · bell with unread count · user name/title/avatar menu; page head with icon, title, English
  name (`en` in the registry) and the screen's actions.
- `ui/components/charts.js` (`SKCharts`) — grouped bars + line with tooltips, rings, 3×3 risk heatmap,
  donut, progress lists, sparklines; drawn only from the numbers passed in.
- `ui/components/table.js` (`SKosifTable`) — upgrades every data table in place: search, sortable headers,
  column picker, CSV export, pagination, ▲/▼ on change columns (opt out: `data-sk-plain`).
- Screens: Command Center (`command-center.js`, also `SKosifMetrics`), notification centre
  (`notifications.js`, `SKosifNotify`), risks & findings register (`risks.js`), executive report pack
  (`report-pack.js`, first tab of التقارير التنفيذية), the KOSIF print letterhead (`SK.brandPrint`) and the
  sign-in page (`unlock.html`).

## iPhone & laptop

One app, one dataset, two form factors — see `docs/ROADMAP-ar.md` for what shipped and the idea backlog.

- `ui/core/device.js` (`SK.device`) — platform (iOS, iPadOS, macOS, Windows, Android), form factor,
  installed or in the browser; marks `<html data-device data-os data-standalone data-display>`; keeps the
  laptop install prompt and shows the iPhone «Add to Home Screen» steps; wraps the share sheet; opens deep
  links `?go=<screen>` / `?do=sale|search|item|keys` (manifest shortcuts, the iOS Shortcuts app, bookmarks).
- `ui/components/keys.js` (`SKosifKeys`) — laptop keyboard: `?` sheet, `Ctrl/⌘+B` compact rail,
  `Alt+1…0` domains, `[` `]` sibling screens, `G` + letter; matched by `KeyboardEvent.code` so an Arabic
  layout works too.
- `ui/layouts/shell.js` — the phone bottom tab bar in every theme with user-chosen screens, edge swipe for
  the drawer, the compact rail, and a title strip for an installed window without a title bar.
- `ui/features/devices.js` — the «الأجهزة والمزامنة» screen: device status, the encrypted iPhone ⇄ laptop
  transfer (`skosif-transfer`: the full `SK.store.data()` backup, gzip, AES-GCM 256, PBKDF2-SHA-256 from a
  one-time transfer code; imported through the same dry-run + rollback restore), tab bar picker, shortcuts
  and quick links.
- Install guides shipped with the build: `INSTALL-iPHONE-ar.txt`, `INSTALL-LAPTOP-ar.txt`.

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
## Trial balance review (Gemini) and the accounting codex

«مراجعة ميزان المراجعة» (`ui/features/tb-review.js`) audits any company's trial balance: import
(.xlsx / CSV / paste), standards badges beside every account with the standard sheet (relation to the
account, requirements, audit procedures, IFRS for SMEs section, official source), the deterministic
reviewer (`audit/tb-review-engine.ts`), Gemini review rounds with the user's own key — document
requests, uploads, verdicts — until Gemini completes (`audit/ai-review-engine.ts`, `core/ai.js`),
balanced proposed adjusting entries, standards-compliance discussion, and IFRS 18 statements,
analysis and a derived ISA 705 opinion. «المدونة المحاسبية والمعايير» (`ui/features/codex.js`) keeps
the standards with their official sources and checks updates from the issuing bodies (applied only
after approval). Where every repository and file went: `docs/FUSION_ALL_REPOS_ar.md`.

## Capabilities v2

The port from `kosif-stable-capabilities-v2` is implemented in `capabilities-v2/worker.js`, with its D1 schema in `capabilities-v2/schema.sql`. The in-app center uses a privacy-minimized local fallback until a protected Worker URL is configured. When connected, Cloudflare Access, tenant isolation, server RBAC, optimistic workspace revisions and the append-only integrity chain are enforced by the Worker.
