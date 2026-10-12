# ربط رصيد Anthropic API بتطوير KOSIF EARTH

## ما الذي تم تجهيزه؟

- المصدر المعتمد للموقع: `elkosif0-cmd/cloude`، فرع `main`؛ الإنتاج منشور في Cloudflare Pages `s-kosif` على `https://earth.kosif.pp.ua/`.
- تشغيل `anthropics/claude-code-action@v1` في GitHub Actions عند تعليق مالك المستودع بـ `@claude` على Issue أو سطر مراجعة Pull Request.
- تشغيل يدوي بطلب واضح فقط؛ لا تشغيل دوري ولا تشغيل من الزوار ولا مشاركة لمفتاح API مع كود المتصفح.
- Claude يقرأ دستور المشروع في `AGENTS.md` و`docs/START_HERE.md` و`FOUNDATION.md`، ثم يقدّم تغييرات قابلة للمراجعة؛ لا يتجاوز اختبارات القبول ولا ينشر مباشرة على `main`.

## إعداد لمرة واحدة — نفذه مالك الحساب بنفسه

1. افتح [Claude Console](https://platform.claude.com/settings/keys) وأنشئ مفتاح API في المؤسسة التي يظهر فيها رصيدك. **لا ترسل المفتاح في المحادثة ولا تضعه في ملف بالمستودع**.
2. افتح [إعدادات GitHub Actions secrets للمستودع](https://github.com/elkosif0-cmd/cloude/settings/secrets/actions)، ثم `New repository secret`.
3. اكتب الاسم بالضبط `ANTHROPIC_API_KEY`، وضع المفتاح في خانة `Secret` ثم `Add secret`. لا تغيّر `CLOUDFLARE_API_TOKEN` ولا `KOSIF_UNLOCK_PASSWORD`.
4. ثبّت تطبيق [Claude GitHub App](https://github.com/apps/claude) واسمح له بالوصول إلى هذا المستودع فقط.
5. بعد مراجعة هذا الـPull Request والموافقة على دمجه في `main`، افتح [Issues](https://github.com/elkosif0-cmd/cloude/issues/new/choose)، واختر قالب تطوير KOSIF EARTH، وأنشئ مهمة.
6. في تعليق جديد **من حساب `elkosif0-cmd` أو `kosif199022-jpg`**، اكتب `@claude` متبوعة بالمهمة. افتح [Actions](https://github.com/elkosif0-cmd/cloude/actions) لمتابعة التنفيذ، ثم راجع الـPull Request والاختبارات قبل الدمج.

## مثال تعليق

```text
@claude راجع شاشة الأصول الثابتة في KOSIF EARTH، وأصلح أي خلل في حفظ البيانات مع الحفاظ على فصل الشركات، واعرض الاختبارات والـdiff في Pull Request. لا تغيّر main مباشرة ولا تستخدم بيانات حقيقية.
```

## ضوابط الأمان والتكلفة

- **لا تضع المفتاح في `ui/core/ai.js` أو localStorage أو ملفات `.env` المتتبعة في Git**؛ المسار السابق للاستخدام المباشر من المتصفح منفصل عن هذا التكامل، ولا ينبغي استعماله مع رصيد مشترك أو مفتاح رئيسي.
- Workflow لا يسمح للمستخدمين العموميين بتشغيله. الطلبات يجب أن تحتوي `@claude` ومن أحد الحسابين المحددين.
- كل تنفيذ يستهلك من رصيد Anthropic API، وليس من حصة محادثات Claude Max. راقب استهلاك الرصيد وحدّد سقف إنفاق في Console.
- حد `--max-turns 12` يقيّد خطوات التنفيذ وليس ضمانًا بحدّ مالي ثابت. امنع تشغيل أكثر من مهمة إلا عند الحاجة.
- الريبو عام؛ لا تمرّر بيانات العملاء والمستندات الحساسة أو مفاتيح أخرى للوكيل؛ لا تُفعّل `show_full_output`.
- الدمج في `main` قد يطلق آلية Pages الحالية؛ لا يتم الدمج أو النشر دون اختبار بشري. تحديث workflow وحده لا يفعّل Claude حتى يستكمل تثبيت التطبيق والمفتاح والدمج.
- GitHub Actions قد يتأثر بفواتير GitHub أو قيود تشغيل الحساب؛ تأكد من نجاح أول تشغيل في صفحة Actions.

## حدود الربط

هذه إضافة **مساعد تطوير للمصدر الذي يبني موقع EARTH** عبر GitHub، وليست نافذة دردشة Claude عامة متاحة لزوار الموقع، وليست إعدادًا لمفتاح Anthropic داخل Cloudflare Pages.
إذا أردت لاحقًا واجهة «المطور/إضافة كود» داخل الموقع، يجب أولًا توفير مصادقة مالك موثوقة وتحديد صلاحيات الملفات وخادم مفاتيح وقيود تكلفة ومراجعة قبل تنفيذ أي Patch.
