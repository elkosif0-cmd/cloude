# Branch Knowledge Merge — 2026-10-06

الهدف: قراءة كل فرع قديم/جانبي كمصدر معرفة، وليس كمرشح دمج أعمى. نستخرج أفضل فكرة/تنفيذ/واجهة/محرك/اختبار، ثم نطوّر بها النسخة الحالية على فرع التكامل، وبعد التحقق ننقلها إلى main.

## النطاق
- المصدر الأساسي قبل بدء العملية: 164 فرعًا بما فيها main.
- فروع المصدر غير main: 163.
- فرع العمل المؤقت: `integration/all-work-20261006`.
- قاعدة القرار: لا يُرفض فرع لمجرد أنه قديم أو لأن نفس القدرة موجودة؛ نقارن جودة الفكرة والتنفيذ.
- Jev يُستخدم عند وجود بدائل حقيقية، وليس بدل القراءة الهندسية.

## ترتيب الدفعة الأولى
| الترتيب | المصدر | الحالة | سبب الأولوية |
|---|---|---|---|
| 1 | PR #143 / `codex/sqc-five-audit-source-models-20261005` | COMPLETE | أكبر حزمة: مصادر، محركات، حماية، اختبارات |
| 2 | PR #140 / `feat/kosif-unified-financial-os-20261005` | COMPLETE | Company Platform, Master Data, Reporting Intake, Audit Inbox |
| 3 | PR #169 / `kosifsee/ux-clarity-20261006` | COMPLETE | توضيح البوابات الثلاث وتجربة الأدوات |
| 4 | PR #170 / `kosifsee/audit-context-separation-20261006` | COMPLETE | فصل سياق المراجعة عن المحاسبة |
| 5+ | بقية الفروع | QUEUED | تُقرأ واحدًا واحدًا كمصادر معرفة |

## معيار كل فرع
1. ما الفكرة المختلفة حتى لو كانت لنفس القدرة؟
2. هل طريقة الاستخدام أو الـUX أفضل؟
3. هل المعمارية أو العزل أو نموذج البيانات أفضل؟
4. هل فيه محرك/اختبار/حماية غير موجودة أو أقوى؟
5. هل يمكن تركيب أفضل أجزاء الفرع مع النسخة الحالية بدل استبدالها؟
6. ماذا نُقل فعليًا إلى فرع التكامل؟
7. ماذا لم ننقل، ولماذا؟

## PR #143 — قراءة أولية
الحجم: 176 ملفًا متغيرًا، +257,110 / -717، 7 commits.

المجالات عالية القيمة التي يجب فحصها قبل أي رفض:
- كتالوج وموديلات المصادر المرجعية.
- Source replay ومحركات القوائم/التحليل/السرد.
- مصادر P&G / Home Depot / McDonald's / Mercedes-Benz / Volkswagen.
- Company-chat scope safeguards.
- Public-demo selection/admission safeguards.
- Source provenance / freeze manifests / numerical oracles.
- اختبارات source fidelity / replay / re-import / preview boundaries.
- طبقة المراجعة والتقارير المرتبطة بالمصادر.

الحالة: التحليل العميق جارٍ؛ لا يوجد قرار نسخ أعمى أو رفض جماعي.


### PR #143 — نتيجة التنفيذ
- تمت القراءة كمصدر معرفة، وليس كدمج فرع كامل.
- ثبت أن وثيقتي Company Chat Isolation وPublic Demo Admission موجودتان أصلًا في main بالمحتوى نفسه؛ لم تُكررا.
- تم استرجاع **110 ملفات** من حزمة المصادر الموثقة: محركات + source-data + fixtures + اختبارات fidelity/replay.
- تمت إضافة/استرجاع محركات: Home Depot، Mercedes-Benz، McDonald's، Volkswagen، Reference Index، Source Replay، وP&G source package.
- تم توصيل **6 محركات مصادر** إضافية داخل `app/src/engine/fusion/index.ts` مع الحفاظ على محركات main الأحدث.
- تحقق وجود الملفات الأساسية على فرع التكامل بعد النقل.
- ما لم يُنسخ: أي ملف قديم كان سيستبدل منطقًا أحدث في main بلا فائدة إضافية.

الحالة: **COMPLETE — المعرفة المفيدة من PR #143 نُقلت إلى فرع التكامل.**

## PR #140 — بدأ التحليل
المطلوب فحصه: Company Platform، Master Data، Reporting Intake، Audit Inbox، تثبيت الأدوات لكل شركة، Capability Registry والعقود المرتبطة.


### PR #140 — نتيجة التنفيذ
- تمت مقارنة الفرع مع النسخة الحالية بدل نسخه بالكامل.
- تبين أن المسارات الجوهرية التي كان الفرع يقدمها موجودة بالفعل في النسخة الحالية: `company-platform` و`standards` و`audit-inbox` و`master-data` و`reporting-intake` ومراجعة قيود اليومية.
- ملفا `audit-inbox.js` و`reporting-intake.js` متطابقان حرفيًا مع النسخة الحالية، وكذلك اختبار `journal_review_contract.test.mjs`.
- النسخة الحالية من `company-platform.js` أوسع من نسخة PR #140 وتضيف VAT Policy وSector Pack وتسجيل استثناءات AI ومعالجتها، لذلك لم يتم استبدالها بنسخة أقدم.
- النسخة الحالية من `standards.js` و`master-data.js` أوسع/أحدث، ولذلك تم الاحتفاظ بها.
- `build.py` الحالي موصل بالفعل للوحدات الخمس الأساسية من PR #140، و`helper-space.js` الحالي يحفظ مفتاح `skosif_company_platform_v1`.
- النتيجة: **لا توجد شفرة صافية أفضل تحتاج نقلًا من PR #140**؛ القيمة المفيدة منه محفوظة بالفعل في النسخة الحالية، فتم تجنب التراجع أو التكرار.

