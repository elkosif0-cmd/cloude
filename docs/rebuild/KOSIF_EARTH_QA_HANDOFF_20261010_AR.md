# KOSIF EARTH — فحص التهيئة والثيمات وسجل الاستكمال
**التاريخ:** 2026-10-10 (Asia/Riyadh)
**الفرع:** chatgpt/kosif-earth-qa-handoff-20261010
**الأساس:** a973a5c — PR #243 (draft) فوق #242 ← #241 ← #240 ← #239 ← #238
**النطاق:** إصلاح محدود قابل للعكس + ثيمات اختيارية + اختبارات فعلية، لا دمج مع main ولا نشر إنتاج.

## حالة ملفات العمل المحفوظة
- المشروع الأصلي: C:\Users\اغنام الوادي\kosif-earth-entry-20261009
- فرعه وقت الفحص: chatgpt/earth-conan-audit-factory-integration-20261010، commit a973a5c، وفيه تعديلات staged/unstaged/untracked مقصودة.
- لم أستعمل reset أو clean أو stash، ولم أعدّل ملفات مساحة العمل الأصلية.
- عملت في worktree مستقل: C:\Users\اغنام الوادي\kosif-earth-qa-handoff-20261010.
- يوجد checkpoint سابق وفق سجل docs/rebuild/KOSIF_EARTH_REPOSITORY_AUDIT_CONTINUATION_20261010_AR.md بالمساحة الأصلية.
- لا تمس أي بيانات أو إعدادات أو أصول 4K للمشروع الأصلي عند الاستكمال.

## العطل المعاد إنتاجه
1. في مسار دخول الشركة التجريبية الاصطناعية «model-earth-industrial»، شوهد بعد انتهاء انتقال الشركة: SK.demo.settled() = false، وSKosifSpace.busy() = false، وscopeSnapshot().status = unknown، periodId = null، دون أخطاء JavaScript في الصفحة.
2. كانت demo.js تتوقف نهائيًا إذا كان تبديل الشركة busy وقت boot، دون إعادة المحاولة. هذا يترك أدوات إضافية للشركة في حالة انتظار لأن واجهة الإضافة تتحقق من demo.settled().
3. إصلاح ui/core/demo.js: retry محدد كل 250ms حتى 160 محاولة عند busy، ويستمر فقط بعد انتهاء handoff. عند انتهاء المحاولات يسجل خطأ ويبقى مقفلًا fail-closed. لا إلغاء لصلاحيات الشركة ولا تجاوز للتهيئة.
4. هذا إصلاح متحقق باختبارات VM وبرنامج المتصفح للـdemo العادية؛ المسار الصناعي الاصطناعي غير الملتزم بعد في worktree الأصلي يحتاج إعادة بناء واختبار مستقل بعد دمج عمل مطوره. لا ندّعي أنه اختُبر داخل المعاينة الحالية بعد الإصلاح.

## إضافة بصرية قابلة للاختيار
- ثيم «كحلي ونحاس» (copper): ورق عاجي وكحلي ونحاس مع ألوان أزرار مقروءة.
- ثيم «كحلي ونحاس ليلي» (copper-night): نسخة داكنة عالية التباين.
- الهوية الافتراضية kosif وصورة المكتب النهارية 4K لم تتغير، ولا شيء في SQC:AUTH أو محتويات البيانات المحمية.
- متغيرات الألوان، rail، بطاقات العمل، الأزرار، RTL، تقليل الحركة، وحفظ اختيار الثيم عولجت في ui/layouts/shell.js وui/ds/tokens.css وui/ds/shell.css.
- أزلت استثناء !important إضافيًا بعدما كشف حارس الهوية visual ratchet زيادة من 99 إلى 100. أصبح 99/99.

## نتائج فعلية في هذه الجلسة
- 47/47 اختبار Node متخصص PASS (تهيئة، owner scopes، منصة الشركات، الهدف/التنقل، palette contrast).
- 3/3 اختبارات جديدة لمسار boot PASS: الطبيعي، الانتظار المؤقت، التعليق الطويل fail-closed.
- 32/32 اختبار متصفح Edge PASS في المعاينة المنفصلة محليًا على 1440 و390: فتح الشركة، البحث في الأدوات، إضافة salesintel، تخزين مرتبط بمعرّف الشركة، إعادة تحميل، تأكيد الحذف، إزالة رابط القائمة، وعدم وقوع أخطاء صفحة.
- 87/87 فحصًا لتبديل 29 مظهرًا × 3 أحجام (1440/390/320) PASS؛ readiness=true في كل حجم، وحفظ المظهر بعد reload 3/3 PASS؛ RTL=true. حالة report scope للشركة demo-co كانت unknown، ولم تُعدّ إثباتًا لجاهزية التقارير.
- preview build: SQC_BUILD_MODE=preview py -3 build.py → 191 entries؛ dist/secure غير موجود.
- product constitution: 18/18 PASS، 3 partial markers؛ identity_audit: 3/3 PASS؛ git diff --check PASS.
- الإخفاق الأولي قبل تعديل CSS: importantCount 100>99؛ صححته وأعدت الفحص، ولم أضعف معيار القبول.
- هذه النتائج خاصة بنطاقها فقط؛ لم ينجح بعد اختبار المستودع الكامل أو فحوص production.

