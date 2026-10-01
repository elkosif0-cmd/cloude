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

### Controls (0.14.0 — Auth0 OAuth replaced the shared token as the main sign-in)
| Control | Behaviour |
|---|---|
| Public tools | `kosif_auto`, `kosif_think_status`, `kosif_route`, `kosif_verify_evidence`, `kosif_compare_candidates`, `kosif_agent`, `kosif_council` (and the merged names) answer without a sign-in, rate-limited per IP. |
| Full Pro tools | `kosif_full_pro_execute` (the gateway added in 0.13.63, public until 0.14.0), the other `kosif_full_pro_*`, `kosif_secure_*`, `kosif_expert_harvest` and `kosif_full_pro_jev_batch` need an Auth0 access token (RS256/PS256, issuer + audience + expiry checked against the tenant JWKS). Without one: `401`, `WWW-Authenticate: Bearer resource_metadata=…` and an `mcp/www_authenticate` tool result, so the host offers the sign-in. Nothing is read, queued or spent. |
| Full Pro bridge | `kosif_think` / `kosif_auto` context prefixes `KOSIF_FULL_PRO_MOBILE_V1:` (start, canary_start), `…_CANARY_START/STATUS/CANCEL_V1:`, `…_HARVEST_V1:`, `…_JEV_BATCH_V1:` need the same sign-in. The other mobile actions stay bound to the per-request bridge token that only an authenticated start hands out. (Before 0.14.0 these prefixes reached Full Pro with no sign-in.) |
| Owner allow-list | `KOSIF_OWNER_SUBS` (comma-separated Auth0 user ids, e.g. `auth0|…`, `google-oauth2|…`): when set, any other account that signs up to the tenant is refused. Set it — without it every tenant account passes. |
| Legacy bearer | `Authorization: Bearer <KOSIF_THINK_TOKEN>` still works for server-to-server callers, compared in constant time, only when the secret has 32+ characters. `/mcp/<token>` only when `THINK_ALLOW_PATH_TOKEN = "true"`. |
| Failed sign-ins | After `THINK_AUTH_FAILS_PER_MIN` failures a minute from one IP, further wrong tokens get `429`; a valid token still passes. |
| Rate limits | Per caller (`THINK_RPM`, `THINK_MODEL_RPM`) through the `THINK_RATE_LIMITER` / `THINK_MODEL_LIMITER` bindings; a local window takes over if a binding is missing or fails (never fails open). Public model calls: 2 `kosif_auto`/`kosif_think` and 5 `kosif_agent` a minute per IP. `429` + `Retry-After: 60`. |
| Write hints | Tools that change Full Pro state carry `readOnlyHint: false` (cancel and bypass also `destructiveHint: true`), so hosts confirm them before running. |
| Kill switch | `THINK_FRONTIER_ENABLED = "false"` stops every frontier agent call at once. |
| Methods | `/mcp`: `POST` (+ `OPTIONS` preflight) only, else `405`. `/health`: `GET`/`HEAD` only. |
| CORS / Origin | No browser origin by default. A request carrying an `Origin` that is not in `THINK_ALLOWED_ORIGINS` → `403`; an allowed origin gets its own origin back, never `*`. |
| Request size | `Content-Type: application/json` only (`415`); bodies over `THINK_MAX_BODY_BYTES` (default 128 KiB) → `413`. JSON-RPC batches or messages without a method → `-32600`. |
| No leaks | Public `/health` returns only `ok`, `service`, `version`. Errors carry this Worker's codes only. `kosif_think_status` shows how access is configured (counts and flags), never a value. |

`think-mcp/worker.test.mjs` proves each row (CI step "Test KOSIF Think MCP access control").

### One entry point, one status tool (0.14.0)
`tools/list` shows `kosif_auto` as the only entry point (it replaces `kosif_think` and `kosif_preflight`; `planOnly:true` is the no-model preflight), `kosif_think_status` as the only status tool (it now carries the self-test and the runtime diagnostics that `kosif_self_test` and `kosif_diagnostics` returned) and `kosif_full_pro_execute` as the only way to start Full Pro (it starts or resumes through `kosif_full_pro_start`). The five merged names are no longer listed but stay callable, so existing callers and the mobile bridge keep working.

### Deploying (manual; no workflow deploys this Worker)
1. `wrangler.think.toml` carries the live `FULL_PRO_STATE` (KV), `FULL_PRO_QUEUE`, `SECURE_EXECUTOR` and `KOSIF_JEV` bindings (read back from the deployed Worker). The queue consumer is attached on the `kosif-full-pro-jobs` queue itself; check after a deploy that `wrangler queues info kosif-full-pro-jobs` still lists `kosif-think-mcp` as its consumer.
2. Set the owner allow-list: `npx wrangler secret put KOSIF_OWNER_SUBS --config wrangler.think.toml` (your Auth0 user id from Auth0 → User Management → Users).
3. A server that calls Full Pro without a user sign-in — the WhatsApp MCP relays `kosif_full_pro_execute` and `kosif_mobile_*` — must send `Authorization: Bearer <KOSIF_THINK_TOKEN>`: put the same value in that Worker's `KOSIF_THINK_TOKEN` secret.
4. `npx wrangler deploy --config wrangler.think.toml`, then check: a Full Pro tool without a token → `401`; `kosif_think_status` → `access.fullProBridgeRequiresAuth: true`.
