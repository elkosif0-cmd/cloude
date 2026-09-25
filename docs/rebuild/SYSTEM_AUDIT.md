# SYSTEM AUDIT — S.kosif before the zero-legacy UI rebuild

Snapshot: `legacy-before-zero-ui-rebuild` (branch, commit `ccd155f`). Rollback = redeploy that branch.

## 1. What ships

| Layer | Where | Size | Notes |
|---|---|---|---|
| Core app (brain + legacy body) | `payload/index.html.gz.b64.part*` → `dist/app-safe.html` | 1.05 MB HTML | One IIFE: Engine, state `S`, IndexedDB `aghnam-app-v7`, DataHub, 20+ core views, ACT/CHG/INP handlers |
| Screen modules | `ui/*.js` → `dist/skosif.js` | ~410 KB | 16 modules, 25 screens, registered via `SKosifCore.registerView` |
| Styles | `ui/*.css` → `dist/skosif.css` + inline core styles | ~260 KB inline + ~90 KB | see §3 |
| Audit studio | `ui/audit/**` (vendored ES modules, Shadow DOM) | lazy | 8 screens |
| Private catalog | `secure/*` (ChaCha20+HMAC, PBKDF2) | — | decrypted by `unlock.html` with the Cloudflare/GitHub secret |
| Workers | `jev-api/worker.js`, `capabilities-v2/worker.js` | — | Jev decisions (service binding `jev-claude-bridge`); roles/D1 workspace |
| Unused React app | `app/src/{App.tsx,components,storage,data,...}` | ~200 KB | not built or shipped; only `app/src/engine/{corePricing,meatOps}` are tested in CI |

## 2. The brain (kept)

- `Engine.compute(S)` — raw/box costing, VAT, waste (yield/markup), margin base (gross/net), rounding, bands.
- Persistence: `Store` → localStorage `aghnam-pricing-v3` (+ ui `aghnam-pricing-ui-v3`, prints, rules, master lists…), IndexedDB `aghnam-app-v7` (12 stores: meta, customers, sales_lines, sales_descriptions, imports, import_errors, pricing_snapshots, orders, order_items, payments, ops_orders, customer_master_rows).
- DataHub (imports, matching, commerce metrics), PricingSnapshots, logEvent (price change log), memos (maker–checker), V17Runtime (error capture), v195 decision signals, v202 exception inbox.
- Module-owned data: ~35 localStorage keys (`skosif_*`, `aghnam_v29_*`) — see DATA_FLOW_MAP.md.
- Tested engines: `app/src/engine/corePricing` (browser mirror `ui/pricing-core.js`), `app/src/engine/meatOps`.

## 3. The body (legacy — replaced)

Core HTML carried **27 stacked style/script layers**, each patching the previous one:

| Layer | Kind | Size | Purpose → fate |
|---|---|---|---|
| base `<style>` | CSS | 97 KB | Apple-style components → moved to `ui/ds/components.css`, tokens re-pointed to the design system |
| v19.7 capability registry | CSS | 2 KB | → components.css |
| v19.10 JEV green hybrid | CSS | 10 KB | theme patch → **deleted** |
| v22 azea vertical light | CSS | 1 KB | theme patch → **deleted** |
| v20.2 shell | CSS | 0.6 KB | exception inbox list → components.css |
| v21 ultimate UX / unity / organizer / radiant | CSS | 23 KB | patches → **deleted** |
| v21 organizer | JS | 5 KB | nav regrouping via MutationObserver → **replaced** by `ui/layouts/shell.js` + registry |
| v21 radiant | JS | 7 KB | accent, density, zen, ripple, tour, pulse → density kept in prefs; the rest **deleted** |
| v21 UX | JS | 17 KB | Ctrl+K palette, splash, shortcuts sheet, what's-new, calculator → **rebuilt** as `ui/components/palette.js` |
| v21 markup | HTML | 5 KB | splash, palette, sheets, zen button, tour → **deleted** |
| v23 Falr/Tourigo | CSS | 30 KB | theme patch → **deleted** |
| v23 shell | JS | 4 KB | top search, fake icons/avatar, page head → **deleted** (palette + new topbar) |
| v26 iOS | CSS+JS | 1 KB | standalone class, SW registration → `ui/core/pwa.js` |
| v27, v27.1, v27.2, v28, v29, v30 | CSS+JS | 6 KB | iPhone flicker/scroll patches → **deleted**; new shell uses document scrolling |
| `ui/shell.js` themes | JS→CSS | 12 themes | `!important` overrides → **replaced** by one design system (light/dark) |

## 4. Findings

1. **Patches over patches**: 27 layers, 4 separate "shell" implementations, 3 palettes/searches, 2 backup implementations (core + settings card).
2. **Duplicated navigation truth**: `NAV_OPS/NAV_AN/NAV_ADV` (core), organizer `META/DAILY/ADVANCED`, v21 `VIEWS` palette list, erp-plus `ROLES` — four lists of the same screens.
3. **Fabricated data** (added by another agent in `ccd155f`): sample expiry lots, sample dry-aging pieces, fixed weekly sales chart and sector split in executive reports. Violates "no fabricated data shown as real" → removed.
4. **False claim**: backup card said data is "encrypted and secured in the browser" — localStorage is not encrypted → removed.
5. `alert()` in `ui/operations.js`; `confirm()` in 7 places → routed through the central dialog/toast.
6. `app/` React UI is dead code (not built, not shipped) and carries a plaintext seed catalog → removed; tested engines kept.
7. Roles hide nav buttons only; no action-level check → permission model with actions + no-permission state.
8. No audit trail outside price changes → `ui/core/audit.js`.

## 5. Console baseline (before)

52 screens × desktop/mobile: 0 errors at `6add8c2`; `ccd155f` adds three screens with sample data (no errors).