الحالة: **COMPLETE — PR #140 تمت مراجعته واستخلاصه، وأفضل ما فيه موجود بالفعل في خط الأساس الحالي.**

## PR #169 — بدأ التحليل
التركيز: وضوح البوابات الثلاث المعتمدة في FOUNDATION §3، تقليل التداخل البصري، ترتيب الأدوات، وتسلسل الوصول للقسم/المساحة بدون فقد قدرات قائمة.


### PR #169 — نتيجة التنفيذ
- تم فحص تغييرات واجهة الدخول ومساحة الأدوات واختبارات البوابات.
- تغييرات `unlock.html` في الفرع كانت متسقة مع مبدأ **ثلاثة مداخل** المعتمد حاليًا في FOUNDATION §3، لكن لم ننسخ النسخة القديمة بالجملة لأن `main` كان قد تطور بعدها؛ أخذنا فقط التحسينات الصافية التي لا تستبدل منطقًا أحدث.
- تم أخذ أفضل فكرة UX من الفرع: **الأداة أولًا، وسياق الشركة اختياري** داخل بوابة الأدوات.
- تم دمج هذه الفكرة مع النسخة الحالية بدل استبدالها، مع الحفاظ على **AI Exception Queue** والقدرات الأحدث الموجودة في `helper-center.js`.
- أُضيفت تسميات موجّهة بالمهمة: التكلفة والتسعير، المبيعات والعملاء، المخزون والمشتريات، الدفاتر والتحليل، التقارير والمستندات.
- أضيف مؤشر واضح لحالة سياق الشركة، وتحسينات وصول/لمس في CSS.
- أضيف اختبار عقدي يثبت أن بوابة الأدوات تبقى task-first وأن ربط الشركة اختياري.

الحالة: **COMPLETE — أخذنا جوهر UX الأفضل من PR #169 مع الالتزام بنموذج البوابات الثلاث المعتمد حاليًا في الدستور.**

## PR #170 — بدأ التحليل
التركيز: فصل سياق المراجعة عن المحاسبة، استقلال ملف المراجعة، ومنع أي ربط ضمني يجعل نتائج الأدوات أو دفاتر المحاسبة دليل مراجعة تلقائيًا.


### PR #170 — نتيجة التنفيذ
- تم أخذ جوهر الفصل بين المراجعة والمحاسبة بدون نسخ الفرع كاملًا.
- أُضيف أمر جلسة مستقل `sqc_gate_audit_new` لفتح ملف مراجعة جديد بدون شركة محاسبية.
- تم تعديل `gate.js` بحيث ينتظر وحدة المراجعة فقط، ولا ينتظر `SK.company.ready` ولا يبدّل مساحة الشركة.
- تم تعديل `helper-space.js` بحيث نية «مراجعة جديدة» أو «شركة مرجعية» لا تحفظ Snapshot للشركة ولا تغيّر الشركة النشطة.
- أُضيف `newEngagement()` داخل `tb-review.js`: ينشئ ملف مراجعة فارغًا مملوكًا للمراجعة، ثم يمكن استيراد دفاتر المحاسبة لاحقًا فقط بإجراء صريح.
- أزيل اختيار شركة مضيفة ضمنيًا من `unlock.html` عند بدء مراجعة جديدة أو فتح corpus مرجعي.
- أُضيف اختبار `audit_context_independence.test.mjs` وتم توصيله إلى CI للتأكد من عدم حدوث كتابة أو تبديل سياق شركة عند بدء مراجعة مستقلة.
- تم الحفاظ على التعديلات الأحدث في main مثل الشركات النموذجية والقطاع، بدل نسخ نسخة أقدم من الفرع.

الحالة: **COMPLETE — استقلال سياق المراجعة أصبح حدًا تنفيذيًا واختباريًا، وليس مجرد نص واجهة.**


## دفعة التحقق المباشر — موجودة أصلًا في main
تم التحقق من الفروع التالية بمقارنة رأس كل فرع مع `main`. النتيجة: لا توجد ملفات مختلفة تحتاج نقلًا؛ كل المعرفة البرمجية لهذه الفروع موجودة بالفعل في `main` الحالي أو في نسخة لاحقة منه:

- PR #174 — `claude/cycle-proof-types-20261006` — 0 ملفات مختلفة.
- PR #173 — `claude/cycle-proof-20261006` — يظهر commit إضافي بلا أي file delta؛ لا توجد شفرة ناقصة.
- PR #172 — `claude/model-companies-20261006` — 0 ملفات مختلفة.
- PR #171 — `claude/digital-pack-20261006` — 0 ملفات مختلفة.
- PR #168 — `claude/hospitality-pack-20261006` — 0 ملفات مختلفة.
- PR #167 — `claude/construction-pack-20261006` — 0 ملفات مختلفة.
- PR #166 — `claude/vat-return-boxes-20261006` — 0 ملفات مختلفة.
- PR #165 — `claude/health-vat-20261006` — 0 ملفات مختلفة.
- PR #164 — `claude/health-case-cost-20261006` — 0 ملفات مختلفة.
- PR #160 — `claude/p3-health-claims-20261006` — 0 ملفات مختلفة.

الحالة: **VERIFIED-IN-MAIN — لا يلزم نسخ أو دمج إضافي لهذه الدفعة؛ تجنبنا تكرار كود موجود بالفعل.**


## دفعة التحقق المباشر الثانية — موجودة أصلًا في main
تمت مقارنة الفروع التالية مع `main` الحالي، وجميعها `ahead=0` وبدون أي file delta؛ أي أن الشفرة والقدرات منها ممتصة بالفعل في النسخة الحالية:

