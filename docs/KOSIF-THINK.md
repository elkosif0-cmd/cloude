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


## KOSIF Think v2 — Clean APIs frontier council
- **Fast** keeps the low-latency Cloudflare council: Llama 3.3 70B Fast + Mistral Small 3.1 24B + Llama 4 Scout.
- **Council** routes to the new Clean APIs secret using GPT-5.6 Sol + Claude Opus 5 + Gemini 3.7 Flash in parallel.
- **Deep** uses the same frontier trio, then critique and revision rounds before Jev handoff.
- If fewer than two Clean APIs frontier agents succeed, the stage automatically falls back to the Cloudflare fast council.
- The Clean APIs credential remains a Cloudflare secret named `cleanapis`; its value is never committed to GitHub or returned by the MCP.
- Frontier synthesis prefers GPT-5.6 Sol; Kimi K2.6 on Workers AI remains the synthesis fallback.
- The MCP still returns a structured `jev_payload` for the existing Jev Bridge decision gate.
