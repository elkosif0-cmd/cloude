# Claude Secure Workspace Review — KOSIF EARTH

This branch adds a read-only Claude AI review flow within the Capabilities v2 workspace. The UI has three review purposes: accounting, audit, and reconciliation.

Security gates: validated Cloudflare Access JWT, tenant/workspace ACL, owner/partner/manager/senior roles, explicit user consent, same-origin/CORS validation, 20KB request size, 12,000-character text limit, input-secret detection, and Cloudflare rate-limiting. Viewer has no permission. User-selected company, model or provider URL are never trusted in a request. AI outputs are drafts requiring human approval, never automatic journal posting.

Cloudflare Worker production configuration required before enabling: ANTHROPIC_API_KEY as encrypted Worker Secret, POLICY_AUD, TEAM_DOMAIN, ALLOWED_ORIGINS, the existing D1 binding, a rate-limiting binding named AI_REQUEST_LIMITER, AI_REVIEW_ENABLED=true, and an optional ANTHROPIC_MODEL (claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5). No Anthropic key is bundled in JavaScript or HTML. The server defaults to disabled.

Do not confuse the $50 cross-repository review authorization with an open-ended production AI budget. Before production activation, configure a separate API spend limit, run real Cloudflare Access tenant-isolation tests, and inform users which document text is sent to Anthropic.

Tests: node --test capabilities-v2/claude-review-security.test.mjs capabilities-v2/security-contract.test.mjs

The test suite uses synthetic/mock provider responses. An actual server-side Claude review cannot be claimed working until Cloudflare Worker secrets, Access identity, D1 and rate-limiter bindings are deployed and tested.
