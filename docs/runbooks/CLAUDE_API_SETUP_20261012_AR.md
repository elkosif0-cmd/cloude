# توصيل Claude API بأمان من الآيفون — KOSIF EARTH

## صفحة إدخال المفتاح (دون مشاركة المفتاح في ChatGPT)
1. افتح GitHub من Safari وسجّل الدخول إلى الحساب الذي يملك صلاحية تعديل إعدادات المستودع `elkosif0-cmd/cloude`.
2. افتح: https://github.com/elkosif0-cmd/cloude/settings/secrets/actions/new
3. في خانة **Name** اكتب حرفيًا `MOON`.
4. في خانة **Secret** ألصق مفتاح Anthropic الخاص بك، ثم اضغط **Add secret**.
5. لا تكتب المفتاح في محادثة، Issue، Pull Request، أو ملف كود.

إذا لم يظهر إعداد Secrets على الهاتف، افتح GitHub في Safari واختر **Request Desktop Website** أو استخدم حساب مالك المستودع.

لإنشاء مفتاح جديد: https://platform.claude.com/settings/keys (أو Settings → API keys في Claude Console).
يفضّل إصدار مفتاح مخصص لـ KOSIF، بنطاق وصلاحيات محددة، ومراقبة الاستهلاك. API منفصل عن اشتراك Claude للدردشة وقد يترتب عليه تكلفة.

## ما الذي بُني؟
- `.github/workflows/claude-api-review.yml`: تشغيل يدوي من GitHub Actions على PR يختاره المالك، دون الاعتماد على الكمبيوتر.
- `tools/claude_pr_review.py`: يُرسل **مقاطع محدودة من تغييرات ملفات كود عامة فقط** إلى Anthropic، ويكتب المراجعة في ملخص GitHub Actions.
- الاتصال يستدعي `https://api.anthropic.com/v1/messages` بهوية `ANTHROPIC_API_KEY` المشفرة في GitHub Actions Secrets تحت الاسم `MOON`.
- لا تطبّق الأداة أي تعديل برمجي ولا تدمج أو تنشر؛ القرارات والتعديلات تحتاج مراجعة منفصلة.
- تمنع المراجعة الخارجية من forks؛ لا تُنفذ شفرة PR نفسها؛ الحد الأقصى 18 ملفًا و26000 حرف من الفروق المسموح بها.
- التشغيل يدوي لتفادي مصروفات API غير مقصودة؛ لا تصدّق على أنها مراجعة تمت حتى ترى نموذج Anthropic الفعلي في التقرير.

## بعد إدخال المفتاح
تُدمج تغييرات هذا الإعداد بعد مراجعة PR. ثم افتح GitHub → Actions → Claude API - controlled PR review → Run workflow، وأدخل رقم PR المراد مراجعته.
إذا كان المفتاح غير موجود، يظهر التقرير `Claude API: not connected` من دون إرسال أي طلب مدفوع.

**مهم:** هذه طريقة تشغيل Claude API من GitHub Cloud، وليست تسجيل الدخول إلى Claude Code على الكمبيوتر. للمراجعة البرمجية المباشرة هنا، لا يمكن للنموذج الموجود في ChatGPT رؤية قيمة السر أو قراءتها من GitHub؛ يتابع التشغيل عبر تقارير GitHub فقط.
