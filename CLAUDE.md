# READ FIRST — mandatory repository preflight

Before ANY planning, coding, refactor, deletion, UI change, data migration, generated patch, or deployment:

1. Read **/FOUNDATION.md in full**. It is the highest-priority product charter.
2. Then read **/docs/PRODUCT_MANDATE_ar.md** for current implementation obligations.
3. Do not proceed if your proposed work conflicts with FOUNDATION.md.
4. The mandatory navigation model is: **section first → company/workspace inside that section**. Never reverse it to company → sections.
5. Preserve the three primary entries: full accounting, audit, helper tools.
6. Cross-section linking is optional and user-triggered (e.g. “review this company”).
7. Any generated Python/extension update must use the governed Patch/Extension path with preview, validation, tests and rollback; never run arbitrary unrestricted code against production data.
8. AI providers are replaceable. Core deterministic accounting/audit/helper functions must not require a live AI provider.

If the owner explicitly changes a foundational rule, update FOUNDATION.md first in the same change.
