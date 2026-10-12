# KOSIF EARTH — Secure Claude accounting and audit

## What was implemented
- Protected POST endpoint for a workspace's Claude accounting analysis, audit planning and reconciliation suggestions.
- Uses Cloudflare Access RS256 JWT verification; ignores untrusted identity headers for the Claude endpoint.
- Checks actual workspace ACL. Owner, partner, manager and senior can analyze, viewer cannot.
- Uses server-saved numeric financial/inventory/reporting aggregates only. No raw journals, company/customer names, attachments or passwords sent to Claude.
- A D1 per-workspace daily quota is reserved before calling Anthropic. Default 5, maximum 20 requests.
- The API key remains a Cloudflare Worker secret; all results require human review.

## Release checklist (not completed by merging code)
1. Provision Cloudflare Worker s-kosif-capabilities-v2, D1 and Cloudflare Access.
2. Apply capabilities-v2/schema.sql, including workspace_ai_requests.
3. Configure TEAM_DOMAIN and POLICY_AUD from a real Access application.
4. Add ANTHROPIC_API_KEY as a Cloudflare Worker secret via a secure UI, not in Git, Pages, source files or chat. The existing GitHub MOON secret is not automatically available to Cloudflare.
5. Set ALLOWED_ORIGINS to https://earth.kosif.pp.ua, choose ANTHROPIC_MODEL and check AI_DAILY_LIMIT.
6. Only after tests and permissions succeed, change AI_ENABLED from false to true in the Worker environment.
7. In the site, connect the dedicated protected Worker under مركز القدرات v2 then explicitly synchronize a sanitized workspace aggregate snapshot. Select مزودات الذكاء / عقل Claude to analyze. There is no automatic transfer of company data.

## Tests
- node --test capabilities-v2/claude-summary.test.mjs capabilities-v2/security-contract.test.mjs
- node --check capabilities-v2/worker.js
- node --check ui/features/capabilities-v2.js
- cd app && npx tsc -p tsconfig.fusion.json --noEmit
- cd app && npx vitest run src/engine/fusion/audit src/engine/fusion/finance src/engine/fusion/reports --maxWorkers=2
- GitHub Actions Claude Opus live validation uses synthetic ledger, VAT and audit questions only.

## Boundaries
This feature is staged with server-side AI disabled until secure Worker authentication, data isolation, secret configuration and quota migrations are verified. It does not authorize autonomous posting, financial approvals or audit opinions. The older browser-local bring-your-own-key feature is not equivalent to this secure server endpoint.