- PR #159 — `claude/meat-receipts-1310-20261006` — معالجة استلام الذبائح/المخزون.
- PR #158 — `claude/p3-meat-pack-20261006` — حزمة قطاع اللحوم وتشغيل التقطيع.
- PR #157 — `claude/p2-definitions-pickers-20261006` — تعريفات الشركة داخل اختيارات البيع والشراء.
- PR #156 — `claude/vat-policy-everywhere-20261006` — سياسة VAT عبر الشاشات.
- PR #155 — `claude/p2-ledger-integrity-20261006` — سلامة الدفاتر وسياسة VAT.
- PR #154 — `claude/p5-corpus-scorecard-20261006` — one-company/one-figures وcorpus scorecard.
- PR #153 — `claude/m1-gates-20261006` — هيكل الدخول والقطاع (تاريخي؛ لا يعاد فرض نموذج الثلاث بوابات على الرؤية الحالية).
- PR #152 — `docs/rule-zero-checkpoint-20261005-r2` — جرد Rule Zero.

الحالة: **VERIFIED-IN-MAIN — لا نقل إضافي، ولا إعادة إدخال لنسخ أقدم.**


## دفعة #151 → #144 — نتيجة المراجعة

### PR #151 — Rule Zero inventory
- رأس الفرع خلف `main` الحالي وبدون أي file delta.
- الجرد الإلزامي العميق موجود بالفعل في `FOUNDATION.md` الحالي بصورة أوسع.
- الحالة: **VERIFIED-IN-MAIN**.

### PR #150 وPR #149 — وثائق Product Mandate التاريخية
- تحتويان أفكارًا مفيدة عن حدود الأدلة، حفظ القدرات، العزل، وعدم تحويل القوائم المنشورة إلى دفاتر معاملات مخترعة.
- هذه الحدود المفيدة موجودة بالفعل في الدستور/الحماية الحالية وفي Source Replay واختبارات استقلال المراجعة التي تم دمجها.
- لم تُنسخ تعديلات هيكل الدخول من هذين الفرعين لأنها تعيد فرض تفسير تاريخي لعدد المداخل؛ هذا النوع من القرار لا يُستعاد من فرع قديم أثناء جرد تقني، بل يتبع تعليمات المالك الأحدث وتحديث الدستور المقصود.
- الحالة: **KNOWLEDGE-EXTRACTED / NO CODE MERGE**.

### PR #148 — AI Exception Queue
- اختبار `tools/ai_exception_queue_contract.test.mjs` في `main` مطابق للفرع.
- `company-platform.js` الحالي ما زال يحتوي `aiExceptions` و`addAIException` و`resolveAIException` وحد `requiresHumanDecision:true`.
- `helper-center.js` الحالي يحتفظ بـ AI EXCEPTION QUEUE وقرارات القبول/الرفض/الإغلاق دون تنفيذ محاسبي تلقائي.
- الحالة: **VERIFIED-IN-MAIN / CURRENT IS SUPERSET**.

### PR #147 — Standards company layer
- `main` الحالي يحتوي خدمة `SKosifStandards` والبحث في `searchCodex` وعدم الاعتماد التلقائي.
- المساعد الحالي يحتوي `standards_search` ويربط `SKosifStandards`.
- Master Data الحالي يحتوي اختيار إطار IFRS / SME / EAS.
- النسخ الحالية أوسع من الفرع.
- الحالة: **VERIFIED-IN-MAIN / CURRENT IS SUPERSET**.

### PR #146 — Audit tab selector fix
- تم فحص الإصلاح نفسه لا مجرد اسم الفرع.
- `tools/feature_audit.mjs` الحالي يحتوي بالفعل المحددين الدقيقين:
  - `.tbr-tabs [data-tab="tb"]`
  - `.tbr-tabs [data-tab="fs"]`
- الحالة: **VERIFIED-IN-MAIN**.

### PR #145 — Assistant HELP parse hotfix
- الإصلاح التاريخي كان تحويل سطر خام داخل `HELP` إلى `\\n`.
- النسخة الحالية تحتوي النص بصيغة escaped وتبني بنجاح ضمن السلسلة الحالية، كما أنها أحدث بكثير من hotfix.
- الحالة: **VERIFIED-IN-MAIN**.

### PR #144 — Unified financial OS implementation
- هذا الفرع هو خط أساس أقدم للمكونات التي راجعناها أيضًا عبر #140.
- Company Platform / Master Data / Reporting Intake / Audit Inbox / Standards / journal review موجودة في `main` الحالي، وبعضها مطابق وبعضها صار Superset مع VAT Policy وSector Packs وAI Exceptions وتحسينات السياق.
- إعادة نسخ #144 ستستبدل منطقًا أحدث وتعيد أجزاء قديمة؛ لا توجد فائدة صافية تبرر ذلك.
- الحالة: **SUPERSEDED-BY-CURRENT / NO BULK MERGE**.

**خلاصة الدفعة:** لا توجد شفرة ناقصة تستحق النقل من #151–#144 بعد الفحص التفصيلي؛ تم حفظ المعرفة المفيدة وتجنب إعادة إدخال قرارات/نسخ أقدم.


## دفعة PR #142 → PR #128 — مراجعة المعرفة والتنفيذ

### PR #142 — External research backlog
- الملف `docs/registry/EXTERNAL_BACKLOG_ar.md` في `main` **مطابق حرفيًا** لنسخة الفرع.
- إحالة `docs/VISION_ar.md` إلى الـbacklog موجودة أيضًا.
- القرار: **VERIFIED-IN-MAIN** — لا نقل إضافي.

### PR #141 — «نبض اليوم» + تحسينات البناء على Windows
- `ui/features/pulse.js` و`tools/pulse.test.mjs` في `main` **مطابقان حرفيًا** للفرع.
- `docs/rebuild/PROGRAM_2_ar.md` الحالي ما زال يوثق «نبض اليوم» ورحلة المالية.
- القرار: **VERIFIED-IN-MAIN** — القدرة لم تضِع.

