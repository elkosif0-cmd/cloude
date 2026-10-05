# AGENTS.md — Mandatory preflight for every coding agent

## STOP: read this first
Before doing **any** work in this repository, read the entire file:

**[FOUNDATION.md](./FOUNDATION.md)**

It is the canonical product charter for S.KOSIF and overrides conflicting interpretations in older docs or legacy UI.

### Required behavior
- Do not plan, code, refactor, delete, redesign, or deploy before reading `FOUNDATION.md`.
- Preserve the unified-product meaning: accounting + audit + reporting + financial analysis + standards + AI + documents + helper tools.
- Preserve useful capabilities even when replacing legacy UI/implementation.
- Never collapse the product into only accounting, only audit, a dashboard, or a chatbot.
- Respect company/workspace isolation and the protected context of «تصيف».
- Deterministic financial calculations and verifiable evidence precede AI interpretation.
- If a user explicitly changes a foundational product rule, update `FOUNDATION.md` first in the same change.
- For any PR that changes product behavior, confirm the charter was read and explain how the change preserves it.

Also inspect relevant `docs/` and capability registry material before removing or replacing existing features.
