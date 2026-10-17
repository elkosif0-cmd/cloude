# MIGRATION PLAN

## Safety net

1. **Rollback point**: branch `legacy-before-zero-ui-rebuild` (= `ccd155f`). Cloudflare Pages can redeploy it in one step; git `revert` of the rebuild merge also restores it.
2. **No data migration of business data**: keys, IndexedDB schema and calculations are unchanged (see DATA_FLOW_MAP.md). The only migration is UI preferences:
   - `aghnam-v21-density` → `skosif_prefs.density`
   - `skosif_theme`/`skosif_theme_dark`/`skosif_theme_light`/`aghnam-v12-theme` → `skosif_prefs.appearance` (`light` | `dark` | `auto`), dark themes map to `dark`.
   - Removed UI-only keys: `aghnam-v21-accent`, `aghnam-v21-tour`, `aghnam-v21-whatsnew`, `aghnam-v21-ux-v1`, `aghnam-v203-magic-v1`.
   The migration is idempotent, runs once (`skosif_prefs.migrated = 1`) and never touches business keys.
3. **User-level backup / restore** (`SK.store`):
   - `backup()` — every app localStorage key (prefixes `aghnam`, `skosif`, `kosif`) + every IndexedDB store of `aghnam-app-v7`, with counts and a SHA-256 of the payload.
   - `restore(file, {dryRun:true})` — validates format and checksum and returns a preview (keys added / changed / unchanged, IDB rows per store) without writing.
   - `restore(file)` — takes an automatic in-memory + downloadable **pre-restore snapshot**, then writes; `rollback()` re-applies the snapshot.
4. **Coverage gate**: `tools/capability_docs.py --check` and the CI view-id check must pass (52/52 screens registered) before any legacy layer is removed.

## Order (strangler)

| Step | What | Gate |
|---|---|---|
| 1 | Freeze legacy (branch) | done |
| 2 | Extract contracts (DEPENDENCY_MAP) + registry | 52/52 mapped |
| 3 | New design system + shell + core services loaded alongside | all screens render |
| 4 | Remove legacy layers from core payload (27 → 0 patch layers) | QA desktop + mobile, 0 console errors |
| 5 | Move features to `ui/features/`, core services to `ui/core/` | build + CI |
| 6 | Remove dead code (`app/` React UI, theme generator, fabricated samples) | tests green |
| 7 | Deploy, verify Cloudflare + CI | live deploy success |
