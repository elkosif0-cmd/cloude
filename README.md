# SQC — Smart Quality Control

![SQC — Smart Quality Control · AI-Powered Audit & Assurance Platform](ui/art/sqc-banner.jpg)

**SQC — Smart Quality Control** · منصة المراجعة والتأكيد المدعومة بالذكاء الاصطناعي (AI-Powered Audit & Assurance Platform).
The app was previously named S.kosif / KOSIF; storage keys and file names keep the old prefix so existing data keeps loading.

### AI audit and integrated reporting

- **Any AI provider:** Google Gemini, OpenAI or Anthropic Claude with the user's own key (`audit/ai-providers-engine.ts`,
  `ui/core/ai.js`) runs the review rounds, the reviewers' council, the final report and the report narrative.
- **The whole research bundle, page by page:** all 12,506 pages of the global financial & audit research bundle are
  classified into 54 section types; each of the 49 reports' structure and the patterns across them (KAM procedures,
  principal-risk categories, letter topics, APMs, audit-committee topics, auditor-report elements) live in
  `reports/global-corpus-engine.ts` and the «الحزمة كاملة» tab of the Global Audit Reference.
- **Integrated annual report:** `reports/narrative-engine.ts` + `ui/features/integrated-report.js` write the report to
  that structure — AI-drafted when a key is set, engine-drafted otherwise — check every figure in the prose against the
  company's numbers, and score the report against the bundle. One click runs the whole engagement: round → final
  report → integrated report. See `docs/research/GLOBAL_RESEARCH_BUNDLE_ar.md`.


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
- Navigation: four top-level gateways from `ui/core/capabilities.json`: **البرنامج المحاسبي الكامل · مساعد القوائم والتقارير · نظام المراجعة الذكي · الأدوات المساعدة المستقلة**. The legacy eight domains remain internal studios for compatibility, company scoping and deep links; the sidebar exposes the four gateways only. Hubs keep their ids, permissions and deep links.

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

## One system: council, demo data, templates, themes, preview (round 37)

- **AI audit council** (research «مجلس المراجعة الذكي») in «مركز المراجعة»: 1/3/5 members with independent
  opinions, mandatory citation of numbered evidence (unknown citations reject the opinion), a debate on
  disagreements, confidence per line × assertion (C = 0.5E + 0.3T + 0.2A) against materiality/risk
  thresholds, a coded stopping rule, eight engagement states, four human approvals, the six integrity checks,
  whole-journal tests (unusual entries, Benford, cut-off), the round report and the management letter
  (observation / effect / recommendation / response) — `confidence-engine.ts`, `council-engine.ts`,
  `ui/features/tb-council.js`.
- **One engagement** — the audit studio's six pages live as the «الاستوديو المتقدم» tab inside the engagement
  (`hidden` pages in the registry, deep links redirect there). The registry's `feeds` graph drives the
  «مسار العمل» strip on every screen; `SK.flow` sends any finding to tasks or the findings register.
  `docs/rebuild/CAPABILITY_BASELINE.txt` + CI guarantee no capability is lost.
- **Demo data** (`SK.demo`, `ui/core/demo.js`) — a fictional company fills empty sections only; every record is
  `demo:true`, a strip marks demo screens, one click removes them; a brand-new device fills itself once.
- **Import templates** (`SK.templates`) — 17 Excel templates (data + instructions sheets; CSV for the core's
  sales importer), a validating importer that appends, a header button on each screen, a list in exports.
- **Sales lab** (`sales-analytics-engine.ts`, `ui/features/sales-lab.js`) inside «ذكاء المبيعات».
- **Five looks** — aurora, vivid, oasis (each with night), graphite, onyx; live previews; view transitions;
  the KOSIF brand and letterhead in every look but the heritage ones.
- **In-app preview** (`SK.output`) — every print opens inside the app with page options and exports to
  PDF, Word, multi-sheet Excel (`SKXlsx.book`), HTML and share.
- **Evaluation** — Jev scores before/after in `docs/EVALUATION-ar.md`; `tools/ui_smoke.mjs` opens every screen on
  laptop and phone in CI.

## Global research bundle: benchmarks, notes and governance reports

The 12,506-page research bundle (49 annual reports, 10-Ks and 20-Fs from 15 countries, plus 30 official sources) was split
into 50 parts, read, and turned into working tools; every figure cites its bundle page and is machine-checked against it
(`docs/research/GLOBAL_RESEARCH_BUNDLE_ar.md`).

- **المرجع العالمي للمراجعة** (`auditbench`, in the standards hub): 96 key/critical audit matters by theme and sector, a
  materiality checker against the 7 disclosed cases (including Aramco, SAR 26.25bn = 3.7% of income before tax and zakat),
  13 ratios for 8 peer groups, auditors and tenure, and the 30 official sources — `audit/global-benchmarks-engine.ts`,
  `reports/peer-benchmarks-engine.ts`.
- **Engagement file › statements and reports** gains the full notes package (expenses by nature, zakat movement and an
  indicative base, IAS 7.44A, IFRS 7 credit/liquidity/interest risk, capital management with Aramco's gearing and ROACE,
  estimate sensitivities — `reports/notes-engine.ts`), the auditor's «نهجنا في المراجعة» section, the audit committee report,
  management's ICFR report with AS 2201 severity (`audit/governance-engine.ts`), and the global peer comparison.

