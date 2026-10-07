# KOSIF199022 Account Capability Harvest — 2026-10-07

الهدف: اعتبار كل مستودعات حساب `kosif199022-jpg` مصادر معرفة وقدرات، ثم نقل الأفضل إلى `cloude` وفق FOUNDATION: Keep / Merge / Rebuild / Relocate / Retire، بدون نسخ أعمى أو إرجاع كود أقدم فوق تنفيذ أقوى.

## النطاق — 16 مستودعًا
1. mafateeh-al-tharwa
2. mafateeh-al-tharwa2
3. -
4. CLOUDFLARE_API_TOKEN
5. moon
6. kosif-audit-studio
7. smart-trial-balance-review
8. kosif-audit-pro
9. new
10. see
11. whatsapp-personal-bridge
12. think
13. kosif-omni
14. kosif-atlas-private
15. kosif-atlas
16. 100-superskills

## أولوية النقل الفعلي

### P0 — ابدأ النقل
- **think → PII masker + preflight guardrails**
  - الحالة: غير منقول حسب registry الحالي.
  - الهدف: طبقة JavaScript قبل أي استدعاء نموذج، تحجب الاسم/الجوال/الهوية/المفاتيح والحقن الخطير.
  - القرار: Rebuild صغير في cloude، لا نسخ Python كما هو.
  - قبول: fixture يحتوي بيانات عميل حساسة، والنص الخارج للمزود لا يحتويها.

- **kosif-omni → tool registry contract**
  - قدرة مؤكدة: registry واحد يغذي MCP / REST / OpenAPI، مع توصيف read-only / destructive / idempotent / open-world.
  - القرار: Relocate للعقد داخل AI Brain Connector وcapability registry؛ لا نسخ المنتج كله.
  - قبول: كل أداة عالية الأثر مصنفة قبل dispatch.

- **moon → Journal Entry Testing كواجهة مستقلة**
  - قواعد: نهاية الفترة، الأرقام المستديرة، المستخدم غير المعتاد، وأنماط القيود.
  - الحالة: المنطق متاح داخل audit studio لكن ليس كعائلة أدوات مستقلة.
  - القرار: Relocate إلى أدوات الرقابة والجودة مع قراءة دفتر الشركة.
  - قبول: تشغيل القواعد على دفتر تجريبي وإظهار findings قابلة للتتبع.

### P1 — نقل بعد P0
- **think → statistical verifier**
  - p-values / t-test / CI / Cohen's d.
  - الهدف: عينات المراجعة والتحليلات، مع إعادة بناء حتمية واختبارات مرجعية.

- **mafateeh-al-tharwa → knowledge/book reader**
  - فصل/بحث/EPUB/DOCX/text/audio كمرجع.
  - الهدف: قارئ `knowledge/books` فوق catalog حقيقي، مع ربط مكتبة المعايير.
  - القرار: Rebuild، ودمج mafateeh-al-tharwa2 كمصدر مكرر.

- **new → blind-round reviewer council**
  - آراء مستقلة قبل التجميع.
  - الحالة: جزئي في ai-review-engine.
  - القرار: Merge سلوك الاستقلال واختباره صراحة.

### P2 — تصميم وتجربة
- **moon → cinematic finance UI ideas**
  - حصد الحركة والطبقات فقط، بدون استبدال منطق cloude.
- **kosif-audit-studio → v5 workspace ideas**
  - الاستوديو مدمج جزئيًا؛ المطلوب دمج أعمق كتجربة واحدة لا تطبيق داخل تطبيق.
- **see → audit lifecycle/state/provenance/human gates**
  - Keep methodology؛ لا استبدال shell الحالي.

## مصادر مكتبات المهارات
- **kosif-atlas**: 14,793 مهارة عامة مع تراخيص ونتائج فحص أمني. مرجع فقط؛ لا تشغيل سكربتات بلا مراجعة.
- **kosif-atlas-private**: مرجع خاص؛ لا إعادة توزيع للمحتوى. نستخدم المعرفة/الأنماط فقط ضمن الحقوق المتاحة.
- **100-superskills**: مرجع لاستخراج منهجيات محاسبة/IFRS/مطابقة/تقارير، مع فحص كل قدرة قبل النقل.
- **kosif-omni**: 46 مهارة و52 أداة MCP؛ نأخذ العقود والقدرات المطلوبة للمحاسبة والمراجعة بدل نسخ المنتج.

## قدرات منقولة بالفعل — لا نعيدها
- kosif-audit-pro: BigInt money، statements/analysis، ISA 450/opinion، معظم مجلس A01–A10.
- smart-trial-balance-review: Gemini reviewers، request/upload/judgement loop، standards mapping.
- moon: risk score + ISA 705 opinion.
- see: assertions/standards mapping، readiness جزئيًا، human approval governance.
- kosif-audit-studio: audit studio + standards lab مدمجان في `ui/audit`.

## قواعد الدمج
1. لا يتم bulk merge لمستودع كامل.
2. نفس القدرة بتنفيذ مختلف تُقارن على الفكرة والعقد والاختبارات، لا على تاريخ commit فقط.
3. أي قدرة من Atlas/third-party تحتاج license + security review قبل أخذ كود.
4. الدستور/FOUNDATION أعلى من أي تنفيذ قديم.
5. كل نقل ينتهي باختبار قبول وسجل مصدر.

## الخطوة التنفيذية التالية
1. تنفيذ PII/preflight guard داخل cloude.
2. استخراج عقد Omni tool registry وتصنيفات الأثر.
3. فصل Journal Entry Testing كواجهة أدوات.
4. فتح PR لهذا الفرع بعد أول قدرة منقولة ومختبرة.
