# KOSIF Think Runtime Manifest

Last verified: 2026-10-01

## Canonical live components

| Component | Cloudflare Worker | Live version | GitHub source |
| --- | --- | ---: | --- |
| KOSIF Think runtime | `kosif-think-mcp` | `0.17.7` | `think-mcp/worker.js` |
| Secure Executor | `kosif-full-pro-secure-executor` | `1.4.3` | `think-mcp/secure-executor/worker.js` |
| Jev service | `kosif-jev` | unversioned live worker | `think-mcp/jev/worker.js` |

ChatGPT plugin releases verified with this runtime:
- `kosif think 20 s`: `20.3.9`
- KOSIF Think provider: `1.8.6`
- `Source kosif think 20 s`: `10.7.9`

## Current contracts

- Council-500 Full Pro remains the one-mode front-door contract.
- Fresh discovery endpoint: `/mcp/v0.17.7`; `/mcp/v0.9.3` remains compatibility-only.
- MCP auth policy: `public-broker-oauth-v2`; public broker tools are rate-limited, protected secure-execution tools require verified OAuth2 or the legacy bearer secret, and repeated invalid credentials trigger the `pre-verification-ip-window` lockout before further bearer verification.
- Adaptive Council/Deep frontier budgets derive from the live `FRONTIER_AGENTS.length`; no hard-coded five-agent truth claims are allowed.
- Host connectivity is tri-state: `true`, `false`, or `unknown`. An omitted `connected` field must never be interpreted as a verified connection.
- Frontier compatibility role aliases are `gpt`, `claude`, `gemini`, and `fable`; the current receipt is authoritative for the actual Cloudflare model.
- Mythos and Clean APIs are retired and must not be reintroduced.
- `attachments-governance-v1`: attachment-derived governance integration.
- `einstein-attachments-v2`: observation → first principles → Gedankenexperiment → observer/frame → unification → simplicity critic → empirical-verification revision.
- `source-taint-v1`: consensus, clustering or Jev selection cannot upgrade unverified provenance.
- Option-binding consistency gate: a numeric recommendation that conflicts with an independently established canonical arithmetic value is excluded from council weighting, while raw participation agreement is retained separately.
- Capability Truth states: `verified`, `measured`, `implemented`, `host-dependent`, `prompt-only`, `simulated`, `historical`, `unavailable`.
- `execution-binding-v1`: freeze `execution_contract_digest` before authorization and bind it through request → authorization → one-use ticket → execution → receipt.
- `attachment-cinema-v1`: generic visual grammar; no task fixture may leak into unrelated requests.
- Secure visual QA: `vision_task_aware_v5` with `active-values-v3`; positive SceneSpec activation is distinct from negated constraints.

## Source-of-truth and deployment rule

1. Never deploy an older GitHub copy over a newer Cloudflare runtime.
2. Every Cloudflare hotfix must be synchronized back to the matching GitHub source before the next normal deployment.
3. Use ETag/version checks before remote writes; an unexpected ETag change is a merge event, not permission to overwrite.
4. Run `.github/workflows/kosif-regression.yml` before treating a GitHub revision as deployable.
5. `S.kosif.yml` is CI/build validation only; it is not a Cloudflare deployment workflow.
6. Host/plugin registration is not live-execution evidence. Runtime receipts and Capability Truth are authoritative.

## Regression coverage

`think-mcp/regression-0177.test.mjs` protects:
- no Mythos / no Clean APIs reintroduction;
- no duck/dragon fixture leakage into generic visual requests;
- conditional task-aware QA;
- negation-aware visual activation;
- Capability Truth;
- Source Taint/governance markers;
- execution-contract construction and binding;
- current runtime/Secure Executor version expectations.

`think-mcp/worker.test.mjs` covers current MCP transport/access behavior, public discovery, protected secure execution, CORS/body limits, public broker rate limiting, host-mediated routing and truthful status reporting.
