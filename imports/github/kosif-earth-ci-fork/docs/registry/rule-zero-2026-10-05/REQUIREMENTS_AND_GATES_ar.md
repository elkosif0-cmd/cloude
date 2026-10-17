# FOUNDATION → متطلبات التنفيذ وأدلة القبول

تاريخ الفحص: 2026-10-05. المستودع: `kosif199022-jpg/cloude`.

## الحكم الحالي

هذا سجل متطلبات وقبول مشتق من الدستور، وليس تصميمًا جديدًا أو إعلان إكمال للموجات. التنفيذ التوسعي والنشر معلّقان حتى إغلاق جرد Rule Zero والمصالحة مع أحدث main. لا يوجد في هذه المراجعة تشغيل لشيفرة المستودعات أو تعديل بعيد.

- المرجع الأعلى: [FOUNDATION عند 799d8af](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md). تمت قراءته كاملًا.
- [START_HERE](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/START_HERE.md) ثم [PRODUCT_MANDATE_ar](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md). الـMandate لم يتغير عن 206a4da.
- [مقارنة 206a4da…799d8af](https://github.com/kosif199022-jpg/cloude/compare/206a4da751a6e827b0fcf7386964f6b75a154a16...799d8afa959215ab1eed27bd995f35029b98512d): التغيرات اللاحقة اقتصرت على FOUNDATION وAGENTS وإنشاء AGENT_WORKLOG. تم التحقق من مقارنة a4299d5…799d8af أيضًا: خمسة commits، 183 سطرًا إضافيًا للدستور، ولا تغيير runtime. نتائج القراءة الساكنة للكود عند 206a4da تبقى قراءة مصدر، لا نتائج تشغيل.
- «موجود في المصدر» لا يعني «ناجح End-to-End»؛ «اختبار محلي ناجح» لا يعني قبول المتصفح أو production؛ «UNAVAILABLE FOR INVENTORY» ليست حالة جرد مكتمل.

## الفجوات المؤكدة قبل أي موجة جديدة

1. [السجل الحالي](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/product/capability-source-registry.json) و[سجل الواجهة](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/ui/core/capabilities.json) يحتويان 78 معرفًا و4 بوابات تاريخية. يجب حفظ الـ78 معرفًا وقدراتها مع إعادة موضع reporting كخدمة مشتركة، لا حذف قدرات التقارير لإزالة البوابة الرابعة.
2. [docs/capabilities](https://github.com/kosif199022-jpg/cloude/tree/799d8afa959215ab1eed27bd995f35029b98512d/docs/capabilities)، [docs/sectors](https://github.com/kosif199022-jpg/cloude/tree/799d8afa959215ab1eed27bd995f35029b98512d/docs/sectors)، [docs/runbooks](https://github.com/kosif199022-jpg/cloude/tree/799d8afa959215ab1eed27bd995f35029b98512d/docs/runbooks) تحتوي README مواصفات فقط في الشجرة المفحوصة. هذا لا يثبت انعدام المحركات في بقية المستودع، لكنه لا يحقق مواصفات/Runbooks الموجات المطلوبة.
3. [catalog.json](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/knowledge/books/catalog.json) يحوي books=[]؛ سياسة المعرفة موجودة، لكن لا يجوز الادعاء بقراءة كتب المستودع. المكتبة المالية الخارجية وأعمالها السابقة أصول مستقلة يجب إدراجها.
4. أضيف [AGENT_WORKLOG.md الحالي](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/AGENT_WORKLOG.md) بعد فحص a4299d5 الذي أعاد 404؛ يحفظ سجل GOVERNANCE-20261005-001 ويجب الإضافة بعده دون استبداله بسجل قديم. [PR116](https://github.com/kosif199022-jpg/cloude/pull/116) يحوي سجلًا تاريخيًا عند 0babfb1 ويظل open وغير قابل للدمج في الفحص. [PR150](https://github.com/kosif199022-jpg/cloude/pull/150) open draft عند a911c113 وغير قابل للدمج؛ خطته M1–M7 ووثائقه لا يجوز أن تستبدل الدستور والـMandate الحاليين.
5. جرد الـ17 مستودعًا الحديث يشمل أصولًا مالية لم يعكسها السجل القديم: `moon`، والفروع غير المدمجة في `new` و`-`. اكتمال قائمة أسماء المستودعات لا يكفي لقبول P0 قبل تقييم الأصول والفروع والطلبات ذات الصلة.

## الإضافات الملزمة في النسخة الحالية

- [الجرد العميق وCapability Migration Matrix](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L44-L121): الفحص على مستوى الملفات/المحركات/services/schema/SQL/APIs/اختبارات/تعليقات/HACK/DEPRECATED وكل المسارات الرئيسية، وليس README أو أسماء فقط. لكل قدرة وصف فعلي للمدخلات/المخرجات/القواعد والتبعيات والاكتمال وأفضل تنفيذ والقطاع والحقوق واختبار عدم الفقد.
- [Claude قائد التطوير](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L168-L192): توزيع القدرات، ترتيب التنفيذ المعماري والتوفيق بين الأعمال يتبع التنسيق القيادي تحت المالك والدستور. البدائل تسجل PROPOSAL/CONFLICT بالأدلة ولا تطبق في مسار منافس. لا تُنسب إلى Claude وجهة لم تثبت من حالة حديثة.
- [هوية بصرية مركزية](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L645-L719): نظام tokens ومكونات واحد عبر الأقسام والـAI/المكتبة/الإعدادات/الحوارات والتقارير والطباعة والهاتف والتابلت والكمبيوتر، مع variants موثقة بدل أساليب محلية متفرقة. هذا قبول مطلوب دون تصميم جديد في هذا الفحص.

## قائمة الموجات المحددة بالنص، لا خطة بديلة

جميع بنود القبول أدناه مفتوحة ما لم يرفق دليل مطابق للـcommit النهائي. قوائم الاختبار تحوّل نصوص الدستور إلى أدلة مطلوبة؛ ليست ادعاء بأن الاختبارات كُتبت أو شُغلت.

### P0 — Discovery & Inventory

المصدر: [FOUNDATION 8–224](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L8-L224)، [Mandate 19–48 و383–404](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L383-L404).

- [ ] سجل حديث لكل المستودعات المتاحة، refs/branches/PRs/issues/discussions/طلبات سابقة/TODO/FIXME/roadmaps، مع مصدر وآخر وقت فحص وحدود الوصول.
- [ ] لكل أصل: الوظيفة، حالة التنفيذ الفعلية، مكانه الصحيح، التخصص القطاعي، الاعتماديات، المخاطر/الحقوق/الخصوصية، الاختبارات، وفرص التطوير.
- [ ] قرار Keep/Merge/Rebuild/Relocate/Specialize/Retire لكل أصل معروف. لا Retire بلا سبب وأثر واختبار عدم فقد الوظيفة. حفظ الـDraft PRs وفروع المكتبة المالية كأصول محتملة.
- [ ] إزالة التكرار على مستوى القدرة، مع بقاء provenance لكل تنفيذ، وتحديد النسخة الأقوى بالأدلة، لا بعمر الفرع.
- [ ] Capability Migration Matrix لكل قدرة: repo/ref/PR، files/modules، الاسم والوصف والمدخلات/المخرجات/القواعد، classification/sector، current state، dependencies، tests/evidence، duplicates/related، best implementation/merge plan، target، decision، migration status، acceptance tests، risks/gaps، owner/Agent وNEXT ACTION.
- [ ] Coverage لكل مستودع ولكل نظام/مسار رئيسي مع ما لم يفحص أو تعذر الوصول إليه؛ لا تكفي عينات مختارة لإعلان جرد كامل.
- [ ] قراءة حالة Claude الحديثة ذات الصلة وتسجيل اقتراحات إعادة التوزيع قبل تنفيذها؛ claims والتعارضات والنتائج المهمة تحدّث في worklog أولًا بأول.
- [ ] تحديث Capability Registry وCurrent-State Report وسجل تسليم append-first، وإغلاق أو إظهار كل فجوة وصول بدقة.

الحالة: جرد منسق قيد العمل. الـ78-ID crosswalk المرفق خط أساس حفظ فقط، لا حصر لكل قدرات الحساب. القبول: لا أصل معروف بلا تقييم/تصنيف/قرار؛ أي أصل غير متاح لا يدخل عدد «تم جرده».

### P1 — Navigation & Information Architecture

المصدر: [FOUNDATION 248–343 و478–493 و828–835](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L248-L343)، [Mandate 406–413](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L406-L413).

- [ ] ثلاث بوابات فقط: محاسبة، مراجعة، أدوات. المحاسبة: قطاع → نموذج/شركة → العمل. مراجعة مستقلة بلا شركة محاسبية. أدوات بلا شركة/بمساحة مستقلة/بربط اختياري.
- [ ] الروابط المباشرة والعودة/reload/Back/Forward/Cancel وتغيير القسم أو الشركة لا تعيد تنشيط سياق سابق ولا تكشف بياناته.
- [ ] الهاتف والتابلت والكمبيوتر وRTL/LTR، لوحة المفاتيح، وفصل state الخاص بالقسم والشركة وملف المراجعة والمساحة.
- [ ] مراجعة consistency للمكونات وtokens والـstates/الجداول/الرسوم/الحوارات مع visual regression وaccessibility وresponsive؛ الاختلاف variant موثق داخل النظام المركزي نفسه.
- [ ] «راجع هذه الشركة» handoff صريح محدود بالبيانات المطلوبة؛ لا إنشاء أو ربط ضمني بين الأقسام.

الحالة: main ما زال يحمل four-gateway registry. candidate الدخول المحلي جزئي ويصرح بغياب Sector-first وملكية مراجعة مستقلة وgrants أدوات دائمة. لا يقبل P1 بمجرد تغير أسماء البوابات أو نجاح VM.

### P2 — Accounting Core Integrity

المصدر: [FOUNDATION 268–287 و435–476](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L268-L287)، [Mandate 415–422](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L415-L422).

- [ ] مسار قابل لإعادة التشغيل: مستند/عملية → قيد متوازن → أستاذ → ميزان → ذمم/مخزون/تكلفة → قوائم → تسوية/إقفال، بالأرقام والسياسة والفترة نفسها.
- [ ] COA/master-data IDs موحدة وعلاقات فعلية مع العملاء والموردين والأصناف والتكلفة والضرائب؛ لا كتالوج موازٍ ينفصل عن التعريفات.
- [ ] اختبارات القيد الفارغ/غير المحدود/الحساب أو التاريخ غير الصالح، التكرار/idempotency، reversal، القيود المرحّلة، period locks، المعاملات متعددة الأجزاء والفشل الذري.
- [ ] تفسير وtrace لكل رقم، وتشغيل الحسابات بلا AI. تغير سياسة الضريبة/التكلفة/القطاع يصل للمنتجين جميعًا.

الحالة: القراءة الساكنة وجدت GL/TB/reversal/period-lock ومحركات sales/procurement posting قابلة لإعادة الاستخدام، لكن ledger validation وروابط UI للـmaster/profile/tax/cost لا تحقق الرحلة كاملة بعد. ملف `finance-journey.test.ts` المقروء يعتمد قيودًا منشأة يدويًا؛ لا يعادل رحلة مصدر عملية من UI. راجع CLOUDE_READONLY_REGISTRY.json.

### P3 — Sector Packs والنماذج المرجعية

المصدر: [FOUNDATION 435–508](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L435-L508)، [Mandate 117–154 و424–428](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L117-L154).

- [ ] Hospital: مطالبات/رفض/تسويات تأمين، تكلفة الحالة والخدمة، صيدلية/مختبر/أشعة، أطباء/عمولات، مراكز تكلفة وذمم ومعياري/فعلي.
- [ ] Hotel: غرف/حجوزات/إشغال/F&B، ودائع وقنوات/عمولات، إقفال ليلي، Housekeeping وصيانة، ربحية الغرفة والقسم.
- [ ] Construction: عقد/BOQ/مستخلصات/نسب إنجاز/WIP/محتجزات/تغيير/باطن/تكلفة وربحية متوقعة.
- [ ] Meat: وزن/رؤوس/قطع/Yield/تحويل/هدر/منتج ثانوي/تعبئة/دفعات وتبريد/تكلفة كيلو أو قطعة.
- [ ] Digital marketing: عميل/حملة/قناة/إنفاق/Retainer أو Project/عمولات/استحقاق أو تأجيل الإيراد/ربحية مرتبطة بالتحويلات.
- [ ] حفظ التعليم والتصنيع والمخابز والزراعة والتجارة؛ ليست خارج النطاق لأنها ليست ضمن الخمسة الأولى.
- [ ] سبعة نماذج محاسبية دنيا منفصلة عن ترتيب الأولوية: مستشفى، تعليم، مصنع، لحوم، مخبز، زراعة، تجارة. كل نموذج يمر بالدورة الفعلية مع طبيعي/استثنائي/تسويات/أخطاء.
- [ ] المستشفى Stress Model بإيراد شهري تجريبي >10 ملايين، حجم عمليات كبير، بيانات اصطناعية/مجهولة الهوية فقط.

الحالة: folder القطاع مواصفة عامة فقط؛ يلزم أولًا مقارنة المحركات/المهارات/الاختبارات المستخرجة من الحساب كله. القبول يثبت اختلاف المنطق والقيود والتكلفة والتقارير بحسب القطاع، لا مجرد مسميات مختلفة.

### P4 — Audit Platform

المصدر: [FOUNDATION 289–311](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L289-L311)، [Mandate 79–95 و430–438](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L79-L95).

- [ ] ملف مستقل مع scope لقوائم كاملة/بند/مستند/معالجة أو معيار، intake وPBC ومخاطر وأهمية نسبية وإجراءات تحليلية وتفصيلية.
- [ ] ربط كل بند/رصيد/مستند بالمعيار والمتطلب المهني والأدلة، مع مصدر/إصدار/تاريخ مناسب للمعيار.
- [ ] آراء مستقلة للمجلس، Jev عند الاختلاف، طلبات مستندات محددة وجولات إضافية؛ انتهاء بكفاية الأدلة أو تصريح عدم توفرها مع أثر النقص وعدم اليقين.
- [ ] تقرير نهائي وworkflow اعتماد بشري مناسب؛ لا تحويل اقتراح رأي آلي إلى ضمان مهني مستقل.

الحالة: أصول audit-studio/pro/trial-balance/see/moon ومحركات cloude موجودة في الجرد، بدرجات نضج مختلفة. لا يوجد في هذه المراجعة إثبات مسار أصلي كامل على main الحالي بكل هذه الشروط.

### P5 — Reference Corpus Benchmark

المصدر: [FOUNDATION 537–587](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L537-L587)، [Mandate 158–201 و440–446](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L158-L201).

- [ ] ابدأ من [المكتبة المالية الرسمية](https://kosif-financial-reference-library.smartsphere152.chatgpt.site/) والصفحات/PDF الأصلي؛ catalog لكل شركة/حالة قابلة للاستخراج من المرجع ذي 12,506 صفحة.
- [ ] حفظ أصول القراءة والاستخراج والمقارنة/replay والـPRs السابقة؛ لا تعاد عبارة «PDF لم يقرأ» التاريخية كحالة حالية.
- [ ] فصل extracted/inferred/synthetic في كل fact/fixture؛ وسم كل حزمة معاد بناؤها Synthetic Reconstruction مع provenance للصفحات.
- [ ] Matrix لكل حالة قابلة للتشغيل: Evidence Trace + Benchmark Comparison + Scorecard + Regression Result + Failure Log، ويشمل الأرقام والرأي والمخاطر/العرض والإفصاح والصياغة والبنية والطباعة.
- [ ] تشغيل audit E2E بالموفر المحلي/Brain عند تفعيله وبإذن scope مناسب، وتسجيل رفض/فشل/غياب الموفر بدل اختلاق نتيجة.

الحالة: نتائج الشركات والتقارير السابقة يجب حفظها وإعادة تقييمها مقابل هذا العقد. تطابق أرقام منشورة أو ست شركات أو replay اصطناعي لا يثبت تغطية جميع الحالات ولا audit assurance مستقلًا.

### P6 — Helper Tools + العلاقات + التشغيل والتحليل

المصدر: [FOUNDATION 313–343 و463–476 و510–535](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L313-L343)، [Mandate 315–332 و348–379 و448–453](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L315-L379).

- [ ] ثماني عائلات: بيانات/ملفات، مطابقات/تسويات، تكاليف/تسعير، تحليل/تنبؤ، رقابة/جودة، ضرائب/امتثال، إنتاجية/أتمتة، مطور/تكامل.
- [ ] حفظ/تقييم matching متعلم مع تأكيد بشري منخفض الثقة، Macro/recipes مقيدة، استنساخ تقارير يحفظ الحساب/التنسيق/الطباعة، كشوف يومية مؤرخة بمصادرها، تكاليف قطاعية.
- [ ] لكل أداة Owner/Inputs/Outputs/Tests/Placement وعقد قراءة/كتابة/events/postings/reports/mapping؛ لا screen مكرر لقدرة موجودة.
- [ ] Relationship Health يكشف mapping/schema/posting/sync المكسور، يمنع فسادًا صامتًا، يدعم إصلاحًا مختبرًا وتاريخ تغيير.
- [ ] تشغيل ومهام المحاسبين: أدوار ومسؤول وموعد وحالة وأولوية وروابط للمستند/الحساب/المشروع/المطالبة/مركز التكلفة، checklists إقفال واعتماد وتأخير وAudit Trail.
- [ ] تحليل أفقي/رأسي/نسب/trends/variance/ربحية، sensitivity/what-if/base-upside-downside/forecast/backtesting مع افتراضات وعدم يقين ومصدر؛ يعمل مستقلاً أو على بيانات شركة.

الحالة: السجل يحفظ أدوات كثيرة، لكنه لا يقدم قبول العقود/health/قطاعية التشغيل كاملًا. مهام المحاسبين والتنبؤ التزامان صريحان لا يجوز فقدهما لأن قائمة P0–P10 لا تمنحهما موجة منفصلة.

### P7 — AI Brain Connector

المصدر: [FOUNDATION 345–406](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L345-L406)، [Mandate 205–242 و455–461](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L205-L242).

- [ ] provider محلي/خارجي قابل للاستبدال، modes interactive/task/open-session، مع استمرار deterministic core عند فصله.
- [ ] App Context يصف schema/relations/pages/capabilities/permissions/data scope وله version/createdAt/expiry؛ تغير schema أو انتهاء المهلة يرفض القديم؛ قرارات/patch عالية الأثر مربوطة بالإصدار.
- [ ] مهمة حقيقية عبر tools ذات schema/policy/permission gates وAudit Trail، دون raw unrestricted DB/filesystem/production access.
- [ ] الجلسة مرئية ومملوكة للمستخدم وقابلة للفصل؛ لا كلمات مرور/cookies/session tokens أو تجاوز مصادقة؛ adapter معزول وfallback مشروع.
- [ ] منطق scope يرفض ردودًا متأخرة بعد تغيير الشركة/الملف/الجلسة، وتعتمد النتائج عالية الأثر وفق الصلاحيات والموافقة المناسبة.

الحالة: أصول provider/orchestration/AI موجودة؛ الكتالوج أو الاختبار دون provider لا يثبت task حقيقية governed. وصف الميزة في الدستور لا يمنح إذن اتصال أو إرسال بيانات أو وصول دائم.

### P8 — Reporting & Print

المصدر: [FOUNDATION 596–643](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L596-L643)، [Mandate 278–311 و463–469](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L278-L311).

- [ ] فصل data/calculation عن presentation وعن rendering؛ template بديل لا يغير الأرقام.
- [ ] A4/A3 portrait/landscape، headers/footers/page numbers، تكرار رؤوس الجداول، منع قص صف/عنوان، RTL/LTR وثنائي لغة عند الحاجة، خطوط/نسب/عملات/سوالب/إجماليات وحواشٍ ومصادر ورسوم قابلة للطباعة.
- [ ] تقارير حقيقية 100–150+ صفحة حين تستدعي الحالة دون حشو، TOC/أقسام/ملاحق/إيضاحات/cross-references/widows-orphans، وPDF مطابق للمعاينة.
- [ ] تحويل المرجع المعتمد إلى tokens/template spec، مقارنة بصرية ووظيفية، version/preview/rollback وvisual regression.
- [ ] حفظ هوية SQC الحالية ومقاييس الوصول ضمن نظام design tokens ومكتبة مكونات مركزية واحدة وprint/preview tokens؛ theme يبدل tokens ولا يصنع هوية لكل قسم. old dashboard layout لا يعلو على section-first.

الحالة: identity/tokens وتقارير/exports سابقة أصول قابلة للحفظ؛ لا يثبت ذلك acceptance لطباعة طويلة أو مصفوفة visual regression للـcommit الحالي.

### P9 — Developer Extensions

المصدر: [FOUNDATION 408–432](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L408-L432)، [Mandate 246–274 و471–477](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L246-L274).

- [ ] Export لصفحة/نموذج/تقرير/قدرة: fields/relations/sources/calculations/events/permissions/navigation/dependencies.
- [ ] Schema → permissions → dependencies/conflicts → preview/diff → sandbox/dry-run → acceptance tests → snapshot/version → atomic apply → rollback → Audit Trail.
- [ ] Patch تجريبي يغير نموذجًا ثم يعود للحالة المطابقة قبل التغيير؛ negative tests لصلاحية/نسخة قديمة/حذف/كسر روابط/تنفيذ غير مقيد.
- [ ] Python SDK/DSL مقيد؛ لا تنفيذ Python عشوائي أو scripts مكتبات غير مراجعة على الإنتاج.

الحالة: وجود extensions/skills/runner لا يساوي pipeline مقبولة؛ كل adapter ينقل الفكرة لا يمنحها صلاحية التنفيذ. لم ينفذ أي script مصدر ضمن هذا الفحص.

### P10 — Hardening

المصدر: [FOUNDATION 861–902](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/FOUNDATION.md#L861-L902)، [Mandate 479–488 و508–521](https://github.com/kosif199022-jpg/cloude/blob/799d8afa959215ab1eed27bd995f35029b98512d/docs/PRODUCT_MANDATE_ar.md#L479-L521).

- [ ] فصل الشركات والأقسام وengagement/workspace في جميع القراءة/الكتابة/النسخ الاحتياطي/التصدير/AI/caches والعمليات المتأخرة؛ تحكم server-side للبيانات المشتركة الحساسة.
- [ ] auth/RBAC/permissions والسياسات ومسارات high-impact approvals؛ private payload لا يفتح أو يتبنى نطاقًا تلقائيًا بسبب اسم أو شكل seed.
- [ ] backup/restore/migration/rollback والتعافي مجرّبة دون فقد أو تكرار أو تغيير blob محمي، مع observability وfailure logs وأداء مناسب لحجم النماذج.
- [ ] native mobile/desktop/refresh/interruption/repeated-click/Back/Forward/BFCache، build/lint/typecheck/full relevant regression وCI على نفس artifact/commit النهائي.
- [ ] docs وregistry وworklog حديثة؛ الاختبارات غير المشغلة أو الفاشلة ظاهرة ولا يحجبها رقم إجمالي ناجح.

الحالة: bootstrap local accepted محدود، admission النهائي مقبول محليًا ضمن نطاق مستقل محدود، ولا native acceptance أو full isolation. لا Critical regression في الحسابات/المراجعة/البيانات معيار قبول مطلوب، وليس نتيجة هذه المراجعة.

## أدلة التصحيحات المحلية الحالية وحدودها

- `company-chat-startup/manifest.json` / `company-chat-startup-review/REVIEW.md`: patch `1a35441307cf4be546ab51809fa29fce7f740700734390758205837fff48aeeb`، base `7da550d6debc90a3d0012b6e96cf99ab39a7cd96`، 7 ملفات. قبول مستقل للـsource/VM فقط؛ reviewer سجل 48 probe +73 startup/scope +86 regressions وlint. لا native/remote CI/deployment. لا نجمع أعداد author/reviewer المتداخلة كاختبارات مستقلة.
- `three-entry-admission-implementation/revision3-final/TASK3_MANIFEST.json`: patch `dd3cd474a431ef0840176da0832f403dced23b583e27d367b7eccb57f85a5201`، 24 changed files في طبقة Task3 إضافة إلى الطبقات السابقة. Manifest المؤلف يسجل 1026 nonbrowser و452 engine و67 entry و16 protected؛ نتائج المجموعات تتداخل وليست مجموعًا جديدًا. الـreview النهائي مقبول الآن للنطاق المحلي المحدود: 323 focused و3 whole-built controls و26 rebuilt-runtime؛ 815 reconstructed file hashes و7 output hashes متطابقة. native وقبول التركيب باقيان، ولا تجمع نتائج المؤلف والمراجع المتداخلة.
- Manifest admission يصرح أن startup repair المنفصل غير مضمّن، وأن sector-first غائب، وأن first-use/recovery المحمي والتحول من ordinary company غير متاحين، وبقاء إخفاقين preview-safety مرتبطين بغياب secure directory. لا يمحى ذلك من تقرير القبول.
- يوجد تداخل ملموس في helper-space.js وdemo.js وملفات fixtures/workflow؛ لا يجوز تركيب patchين آليًا أو نسخ دوال قديمة فوق تصحيح مقبول. RESERVATIONS_LOCAL.json يسجل كل ملفات الطبقات وتداخلها. هذه حجوزات تنسيقية محلية فقط، وليست locks منشورة.

## No-capability-loss — معايير ثابتة لكل موجة

1. **NCL-01 هوية الأصول:** لا معرف مفقود بين registry وUI قبل وبعد؛ يحتفظ كل merge بaliases/provenance وروابط المستهلكين. الـ78 معرفًا حد أدنى معروف، ويضاف كل أصل جديد من Rule Zero.
2. **NCL-02 البيانات:** mapping محدد لكل store/entity/ID/snapshot/document؛ مقارنة counts/hashes/relationships قبل وبعد باستخدام fixtures اصطناعية، واختبار استعادة فعلي. عدم قراءة ملفات محمية لا يساوي فقدها؛ تحفظ blobs بعينها.
3. **NCL-03 الوظيفة:** لكل قدرة baseline inputs/outputs/error paths، ثم replay بعد relocation/rebuild؛ شاشة ظاهرة لا تكفي ونجاح count لا يكفي.
4. **NCL-04 المحاسبة:** source→journal→GL→TB→statements بنفس الأرقام/الفترة/السياسة، مع negative tests وcross-company isolation.
5. **NCL-05 المراجعة:** استقلال ملف/أدلة/جولات/طلبات/معيار/حكم/تقرير؛ لا اختزالها إلى تحليل مالي أو محادثة.
6. **NCL-06 التقارير:** export/print/preview/data/provenance محفوظة عند إزالة بوابة reporting، مع صحة الأرقام واختبار بصري.
7. **NCL-07 الروابط:** deep links/installed-tool contracts/optional handoffs لا تفقد وظيفة ولا تمنح صلاحية إضافية؛ health tests تحكم كل تغيير schema أو mapping.
8. **NCL-08 scope:** اختبار كل قراءة/كتابة/export/AI/report/async path على نطاقين مستقلين؛ لا التسامح مع state قديم أو implicit central company.
9. **NCL-09 deterministic fallback:** انقطاع/فشل/تبديل AI لا يعطل الحسابات؛ uncertainty وحالات failure ظاهرة.
10. **NCL-10 القطاع:** أفضل منطق قديم يعاد تخصصه ويثبت سلوكه؛ لا تختفي القطاعات الثانوية أو تنقلب أدوات اللحوم إلى قواعد عامة خاطئة.
11. **NCL-11 الحقوق والأمان:** license/provenance/dependencies/privacy قبل reuse؛ لا استخراج أسرار أو نسخ بيانات خاصة أو scripts غير موثوقة. المهارة المرجعية ليست قدرة تنفيذية مقبولة.
12. **NCL-12 Retire:** يحتاج أصلًا معينًا وسببًا وأثرًا وبديلًا/تغطية مكافئة واختبارًا مثبتًا؛ لا retire بسبب العمر/اسم repo/عدم الدمج/فشل prototype.
13. **NCL-13 النسخة:** الدليل يحمل commit/artifact hash، بيئة وتاريخ، passed/failed/not-run؛ إعادة تركيب patches تبطل ضمان نتيجة مستقلة سابقة حتى يعاد التحقق.
14. **NCL-14 التسليم والقيادة:** السجل الحالي append-first، scope/file reservation واضح، المخاطر وNEXT ACTION محددان، وClaude يقود إعادة توزيع القدرات والتوفيق تحت المالك والدستور؛ لا بديل معماري صامت ولا استعادة worklog تاريخي فوق الحالي.
15. **NCL-15 الهوية الموحدة:** tokens ومكتبة مكونات وvariants موثقة عبر جميع الأقسام والـstates/themes والأحجام، مع visual/component/responsive/RTL/accessibility/print checks دون حذف وظيفة بسبب إعادة التصميم.

`NO_CAPABILITY_LOSS_CROSSWALK.json` يحفظ كل واحد من الـ78 IDs مرة واحدة مع الأصل والموضع التاريخي وقيود الموضع الإلزامية وأدلة القبول المطلوبة. قيود موضعه وقراراته preservation-only PROPOSAL حتى إكمال P0 وتنسيق Claude؛ لا قرار نقل منفذ؛ لا يتضمن Retire ولا يحوّل الحالة التاريخية working إلى قبول حالي.

## تحديث التنسيق والمراجعة المستقلّة

- نُشرت إضافتا التنسيق بواسطة الوكيل الرئيسي في [ae7d97e](https://github.com/kosif199022-jpg/cloude/commit/ae7d97e3d004cdd04c84da74ac84747e6a9d6f29). أعيدت قراءة [السجل المنشور](https://github.com/kosif199022-jpg/cloude/blob/ae7d97e3d004cdd04c84da74ac84747e6a9d6f29/AGENT_WORKLOG.md)، blob `912347b8bf5e9d0dc5f49cabd71a461e11822b87`؛ محتوى سجل 799d8af محفوظ كبادئة مطابقة ومعرفا المهمتين مرة واحدة. هذا commit تنسيق فقط؛ لا runtime جديد. ملفات APPEND/CANDIDATE المحلية محفوظة كأثر مراجعة ولا تعاد إضافتها مرة ثانية.
- قرئ `three-entry-admission-review/REVISION3_REVIEW.md` كاملًا: P0 الخاص بالـprotected binding في revision2 محلول في revision3 المحدد. قبول محدود source/VM/packaging، دون first-use/recovery أو native/BFCache/remote/provider/backend acceptance. تهيئة التطبيق العام قد تنشئ `user-main` فارغًا بلا company/private ownership؛ zero-storage ينطبق على dedicated public-tools host فقط، وليس التطبيق كله.
- لم تنشر هذه المراجعة شيفرة أو PR؛ النشر البعيد الوحيد المذكور أعلاه هو تحديث التنسيق المؤكد من الوكيل الرئيسي. مرجع متطلبات الدستور يظل 799d8af؛ ae7d97e لا يغيره.

## الخطوة التالية المحددة

إتمام consolidated Rule Zero registry/current-state مع حصر ما لم يفحص؛ ربط كل أصل بقرار ودليل وحقوق ومكان؛ قراءة أحدث main/PRs/worklog مرة أخرى؛ ثم تقديم مصفوفة الأدلة وتوصيات الموضع إلى التنسيق القيادي واختيار أول delta محدود لا يتعارض مع حجوزات التصحيحات. لا تعديل FOUNDATION أو PRODUCT_MANDATE باستخدام ملفات PR150 القديمة، ولا نشر candidate العمل المحلي أو دمج PR بلا سلطة صريحة ومراجعة النسخة النهائية.

## ملحق التنسيق الحالي عند إغلاق هذا checkpoint

هذا الملحق يحفظ وصف القراءة السابقة عند 799d8af ونشر dot عند ae7d97e كتاريخ مثبت؛ كلمة «الحالي» في تلك الفقرات تعني لقطة قراءتها، ولا تستبدل الحالة الأحدث التالية.

- رأس التنسيق المقروء عند الإغلاق هو [d5cd45fe](https://github.com/kosif199022-jpg/cloude/blob/d5cd45fe9fe71f628dec23bf987faeece6ac493c/AGENT_WORKLOG.md)، blob 0f1989c075405c0ecf42fd5279f8d181757016db. التغيير منذ ae7d97e يضيف نطاق KOSIFSEE-FOUNDATION-20261006-001 وتسليمه، في AGENT_WORKLOG فقط.
- [draft PR #151](https://github.com/kosif199022-jpg/cloude/pull/151) عند c4fb6a65a9ca02fbd369642401d01e331f17eef6 تسليم توثيقي لمجموعة AI/tooling، تابع للجرد العام DOT. قُرئ وصُولح مع المصادر، وليس تفويضًا جديدًا أو مصفوفة منافسة أو إثبات اكتمال P0.
- يظل مرجع الدستور 799d8afa959215ab1eed27bd995f35029b98512d دون تغيير runtime لاحق في هذه المقارنة. راجع CURRENT_STATE_REPORT_AR.md وPR151_SECONDARY_HANDOFF_RECONCILIATION.json للحالة الموحدة وحدود الفحص الحالية.
- الجرد العميق لا يزال قيد العمل. لا تسمح قراءة جزء أو هذا checkpoint الجزئي بتجاوز Rule Zero الواسعة أو بدء تنفيذ معماري/runtime جديد دون استيفاء بواباته ومصالحة lead والأذونات.
