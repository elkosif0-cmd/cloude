# READ FIRST — mandatory repository preflight

**STOP: before doing any work in this repository, read `/docs/START_HERE.md`.**

Then follow its required order:
1. `/FOUNDATION.md` in full — highest-priority product constitution.
2. `/docs/PRODUCT_MANDATE_ar.md` — implementation mandate.
3. Relevant task-specific docs:
   - sector: `/docs/sectors/`
   - capabilities: `/docs/capabilities/`
   - operations/runbooks: `/docs/runbooks/`
   - knowledge/books: `/knowledge/`

Do not infer the product from current screens, old gateway documents, legacy code placement, or historical architecture.

Hard guards:
- section first → sector/activity when applicable → company/workspace.
- exactly three primary entries unless the owner explicitly changes them: accounting, audit, helper tools.
- reporting/analytics/AI/standards/documents are cross-cutting capabilities, not a fourth primary gateway.
- capabilities must be reclassified and can be specialized differently by sector.
- preserve useful logic; rebuild or relocate wrong UI/architecture.
- AI providers are replaceable; deterministic core logic must work without live AI.
- generated Python/extensions require validation, preview, sandbox/tests, versioning and rollback.

If the owner changes a foundational rule, update FOUNDATION.md first in the same change.
