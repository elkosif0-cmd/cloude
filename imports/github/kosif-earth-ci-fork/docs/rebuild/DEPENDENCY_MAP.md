# DEPENDENCY MAP

```
unlock.html ──(password → decrypt secure/*)──▶ app-safe.html
app-safe.html
 ├─ core IIFE (payload)           Engine · S · Store · AghnamDB · DataHub · VIEWS · ACT · go/render
 │    └─ exposes window.SKosifCore  { raws, catalog, registerView, onView, navIcon, go, view, mode, toast,
 │                                     signals, exceptions, stats, act, setAdvanced, errors }   (read-only bridge)
 ├─ skosif.css  = ui/ds/tokens.css → ui/ds/components.css → ui/ds/shell.css → feature css
 └─ skosif.js   (each module isolated in try/catch)
      ui/core/sk.js          window.SK helpers (esc, load/save, money, csv, redact, view, lock)   ← every feature
      ui/core/bus.js         SK.bus  (events)                                                     ← audit, shell, features
      ui/core/errors.js      SK.errors (window.onerror, unhandledrejection, report)               ← all
      ui/core/store.js       SK.store (keys, backup, dry-run restore, rollback, IDB read)          ← settings, reports
      ui/core/audit.js       SK.audit (trail)                                                      ← bus
      ui/core/perm.js        SK.perm (roles → caps → actions)                                      ← registry, shell
      ui/core/registry.js    SK.caps (capabilities.json)                                           ← shell, palette, perm
      ui/components/states.js SK.ui.state (loading/empty/error/offline/denied/partial)             ← features
      ui/layouts/shell.js    rail/nav/topbar/drawer/prefs                                          ← core #nav/#hdr contract
      ui/components/palette.js Ctrl+K                                                              ← registry, SKosifCore
      ui/features/command-center.js home                                                           ← SKosifCore.signals/exceptions
      ui/features/*.js       screens (offers, inventory, supply, meatops, smartmatch, pricing-core, kernel, tools,
                             enterprise, reports, erp-plus, operations, capabilities-v2, jev, audit-bridge)
 ├─ ui/audit/** (lazy ES modules, Shadow DOM)  ← audit-bridge.js
 └─ sw.js (cache by build hash)
Workers: jev-api/worker.js ⇄ JEV_BRIDGE service;  capabilities-v2/worker.js ⇄ D1 (schema.sql)
CI: .github/workflows/S.kosif.yml → tsc+vitest (app/src/engine) → build.py → dist checks → Cloudflare Pages (git-connected)
```

## Contracts the body must honour (from the brain)

| Contract | Provider | Consumers |
|---|---|---|
| DOM ids `#nav #modeseg #status-card #hdr #pg-title #pg-sub #biz-name #rail #scrim #view #pr-modal #pr-toasts` | core `paintChrome`, `render` | new shell (restyles, never rewrites) |
| `data-act` / `data-chg` / `data-inp` delegation | core `bindEvents` | every core view |
| `SKosifCore.registerView(id, {title, sub, icon, adv, render})` | core bridge | all features |
| localStorage / IDB keys | see DATA_FLOW_MAP.md | unchanged by the rebuild |

## Removed dependencies

`V21UX`, `V21RAD`, `V23Shell`, `SKosifNav`, organizer `MutationObserver`, `SKosifPalette.add` (kept as a no-op shim → palette reads the registry), `v12-theme` capture handler, theme CSS generator.