### PR #139 — تشخيص مشكلة Focus/Fullscreen
- الفرع كان **تشخيصًا مؤقتًا فقط** ومذكورًا صراحةً أنه لا يجب دمج Logger التشخيصي في الإنتاج.
- الـinstrumentation القديمة في `output.js` و`sk.js` لم تُستعد عمدًا لأنها logging مؤقتة قد تؤثر على التوقيت.
- الإصلاحات الفعلية انتقلت لاحقًا عبر #137/#163، واختبارات focus الحالية أوسع.
- القرار: **RETIRE-DIAGNOSTIC-CODE / KEEP-KNOWLEDGE** — نحتفظ بسبب المشكلة وطريقة القياس كمعرفة، ولا نعيد تفعيل الـdiagnostic في production.

### PR #138 — Helper gateway topology
- الاختبار الحالي `tools/helper_gateway.test.mjs` أطول وأحدث من نسخة الفرع، ويحتفظ باختبارات topology/permission ثم يضيف فوقها task-first semantics من #169.
- أي وثائق تربط ذلك بهيكل قديم لا تعلو على FOUNDATION الحالي.
- القرار: **CURRENT-IS-SUPERSET**.

### PR #137 — Native focus completion
- الفرع الآن `ahead=0` أمام `main`; لا توجد ملفات ناقصة.
- مضمونه أُعيد بناؤه أيضًا ضمن #163 على خط أحدث.
- القرار: **VERIFIED-IN-MAIN**.

### PR #136 — Four-gateway implementation (historical)
- لا توجد file delta حاليًا؛ الكود الذي بقي صالحًا امتصه main.
- مفهوم «أربع بوابات» نفسه **تاريخي** ويتعارض مع FOUNDATION §3 الحالي الذي يثبت ثلاث بوابات؛ لا يُعاد فرضه من فرع قديم.
- القرار: **KNOWLEDGE-EXTRACTED / ARCHITECTURE-SUPERSEDED**.

### PR #135 — Four-portal vision/source registry (historical)
- سجل مصادر القدرات والأفكار المفيدة استُوعب لاحقًا في سجلات Rule Zero وCapability Migration Matrix.
- عقد الأربع بوابات لا يُعاد لأنه قرار معماري قديم يخالف الدستور الحالي.
- القرار: **REGISTRY-KNOWLEDGE-KEPT / PORTAL-CONTRACT-RETIRED**.

### PR #134 — Apple published-source boundary
- `published-source-engine.ts` الحالي **مطابق حرفيًا** للفرع.
- اختبارات Apple وfixtures والحواجز ما زالت موجودة في `main`، ثم توسعت لاحقًا بحزمة #143 إلى مصادر أخرى.
- القرار: **VERIFIED-IN-MAIN / EXTENDED-LATER**.

### PR #133 — Report guards + preview accessibility
- الفرع `ahead=0` أمام main؛ لا يوجد code delta.
- القرار: **VERIFIED-IN-MAIN**.

### PR #132 — Workspace validation
- ملفات workflow والاختبارات موجودة في main؛ `tools/workspace_validation.test.mjs` **مطابق حرفيًا** للفرع.
- القرار: **VERIFIED-IN-MAIN**.

### PR #131 — Superseded preview accessibility branch
- كان قد وُسم أصلًا Superseded by #133، ثم أُخذت إصلاحات focus النهائية ضمن #137/#163.
- لا نعيد النسخة الوسطية لأنها تجمع نسخًا أقدم من workflows/tests.
- القرار: **SUPERSEDED / NO BULK MERGE**.

### PR #130 و#129 — All-periods company context
- #129 كان Superseded by #130.
- منطق الشركة/الفترة انتقل إلى المسار الحالي، بينما إعادة نسخ ملفات `engines.js` القديمة ستتراجع عن محركات أحدث.
- القرار: **KNOWLEDGE-KEPT / IMPLEMENTATION-SUPERSEDED**.

### PR #128 — Program 2 research + finance journey
- `app/src/engine/fusion/finance/finance-journey.test.ts` و`tools/bundle_verify.mjs` الحاليان **مطابقان حرفيًا** للفرع.
- وثائق التحقق للحزمة وبرنامج 2 موجودة في main.
- القرار: **VERIFIED-IN-MAIN**.

**خلاصة الدفعة:** لم تظهر شفرة صافية أفضل تحتاج نقلًا من #142–#128؛ ما كان صالحًا موجود في main، وما كان تشخيصيًا/معماريًا قديمًا وُثق سبب عدم إعادته بدل تجاهله.


## دفعة PR #127 → PR #118 — مراجعة المعرفة والتنفيذ

### PR #127 — Workspace validation (superseded by #132)
- `tools/workspace_validation.test.mjs` و`ui/features/workspace.js` في `main` مطابقان حرفيًا لنسخة الفرع.
- الفرع نفسه كان Superseded by #132.
- القرار: **VERIFIED-IN-MAIN / SUPERSEDED-BY-#132**.

### PR #126 — Fail-closed executive reports (superseded by #133)
- `tools/report_pack_guard.test.mjs` و`ui/features/report-pack.js` في `main` مطابقان حرفيًا لجوهر الفرع.
- `report_output_guard.test.mjs` الحالي أوسع من النسخة القديمة؛ لا نعيد harness أقدم.
- القرار: **CURRENT-IS-SUPERSET / SUPERSEDED-BY-#133**.

### PR #125 — Shared Studio component
- `ui/components/studio.js` و`customer-flow.js` و`product-flow.js` في `main` مطابقة حرفيًا للفرع.
- فكرة الاستوديو المشترك محفوظة وتعمل كأساس لتوحيد العرض بدل شاشات متفرقة.
- القرار: **VERIFIED-IN-MAIN**.

