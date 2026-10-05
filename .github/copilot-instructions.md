# READ FIRST — mandatory repository preflight

**STOP: before doing any work in this repository, read `/FOUNDATION.md` in full.**

This applies to every human contributor and every coding/AI agent, including Claude, Gemini, Copilot, Codex and other automation.

Required order before planning, coding, refactoring, deleting, migrating data, changing UI/architecture, generating a patch, or deploying:
1. Read `/FOUNDATION.md` completely. It is the highest-priority product constitution.
2. Read `/docs/PRODUCT_MANDATE_ar.md` for implementation status and obligations.
3. Check the requested work against the constitution before changing code.
4. If anything conflicts with `FOUNDATION.md`, do not silently reinterpret the product.
5. If the owner explicitly changes a foundational rule, update `FOUNDATION.md` first in the same change.

Non-negotiable product guards:
- Entry model: **section first → sector/activity when applicable → company/workspace inside that section**.
- The three primary entries remain: full accounting, audit, helper tools unless the owner explicitly changes them.
- Cross-section links are optional/user-triggered; never force a company-first architecture.
- Preserve useful existing capabilities while rebuilding implementation/UI where needed.
- AI providers are replaceable; deterministic core functions must work without live AI.
- Generated extensions/Python updates must use the governed Patch/Extension route with validation, preview, sandbox/tests, versioning and rollback; never execute arbitrary unrestricted code against production data.
- Sector packs, model companies, audit rounds/council/Jev, helper automation, local AI bridge, financial analytics/forecasting, and relationship-health monitoring are part of the constitutional product direction.

Do not treat older docs, current screens, or legacy architecture as authority over `/FOUNDATION.md`.