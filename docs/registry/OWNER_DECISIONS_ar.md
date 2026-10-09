# قرارات المالك — هل كلها موجودة في الكود؟

يُولَّد من `node tools/owner_decisions.mjs` بفحص الكود نفسه (لا من الذاكرة). كل قرار: مصدره، ما وُجد، وما يقفله.

**النتيجة: 21 من 23 موجودة** — ناقص: دمج كل الفروع في main — يتعارض ويحتاج قرار المالك: لا أداة لقراءة رسائل واتساب

| # | القرار | المصدر | الحالة | الدليل | يقفله |
|---|---|---|---|---|---|
| 1 | الأقسام أولاً: ثلاثة مداخل فقط — المحاسبة الكاملة، المراجعة، الأدوات المساعدة | FOUNDATION §3 · أمر المالك 2026-10-06 | ✅ موجود | accounting,audit,tools | tools/gateway_contract.mjs · tools/menu_constitution.test.mjs |
| 2 | في المحاسبة: القطاع ثم الشركة؛ عشرة قطاعات، خمسة بأولوية (المستشفيات، الفنادق، المقاولات، اللحوم، التسويق الإلكتروني) | FOUNDATION §3.7 | ✅ موجود | 10 قطاعات · أولوية: health,hospitality,construction,meat,digital | constitution_guard ten_sectors |
| 3 | الشركات المرجعية (47 من الحزمة) نماذج تُفتح، وملفها يعيد نفس أرقام إعادة التشغيل | أمر المالك 2026-10-06 · FOUNDATION §3.10 | ✅ موجود | 47 شركة | tools/corpus_same_results.test.mjs |
| 4 | «تصيف» محمية بصلاحية مستقلة وكلمة مرور؛ لا تظهر في نسخ المعاينة | نص المالك: «الدخول إلى بيانات تصيف يجب أن يكون محمياً بصلاحيات مستقلة وكلمة مرور» | ✅ موجود | بوابة مقفلة + كتلة SQC:AUTH + المفتاح من متغير البيئة | tools/unlock_runtime.test.mjs · tools/preview_build_check.py |
| 5 | لا كلمة مرور مكتوبة في أي ملف | قاعدة المالك | ✅ موجود | 603 ملفاً متتبعاً بلا قيمة مكتوبة | — |
| 6 | القدرات مشتركة والبيانات معزولة بين الشركات | نص المالك: «القدرات مشتركة، لكن البيانات معزولة بين الشركات» | ✅ موجود | مفاتيح التخزين تُبدَّل مع الشركة (HELPER_KEY) | tools/company_scope_keys.test.mjs |
| 7 | المسار يملك المساحة: FULL_ACCOUNTING / AUDIT_ONLY / TOOLS_ONLY، ولا مساحة تظهر تلقائياً في قسم آخر | FOUNDATION §3.0-1 و-12 | ✅ موجود | ui/core/company.js | constitution_guard audit_registry_own · tools_menu_own_space |
| 8 | ملف القدرات: الشركة الجديدة تختار أدواتها (opt-in) والشركات القائمة تحتفظ بكل أدواتها | اختيار المالك 2026-10-09 (#231) · FOUNDATION §3.0-10 | ✅ موجود | capMode: opt-in للشركة ذات ownerScope، والباقي all | tools/capability_profile.test.mjs |
| 9 | حزمة القطاع تُطبَّق مرة واحدة للشركة الجديدة ولا تُفرض على شركة قائمة | FOUNDATION §3.0-5 · #158 | ✅ موجود | packPending | tools/meat_pack_e2e.mjs |
| 10 | سياسة ضريبة القيمة المضافة لكل شركة، وكل شاشة ضريبية تقرؤها | #155 / #156 | ✅ موجود | SKosifCompanyPlatform.vatPolicy | tools/vat_policy_contract.test.mjs |
| 11 | المراجعة مستقلة: ملف مرتبط بشركة أو عام، ولا يُنشئ شركة في المحاسبة | FOUNDATION §3.0-3 · §3.2 | ✅ موجود | SKosifTBReview.newEngagement | tools/audit_context_independence.test.mjs |
| 12 | المنيو حسب الدستور: أقسام المحاسبة داخل الشركة، مراحل ملف المراجعة، وعائلات الأدوات الثماني | طلب المالك 2026-10-09 · FOUNDATION §3.12 و§3.3.1 | ✅ موجود | المحاسبة 13 أقسام · الأدوات 12 · لا شاشة في «أخرى» | tools/menu_constitution.test.mjs |
| 13 | دمج كل الفروع في main | طلب المالك 2026-10-09 | ❌ ناقص | 211 فرعاً، خارج main: origin/claude/constitution-restructure-20261009 | docs/registry/BRANCH_MERGE_ALL_20261009.md |
| 14 | هوية واحدة «دفتر KOSIF» من الباب إلى الورقة المطبوعة؛ «كوبالت وجليد» و«الكحلي والذهبي» اختيار | طلب المالك 2026-10-09 (R19، R20) · FOUNDATION §3.11.2 | ✅ موجود | الدفتر افتراضي، الباب والشعار والأيقونات والطباعة بنفس الهوية | tools/identity_unity.test.mjs · tools/door_tokens.test.mjs · identity_audit |
| 15 | الهلال لا الصليب في صور القطاع الصحي | FOUNDATION §3.0-11 | ✅ موجود | ui/art/brand/sector-health.webp | constitution_guard health_art |
| 16 | شريط السياق دائم (البرنامج · النشاط · الشركة · القسم) وحالة حفظ مرئية | FOUNDATION §3.0-7 و-8 | ✅ موجود | topbar.js + save-state.js | constitution_guard context_bar · save_state_wired |
| 17 | صفحة الدخول: سكربت SQC:AUTH يبقى كما هو بايتاً ببايت | قاعدة المراجعة الأمنية | ✅ موجود | البصمة مثبتة في الاختبار | tools/unlock_runtime.test.mjs |
| 18 | الشركة التجريبية «أغنام الوادي» باقية، ولا اسم شركة ثابت في المخرجات | R10 · مراجعة لاذعة 2026-10-08 | ✅ موجود | SK.bizName() | tools/harsh_review_guards.test.mjs · tools/identity_check.py |
| 19 | عالم بلوري أصلي (لا نسخ من igloo.inc) | اختيار المالك 2026-10-05 | ✅ موجود | ui/art/crystal-world.js | tools/crystal_world.test.mjs |
| 20 | «الربحية والقنوات» من لوحة v16 على محرك تكلفة القنوات | #229 بطلب المالك | ✅ موجود | ui/features/channel-profit.js | feature_audit |
| 21 | شريط تبويبات الجوال ثابت أسفل الشاشة و«الرئيسية» أولاً | R19 | ✅ موجود | .skb position:fixed | tools/gate_nav_contract.test.mjs · phone_layout |
| 22 | لا أداة لقراءة رسائل واتساب | قاعدة المالك | ⚠️ تعارض — قرار المالك | موجودة في جسر واتساب: list_whatsapp_messages («Read messages received on WhatsApp») — استُرجعت من PR #96 في 2026-10-06؛ لم تُحذف دون قرار المالك | whatsapp-bridge/workers/mcp/index.js |
| 23 | سجل عمل مشترك: كل مهمة تُسجَّل قبل التعديل | FOUNDATION §0.0.2 | ✅ موجود | AGENT_WORKLOG.md | constitution_guard worklog |
