# MIGRATION PLAN

## Safety point

- immutable safety branch: `legacy-before-zero-ui-rebuild-20260925`.
- reconstruction branch: `rebuild/zero-legacy-ui-20260925`.
- no force updates to `main`.

## Controlled replacement

1. Freeze legacy presentation at baseline.
2. Inventory capabilities and data contracts.
3. Build new domain/repository/service layer.
4. Build new shell/design system.
5. Add legacy-data bootstrap adapter (data only, no legacy UI).
6. Port capabilities by priority.
7. Run migration dry-run diagnostics in browser.
8. Compare old/new capability matrix.
9. Run unit/integration/build golden tests.
10. Deploy preview.
11. Smoke test mobile/desktop.
12. Only after coverage gate, switch production build to new shell.
13. Keep rollback branch; delete legacy production source in a later purge commit after production validation.

## Rollback

- Cloudflare Pages can rollback to previous production deployment.
- Git branch `legacy-before-zero-ui-rebuild-20260925` preserves exact source.
- user data migration is additive/non-destructive initially.
- schema migrations store a version marker and do not delete old keys during first production cutover.

## Data migration rules

- preserve old keys for one stabilization release.
- write new canonical keys with versioned schema.
- store migration manifest containing source key, count, checksum, timestamp and warnings.
- no destructive deletion until equivalent records are verified.