### PR #124 — Five company studios / domain organization
- الفكرة المفيدة: تجميع القدرات المتقاربة في عائلات/استوديوهات بدل قائمة ضخمة من الشاشات.
- `registry.js` الحالي أوسع من الفرع ويضيف البوابات والقطاعات والـshared gateways؛ لا يُستبدل بالنسخة الأقدم.
- `helper-center.js` الحالي أصبح Superset بعد #169: يحتفظ بالتجميع ويضيف task-first + optional company context + AI exception queue.
- القرار: **KNOWLEDGE-KEPT / CURRENT-IS-SUPERSET**.

### PR #123 — One visual brand
- `docs/design/SQC-IDENTITY-ar.md` و`ui/ds/sqc.css` في `main` مطابقان حرفيًا للفرع.
- القرار: **VERIFIED-IN-MAIN**.

### PR #122 — Identity drift ratchet
- رأس الفرع خلف main وبدون file delta.
- قواعد الـidentity reference / drift ratchet / focus ring موجودة في خط الإنتاج الحالي.
- القرار: **VERIFIED-IN-MAIN**.

### PR #121 — Motion layer
- رأس الفرع خلف main وبدون file delta.
- طبقة الحركة التي بقيت صالحة موجودة بالفعل في main.
- القرار: **VERIFIED-IN-MAIN**.

### PR #120 — Period/name hotfix
- رأس الفرع خلف main وبدون file delta.
- الإصلاحات absorbed في main.
- القرار: **VERIFIED-IN-MAIN**.

### PR #119 — One company context + Crystal World
- `ui/art/crystal-world.js` في main مطابق حرفيًا للفرع؛ الهوية البصرية/العالم البلوري لم تضِع.
- `ui/core/company.js` الحالي أوسع من نسخة الفرع؛ لا يُستبدل بنسخة أقدم.
- فكرة «one company context» تُستخدم داخل السياق الذي يحتاج شركة، لكنها لا تعيد فرض company-first على بوابة المنتج لأن FOUNDATION الحالي section-first.
- القرار: **VISUAL-KEPT / CURRENT-COMPANY-CONTEXT-IS-SUPERSET**.

### PR #118 — Company-first front door + Sales Intelligence in executive reports
- معمارية **company-first** نفسها superseded بالدستور الحالي: `القسم → الشركة/المساحة`.
- قدرة «ذكاء المبيعات» الأساسية **لم تضِع**: `salesintel` موجودة في main وتعمل من IDB per-company، و`reports.js` يستخدم نفس المحرك لرادار العملاء.
- الفرع القديم كان يحقن نتائج `SKosifSalesIntel.snapshot` مباشرة في الحزمة التنفيذية حسب 6/12 شهرًا.
- الحزمة الحالية أوقفت هذا الربط المباشر عمدًا لأن التقرير التنفيذي الآن fail-closed ومربوط بـimmutable company+period capture؛ مصدر المبيعات التشغيلي لم يكن مربوطًا بنفس الـscope، ولذلك يعرض القسم «غير متاح» بدل خلط شركة/فترة خاطئة.
- تم سؤال Jev بين أربع بدائل؛ النتيجة **REBUILD_SCOPED (100%)**: نحتفظ بالفكرة ونبني لاحقًا Sales Capture مربوطًا بنفس company+period token/hash قبل السماح بإظهار ذكاء المبيعات داخل التقرير التنفيذي.
- القرار: **REBUILD_SCOPED — capability preserved, unsafe direct binding not restored.**

الحالة: **COMPLETE — #127 إلى #118 تمت مراجعتها، وأفضل ما فيها إما موجود في main أو موثق كإعادة بناء آمنة بدل إعادة كود أقدم/أخطر.**


## دفعة PR #117 → PR #108 — مراجعة المعرفة والتنفيذ

### PR #117 — Council readiness + legacy report guard
- رأس الفرع خلف `main` وبدون أي file delta.
- ضوابط fail-closed للمجلس والتقارير غير المربوطة موجودة في الخط الحالي.
- القرار: **VERIFIED-IN-MAIN**.

### PR #116 — Shared Agent Work Log
- النسخة الحالية من `AGENTS.md` و`AGENT_WORKLOG.md` أكبر بكثير وتغطي نفس الفكرة مع قواعد أحدث: FOUNDATION-first، Claude lead coordination، Rule Zero inventory، handoff وNEXT ACTION.
- البند التاريخي company-first داخل worklog القديم لا يُعاد لأنه يخالف FOUNDATION الحالي.
- القرار: **CURRENT-IS-SUPERSET / HISTORICAL-TASK-SUPERSEDED**.

### PR #115 — Consistent box-only KPI counts
- رأس الفرع خلف main وبدون file delta.
- إصلاح اتساق عدّ البوكسات موجود بالفعل.
- القرار: **VERIFIED-IN-MAIN**.

### PR #114 — Review import guard + preserve docs on failed save
- رأس الفرع خلف main وبدون file delta.
- منطق الحماية والحفاظ على المستندات موجود بالفعل.
- القرار: **VERIFIED-IN-MAIN**.

### PR #113 — Sales date boundaries / returns / refresh / spreadsheet types
- رأس الفرع خلف main وبدون file delta.
- الإصلاحات موجودة في مسار Sales Intelligence الحالي.
- القرار: **VERIFIED-IN-MAIN**.

### PR #112 — Mercury styling for command center/reports
- رأس الفرع خلف main وبدون file delta.
- الأسلوب البصري الموحّد الحالي احتفظ بما تم اعتماده منه.
- القرار: **VERIFIED-IN-MAIN**.

### PR #111 — Verified Sales Intelligence
- رأس الفرع خلف main وبدون file delta.
- `salesintel` الحالي ما زال قدرة عاملة، ومحرك `sales-insights-engine.ts` هو مصدر الحقيقة.
- القرار: **VERIFIED-IN-MAIN**.

### PR #110 — Scoped management report snapshots
- رأس الفرع خلف main وبدون file delta.
- الـimmutable company+period capture والحواجز الحالية بُنيت فوق هذا الأساس.
- القرار: **VERIFIED-IN-MAIN**.

