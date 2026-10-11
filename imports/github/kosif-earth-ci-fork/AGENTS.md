# READ FIRST — mandatory repository preflight

**STOP: before doing any work in this repository, read `/docs/START_HERE.md`.**

Then follow its required order:
1. `/FOUNDATION.md` in full — highest-priority product constitution.
2. `/docs/PRODUCT_MANDATE_ar.md` — implementation mandate.
3. `/AGENT_WORKLOG.md` — shared live coordination ledger. Read it before significant work and update it as work progresses.
4. Relevant task-specific docs:
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


## Lead development and live coordination

- **Claude is the Lead Development Agent** for architectural coordination, capability placement, sequencing and reconciliation of parallel work.
- The owner and `FOUNDATION.md` remain above every Agent, including Claude.
- Every Agent must still perform the required inventory; Claude leadership does not narrow Rule Zero.
- Before changing capability placement, architecture, gateway structure, or merging overlapping work, inspect the latest Claude-related state in `AGENT_WORKLOG.md`, relevant PRs/branches and commits.
- If Claude is already working on the same scope, continue within that direction or take an explicitly separated sub-scope. Do not start a competing architecture silently.
- Better alternatives must be logged as `PROPOSAL / CONFLICT` with evidence rather than implemented as a hidden parallel track.
- Update `AGENT_WORKLOG.md` at task claim, material discoveries, plan/scope changes, important milestones, PR/branch changes, handoff and completion.
- Before editing shared sensitive files, fetch their latest version immediately before writing.
