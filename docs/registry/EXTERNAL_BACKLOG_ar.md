# قدرات مقترحة من البحث الخارجي (التصور §12)

> تاريخ: 2026-10-05 · يُقرأ بعد `docs/product/CAPABILITY_SOURCE_REGISTRY_AR.md` (الجرد الداخلي، §11) ولا يكرره.
> الهدف: ما الذي أصبح معياراً متوقعاً في البرامج المالية الحديثة ومهنة المراجعة، وما ينقص KOSIF، مع تمييز صريح بين
> **نملكه** (موجود ومختبر في المستودع)، **جزئي** (موجود بشكل أولي أو في مستودع آخر)، **جديد** (اقتراح لا نملكه).
> المصادر مواقع عامة قُرئت في 2026-10-05؛ ليست توصية بنسخ أي منتج.

## 1. ما أصبح معياراً في برامج المحاسبة (2026)

| القدرة المتوقعة | عندنا | ما ينقص | المصدر |
|---|---|---|---|
| ربط الفوترة بمنصة «فاتورة» (زاتكا، المرحلة الثانية): XML، ختم تشفيري، QR، إبلاغ لحظي؛ موجات 2026 (الموجة 23 في 1 مارس 2026 للإيراد > 375 مليون، الموجة 24 في 1 يونيو 2026 لـ> 250 مليون) | **جزئي**: شاشة `zatca` تولّد الفاتورة والـQR محلياً (`ui/enterprise.js`)، ولا تكامل مع فاتورة | التوقيع التشفيري (CSID)، إرسال/إبلاغ لحظي، تخزين الاستجابة مع الفاتورة، حالة الامتثال لكل فاتورة | [ZATCA phase-2 guide](https://origami.sa/en/blog/zatca-phase-2-wave-24-integration-guide/) · [Daftra: phase 2](https://www.daftra.com/en/hub/zatca-einvoicing-phase-2) · [fiscal-requirements: waves 18–22](https://www.fiscal-requirements.com/news/5453-saudi-arabia-complete-guide-to-zatca-phase-2-e-invoicing-waves-18-22-2026) |
| تغذية بنكية تلقائية ومطابقة مستمرة (bank feeds + continuous reconciliation) | **جزئي**: محرك مطابقة بنكية (`bank-reconciliation-engine.ts`) على كشف مستورد يدوياً | استيراد كشوف البنك (CSV/OFX/PDF) بقوالب البنوك السعودية، مطابقة تلقائية بقواعد متعلَّمة، مطابقة يومية لا شهرية | [Qoyod: bank-feed reconciliation](https://www.wafeq.com/en-sa/e-invoicing-in-saudi-arabia/preparing-for-e-invoicing/best-accounting-software-in-saudi-arabia) · [AI accounting 2026](https://dualentry.com/blog/ai-in-accounting) |
| تصنيف المعاملات آلياً من التاريخ، والبشر للاستثناءات | **جزئي**: محاكي القيود (`entry-learner-engine.ts`) يتعلم ويقترح القيد | تطبيقه على كشف البنك والمصروفات بالجملة، وقائمة استثناءات للمراجعة | [AI in accounting 2026](https://dualentry.com/blog/ai-in-accounting) |
| كشف الشذوذ على كل القيود (مكررات، تجاوز حدود، موردون غير متطابقين) لحظياً | **جزئي**: فحوص الدفاتر (`ledger-controls`, `costChecks`, سلسلة الختم) | درجة مخاطرة لكل قيد على كامل الدفتر (لا عينة)، وتنبيهات في «نبض اليوم» | [Jotform: AI in accounting](https://www.jotform.com/ai/agents/ai-in-accounting/) |
| استخراج البيانات من الفواتير والإيصالات والكشوف بدقة عالية (OCR) | **جزئي**: `document-check-engine`, `extractText` في محاكي القيود، التعرف على نوع المستند في مساعد التقارير (PR #140) | OCR للصور/PDF الممسوحة داخل الجهاز، وربط الاستخراج بالقيد المقترح | [Jotform: AI in accounting](https://www.jotform.com/ai/agents/ai-in-accounting/) |
| رواتب مع التأمينات ونهاية الخدمة وملف حماية الأجور (WPS) | **جديد** (إيضاح نهاية الخدمة فقط في `notes-engine`) | محرك رواتب: GOSI، نهاية الخدمة، ملف WPS للبنوك، قيد الرواتب التلقائي | [Wafeq: best accounting software in KSA](https://www.wafeq.com/en-sa/e-invoicing-in-saudi-arabia/preparing-for-e-invoicing/best-accounting-software-in-saudi-arabia) |
| إقرارا الضريبة والزكاة «جاهزان دائماً» من الدفاتر | **نملكه** (VAT: `vat-return-engine` + شاشة الإقرار؛ الزكاة: وعاء تقديري في الإيضاحات) | نموذج زاتكا للزكاة كاملاً وربطه بالإقفال السنوي | [Qoyod](https://www.qoyod.com/en/fields/financial-management-software-for-companies/) |
| مخزون أساسي باستلام بالباركود | **جزئي**: `inventory`, `scanner`, `traceability` | الاستلام بالماسح يولّد حركة مخزون وقيد الاستلام | [Wafeq](https://www.wafeq.com/en-sa/e-invoicing-in-saudi-arabia/preparing-for-e-invoicing/best-accounting-software-in-saudi-arabia) |

## 2. ما أصبح معياراً في إدارة الإقفال (close management)

| القدرة المتوقعة | عندنا | ما ينقص | المصدر |
|---|---|---|---|
| قائمة إقفال بمهام وتوقيعات ومسؤولين ومواعيد | **جزئي**: خطوات الإقفال الحية (`month-close.js`) + نطاق الجاهزية (`pulse.js`) | مسؤول لكل خطوة، توقيع معدّ/مراجع، تاريخ استحقاق لكل خطوة، سجل من أغلق ومتى | [FloQast vs BlackLine 2026](https://www.cfoshortlist.com/reports/blackline-vs-floqast) |
| اعتماد المطابقات (reconciliation certification) مع الأدلة | **جزئي**: المطابقة البنكية والجرد ومطابقة الإيرادات | اعتماد كل حساب ميزانية شهرياً مع مرفقاته، وفرق غير مفسَّر = عائق في الجاهزية | [FloQast reconciliation automation](https://get.floqast.com/hubfs/FloQast_Data%20Sheet_Reconciliation%20Automation_March%202024.pdf) |
| تحليل التغيرات (flux / variance) شهري مع تفسير | **جزئي**: مقارنات في التقرير الإداري و`analysis` | تحليل تلقائي لكل حساب: التغير، الأهمية، تفسير مطلوب فوق حد | [NetGain: FloQast vs BlackLine](https://www.netgain.tech/blog/floqast-vs-blackline) |
| مطابقة معاملات بالجملة بإدخال لغوي طبيعي | **جديد** | مطابقة BigInt للكميات الكبيرة + وصف القاعدة بالعربية | [SolveXia: BlackLine vs FloQast](https://www.solvexia.com/vs/blackline-vs-floqast) |

## 3. ما أصبح معياراً في برامج المراجعة بالذكاء الاصطناعي

| القدرة المتوقعة | عندنا | ما ينقص | المصدر |
|---|---|---|---|
| تحليل 100% من القيود بدرجة مخاطرة لكل قيد (لا عينة) | **جزئي**: اختبارات القيود والعينات (`sampling`, `journal tests` في audit-studio) | درجة مخاطرة لكل قيد بمؤشرات (نهاية فترة، مبالغ مستديرة، مستخدم غير معتاد، عطلات) على كامل الدفتر | [toolradar: AI tools for auditors](https://toolradar.com/guides/best-ai-tools-for-auditors) |
| اختبارات التفاصيل والضوابط من داخل المستندات (ربط الرقم بمصدره) | **جزئي**: الأدلة ببصمة SHA-256، ربط PBC بالخطر/التأكيد (audit-pro) | «قص» الرقم من المستند إلى ورقة العمل مع إحداثياته، وإعادة الحساب | [DataSnipper](https://tooldirectory.ai/tools/datasnipper) |
| وكلاء مراجعة مسمّون فوق أوراق العمل | **نملكه** مبدئياً (مجلس المراجعين، الجولات، `reviewerCouncil`, `council`) | وكيل لكل مجال (إيرادات، مخزون، ذمم) بإجراءات قياسية وسجل تتبع (§9) | [Caseware](https://www.sally.io/blog/ai-tools-for-auditors) |
| سجل تتبع لكل نتيجة AI: من طلب، ما البيانات، أي نموذج، أي أدلة، النتيجة، التعديلات | **جزئي**: `confidence-engine`, `evidence`, سلسلة الختم للقيود | سجل موحد لكل استدعاء AI في كل البوابات (§9) يُعرض للمستخدم ويُصدَّر مع ملف المراجعة | التصور §9 |

## 4. ترتيب مقترح للإضافة (بعد جرد §11 وقرار المالك)

1. **سجل تتبع AI موحد** (§9) — يمسّ كل البوابات، منخفض المخاطرة، يفتح الطريق للوكلاء.
2. **استيراد كشوف البنوك + مطابقة مستمرة** — أعلى قيمة يومية لشركة اللحوم، ويغذّي «نبض اليوم» والإقفال.
3. **قائمة الإقفال بمسؤولين وتوقيعات واعتماد المطابقات** — توسعة مباشرة لما بُني في `month-close.js` و`pulse.js`.
4. **درجة مخاطرة لكل قيد** على كامل الدفتر — توسعة لفحوص الدفاتر الحالية.
5. **تكامل فاتورة (زاتكا المرحلة الثانية)** — يحتاج قراراً تجارياً (شهادات، بيئة اختبار الهيئة) قبل البناء.
6. **الرواتب و WPS** — قدرة جديدة كاملة؛ تُبنى بعد استقرار الدفاتر.

## 5. حدود
- المصادر صفحات تسويقية أو مقارنات عامة؛ لم تُختبر منتجاتها. ما يُؤخذ منها هو **توقعات السوق** لا تفاصيل التنفيذ.
- لم يُذكر هنا ما جُرد داخلياً (المستودعات الـ17) إلا بوصفه «عندنا/جزئي».
