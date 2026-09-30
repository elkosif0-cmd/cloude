# KOSIF Think — Multi-Agent Reasoning Orchestrator

## الهدف
KOSIF Think طبقة تنسيق واحدة فوق مزوّدي الذكاء الاصطناعي الموجودين في S.KOSIF، وتستخدم Jev كحاجز قرار منظم. لا تعتمد على كشف سلسلة التفكير الداخلية لأي نموذج. كل Agent يعيد artifact منظم قابل للمراجعة: النتيجة، الأدلة، الافتراضات، المخاطر، الاعتراضات، والثقة.

## لماذا داخل النظام الحالي؟
المستودع يحتوي بالفعل على:
- `app/src/engine/fusion/audit/ai-providers-engine.ts`: توحيد Gemini / OpenAI / Anthropic.
- `app/src/engine/fusion/intelligence/council-engine.ts`: تجميع أصوات مرجحة.
- `jev-api/worker.js` + `wrangler.jev.toml`: جسر Jev عبر Service Binding إلى `jev-claude-bridge`.

لذلك KOSIF Think يضيف orchestration فقط ولا ينشئ منصة موازية.

## مراحل التفكير
### fast
1. تشغيل Agents مستقلين بالتوازي.
2. تجميع artifacts.
3. Jev gate.
4. synthesis نهائي.

### council
1. Independent round.
2. Critique round: كل Agent يرى artifacts المختصرة للآخرين، وليس chain-of-thought.
3. Council vote إذا توجد بدائل صريحة.
4. Jev choice/noul.
5. synthesis.

### deep
1. Independent.
2. Critique.
3. Revision بعد قراءة الاعتراضات.
4. Deterministic council.
5. Jev gate.
6. Final synthesis.

## عقد الـAgent
```json
{
  "agentId": "claude-risk",
  "provider": "anthropic",
  "role": "skeptic",
  "recommendationId": "B",
  "answer": "الاستنتاج المختصر",
  "evidence": ["..."],
  "assumptions": ["..."],
  "risks": ["..."],
  "objections": ["..."],
  "confidence": 0.84
}
```

## Jev
- عند وجود بدائل: `jev_choice`.
- عند سؤال اعتماد/رفض: `jev_noul`.
- عند الحاجة لتقييم rubric: `jev_score`.
- الحد الافتراضي في engine: اتفاق مجلس 80% وثقة Jev 0.80، ويمكن تغييره لكل طلب.

## الأمان
- مفاتيح OpenAI / Anthropic / Gemini لا تُكتب في GitHub.
- في نسخة Cloudflare تحفظ كمفاتيح Secrets أو خلف Worker موثوق.
- لا يُسمح للعميل بإرسال provider URL حر لمنع SSRF.
- كل run يحصل على correlation id وسجل stages، provider failures، Jev verdict، والقرار النهائي.
- فشل Agent واحد لا يُسقط الجولة كلها.

## API المستهدف
`POST /v1/think`

```json
{
  "question": "أي خطة أفضل؟",
  "context": {"facts": []},
  "mode": "deep",
  "options": {"A": "خطة أ", "B": "خطة ب"},
  "agents": ["openai-solver", "claude-skeptic", "gemini-analyst"],
  "jev": true
}
```

الاستجابة تعرض النتيجة النهائية، اتفاق المجلس، قرار Jev، artifacts المختصرة، التعارضات، وأي Agent فشل.

## حالة التنفيذ الحالية
- `SKosifAI.generateFor(provider, ...)` يشغّل كل مزود مضبوط بمفتاحه المحلي بدون إرسال المفاتيح إلى خادم KOSIF.
- شاشة Jev تحتوي الآن على KOSIF Think بأوضاع Fast / Council / Deep.
- `SKosifThink.run(...)` API داخلي متاح لبقية وحدات التطبيق.
- جولات independent → critique → revision تعمل حسب الوضع المختار.
- Jev يراجع النتيجة عبر الجسر الحالي، وبوابة الاعتماد الافتراضية تستخدم 80% لاتفاق المجلس و80% لثقة Jev عندما تتوفر.
- فشل مزود واحد لا يوقف بقية الجولة.

## الخطوة اللاحقة الاختيارية
يمكن إضافة HTTP Worker خارجي `/v1/think` لاحقاً إذا أُريد تشغيل المجلس خارج التطبيق. التنفيذ الحالي يبقي مفاتيح النماذج على جهاز المستخدم، وهو أكثر تحفظاً للخصوصية.


