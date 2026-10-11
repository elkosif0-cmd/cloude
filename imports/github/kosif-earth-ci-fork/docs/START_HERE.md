# START HERE — Mandatory reading map for every agent

This repository has one canonical product hierarchy. Do not infer the product from the current UI, old architecture files, or legacy code placement.

## Mandatory reading order

1. **/FOUNDATION.md**
   - Highest-priority product constitution.
   - Defines the non-negotiable product meaning and the three-section architecture.
2. **/docs/PRODUCT_MANDATE_ar.md**
   - Current implementation mandate, gaps, acceptance rules and migration obligations.
3. Then read the files relevant to your task:
   - **Sector-specific work:** `/docs/sectors/`
   - **Capability placement/rebuild work:** `/docs/capabilities/`
   - **Operational/deployment/migration work:** `/docs/runbooks/`
   - **Books/reference knowledge:** `/knowledge/`

## Mandatory interpretation rules

- Product entry model is **section first**, then sector/activity where applicable, then company/workspace.
- The three primary sections are:
  1. Full accounting
  2. Audit
  3. Helper tools
- Reporting, analytics, AI, standards, documents and knowledge are cross-cutting capabilities, not a fourth top-level product.
- Do not preserve a capability's legacy UI placement just because the code currently lives there.
- Before deleting or rebuilding anything, inventory the underlying capability and decide whether to keep, merge, rebuild, relocate, specialize by sector, or retire with evidence.
- Sector-specific behavior matters: e.g. hospital costing is not factory costing, hotel accounting is not construction accounting.
- Cross-section linking is explicit and optional.
- AI providers are replaceable; deterministic accounting and audit logic must not depend on live AI.
- Generated extensions/Python updates must go through the governed extension path with validation, preview, sandbox/tests, versioning and rollback.
- Knowledge/books are consultative sources. When the user asks to use the library, inspect the catalog and actual source content; never pretend to have read a book that was not loaded.

## Conflict rule

If any old file says four gateways, company-first navigation, or another structure that conflicts with FOUNDATION.md, treat the old file as historical and follow FOUNDATION.md.

If the owner explicitly changes the product foundation, update FOUNDATION.md first in the same change.
