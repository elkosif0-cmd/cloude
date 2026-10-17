# kosif-audit-studio — تقرير الجرد العميق (2026-10-06)

> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `08aa142`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.

## 1. المستودع

- `github.com/kosif199022-jpg/kosif-audit-studio` — عام · اللغة الرئيسية JavaScript · 5,127 ك.ب على GitHub · آخر دفع 2026-09-28 · الفرع الافتراضي `main`
- الوصف على GitHub: —
- النسخة المفحوصة: **200 ملفاً** (1.4 م.ب) بعد استبعاد .engines-build, .git, .next, .venv, __pycache__, build, coverage, dist, node_modules, vendor, venv.
- الفروع: 51 · طلبات الدمج المفتوحة: 5 · Issues المفتوحة: 2

## 2. التغطية

- حالة الجرد: **عميق للكود المنقول إلى ui/audit (مولَّد بـ tools/vendor_audit.py)؛ الـPRs والـIssues المفتوحة مفحوصة عناوينها في §11 من تقرير المستودع**
- ما لم يُفحص: الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه

## 3. البنية

| المجلد | الملفات | الحجم |
|---|---|---|
| `(root)` | 56 | 746 ك.ب |
| `v5` | 56 | 320 ك.ب |
| `tests` | 43 | 164 ك.ب |
| `production-whatsapp` | 6 | 84 ك.ب |
| `public-jev` | 4 | 68 ك.ب |
| `cloudflare` | 10 | 45 ك.ب |
| `docs` | 11 | 21 ك.ب |
| `jev-public` | 2 | 13 ك.ب |
| `whatsapp-container-v2` | 3 | 10 ك.ب |
| `scripts` | 1 | 5 ك.ب |
| `cinema` | 6 | 4 ك.ب |
| `tools` | 1 | 2 ك.ب |
| `benchmarks` | 1 | 1 ك.ب |

الامتدادات: `.js` 131، `.css` 23، `.md` 18، `.json` 7، `.html` 5، `.toml` 4، `.mjs` 3، `(بلا)` 2، `.svg` 2، `.sql` 2، `.webmanifest` 1، `.jsonc` 1، `.ts` 1

نقاط الدخول والإعداد:

- `public-jev/worker.js`
- `jev-public/worker.js`
- `whatsapp-container-v2/server.mjs`
- `index.html`
- `manifest.webmanifest`
- `cloudflare/wrangler.document.example.toml`
- `cloudflare/wrangler.toml`
- `production-whatsapp/package.json`
- `package.json`
- `public-jev/wrangler.toml`
- `production-whatsapp/container/package.json`
- `whatsapp-container-v2/package.json`
- `jev-public/wrangler.toml`
- package.json — deps: —; devDeps: —