## KOSIF Think v3 — ChatGPT-orchestrated frontier council

### Frontier models
The Clean APIs secret `cleanapis` is used only inside the Cloudflare Worker. The configured frontier council is:

- GPT-5.6 Sol — lead solution architect.
- Claude Opus 5 — skeptical reviewer.
- Gemini 3.7 Flash — alternatives/trade-off specialist.
- Claude Mythos Preview — adversarial scenarios, counterfactuals, and second-order effects.
- Claude Fable 5.1 — creative reframing and framing-bias specialist.

The five model IDs were verified against the live Clean APIs account. The secret itself is never stored in GitHub or returned over MCP.

### Why the agents are separate MCP calls
A single Cloudflare request that fans out to five frontier reasoning models can exceed a practical response window even when each model works correctly by itself. KOSIF Think therefore does not use one long frontier fan-out request.

For Council/Deep, ChatGPT calls `kosif_agent` separately for each frontier agent. Each call returns exactly one structured artifact. ChatGPT then supplies the successful artifacts to `kosif_council`, which is deterministic and fast.

Fast mode remains available through `kosif_think(mode=fast)` and uses the low-latency Cloudflare council:
- Llama 3.3 70B FP8 Fast
- Mistral Small 3.1 24B
- Llama 4 Scout

### Council flow

```
ChatGPT
  ├─ MCP kosif_agent(gpt) ───────> Worker ─> Clean APIs ─> GPT-5.6 Sol ─────┐
  ├─ MCP kosif_agent(claude) ────> Worker ─> Clean APIs ─> Claude Opus 5 ──┤
  ├─ MCP kosif_agent(gemini) ────> Worker ─> Clean APIs ─> Gemini 3.7 ─────┤
  ├─ MCP kosif_agent(mythos) ────> Worker ─> Clean APIs ─> Mythos ─────────┤
  └─ MCP kosif_agent(fable) ─────> Worker ─> Clean APIs ─> Fable 5.1 ──────┘
                         each response returns to ChatGPT as an artifact
                                           ↓
                             MCP kosif_council(artifacts)
                                           ↓
                         deterministic council + jev_payload
                                           ↓
                                   ChatGPT → Jev
                                           ↓
                              ChatGPT final chair
```

### Where responses are received
Agent responses are **not** collected in TinyFish and are not persisted in a mailbox.

For each frontier call the path is:

`ChatGPT → MCP → KOSIF Think Worker → Clean APIs → selected model → Worker → MCP response → ChatGPT`

ChatGPT receives the structured artifact returned by each `kosif_agent` call and keeps the successful artifacts in the active tool/conversation state. It then passes those artifacts to `kosif_council`.

The current KOSIF Think Worker does not persist council answers to KV, D1, or R2.

### Deep flow
Deep starts with the same five independent artifacts. Then:
1. Claude, Mythos, and Fable can be called again with `stage=critique` and the independent artifacts as `peers`.
2. GPT and Gemini can then be called with `stage=revision` using the latest artifact set.
3. Keep one latest artifact per agent.
4. Call `kosif_council`.
5. Send its `jev_payload` to Jev.
6. ChatGPT is the final chair.

This keeps hidden chain-of-thought out of the protocol. Agents exchange only reviewable artifacts/summaries.

## TinyFish boundary

TinyFish is **optional and separate from KOSIF Think's core reasoning transport**.

It is useful when the task requires:
- opening or interacting with a web page,
- browser automation,
- collecting external web/visual evidence,
- checking a deployed endpoint during development.

If TinyFish gathers useful evidence, that evidence can be inserted into KOSIF Think `context` before the frontier agents are called.

TinyFish is **not**:
- the place GPT/Claude/Gemini/Mythos/Fable send their answers,
- the council aggregator,
- the Jev bridge,
- required for ordinary KOSIF Think reasoning.

A separate `kosif-jev` Worker may have TinyFish bindings for browser/image workflows. That is a separate workflow and does not put TinyFish in the KOSIF Think reasoning bus.

## Jev and final answer

`kosif_council` returns:
- the sanitized artifacts,
- deterministic consensus/tie metadata,
- coverage/missing-agent information,
- `jev_payload`.

