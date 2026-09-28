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

