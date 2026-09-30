# KOSIF Think — Developer Handoff

Snapshot prepared from the live system on 2026-09-30.

## Current components

- **KOSIF Think runtime:** v0.8.3
- **Capability Mesh:** v2.0.1
- **KOSIF mobile bridge (wa-kosif-mcp):** v1.4.0
- **KOSIF Think ChatGPT plugin package:** v1.5.3
- **KOSIF Think Pro 2 orchestration package:** v2.7.2

## Source layout

```
handoff/kosif-think/
├── worker.live-v0.8.3.js          # exact live KOSIF Think MCP runtime source
├── wa-kosif-mcp.live-v1.4.0.js   # exact live mobile bridge source
├── plugin-1.5.3/                  # ChatGPT plugin package
├── pro-plugin-2.7.2/              # Pro skill/reference/validator package
├── ENVIRONMENT.example.md
└── SNAPSHOT.json
```

## Runtime responsibilities

`worker.live-v0.8.3.js` contains the live MCP runtime:
- Fast Cloudflare council.
- Frontier agent brokerage for GPT / Claude / Gemini / Mythos / Fable aliases.
- Council aggregation.
- Jev handoff payloads.
- adaptive Fast / Council / Deep routing.
- host-mediated tool routing.
- runtime receipts and diagnostics.
- evidence verification and candidate comparison.
- evidence/answer arithmetic consistency quarantine.
- truthful distinction between server-side tool availability and host-side tool exposure.
- BrowserJev / KOSIF Computer execution contracts and verification rules.

`wa-kosif-mcp.live-v1.4.0.js` is the mobile/iPhone bridge. It exposes:
- `kosif_mobile_think`
- `kosif_mobile_capabilities`
- `kosif_mobile_call`
and bridges advanced runtime tools such as `kosif_auto`, `kosif_route`, self-test and diagnostics when available from the live runtime.

## Important invariants

1. Never expose or commit Clean APIs credentials, KOSIF tokens, OAuth tokens, OTPs or other secrets.
2. A configured provider/model alias is **not** independent proof of the underlying provider model identity.
3. A tool that exists on the KOSIF server is not automatically exposed by the current ChatGPT host. Host exposure must be checked from the live host catalog.
4. Side effects require executor-originated evidence / observable postconditions. A successful transport receipt is not enough.
5. Jev is bounded arbitration/review, not evidence authority or execution authority.
6. Do not remove the evidence-answer consistency gate. Known regression:
   - 120 units
   - 15% defective = 18
   - 102 non-defective
   - sell 10
   - expected result = **92**
   Conflicting answer fields such as 97 / 100 / 102 must be quarantined when independent valid arithmetic evidence converges on 92.
7. Preserve the Pro capability-provenance, source-taint, dissent-ledger, bounded-budget and execution-contract rules.

## Recommended next development work

- Generalize answer/evidence contradiction detection beyond simple arithmetic into typed deterministic validators.
- Add schema normalization for micro-agent artifacts so evidence/risks/objections are always in the correct fields.
- Add a full automated regression suite for Fast, Council, Deep, Jev handoff and host-exposure behavior.
- Separate `structurally valid receipt` from `completion-ready receipt`; a verifier/self-critic state of `revise` should not be treated as completion-ready.
- Keep runtime and Git source synchronized automatically after Cloudflare deployments.
- Add explicit version negotiation between runtime, mobile bridge, ChatGPT plugin and Pro package.
- Add deployment smoke tests that call the live status endpoint and the known-answer 92 regression after every release.

## Deployment

The live runtime currently targets:
- `https://kosif-think-mcp.kosif199022.workers.dev/mcp`

The mobile bridge currently targets:
- `https://wa-kosif-mcp.kosif199022.workers.dev/mcp`

Use the existing Cloudflare account/environment. Recreate secret values through the deployment platform; **no secret values are included in this handoff**.

## Validation before publishing a change

At minimum:
1. Run syntax/build checks.
2. Run deterministic helper tests.
3. Run Fast known-answer regression (expected 92).
4. Run malformed/contradictory evidence cases.
5. Test frontier fallback and provenance.
6. Test tool exposure truthfulness.
7. Test budget/no-change stop rules.
8. Test source-taint / spoofed receipt cases.
9. Deploy to a non-production Worker first.
10. Verify observable live receipts and only then promote.