### PR #109 — Trial balance duplicate totals
- رأس الفرع خلف main وبدون file delta.
- الإصلاح موجود بالفعل.
- القرار: **VERIFIED-IN-MAIN**.

### PR #108 — Unlock focus outline
- رأس الفرع خلف main وبدون file delta.
- إصلاح الوصول البصري موجود في النسخة الحالية.
- القرار: **VERIFIED-IN-MAIN**.

الحالة: **COMPLETE — #117 إلى #108 كلها إما موجودة في main أو Superset حالي؛ لا توجد شفرة صافية أفضل تحتاج استعادة.**


## دفعة PR #107 → PR #98 — مراجعة المعرفة والتنفيذ

### PR #107 — Reversible sidebar visibility + responsive focus
- رأس الفرع خلف main وبدون file delta.
- القدرة موجودة في shell الحالي.
- القرار: **VERIFIED-IN-MAIN**.

### PR #106 — Login/PWA cache freshness
- رأس الفرع خلف main وبدون file delta.
- تحديثات freshness للـPWA والدخول موجودة بالفعل.
- القرار: **VERIFIED-IN-MAIN**.

### PR #105 — Report state + partial receipt posting
- رأس الفرع خلف main وبدون file delta.
- الإصلاحات موجودة في النسخة الحالية.
- القرار: **VERIFIED-IN-MAIN**.

### PR #104 — PWA theme consistency
- رأس الفرع خلف main وبدون file delta.
- القرار: **VERIFIED-IN-MAIN**.

### PR #103 — Audit readability/font consistency
- رأس الفرع خلف main وبدون file delta.
- تحسينات القراءة والخطوط امتصها main.
- القرار: **VERIFIED-IN-MAIN**.

### PR #102 — Secure entry UX + PWA identity
- رأس الفرع خلف main وبدون file delta.
- واجهة الدخول الحالية تطورت بعدها مع section-first door وحماية الشركة الخاصة.
- القرار: **VERIFIED-IN-MAIN / CURRENT-IS-NEWER**.

### PR #101 — Full Pro text revision/engineering prompts
- رأس الفرع خلف main وبدون file delta.
- التحديث محفوظ في خط KOSIF Think الحالي.
- القرار: **VERIFIED-IN-MAIN**.

### PR #100 — Encrypted sign-in performance/accessibility
- الفرع غير مدمج تاريخيًا لكنه أقدم كثيرًا من `unlock.html` الحالي.
- أفكاره المفيدة: progress state، `aria-busy`، eye-button semantics، تجنب استخدام كلمة مرور تغيرت أثناء الاشتقاق، وعدم فتح التطبيق عند فشل التحقق.
- النسخة الحالية من `unlock_runtime.test.mjs` أكبر، و`unlock.html` الحالي أعاد بناء الدخول بالكامل حول القسم/الشركة؛ نسخ النسخة القديمة سيكسر الباب الحالي.
- القرار: **KNOWLEDGE-KEPT / CURRENT-ENTRY-SUPERSEDES-OLD**.

### PR #99 — Incremental accessible UI + CI contracts
- رأس الفرع خلف main وبدون file delta.
- القرار: **VERIFIED-IN-MAIN**.

### PR #98 — Sales Intelligence v2
- القدرة الأساسية موجودة ومطوّرة في main: المحرك الحالي أكبر واختباراته أوسع.
- تحسينات النسخة الحالية فوق #98 تشمل: validation أدق للتاريخ، مفتاح الطلب scoped بـinvoice+date+channel+customer لمنع دمج معاملات منفصلة، as-of صحيح، returns على مستوى السطور، متابعة الإيقاع، تحسينات accessibility للـKPIs، وواجهة `snapshot` مشتركة.
- `sales-intel.css` الحالي أكبر دون فقد قواعد المصدر.
- `sales-lab.js` الحالي تطور بعد الفرع.
- القرار: **CURRENT-IS-SUPERSET — لا نعيد نسخة #98 الأقدم.**

الحالة: **COMPLETE — #107 إلى #98 تمت مراجعتها؛ لا توجد شفرة صافية أفضل تحتاج النقل، والمعرفة المفيدة موجودة أو تطورت في main.**


## PR #97 — KOSIF Think live runtime 0.27.3 — نتيجة التنفيذ
- هذا الفرع **ليس مجرد نسخة أقدم**: يحتوي Runtime live أكبر بكثير من `main`، مع 49 دالة/مسارًا غير موجودة بالاسم في خط الأساس عند الفحص.
- في المقابل، `main` يحتوي وظائف وعقودًا أحدث/مختلفة خاصة به؛ لذلك استبدال `worker.js` بالكامل كان سيخاطر بفقد قدرات حالية.
- تم سؤال Jev عن الاستراتيجية بين: overwrite / keep-main / archive-only / selective-port؛ القرار كان **SELECTIVE_PORT بنسبة 100%**.
- أول Slice نُقل وظيفيًا من #97:
  - **A1990 Capability Atlas v3** ومصادره/حزم طرق التفكير.
  - اختيار حزم القدرات تلقائيًا حسب موضوع الطلب ونوع المنفذ.
  - حقن الحزم المختارة داخل كل خبير من Council-500، بحيث تتحول المهارات القديمة إلى قيود/طرق عمل فعلية وليست مجرد فهرس.
  - حفظ `capability_atlas_version` و`capability_packs` داخل حالة الطلب وإظهارها في status كإيصال.
  - إضافة أداة `kosif_capability_route` لعرض الحزم المختارة قبل التنفيذ بدون ادعاء تشغيل أدوات خارجية.
  - إضافة اختبار `think-mcp/capability-atlas.test.mjs` يقفل هذا الربط ويمنع ضياعه لاحقًا.