ChatGPT sends `jev_payload` to the matching Jev tool (`choice`, `noul`, or `score`). Jev is the independent decision gate; ChatGPT remains the final chair that reconciles:
1. the five agent artifacts,
2. deterministic council agreement,
3. Jev's verdict,
4. the user's constraints and evidence.

No component should request or expose a model's hidden chain-of-thought.


## KOSIF Think v0.5 — Host Tool Router

KOSIF Think adds a deterministic `kosif_route` tool for coordinating external ChatGPT tools/plugins without pretending that the Worker can call those host tools itself.

### Boundary
The Cloudflare Worker owns reasoning/orchestration only. It does **not** receive the user's ChatGPT plugin OAuth sessions and cannot directly invoke arbitrary host plugins. The route is:

`KOSIF Think preflight → kosif_route → ChatGPT host calls selected tools → tool evidence returns to KOSIF → council/Jev → final answer`

### Routing lanes
`kosif_route` classifies a task across research/science/legal, browser/computer, development/security/deploy/observability, UI/UX/typography/image/video, documents/memory, and communication.

The built-in catalog covers the tools currently used around KOSIF, including Acumen, Tavily, Parallel Search, Firecrawl, Consensus, Scite, Readwise, Legal Data Hunter, TinyFish, Remote Desktop Commander, GitHub, Superpowers, Codex Security, Cloudflare, Vercel, Supabase, PostHog, Figma, Adobe Express, Canva, Runway and related tools.

The router is not limited to that catalog. The host can pass a future or custom connected tool with `name`, optional `description`, optional `lanes`, and `costClass`; KOSIF can route it without another Worker release.

### Connection truthfulness
The catalog is not proof that a tool is connected. The ChatGPT host passes the tools it can actually access in `availableTools`. If availability is not supplied, the router returns `needsAvailabilityCheck` and never assumes a connection.

### Cost guardrail
The user budget policy is conservative:
- `free`, `included`, and `existing_plan` → may appear in `useNow`;
- `mixed`, `credits`, `paid`, and `unknown` → `needsApproval`; an omitted host cost is normalized to `unknown`, so KOSIF never assumes a connected tool is free or included;
- a gated tool moves to `useNow` only when its exact name is passed in `approvedTools` for that task.

Connection does not equal permission to spend. The route response warns when credits, a paid plan, mixed billing, or unknown billing may apply.

### Example
```json
{
  "task": "راجع واجهة التطبيق واكتشف أخطاء الكود ثم جهز النشر",
  "availableTools": [
    {"name":"GitHub","connected":true,"costClass":"existing_plan"},
    {"name":"Figma","connected":true,"costClass":"existing_plan"},
    {"name":"PostHog","connected":true,"costClass":"existing_plan"},
    {"name":"Cloudflare","connected":true,"costClass":"existing_plan"}
  ],
  "budgetMode": "safe"
}
```

The result is a host execution plan, not proof that KOSIF called those plugins itself.


## Access control (security)

> **الخلاصة:** كانت نقطة `/mcp` في Worker `kosif-think-mcp` مفتوحة لأي شخص على الإنترنت، وكل استدعاء لـ`kosif_agent` يستهلك رصيد مفتاح Clean APIs (`cleanapis`)، وكل `kosif_think` يشغّل ثلاثة نماذج Workers AI. أصبحت النقطة مغلقة إلا بتوكن، مع حدود استخدام وإيقاف فوري ورفض آمن.

