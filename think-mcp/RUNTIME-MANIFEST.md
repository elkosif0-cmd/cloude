# KOSIF Think Runtime Manifest

Last verified: 2026-10-02

## Canonical live components

| Component | Cloudflare Worker | Live version | GitHub source |
| --- | --- | ---: | --- |
| KOSIF Think runtime | `kosif-think-mcp` | `0.18.1` | `think-mcp/worker.js` (**mirror currently 0.17.13; do not deploy over live**) |
| Secure Executor | `kosif-full-pro-secure-executor` | `1.4.3` | `think-mcp/secure-executor/worker.js` |
| Jev service | `kosif-jev` | unversioned live worker | `think-mcp/jev/worker.js` |

ChatGPT plugin releases verified with this runtime:
- `kosif think 20 s`: `20.4.1`
- KOSIF Think provider: `1.9.1`
- `Source kosif think 20 s`: `10.8.1`

## Current contracts

- Council-500 Full Pro remains the one-mode front-door contract.
- Fresh discovery endpoint: `/mcp/v0.18.1`; `/mcp/v0.18.0`, `/mcp/v0.17.14`, `/mcp/v0.17.13` and `/mcp/v0.9.3` are compatibility-only.nd `/mcp/v0.9.3` remain compatibility-only during client refresh.
- MCP auth policy: `public-broker-oauth-v2`; public broker tools are rate-limited, protected secure-execution tools require verified OAuth2 or the legacy bearer secret, and repeated invalid credentials trigger the `pre-verification-ip-window` lockout before further bearer verification.
- Adaptive Council/Deep frontier budgets derive from the live `FRONTIER_AGENTS.length`; no hard-coded five-agent truth claims are allowed.
- Host connectivity is tri-state: `true`, `false`, or `unknown`. An omitted `connected` field must never be interpreted as a verified connection.
- Frontier compatibility role aliases are `gpt`, `claude`, `gemini`, and `fable`; the current receipt is authoritative for the actual Cloudflare model.
- Mythos and Clean APIs are retired and must not be reintroduced.
- `attachments-governance-v1`: attachment-derived governance integration.
- `einstein-attachments-v2`: observation → first principles → Gedankenexperiment → observer/frame → unification → simplicity critic → empirical-verification revision.
- `source-taint-v1`: consensus, clustering or Jev selection cannot upgrade unverified provenance.
- `decision-sensitivity-v1`: for option decisions with at least three valid non-quarantined votes, KOSIF removes each vote once and recomputes the weighted winner; any winner change or tie is reported as `DECISION_UNSTABLE_UNDER_SINGLE_VOTE_REMOVAL`.
- `attachment-cognitive-cards-v1`: every new counted Council-500 expert gets a deterministic cognitive signature built from two operational reasoning powers, one cognitive stance, its mandatory blind-spot compensation, one school, a signature question and trait vector.
- Cognitive source provenance: `sha256:fde0c8bcccea08231389591ea379654563dc39bdcd9d2cbb9f7a19016a716166` derived from the user-supplied Expert Council archive reviewed on 2026-10-02.
- Cognitive Diversity Receipt hard requirements for new requests: 500 unique signatures, 30 primary-power coverage, 30 secondary-power coverage, 24 stance coverage and 10 school coverage.
- Every new expert proposal must preserve an epistemic status (`confirmed`, `probable`, `hypothesis`) and a falsifier or observable decision-changing test. Blind-spot compensation is mandatory and auditable.
- Option-binding consistency gate: a numeric recommendation that conflicts with an independently established canonical arithmetic value is excluded from council weighting, while raw participation agreement is retained separately.
- Natural-language arithmetic binding: deterministic evidence accepts symbolic `=` plus verbal `equals / is equal to` forms and can use arithmetic assertions from both an agent answer and its evidence; contradictory arithmetic within one artifact is not promoted to a canonical value.
- Capability Truth states: `verified`, `measured`, `implemented`, `host-dependent`, `prompt-only`, `simulated`, `historical`, `unavailable`.
- `execution-binding-v1`: freeze `execution_contract_digest` before authorization and bind it through request → authorization → one-use ticket → execution → receipt. Postcondition verification references the live `vision_task_aware_v5` QA contract.
- `revision-closure-v1`: revision agents must resolve peer objections/risks or retain only genuinely unresolved items; resolved objections are never copied forward, and revisions may not invent new task details.
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

`think-mcp/regression-01713.test.mjs` protects:
- no Mythos / no Clean APIs reintroduction;
- no duck/dragon fixture leakage into generic visual requests;
- conditional task-aware QA;
- negation-aware visual activation;
- Capability Truth;
- Source Taint/governance markers;
- execution-contract construction and binding;
- current runtime/Secure Executor version expectations.

`think-mcp/worker.test.mjs` covers current MCP transport/access behavior, public discovery, protected secure execution, CORS/body limits, public broker rate limiting, host-mediated routing and truthful status reporting.

## Live/source drift guard

Cloudflare is currently ahead of the GitHub `think-mcp/worker.js` mirror. The live runtime is `0.18.1`; the worker mirror was last verified at `0.17.13`. A large-file automated source copy was stopped before GitHub write, so no truncated worker was committed. Until the mirror is resynchronized, **do not deploy the GitHub worker over Cloudflare**. `think-mcp/LIVE-RUNTIME-VERSION` and the regression workflow emit an explicit drift warning.

The attachment-derived cognitive layer is preserved independently in `think-mcp/cognitive-cards-v1.js`, `think-mcp/cognitive-cards-v1.test.mjs`, and `think-mcp/EXPERT-COGNITIVE-CARDS.md` so its deterministic contract and provenance remain reviewable even while the main worker mirror lags.