- **لم يتم overwrite** لملف runtime 0.27.3 المجمّع؛ بقية الأنظمة الفريدة فيه (Host Image QA / Render Packet / completion reconcile / recovery / archive / C500 validators) تبقى عناصر مراجعة تالية داخل نفس مصدر المعرفة، وتُنقل فقط كـslices مستقلة عند التحقق من عدم تعارضها مع main.

الحالة: **PR #97 — PARTIAL FUNCTIONAL EXTRACTION COMPLETE (Capability Atlas slice merged to integration); remaining unique subsystems queued for selective extraction, not blind overwrite.**


## PR #96 — KOSIF WhatsApp MCP 1.5.0 — نتيجة التنفيذ
- الفرع احتوى قدرة كاملة **غير موجودة في main وقت الفحص**: مجلد `whatsapp-bridge/` كامل + CI مستقل.
- تم استرجاع **25 ملفًا** كوحدة مستقلة بدل نسخ أجزاء متناثرة.
- القدرات المسترجعة تشمل:
  - Bridge runtime وcontainer.
  - MCP Worker.
  - Dispatch Worker وQueue Consumer.
  - Skill package لرسائل WhatsApp.
  - اختبارات bridge وMCP auth.
  - ملفات Wrangler وTypeScript وCI.
- أهم تحسين أمني محفوظ من الفرع: **Owner-only authorization**؛ الأدوات تفشل مغلقة إذا لم يوجد Auth0 owner token أو shared server token صالح.
- لم يتم تغيير بوابات التطبيق المحاسبي أو FOUNDATION؛ هذه قدرة تكامل خارجية مستقلة تُربط من طبقة الأدوات عند الحاجة.
- Workflow الموجود مسبقًا `.github/workflows/wa-deploy.yml` كان يشير أصلًا إلى `whatsapp-bridge` بينما المجلد نفسه مفقود؛ الاسترجاع يعيد الاتساق بين workflow والكود.

الحالة: **COMPLETE — PR #96 functional subsystem recovered as a self-contained authenticated WhatsApp bridge.**


## دفعة PR #95 → PR #88 — مراجعة KOSIF Think التاريخية

### PR #95 — Full Pro auth gate + duplicate tool merge
- الفكرة المفيدة كانت: منع Full Pro bypass عبر auth، وإزالة تضارب اسم أداة Full Pro المكرر.
- الخط الحالي يحتوي OAuth/Auth0 metadata وحواجز Full Pro أحدث، ويوجد **تعريف واحد فقط** لأداة `kosif_full_pro_execute`.
- لم نعد دوال auth القديمة (`ownerAllowed/ownerSubs/bridgeNeedsAuth`) لأنها تخص تصميمًا أقدم، بينما العقود الحالية أوسع.
- القرار: **SECURITY-IDEA-PRESERVED / CURRENT-IS-SUPERSET**.

### PR #94 — Evidence consistency + reasoning protocol
- الفرع احتوى فكرة مفيدة **لم تكن موجودة في main أو PR #97**: تقرير معايرة تجريبي لاحتمالات Jev مقابل النتائج الفعلية.
- تم استرجاعها وظيفيًا:
  - `wilsonLowerBound`.
  - `calibrationReportTool`.
  - أداة جديدة `kosif_calibration_report`.
  - Brier Score + ECE + reliability bins + Wilson lower bound لكل أداة + حالات false-confidence.
  - قاعدة أمان صريحة: التقرير **لا يخفّض operational gates تلقائيًا**.
  - اختبار `think-mcp/calibration-report.test.mjs`.
- بقية reasoning modules القديمة لا تُنسخ لأن Capability Atlas v3 المسترجع من PR #97 أوسع وأحدث.
- القرار: **FUNCTIONAL EXTRACTION COMPLETE — calibration recovered; older reasoning selector superseded by Capability Atlas.**

### PR #93 — Jev-gated routing + reasoning protocol
- جوهر routing موجود في `kosif_route` الحالي، مع capability mesh، حواجز المخاطر، Jev، التحقق، وtool inventory أحدث.
- `reasoningModulesFor` القديم تم تجاوزه بواسطة Capability Atlas v3.
- calibration المشترك مع #94 تم استرجاع النسخة الأحدث من #94 فقط.
- القرار: **CURRENT-IS-SUPERSET / KNOWLEDGE-KEPT**.

### PR #92 — Dynamic Capability Mesh
- `capabilityMesh` موجود في runtime الحالي.
- لا حاجة لإعادة نسخة 0.7.0 القديمة فوق runtime أحدث.
- القرار: **VERIFIED-IN-CURRENT**.

### PR #91 — Jev-Browser hardening
- منطق browser reliability والتحقق اللاحق تطور لاحقًا؛ runtime الحالي يحتوي مسارات التحقق، recovery، وtool routing.
- القرار: **SUPERSEDED-BY-LATER-RUNTIME**.

### PR #90 — Adaptive settle + rich verification
- `adaptiveSettle` موجود في runtime الحالي.
- القرار: **VERIFIED-IN-CURRENT**.

### PR #89 — Deterministic public fallback
- fallback/preflight logic موجود ومتوسع في runtime الحالي.
- القرار: **VERIFIED-IN-CURRENT**.

### PR #88 — Evidence verification + candidate tournament
- `evidenceConsistency` و`candidate_tournament` موجودان في runtime الحالي، مع `optionBindingConsistency` و`decisionSensitivity` كطبقات أحدث.
- القرار: **CURRENT-IS-SUPERSET**.

الحالة: **COMPLETE — #95 إلى #88 تمت مراجعتها؛ الميزة الصافية الوحيدة التي كانت مفقودة (empirical calibration) تم إحياؤها فعليًا، والباقي موجود أو تطور في runtime الحالي.**


## دفعة PR #87 → PR #78 — مراجعة المعرفة والتنفيذ