## Fieldwork: from plan to sign-off (ISA 300 → 700)

The engagement file is a working audit, not a report generator: «العمل الميداني» holds the audit strategy, the
risk × assertion matrix (ISA 315), one working paper per area with its standard reference (A cash … T zakat), its
procedures — for a significant risk also those the research bundle's auditors performed on the same theme, with the
page — a monetary-unit sample size (ISA 530), the conclusion and a preparer → different-reviewer sign-off; lead
schedules show unadjusted → adjustments → final per account. «الإكمال» is the gate (ISA 450/560/570/580/220) the
report waits on. The report centre groups every document (statements, published reports, governance, analysis,
audit papers: planning memo, working-paper file, lead schedules, completion memo, representation letter); each opens
in the in-app preview before printing or exporting to PDF, Word, Excel or HTML — `audit/fieldwork-engine.ts`,
`ui/features/tb-fieldwork.js`.

## Live assistant, theme studio, charts, tables and printing

- `ui/features/assistant.js` (`SKosifAssistant`, `Ctrl/⌘+J` or the floating button) — a live chat that
  controls the whole app through 22 tools: open any screen, read the current screen (KPIs, sections, table
  rows, buttons — redacted), business summary, search, open an item, theme/night/accent/font/text size/
  contrast, daily/advanced, print, export the table (Excel/CSV/copy/print), tasks, the books → trial-balance
  review, palette actions, and clicking any button or filling any field on the screen. With the user's
  Gemini key it understands free and compound requests by function calling; without it, Arabic commands are
  understood on the device. Destructive steps (delete, clear, lock, restore) always ask first; permissions
  apply; the chat stays on the device (`skosif_chat_v1`, outside backup and transfer); voice input and read-aloud.
- Theme studio (الإعدادات ← المظهر): typeface (IBM Plex, Tajawal, Cairo, Almarai, Noto Kufi, Readex, Noto
  Naskh, system), text size, accent colour (presets or custom, contrast-corrected for buttons and night),
  corners, high contrast — applied as tokens over any look, so screens, charts and prints follow.
- `ui/components/charts.js` (`SKCharts`) — a categorical palette validated for colour-blind separation in
  light and night (`--sk-c1…8`), bars (grouped/stacked, 4px data ends), lines/areas with a crosshair,
  ranked horizontal bars, a waterfall bridge; legends hide/show series, every chart has a table view and
  PNG/SVG export. The TB review and the annual report show the revenue → net profit bridge, revenue by
  category, current vs prior and operating expenses.
- `ui/components/table.js` — every data table gains a totals row, compact rows, a sticky header, cards on
  phones and an export menu: Excel (`SKXlsx.write`: real .xlsx, right-to-left, frozen header, filter,
  numbers as numbers), CSV, copy for Excel, print with the letterhead.
- Printing (`SK.brandPrint`) — every print opens a preview first: paper, orientation, margins, size, grey,
  watermark, letterhead and page numbers, remembered per device; charts print with their own styles.

## iPhone & laptop

One app, one dataset, two form factors — see `docs/ROADMAP-ar.md` for what shipped and the idea backlog.

- `ui/core/device.js` (`SK.device`) — platform (iOS, iPadOS, macOS, Windows, Android), form factor,
  installed or in the browser; marks `<html data-device data-os data-standalone data-display>`; keeps the
  laptop install prompt and shows the iPhone «Add to Home Screen» steps; wraps the share sheet; opens deep
  links `?go=<screen>` / `?do=sale|search|item|keys` (manifest shortcuts, the iOS Shortcuts app, bookmarks).
- `ui/components/keys.js` (`SKosifKeys`) — laptop keyboard: `?` sheet, `Ctrl/⌘+B` compact rail,
  `Alt+1…9` domains, `[` `]` the pages of the hub (or the hubs of the domain), `G` + letter; matched by `KeyboardEvent.code` so an Arabic
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
after approval). Companies in Egypt are reviewed under the Egyptian Accounting Standards (income tax,
14% VAT, EGP). The «القوائم والتقارير» tab issues the documents in the form of Apple's and Amazon's
annual reports: an annual report on the 10-K form (Items 1, 1A, 3, 7, 7A, 8, 9A; MD&A with net sales by
category, products/services gross margin, operating expenses as % of net sales, zakat/tax provision,
liquidity, management-defined measures with reconciliations, critical estimates; notes for revenue,
PPE, balance-sheet details and debt), a results release, and the independent auditor's report with key
audit matters in the «وصف الأمر / كيف عالجنا الأمر في مراجعتنا» form (`reports/annual-report-engine.ts`,
`ui/features/report-docs.js`). Where every repository and file went: `docs/FUSION_ALL_REPOS_ar.md`.

## Capabilities v2

The port from `kosif-stable-capabilities-v2` is implemented in `capabilities-v2/worker.js`, with its D1 schema in `capabilities-v2/schema.sql`. The in-app center uses a privacy-minimized local fallback until a protected Worker URL is configured. When connected, Cloudflare Access, tenant isolation, server RBAC, optimistic workspace revisions and the append-only integrity chain are enforced by the Worker.