سكربتات package.json: `test`: node --test tests/*.test.js؛ `check`: node scripts/check-static.mjs

## 4. README (`README.md`، أول الأسطر)

    # KOSIF Audit Studio
    ## KOSIF 4 — Intelligence Studio
    تطوير للنسخة المرفقة v3.2، يحافظ على شاشات المراجعة والحسابات الحتمية ويضيف ثلاث مساحات عمل:
    1. **استوديو الإيجنت**: اسأل عن الأولويات والمخاطر وفجوات الأدلة والجاهزية والمعايير. كل إجابة تحمل بصمة مصدرها؛ يمكن تحويل الأولويات إلى خطة وصياغة مذكرة قابلة للتحرير.
    2. **مساحة العمل**: أنشئ خطة، افتح مهمة، وحدد المسؤول والموعد والحالة وملخص الإجراء. الإكمال أو الانتظار يحتاج مبررًا. تحديث المصدر يجعل الخطة بحاجة إلى تجديد؛ تحتفظ النسخة بسجل آخر خمس خطط.
    3. **مرصد المراجع**: مصادر رسمية من IAASB وIFRS Foundation وSOCPA، مع الإصدار والرابط وتاريخ التحقق. حدد بداية الفترة المالية لمقارنة السريان الدولي، ثم تحقق من الاعتماد المحلي والتطبيق المبكر.
    المساعد الجديد يعمل بقواعد محلية وبيانات الملف، وليس نموذجًا لغويًا سحابيًا. لا يرسل محادثاته أو بيانات المراجعة إلى طرف خارجي. وظيفة الصوت الموجودة تستخدم خدمات التعرف على الكلام التي يوفرها المتصفح،
    ### تجربة الاستخدام
    - استورد الميزان، أو حمّل البيانات التجريبية الحالية.
    - افتح الإيجنت وجرّب «ما أعلى المخاطر؟»، «ما فجوات الأدلة؟» أو «جهز خطة العمل».
    - أنشئ الخطة؛ افتح المهام للوصول إلى سجل الخطر أو شاشة الإجراء المرتبطة.
    - اعقد جلسة مجلس جديدة. تسعة تخصصات تستعرض سندها؛ يُطلب تحديث الجلسة إذا تغير الملف قبل حسم نزاع.
    - صيّغ مذكرة، حرّرها، واحفظها أو نزّلها. المسودات القديمة تحتفظ ببصمة مصدرها.
    - استخدم التنقل السفلي على الجوال، و`Ctrl/Cmd+K` أو `/` للبحث والأوامر، و`V` للصوت. الحركة تحترم إعداد النظام، ويمكن تقليلها من زر الحركة على اللابتوب.
    ### حدود النسخة وتسليمها
    بيانات الارتباط محفوظة محليًا على الجهاز كما في التطبيق الأصلي؛ صدّر JSON للاحتفاظ بنسخة قابلة للنقل. إكمال مهمة لا يغلق خطرًا ولا يعتمد رأيًا. تقييم الدليل التشغيلي لا يحل محل الحكم على كفايته وملاءم
    التحسينات على فرع مستقل من `kosif199022-jpg/kosif-audit-studio`. لم يُستبدل Worker المنشور باسم `kosif-stable`؛ تبين أنه يربط خدمات إضافية على Cloudflare، لذا يتطلب دمج الواجهة الجديدة هناك الحفاظ على
    المراجع المستخدمة موجودة بروابطها الرسمية في `reference-registry.js`؛ تحقق الروابط وتواريخ السريان في 2026-09-05. لم تُنسخ نصوص المعايير المحمية.
    ### وحدات الإصدار الرابع
    - `agent.js`: خطط وإجابات ومذكرات وبصمات حالة وتحديثات المهام؛ وظائف قابلة للاختبار بلا متصفح.
    - `reference-registry.js`: فهرس المصادر وحساب السريان والبحث.
    - `studio.js` و`studio.css`: الشاشات الجديدة وتجربة التفاعل والحركة والاستجابة.
    - `scripts/check-static.mjs`: فحص JavaScript والمراجع المحلية وأسماء الشاشات والعناصر وذاكرة PWA.
    نظام تشغيل تدقيق عربي مستقل يجمع محرك KOSIF الحتمي مع طبقة تشغيل Moon المحكومة داخل دورة ارتباط قابلة للتتبع.
    ## ما الذي يعمل الآن؟
    - استيراد CSV وExcel والتعرف على الأعمدة العربية والإنجليزية.
    - بيانات تجريبية حتمية من **5000 حساب متزن** ببذرة ثابتة.
    - حساب الأموال بوحدات صحيحة `BigInt`، وفحص توازن وتكرار واتجاه الرصيد.
    - تصنيف الحساب وربطه بمعايير IFRS/IAS وISA والتأكيدات.
    - محرك مخاطر قابل للتفسير: أرصدة غير معتادة، مبالغ مستديرة، حسابات معلقة، أطراف ذات علاقة، ECL، المخزون، الإيراد والتقديرات.
    - أهمية نسبية، أهمية أداء، حد تافه، ومعاينة عشوائية/منهجية/MUS قابلة لإعادة التنفيذ.
    - عشر جولات ارتباط ببوابات جاهزية واضحة.
    - مركز قيادة يحدد المرحلة والعوائق والخطوة التالية من حالة الملف الفعلية.
    - فحص قيود يومية وفق ISA 240 للقيود اليدوية، الإقفال، العطلات، المبالغ المستديرة والمستخدمين قليلي الظهور.
    - برنامج أوراق عمل يُولد من المخاطر، وطلبات PBC، وسجل نتائج وتحريفات.
    - سجل أدلة ببصمة SHA-256 للملف عند اختياره، ودرجة جودة، وحالة مراجعة، وربط بالخطر وورقة العمل.
    - مستكشف تتبع يعرض الحساب ← الخطر ← الإجراء ← الدليل ← الاستنتاج ويكشف الحلقة المفقودة.
    - سجل مصادر وإصدارات يميز SOCPA 2025 ومرجع 2018 التاريخي وIFRS للمنشآت الصغيرة والمتوسطة وحزمة DipIFR التدريبية.
    - بطاقات تطبيقية لأقسام IFRS للمنشآت الصغيرة والمتوسطة 1-10 واختبار أهلية الإطار.
    - إصدارات محفوظة للأهمية النسبية وسجل أحداث متسلسل يكشف تغيير التاريخ المحلي.
    - **جديد 3.1** — مجلس مراجعين محكوم بتسعة مقاعد (مدير الارتباط، IFRS، ISA، الاحتيال، البيانات، الجودة، الرقابة الداخلية، الزكاة والضريبة، الاستمرارية والتقييم) لكل مقعد عقد دور صريح؛ المواقف تُشتق من 
    - تقارير قابلة للطباعة/PDF، حزمة JSON كاملة، ولقطة أرشيف لا تُتاح قبل اكتمال البوابات والاعتماد البشري.
    - **جديد 3.0** — قوائم مالية مشتقة حتميًا (مركز مالي + ربح أو خسارة) مع التحقق من المعادلة المحاسبية وتصدير CSV.
    - **جديد 3.0** — سبع نسب مالية (ISA 520) بمعادلة ظاهرة وحكم اتجاهي، واختبار بنفورد للرقم الأول بمقياس MAD.
    - **جديد 3.0** — مؤشرات الاستمرارية ISA 570.A3 وحزمة السعودية: معقولية ضريبة القيمة المضافة وتقدير الوعاء الزكوي.

## 5. الوحدات المصدرية

99 وحدة (الأكبر أولاً؛ تُعرض 99). «ماذا تفعل» = أول تعليق في الملف كما كُتب.

| الملف | أسطر | تصديرات | TODO | ماذا تفعل |
|---|---|---|---|---|
| `app.js` | 2219 | 0 |  | — |
| `data.js` | 778 | 6 |  | Curated knowledge catalogue for KOSIF Audit Studio. |
| `legacy.html` | 554 | 0 |  | <title> KOSIF 4 — Audit Intelligence Studio |
| `engine.js` | 1087 | 26 |  | KOSIF Audit Studio deterministic engine. All accountable monetary calculations use integer minor units (BigInt). AI-style commentary in the UI never posts entries or approves an audit opinion. |
| `public-jev/kosif-jev-worker.js` | 240 | 0 |  | — |
| `studio.js` | 217 | 1 |  | — |
| `research-engine.js` | 631 | 5 |  | KOSIF Research Intelligence Extension Deterministic planning helpers derived from recurring audit-report patterns in the Global Financial & Audit Research Bundle. These functions support professional judgement; they do n |
| `v5/continuous-dashboard.js` | 54 | 3 |  | — |
| `analytics.js` | 363 | 11 |  | يبني قائمة المركز المالي وقائمة الربح أو الخسارة من ميزان المراجعة المصنف. المبالغ تُعرض بالإشارة الطبيعية للقسم (أصل موجب = مدين، التزام موجب = دائن). |
| `voice.js` | 420 | 3 |  | ---------- موجّه النوايا المحلي الاحتياطي ---------- |
| `council.js` | 208 | 5 |  | يبني جلسة مجلس كاملة من حالة الملف. كل الأرقام تأتي من المحرك؛ المجلس يقرأ ولا يحسب. |
| `production-whatsapp/src/index.ts` | 330 | 2 |  | WhatsApp bridge: Worker -> Durable Object -> Baileys container. |
| `cloudflare/document-worker.js` | 252 | 0 |  | KOSIF V5 — unified Realtime + Document Intelligence Cloudflare Worker. Secrets: OPENAI_API_KEY. Optional bindings: KOSIF_DB (D1), KOSIF_DOCUMENTS (R2). |
| `public-jev/worker.js` | 286 | 0 |  | — |
| `v5/continuous-documents.js` | 31 | 8 |  | — |
| `v5/report-model.js` | 109 | 2 |  | KOSIF V5 — source-backed professional report model. Rendering is a separate concern. |
| `v5/dashboard-capabilities.js` | 105 | 11 |  | — |
| `agent.js` | 106 | 9 |  | Operational change detection, not a cryptographic signature or an approval. |
| `v5/document-intelligence.js` | 217 | 8 |  | KOSIF V5 — Document Intelligence domain normalization. Pure functions only. AI output is untrusted until normalized and reviewed. |
| `jev-public/worker.js` | 12 | 0 |  | — |
| `research-lab.html` | 82 | 0 |  | <title> KOSIF Research Intelligence Lab |
| `research-lab.js` | 194 | 0 |  | — |
| `v5/continuous-reporting.js` | 38 | 7 |  | — |
| `moon-core.js` | 171 | 4 |  | — |
| `whatsapp-container-v2/server.mjs` | 276 | 0 |  | — |
| `v5/continuous-spreadsheet-intake.js` | 19 | 1 |  | — |
| `cloudflare/engagement-api.js` | 31 | 2 |  | KOSIF V5 — authenticated D1 persistence for engagement workspace state. |
| `v5/continuous-equity.js` | 20 | 2 |  | — |
| `v5/engagement-machine.js` | 82 | 9 |  | KOSIF V5 — Engagement state machine. Pure domain code: no DOM, storage, network, or AI calls. |
| `v5/continuous-issues.js` | 15 | 2 |  | — |
| `cloudflare/gateway-worker.js` | 106 | 0 |  | /health is read cross-origin by the canonical S-KOSIF app (https://s-kosif.pages.dev) and the audit studio: it answers OPTIONS itself and every GET carries CORS for an origin listed in ALLOWED_ORIGIN or PERSISTENCE_ALLOW |
| `v5/report-recipes.js` | 14 | 4 |  | KOSIF V5 — intent-driven report recipes and adaptive evidence requirements. |
| `v5/continuous-council.js` | 22 | 4 |  | — |
| `v5/continuous-cash-flow.js` | 21 | 2 |  | — |
| `index.html` | 13 | 0 |  | <title> KOSIF — نظام تشغيل المحاسبة والمراجعة والتقارير |
| `v5/completion-engine.js` | 75 | 4 |  | KOSIF V5 — completion room gates. System facts and human professional decisions stay separate. |
| `continuous-review.html` | 13 | 0 |  | <title> KOSIF 5 — Audit & Financial Reporting OS |
| `v5/disclosure-engine.js` | 29 | 4 |  | KOSIF V5 — governed disclosure/notes candidate engine. |
| `v5/continuous-completion.js` | 16 | 2 |  | — |
| `reference-registry.js` | 37 | 5 |  | Links and effective dates checked against publisher pages on 2026-09-05. These are original summaries and navigation metadata, not standard texts. |
| `v5/continuous-workspace-navigation.js` | 26 | 4 |  | — |
| `v5/continuous-statement-lineage.js` | 13 | 3 |  | — |
| `v5/traceability.js` | 12 | 7 |  | KOSIF V5 — generic traceability graph for documents -> reports. |
| `v5/report-publication.js` | 17 | 5 |  | KOSIF V5 — presentation/export layer. It never changes report approval state. |
| `v5/spreadsheet-intake.js` | 26 | 9 |  | — |
| `v5/issue-workflow.js` | 53 | 4 |  | KOSIF V5 — issue-centric review domain. Human resolution stays separate from automated signals. |
| `v5/continuous-trace-inspector.js` | 17 | 3 |  | — |
| `scripts/check-static.mjs` | 90 | 0 |  | — |
| `v5/continuous-persistence.js` | 26 | 3 |  | KOSIF V5 — browser persistence coordinator for D1-backed engagement snapshots. |
| `v5/audit-coverage.js` | 22 | 5 |  | KOSIF V5 — assertion coverage + council-round delta. Pure domain functions. |
| `v5/equity-engine.js` | 11 | 5 |  | KOSIF V5 — strict statement of changes in equity engine. |
| `v5/report-intake.js` | 33 | 3 |  | KOSIF V5 — report recipe requirements -> governed intake requests. |
| `v5/adjustment-ledger.js` | 12 | 6 |  | KOSIF V5 — immutable balanced adjustment ledger. |
| `v5/evidence-requests.js` | 11 | 5 |  | KOSIF V5 — Council asks -> governed evidence requests. |
| `v5/statement-comparison.js` | 17 | 2 |  | KOSIF V5 — Original vs Adjusted financial-statement comparison. |
| `v5/specialist-registry.js` | 16 | 3 |  | KOSIF V5 — dynamic specialist recommendation registry. Recommendations request expertise; they do not fabricate a specialist conclusion. |
| `realtime.js` | 141 | 2 |  | KOSIF Audit Studio — OpenAI Realtime WebRTC client The browser never receives the OpenAI API key. It sends its SDP offer to the configured Cloudflare Worker endpoint and receives the SDP answer. |
| `v5/continuous-coverage.js` | 11 | 2 |  | — |
| `sw.js` | 32 | 0 |  | — |
| `v5/continuous-disclosures.js` | 13 | 3 |  | — |
| `v5/report-approval.js` | 17 | 4 |  | KOSIF V5 — human report review and controlled issuance. |
| `v5/review-loop.js` | 10 | 4 |  | KOSIF V5 — continuous evidence -> council -> request -> evidence loop orchestration. |
| `v5/document-client.js` | 50 | 1 |  | Browser client for KOSIF server-side document intelligence. No OpenAI API key is accepted here. |
| `v5/statement-lineage.js` | 15 | 2 |  | KOSIF V5 — account-level lineage for SFP/P&L comparison rows. |
| `v5/report-detail-builders.js` | 12 | 6 |  | KOSIF V5 — source-backed detail builders for professional report sections. |
| `v5/cash-flow-engine.js` | 10 | 4 |  | KOSIF V5 — strict, source-backed cash flow movement engine. |
| `v5/continuous-publication.js` | 15 | 2 |  | — |
| `v5/report-source.js` | 28 | 3 |  | KOSIF V5 — deterministic source fingerprint for report freshness (not a security hash). |
| `v5/continuous-statements.js` | 8 | 2 |  | — |
| `v5/continuous-store.js` | 43 | 14 |  | — |
| `cloudflare/realtime-worker.js` | 78 | 0 |  | KOSIF Audit Studio — Cloudflare Worker for OpenAI Realtime WebRTC Required secret binding: OPENAI_API_KEY Optional plain-text binding: ALLOWED_ORIGIN (defaults to *) |
| `continuous-review.js` | 26 | 0 |  | — |
| `v5/trace-inspector.js` | 22 | 2 |  | KOSIF V5 — resolves any traceable object and its upstream/downstream lineage. |
| `v5/continuous-report-intake.js` | 10 | 4 |  | — |
| `v5/restore-points.js` | 11 | 5 |  | KOSIF V5 — IndexedDB restore points inspired by the supplied dashboard safety layer. |
| `v5/workspace-layout.js` | 29 | 5 |  | KOSIF V5 — pure workspace information architecture. |
| `v5/report-cash-flow.js` | 6 | 1 |  | KOSIF V5 — attaches only approved, reconciled cash flow versions to the report. |
| `product-model.js` | 35 | 0 |  | — |
| `v5/report-equity.js` | 6 | 1 |  | KOSIF V5 — attaches only approved, reconciled changes-in-equity versions to the report. |
| `v5/equity-workflow.js` | 9 | 3 |  | KOSIF V5 — human-governed immutable changes-in-equity versions. |
| `v5/cash-flow-workflow.js` | 9 | 3 |  | KOSIF V5 — human-governed immutable cash flow versions. |
| `tools/gateway-cors-browser.mjs` | 27 | 0 |  | Browser regression: a page on another origin reads the gateway's /health (Chromium enforces CORS). Usage (needs Playwright): node tools/gateway-cors-browser.mjs "$PWD/cloudflare/gateway-worker.js" |
| `v5/engagement-persistence.js` | 28 | 1 |  | KOSIF V5 — authenticated optimistic-concurrency client for engagement persistence. |
| `v5/report-disclosures.js` | 8 | 1 |  | — |
| `cloudflare/engagement-auth.js` | 13 | 1 |  | KOSIF V5 — shared engagement-token authorization for protected document operations. |
| `v5/state-codec.js` | 31 | 5 |  | KOSIF V5 — deterministic JSON codec for workspace state containing BigInt values. |
| `audit-report-engine.js` | 53 | 2 |  | KOSIF Audit Report Template Engine Converts audit evidence into structured professional report outputs. Design goal: keep source evidence, standards references and conclusions traceable. |
| `cloudflare/migrations/0001_v5_document_intelligence.sql` | 51 | 0 |  | — |
| `v5/ui-assets.js` | 7 | 2 |  | KOSIF V5 — single registry for optional UI styles loaded by the modular shell. |
| `cinema/threeAuditScene.js` | 45 | 2 |  | KOSIF Cinema 3D Audit Galaxy Foundation Three.js-ready scene configuration |
| `cinema/cinemaCommandCenter.js` | 32 | 2 |  | KOSIF Audit Cinema Edition Command Center visual layer foundation |
| `cinema/auditCinemaConfig.js` | 33 | 1 |  | — |
| `audio-export.js` | 25 | 2 |  | KOSIF audio export helper |
| `attachments.js` | 30 | 1 |  | KOSIF attachment manager Handles local attachment lifecycle before secure upload integration. |
| `cloudflare/migrations/0002_v5_engagement_persistence.sql` | 24 | 0 |  | — |
| `cinema/evidenceGalaxy.js` | 26 | 2 |  | Evidence Galaxy Connects audit evidence, accounts, standards and findings |
| `cinema/cinemaRuntime.js` | 25 | 1 |  | KOSIF Cinema Runtime Bridge Connects cinematic UI layer with audit engines |
| `v5/dashboard-suite.js` | 5 | 2 |  | — |
| `docs/kosif-report-templates.html` | 1 | 0 |  | <title> KOSIF Report Templates |

## 6. الاختبارات (43)

- `tests/public-jev-worker.test.js` (245 سطراً) public-jev/kosif-jev-worker.js is the production source of the kosif-jev Worker: the page (PAGE), its browser script (APP_JS) and the Worker routes. Image understanding goes ChatGPT Web via TinyFish first, then Cloudflar
- `tests/engine.test.js` (214 سطراً) 
- `tests/equity-workbench.test.js` (33 سطراً) 
- `tests/v5-core.test.js` (18 سطراً) 
- `tests/research-engine.test.js` (147 سطراً) 
- `tests/cash-flow-workbench.test.js` (31 سطراً) 
- `tests/freshness-specialists.test.js` (60 سطراً) 
- `tests/document-reader.test.js` (21 سطراً) 
- `tests/analytics.test.js` (97 سطراً) 
- `tests/completion-issuance.test.js` (52 سطراً) 
- `tests/statement-lineage.test.js` (28 سطراً) 
- `tests/engagement-worker-persistence.test.js` (42 سطراً) 
- `tests/disclosure-engine.test.js` (16 سطراً) 
- `tests/issue-workspace.test.js` (19 سطراً) 
- `tests/council.test.js` (66 سطراً) 
- `tests/document-auth.test.js` (39 سطراً) 
- `tests/report-depth.test.js` (19 سطراً) 
- `tests/agent.test.js` (56 سطراً) 
- `tests/report-publication.test.js` (21 سطراً) 
- `tests/dashboard-theme.test.js` (52 سطراً) since e3e1bbb the root shell paints with the KOSIF One editorial theme, layered after the dashboard theme
- `tests/v5-engagement-e2e.test.js` (30 سطراً) 
- `tests/audit-coverage.test.js` (15 سطراً) 
- `tests/report-intake.test.js` (17 سطراً) 
- `tests/dashboard-capabilities.test.js` (14 سطراً) 
- `tests/document-intelligence.test.js` (54 سطراً) 
- `tests/trace-inspector.test.js` (18 سطراً) 
- `tests/moon-core.test.js` (71 سطراً) 
- `tests/state-persistence-report.test.js` (43 سطراً) 
- `tests/statement-comparison.test.js` (14 سطراً) 
- `tests/v5-document-shell.test.js` (36 سطراً) 
- `tests/spreadsheet-intake.test.js` (14 سطراً) 
- `tests/gateway-health-cors.test.js` (41 سطراً) The canonical S-KOSIF app reads the gateway's /health from another origin. The live worker answered it without CORS and without an OPTIONS preflight, and its single ALLOWED_ORIGIN pointed at the old studio origin.
- `tests/workspace-layout.test.js` (12 سطراً) 
- `tests/report-disclosures.test.js` (15 سطراً) 
- `tests/voice.test.js` (32 سطراً) 
- `tests/statement-version-traceability.test.js` (14 سطراً) 
- `tests/service-worker.test.js` (24 سطراً) 
- `tests/disclosure-freshness.test.js` (22 سطراً) 
- `tests/v5-primary-shell.test.js` (29 سطراً) the root shell's title was renamed on purpose in 38ce4c5 (unify KOSIF product flow and report language)
- `tests/document-worker.test.js` (27 سطراً) 
- `tests/evidence-review.test.js` (21 سطراً) 
- `tests/data.test.js` (29 سطراً) 
- `tests/references.test.js` (15 سطراً) 

## 7. المخططات والبيانات

- `cloudflare/migrations/0001_v5_document_intelligence.sql`
- `cloudflare/migrations/0002_v5_engagement_persistence.sql`

## 8. المسارات والعمّال وواجهات API

- `cloudflare/document-worker.js: url.pathname === '/api/documents/analyze`
- `cloudflare/document-worker.js: url.pathname === '/api/realtime/session`
- `cloudflare/document-worker.js: url.pathname === '/health`
- `cloudflare/engagement-api.js: url.pathname==='/api/engagements`
- `cloudflare/gateway-worker.js: url.pathname==='/api/documents/analyze`
- `cloudflare/gateway-worker.js: url.pathname==='/health`
- `cloudflare/realtime-worker.js: url.pathname === '/health`
- `public-jev/kosif-jev-worker.js: url.pathname==='/`
- `public-jev/kosif-jev-worker.js: url.pathname==='/api/chatgpt-web/status`
- `public-jev/kosif-jev-worker.js: url.pathname==='/api/extract`
- `public-jev/kosif-jev-worker.js: url.pathname==='/api/file-support`
- `public-jev/kosif-jev-worker.js: url.pathname==='/api/public-jev`
- `public-jev/kosif-jev-worker.js: url.pathname==='/app.js`
- `public-jev/kosif-jev-worker.js: url.pathname==='/health`
- `public-jev/kosif-jev-worker.js: url.pathname==='/jev`
- `public-jev/kosif-jev-worker.js: url.pathname==='/public`
- `public-jev/worker.js: url.pathname === "/`
- `public-jev/worker.js: url.pathname === "/health`
- `public-jev/worker.js: url.pathname === "/index.html`
- `sw.js: addEventListener('fetch'`
- `whatsapp-container-v2/server.mjs: url.pathname === "/connect`
- `whatsapp-container-v2/server.mjs: url.pathname === "/logout`
- `whatsapp-container-v2/server.mjs: url.pathname === "/restore`
- `whatsapp-container-v2/server.mjs: url.pathname === "/send`
- `whatsapp-container-v2/server.mjs: url.pathname === "/send-bundle`
- `whatsapp-container-v2/server.mjs: url.pathname === "/send-media`
- `whatsapp-container-v2/server.mjs: url.pathname === "/state`
- `whatsapp-container-v2/server.mjs: url.pathname === "/status`

## 9. مواد الذكاء الاصطناعي والوكلاء

- `council.js`
- `jev-public/worker.js`
- `tests/council.test.js`

## 10. TODO / FIXME / HACK / DEPRECATED

- لا شيء.

## 11. المفتوح على GitHub

- PR #36 (2026-09-28) `claude/zealous-maxwell-sgg986`: Security: stop scraping the Jev bridge token; scrub credentials from worker errors and CI logs
- PR #35 (2026-09-26) `codex/wa-container-receipts-20260926`: WhatsApp container v2: receipt feed and media integrity
- PR #34 (2026-09-23) `arena/01a0cea7-kosif-audit-studio`: KOSIF 5.0: هوية تراثية موحّدة + مساعد ملف المراجعة + طباعة نظيفة
- PR #17 (2026-09-10) `feat/v5-primary-entry`: feat: make KOSIF V5 the primary Pages entry
- PR #1 (2026-09-25) `codex/restore-v2-mahmoud-capabilities`: استعادة قدرات KOSIF الموثقة وتوحيد مصدر الحقيقة
- Issue #33 (2026-09-13): KOSIF Heritage AI Theme Upgrade
- Issue #2 (2026-09-01): Upgrade KOSIF Audit Studio to Moon AI Audit Operating System capabilities
- الفروع: `arena/01a0cea7-kosif-audit-studio`، `claude/jev-worker-syntax-baseline`، `claude/whatsapp-integration-messaging-mvdnxr`، `claude/zealous-maxwell-sgg986-baseline-tests`، `claude/zealous-maxwell-sgg986-realtime-cors`، `claude/zealous-maxwell-sgg986`، `codex/cloud-evidence-r2`، `codex/cloud-foundation-v1`، `codex/cloudflare-access-auth-v1`، `codex/kosif-unified-foundation`، `codex/kosif-v4-agent-studio`، `codex/preserve-theme-cloudflare`، `codex/react-cloud-autosave-v1`، `codex/restore-v2-mahmoud-capabilities`، `codex/sites-v1-1-audit-intelligence`، `codex/wa-container-receipts-20260926`، `copilot/tqwrh-dv`، `feat/continuous-audit-core-v5-ci`، `feat/continuous-audit-core-v5`، `feat/dashboard-theme-capabilities`، `feat/document-intelligence-v5`، `feat/kosif-primary-modernization`، `feat/moon-command-center-phase-1`، `feat/realtime-webrtc-cloudflare`، `feat/v5-adaptive-report-intake`، `feat/v5-authenticated-document-upload`، `feat/v5-cash-flow-workbench`، `feat/v5-completion-issuance`، `feat/v5-council-delta-coverage`، `feat/v5-disclosure-engine`، `feat/v5-equity-workbench`، `feat/v5-freshness-specialists`، `feat/v5-interface-declutter`، `feat/v5-issue-workspace`، `feat/v5-persistence-report-model`، `feat/v5-primary-entry`، `feat/v5-primary-shell`، `feat/v5-report-depth`، `feat/v5-report-publication`، `feat/v5-secure-document-inspector`، `feat/v5-spreadsheet-intake`، `feat/v5-statement-comparison`، `feat/v5-statement-lineage`، `feat/v5-trace-inspector`، `fix/jev-empty-analysis-fallback`، `fix/jev-image-lock-test-20260927`، `main`، `ops/cloudflare-pages-deploy`، `rebuild/kosif-audit-studio-next`، `release-v1.1.0`، `research-bundle-audit-intelligence`

## 12. القدرات والقرارات (يدوي — `decisions.json`)

| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |
|---|---|---|---|---|---|---|---|---|---|
| مساحة المراجعة v5 (الاستوديو) | مساحة عمل مراجعة بتبويبات: الجولات، الأدلة، التحليل | المراجعة | عام | مدمج كوحدات ES في ui/audit | cloude: ui/audit/** | ملف المراجعة ← الاستوديو المتقدم | Keep (المصدر) + Merge أعمق في ملف المراجعة | feature_audit (استوديو) | P4: تبويب واحد لا تطبيق مضمَّن |
| استوديو التحليل ومختبر المعايير | تحليلات على الميزان ومختبر لتجربة المعايير | المراجعة (مشترك مع الأدوات: التحليل) | عام | مدمج | cloude: ui/audit | عائلة التحليل | Keep | — | — |
