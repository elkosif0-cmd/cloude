# REBUILD PLAN — status

"KEEP THE BRAIN. KEEP THE DATA. REBUILD THE BODY."

## Target structure

```
ui/
  core/        sk.js bus.js errors.js store.js audit.js perm.js registry.js pwa.js capabilities.json
  ds/          tokens.css components.css shell.css
  layouts/     shell.js                (rail, nav, topbar, drawer, preferences)
  components/  palette.js states.js
  features/    command-center.js + one file per screen family (offers, inventory, supply, meatops,
               smartmatch, pricing-core, kernel, tools, enterprise, reports, erp-plus, operations,
               capabilities-v2, jev, audit-bridge) + their css
  audit/       vendored studio (lazy)
  art/         heritage art
tests/         e2e (Playwright) specs: every screen × desktop/mobile, journeys, console gate
app/src/engine unit tests (vitest) for the pricing and meat-ops engines
```

## Phases

| # | Phase | Status |
|---|---|---|
| 0 | Backup branch `legacy-before-zero-ui-rebuild` | ✅ |
| 1 | Discovery + 10 docs | ✅ |
| 2 | Registry `capabilities.json` (52/52) + generated docs | ✅ |
| 3 | Design system (tokens, components, shell) | ✅ |
| 4 | Core services: bus, errors, store (backup/dry-run/rollback), audit, perm, registry, states | ✅ |
| 5 | New shell: rail from registry, topbar, drawer, Ctrl+K palette, Command Center | ✅ |
| 6 | Purge 27 legacy layers from the core payload; move base CSS out of the payload | ✅ |
| 7 | Move features to `ui/features/`; delete `app/` React UI and theme generator | ✅ |
| 8 | Remove fabricated sample data; replace `alert/confirm` | ✅ |
| 9 | QA: 52 screens × desktop/mobile, journeys, console gate; deploy | ✅ on release |
| 10 | Next: rewrite core view templates (HTML strings inside the payload) screen by screen onto `ui/ds` components | planned — the brain and its view templates live in the same IIFE; each view moves out only with a golden test of its numbers |

## Validation gates (CI)

- `python3 tools/capability_docs.py --check`
- every capability id is registered in the built bundle
- no legacy layer marker (`v21-`, `v23-`, `v24-`, `V21UX`, `V21RAD`, `sk-theme-css`, …) in `dist/`
- no feature JS at the `ui/` root (features live in `ui/features/`)
- engines: `tsc` + `vitest`