## تعليمات الإعادة / الأدلة
- node --test tools/earth_demo_boot_retry.test.mjs tools/earth_theme_palette.test.mjs tools/company_platform_scope.test.mjs tools/company_owner_scope.test.mjs tools/earth_goal_journey.test.mjs tools/earth_quiet_navigation.test.mjs tools/earth_screen_route_guard.test.mjs
- node tools/constitution_guard.mjs
- node --test tools/identity_audit.test.mjs
- SQC_BUILD_MODE=preview py -3 build.py
- node tools/earth_theme_matrix_20261010.mjs http://127.0.0.1:8993/ <output-json> meat demo-co
- الكمبيوتر: ملف JSON الناتج %USERPROFILE%\kosif-browser-check\earth-theme-matrix-qa-20261010.json (بيانات تجريبية فقط).
- متصفح الإضافة: %USERPROFILE%\kosif-browser-check\qa-boot-addons-20261010.mjs (نسخة اختبار محلية من مسار 32 فحصًا).
- المنفذ 8993 هو خادم معاينة محلي فقط، وليس رابطًا عامًا على Cloudflare.

## ما لم يكتمل — لا تُعلن نتيجة خاطئة
- جرد فروع جميع المستودعات، وقرار الدمج لكل فرع، ما زال مفتوحًا. جرى حصر 223 مرجعًا remote في cloude ضمن سجل سابق، ولم تُراجع كل التغييرات السطرية.
- عبر حسابات GitHub المرتبطة، سجل سابق أحصى 20 مستودعًا بأحد الحسابين و2 بالآخر؛ ترتيب الفروع والقدرات وتبعيات المستودعات الخارجية يحتاج استكمالًا.
- طلبات #238 إلى #243 كلها Draft غير مدمجة. يجب التحقق من CI/GitHub Actions الفعلية؛ لم يثبت أن CI يعمل حاليًا.
- اختبار Node الكامل السابق: 1113 ناجحًا و27 فشلًا، وبعض الإخفاقات بيئة تشغيل/تبعية. يحتاج triage وإعادة بعد ضبط المشغلات، ولا يجوز تسميته ناجحًا.
- تقرير scopeSnapshot().status=unknown مع غياب فترة في سياق الشركة demo قد يكون قيدًا مشروعًا في إعداد التقارير، ويحتاج اختبار إنشاء فترة وربط مستخدم دون تجاوز أمان نطاق الشركة.
- نسخ الجولات/التقارير والمعاينة/التصدير والتحميل والضغط لفترات طويلة لم تكتمل، وكذلك اختبار Cloudflare live للفرع الحالي.

## خطوات الاستكمال المحددة
1. اقرأ هذا الملف وAGENT_WORKLOG.md وسجل repository audit في مساحة العمل الأصلية، ثم تحقق من git status وworktrees والـSHA قبل أي تعديل.
2. راجع حالة المسار الصناعي الاصطناعي ودمج إصلاح boot إليه دون مسح التعديلات غير المحفوظة؛ اختبر model-earth-industrial بما في ذلك periodId والسجل العام وحدود الشركة.
3. شغّل full Node suite وسجل مصفوفة الأعطال الـ27 حسب السبب؛ أصلح فقط الأعطال المؤكدة دون تعديل الاختبارات لإخفائها.
4. استخرج مصفوفة ملكية/تبعيات الـ223 فرعًا، مع مراجعة المستودعات الخارجية one-by-one؛ لا دمج شامل.
5. اختبر تقارير الميزان والمراجعة والجولات والتصدير PDF/Excel/CSV والمعاينة والطباعة في 3 شركات تركيبية ببيانات مختلفة.
6. بعد فحص الأمان فقط، أنشئ Cloudflare Preview مستقلًا واربطه بـSHA، ثم اختبر URL المنشور على سطح المكتب والهاتف؛ لا تنشر إنتاجًا أو تدمج main.
7. أضف checkpoint جديدًا إلى السجل، مع أسماء الملفات والأوامر الفعلية والأخطاء ونتيجة PR/المعاينة، في نهاية كل مرحلة.