### PR #87 — Verified Jev browser choice application
- التغيير كان مرحلة مبكرة من تطبيق قرار Jev على مسار المتصفح.
- runtime الحالي يحتوي Jev routing + candidate tournament + verification + recovery بصورة أوسع.
- القرار: **SUPERSEDED-BY-CURRENT-RUNTIME**.

### PR #86 — Complete Jev-Browser capability contract
- العقد الحالي أوسع ويشمل capability mesh وrisk gates وpostcondition verification.
- القرار: **CURRENT-IS-SUPERSET**.

### PR #85 — Jev-Browser routing contract
- نسخة وسيطة مغلقة قبل #86/#87؛ لا يوجد سبب لإعادة منطق أقدم.
- القرار: **SUPERSEDED**.

### PR #84 — Prefer KOSIF Computer for browser/device routing
- فكرة تفضيل أداة الكمبيوتر لمسارات الجهاز محفوظة في router الحالي، ومعها اختبارات توجيه أحدث.
- القرار: **KNOWLEDGE-KEPT / CURRENT-IS-SUPERSET**.

### PR #83 و#82 — Public deterministic preflight + protected model tools
- نفس الرأس ونفس الفكرة.
- preflight/fallback/auth موجودة في runtime الحالي بطبقات أحدث.
- القرار: **VERIFIED-IN-CURRENT**.

### PR #81 — Restored capabilities + safety fixes
- هذا الفرع غير مدمج تاريخيًا كفرع كامل، لكن الفحص الملفي أظهر أن أفضل ما فيه **وصل إلى main لاحقًا**:
  - `tools/advances_e2e.mjs` مطابق حرفيًا.
  - `ui/legacy/v31.html` و`v33.html` و`v40.html` مطابقة حرفيًا.
  - حزمة vendor المحلية بالكامل (Chart.js / html2canvas / jsPDF / xlsx-js-style) مطابقة حرفيًا، وبالتالي سياسة عدم تحميل third-party scripts من الشبكة محفوظة.
  - `helper-space.js` و`ledger.js` الحاليان أكبر بكثير من نسخ الفرع ويحتويان معماريات وقدرات أحدث؛ لا يتم استبدالهما.
  - `demo.js` الحالي أوسع من الفرع.
- القرار: **CAPABILITIES-VERIFIED-IN-MAIN / CURRENT-IS-SUPERSET**.

### PR #80 — Safe core stats before boot
- رأس الفرع خلف main وبدون file delta.
- القرار: **VERIFIED-IN-MAIN**.

### PR #79 — Restore advances/original systems/product cost map
- رأس الفرع خلف main وبدون file delta؛ القدرات التي استعادها موجودة في النسخة الحالية.
- القرار: **VERIFIED-IN-MAIN**.

### PR #78 — 43-company showcase
- رأس الفرع خلف main وبدون file delta.
- فكرة corpus/showcase companies تطورت لاحقًا في source catalog وaudit corpus.
- القرار: **KNOWLEDGE-KEPT / CURRENT-IS-SUPERSET**.

الحالة: **COMPLETE — #87 إلى #78 تمت مراجعتها؛ لا توجد شفرة صافية أفضل مفقودة، والفرع #81 الذي بدا غير مدمج ثبت أن قدراته الأساسية وصلت إلى main لاحقًا.**


## دفعة PR #77 → PR #68 — مراجعة المعرفة والتنفيذ

### PR #77 — Accountant workspaces + optional local PIN
- رأس الفرع خلف main وبدون file delta.
- مفهوم workspaces والعزل انتقل لاحقًا إلى `helper-space.js` الحالي بشكل أوسع.
- القرار: **VERIFIED-IN-MAIN / CURRENT-IS-SUPERSET**.

### PR #76 و#75 — 320px mobile modal actions
- `tools/modal_actions_e2e.mjs` الحالي **مطابق حرفيًا** لنسخة الفرعين.
- `tools/phone_layout.mjs` الحالي مطابق لنسخة #75.
- CSS الحالي تطور بعد الفرع، بينما اختبار 320px ما زال يحمي السلوك المقصود.
- القرار: **VERIFIED-IN-MAIN**.

### PR #74 و#73 — KOSIF Think host tool router + cost guardrails
- هذه هي الجذور التاريخية لـ `kosif_route`.
- runtime الحالي أوسع: live inventory، cost classes، risk checkpoints، dependency groups، candidate tournament، Jev gating، recovery، verification، وCapability Atlas.
- القرار: **CURRENT-IS-SUPERSET / ROOT-IDEA-PRESERVED**.

### PR #72 — Audit request library + round 2 + presentation + benchmarks + IFRS 18/19
- رأس الفرع خلف main وبدون file delta.
- القدرات التي أطلقها هذا الإصدار موجودة في main أو تطورت لاحقًا.
- القرار: **VERIFIED-IN-MAIN**.

### PR #71 — Audit release bundle + #sales + Think 0.4.2
- رأس الفرع خلف main وبدون file delta.
- القرار: **VERIFIED-IN-MAIN**.

### PR #70 — Session-only error banner
- رأس الفرع خلف main وبدون file delta.
- فصل أخطاء الجلسة عن سجل التشخيص موجود ضمن shell الحالي.
- القرار: **VERIFIED-IN-MAIN**.

### PR #69 — Touch targets + status contrast
- رأس الفرع خلف main وبدون file delta.
- معايير الوصول تطورت لاحقًا، واختبارات الهاتف الحالية تغطيها.
- القرار: **VERIFIED-IN-MAIN**.

### PR #68 — Jev public page + scrub bridge errors
- رأس الفرع خلف main وبدون file delta.
- منطق Jev/bridge الحالي أحدث.
- القرار: **VERIFIED-IN-MAIN / SUPERSEDED-BY-CURRENT-JEV-CONTRACT**.

الحالة: **COMPLETE — #77 إلى #68 تمت مراجعتها، ولا توجد شفرة صافية مفقودة تحتاج نقلًا.**