### The risk this closes
Up to version 0.4.0 the deployed Worker (`workers_dev = true`) answered every `POST /mcp` without checking who sent it:
- `kosif_agent` sends the caller's prompt to a frontier model through Clean APIs, billed to the `cleanapis` key; `kosif_think` runs three Workers AI models. Anyone who found the `workers.dev` URL could spend both, with no rate limit and no size limit, and could use the Worker as a free proxy to those models.
- the public `/health` said whether the Clean APIs key was configured and listed every model;
- upstream error texts (which can name the account or the key's balance) were passed back to the caller.

The Worker holds no business data, so the exposure is spending and abuse of the key (which a provider may then suspend), not a data leak. Review the Clean APIs usage since the Worker was first deployed (2026-09-27 21:42 UTC) for calls that were not yours.

### Controls
| Control | Behaviour |
|---|---|
| Authentication | Preferred: Auth0 OAuth2 bearer JWT for the configured issuer/audience. Legacy/private clients may use `Authorization: Bearer <KOSIF_THINK_TOKEN>`, compared in constant time. `/mcp/<token>` works only when `THINK_ALLOW_PATH_TOKEN = "true"` (the token then sits in URLs and logs, so prefer the header). |
| Fail closed | No `KOSIF_THINK_TOKEN`, or one shorter than 32 characters → `503`, nothing runs. |
| Unauthorised | `401` with `WWW-Authenticate: Bearer`, a fixed body, no model call. After `THINK_AUTH_FAILS_PER_MIN` failures a minute from one IP → `429` before any token check. |
| Rate limits | Per caller: `THINK_RPM` requests and `THINK_MODEL_RPM` model-running calls (`kosif_agent`, `kosif_think`) a minute, through the `THINK_RATE_LIMITER` / `THINK_MODEL_LIMITER` rate-limit bindings; a local window takes over if a binding is missing or fails (never fails open). `429` + `Retry-After: 60`. |
| Kill switch | `THINK_FRONTIER_ENABLED = "false"` stops every Clean APIs call at once. |
| Methods | `/mcp`: `POST` (+ `OPTIONS` preflight) only, else `405`. `/health`: `GET`/`HEAD` only. |
| CORS / Origin | No browser origin by default. A request carrying an `Origin` that is not in `THINK_ALLOWED_ORIGINS` → `403` (the MCP HTTP transport rule against DNS rebinding); an allowed origin gets its own origin back, never `*`. |
| Request size | `Content-Type: application/json` only (`415`); bodies over `THINK_MAX_BODY_BYTES` (default 128 KiB) → `413`, checked on the header and on the bytes actually read. JSON-RPC batches or messages without a method → `-32600`. |
| No leaks | Public `/health` returns only `ok`, `service`, `version`. Errors carry this Worker's codes only (`CLEANAPIS_402`, `CLEANAPIS_NETWORK`, `AGENT_FAILED` …). `kosif_think_status` (authenticated) shows how access is configured, never a value. |

`think-mcp/worker.test.mjs` proves each row (CI step "Test KOSIF Think MCP access control"); run against version 0.4.0 the access tests fail 17 of 18.

Version 0.4.2 is this access control together with the council rules deployed by hand as a separate «0.4.1» (which had no access control): one artifact per known frontier agent, agreement counted over every participating agent, a conservative readiness gate, a synthesis that follows the winning option, and no invented confidence or evidence. Deploying 0.4.2 keeps those rules and closes `/mcp`.

### Deploying the change (manual; no workflow deploys this Worker)
1. Make a token and store it as a Worker secret (it is never written in the repository):
   `printf %s "$(openssl rand -hex 32)" | npx wrangler secret put KOSIF_THINK_TOKEN --config wrangler.think.toml`
   (64 hex characters: no `/` or `+`, so it also works in `/mcp/<token>`; `printf %s` adds no newline).
2. Give the same token to the MCP client as `Authorization: Bearer …`. Only if the client cannot send headers, set `THINK_ALLOW_PATH_TOKEN = "true"` and use `/mcp/<token>`.
3. `npx wrangler deploy --config wrangler.think.toml`
4. Check: `POST /mcp` without the header → `401`; with it → `200`; `kosif_think_status` → `access`.
5. Set a spending limit on the Clean APIs account: it is the only hard cap on what the key can spend.

Rotation: put a new `KOSIF_THINK_TOKEN`, then update the client. If the key itself may have been used by someone else, rotate `cleanapis` at Clean APIs and `wrangler secret put cleanapis` again. For stronger caller identity, put the Worker behind Cloudflare Access with a service token.


## KOSIF Think v0.8 — Jev-gated high-confidence tool selection

Version 0.8 changes tool routing from a relevance list into a bounded decision protocol.

### Closed live candidate set

KOSIF never asks Jev to invent a tool. The host supplies the live tool inventory and KOSIF constructs a closed candidate set from tools that are actually observed. Each candidate carries decision evidence including task fit, trust, schema/version, freshness, historical outcomes, evidence quality, reversibility/idempotence, safety, cost/permission compatibility, latency, and dependency group.

The candidate packet is hashed from stable decision-critical state. Jev decisions must echo the packet hash; a stale decision is rejected after schema, authorization, availability, or candidate-state changes.

### Jev is chooser/veto/abstainer, not authority

When material ambiguity remains, KOSIF emits a bounded `jev_choice` packet containing only observed candidate IDs plus `ABSTAIN`.

For consequential writes, execution is gated by all of these operational checks:

- deterministic support >= 0.82;
- at least 3 support signals and at least 4 evidence-independence groups for writes (3 for reads);
- Jev probability for the chosen candidate >= 0.95;
- Jev alternative probability mass <= 0.05;
- Jev decision confidence >= 0.90;
- the selected candidate is no more than 0.05 below the deterministic leader;
- geometric execution-support index >= 0.94;
- no unsatisfied human checkpoint.

These numbers are **operational gates, not empirically calibrated probabilities of correctness**. Low support means collect more evidence, re-route, or abstain rather than force a choice.

### Evidence dependency

Signals are grouped before they count toward high-confidence execution:

- `task_fit`
- `provenance`
- `live_state`
- `outcome_history`
- `execution_safety`

This prevents trust score + evidence score from being treated as two independent facts when they come from the same source. Reliability history uses a conservative prior-shrunk estimate rather than trusting a tiny sample as a 100% success rate.

### Replacement and degraded mode

A failed, stale, low-trust, or schema-drifted tool is quarantined for the task. KOSIF refreshes the live inventory and re-runs selection. Fallback scoring prefers a different dependency group.

Frontier-agent degradation is also explicit. Transient Clean APIs empty/network/timeout/429/5xx and malformed model artifacts can fall back to a mapped Cloudflare model. The artifact keeps the requested agent ID but records the **actual source/model, provenance group, requested model, and fallback flag** so the council never pretends the requested frontier model answered. Council readiness flags weak model diversity or fallback domination.

### Human checkpoints

Jev cannot grant authorization. Credentials, passwords, API keys, OTP/MFA, CAPTCHA/security prompts, payments/transfers/purchases, and irreversible deletions/revocations remain behind an explicit human checkpoint. KOSIF can choose a tool for the surrounding workflow, but the sensitive checkpoint is still completed/confirmed by the human.

### Book-derived reasoning modules

The runtime no longer treats books as prompt stuffing. The useful ideas are compiled into explicit modules, artifact fields, routing rules, and tests:

- **Smart Thinking / judgment material**: alternative generation, multiple problem representations, bias audit, uncertainty, disconfirming evidence, and decision-changing evidence.
- **Probabilistic Graphical Models**: dependency-group reasoning so correlated signals are not counted as independent.
- **Convex Optimization**: objective vs hard constraints, feasible-set thinking, and sensitivity to decision-changing constraints.
- **The Pragmatic Programmer**: reversibility, tracer actions, orthogonality, and observable verification.
- **SICP study material**: dispatchable components, abstraction boundaries, runnable evaluators, and test-first feedback.
- **Organon (initial extraction)**: contradiction, implication strength, category/fallacy checks.

The current uploaded `Probability Theory: The Logic of Science` copy appears to expose mainly product/testbank material, so no detailed Jaynes-specific rules are promoted into runtime policy from that file yet. The uploaded Code Complete copy is scan-heavy/Chinese, so its deeper construction rules remain queued rather than guessed.

The active modules are selected per task and are returned by preflight/status so they can be tested instead of remaining hidden prompt text.

### Empirical calibration loop

KOSIF v0.8 also exposes `kosif_calibration_report`. It accepts historical routing observations and computes:

- Brier score for Jev's chosen-option probability against observed binary outcomes;
- reliability bins and Expected Calibration Error (ECE);
- empirical success rate above the configured high-confidence threshold;
- explicit false-confidence cases;
- per-tool empirical success plus a 95% Wilson lower bound.

The operational `supportIndex` is deliberately excluded from Brier/ECE because it is not a probability. The report is diagnostic: it does not silently lower gates. Threshold changes should be based on enough representative outcomes and reviewed separately by task/risk family.

### Richer reviewable artifacts

Each full agent artifact can now carry:

- evidence;
- assumptions;
- material unknowns;
- risks and objections;
- disconfirming evidence;
- decision-changing evidence;
- hard-constraint violations;
- confidence;
- provenance/fallback metadata.

This is deliberately reviewable output, not hidden chain-of-thought.
