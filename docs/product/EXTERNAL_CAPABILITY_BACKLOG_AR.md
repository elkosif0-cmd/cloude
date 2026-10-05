# Backlog القدرات المقترحة من البحث الخارجي — 2026-10-05

> **قاعدة:** هذه القائمة ليست جردًا لقدرات KOSIF الحالية. هي مقارنة خارجية منفصلة. لا يُعتبر أي بند «منفذًا» إلا إذا ظهر في Capability Registry واختباراته.

## المصادر الرسمية التي تمت مقارنتها

- IFRS Foundation — IFRS 18: https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/
- ZATCA — المرحلة الثانية/الربط والتكامل للفوترة الإلكترونية: https://zatca.gov.sa/en/MediaCenter/News/Pages/Wave25-E-invoicing.aspx
- Oracle NetSuite — Multi-Book / currency consolidation / consolidated reporting:
  - https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_3831567542.html
  - https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N278654.html
- BlackLine — Financial Close / Reconciliation / Transaction Matching:
  - https://www.blackline.com/products/financial-close/
  - https://www.blackline.com/products/financial-close/account-reconciliations/
- FloQast — Close Management: https://www.floqast.com/close-management
- Caseware — Audit / PBC / Client Requests:
  - https://www.caseware.com/products/audit/
  - https://www.caseware.com/products/client-requests
- DataSnipper — evidence cross-reference / document matching:
  - https://knowledge.datasnipper.com/en/articles/685955-how-to-document-your-audit-procedures-with-datasnipper
  - https://www.datasnipper.com/external-audit/test-of-detail
- MindBridge — journal/transaction risk scoring:
  - https://support.mindbridge.ai/hc/en-us/articles/360055739874-MindBridge-score
  - https://support.mindbridge.ai/hc/en-us/articles/1500001228061-Transaction-and-entry-details
- Workiva — connected reporting + controls: https://www.workiva.com/solutions/sec-reporting

## P0 — متطلبات قريبة أو فجوات حوكمة أساسية

| القدرة المقترحة | ما لدى KOSIF الآن | الفجوة الخارجية الحقيقية | قرار التنفيذ |
|---|---|---|---|
| **IFRS 18 readiness كامل** | قائمة ربح/خسارة بفئات ومجاميع قريبة من IFRS 18 + readiness guide + narrative/performance measures | سجل MPM رسمي لكل شركة، تعريف public communications، reconciliation لكل MPM إلى أقرب subtotal IFRS، tax/NCI effects، labeling/disaggregation controls | **Build** قبل 2027؛ لا نعيد بناء statement engine |
| **ZATCA Fatoora Phase 2** | VAT/ZATCA surfaces وQR/checks محلية | ربط فعلي مع Fatoora، XML/UBL/الحقول المطلوبة، cryptographic stamping/CSID حسب المواصفات، clearance/reporting flow، SDK validation، retry/receipt archive | **Build as connector**؛ لا ندّعي compliance قبل اختبار SDK/بيئة ZATCA |
| **Server-side document vault** | مستندات محلية + SHA-256 + audit handoff + audit IndexedDB | تخزين خادمي tenant-isolated، encryption at rest/in transit، retention/versioning، download authorization، malware/content limits | **Build** على طبقة workspace الحالية |
| **Client / PBC portal** | PBC متعدد الجولات وتسليم داخلي صريح من مساعد التقارير | مستخدم عميل محدود يرى طلباته فقط، رفع/رد/تعليق، statuses، reminders، return/accept، full audit trail | **Build** فوق workspace ACL، مع بقاء قبول الدليل بيد المراجع |

## P1 — Accounting OS / close / group finance

| القدرة المقترحة | الموجود | الفجوة | قرار |
|---|---|---|---|
| **Fixed assets register + depreciation** | **منفذ أساسه:** سجل أصل، تاريخ الخدمة، cost/residual/useful life، قسط ثابت، مجمع وقيمة دفترية، وقيد شهري مقترح بلا ترحيل تلقائي | المتبقي: disposal/retirement، impairment، componentisation، تغيير العمر/القيمة كتغيير تقدير، وroll-forward متقدم | **Extend** الأساس المنفذ |
| **Multi-currency / FX** | عملة أساسية للشركة | transaction currency، rates، realized/unrealized FX، account rate types، remeasurement/translation | **Build later** بعقد بيانات مستقل قبل لمس ledger |
| **Consolidation / intercompany** | شركات منفصلة فقط | parent/subsidiary tree، ownership، eliminations، CTA، intercompany matching، group FS | **Build after FX** |
| **Continuous reconciliation / exception workbench** | bank recon، subledger recon، revenue recon، month-close checklist وperiod lock موجودة | تشغيل دوري/مستمر، owner/SLA، exception queue، certifier/reviewer، historical rec roll-forward | **Extend** الموجود؛ لا يُبنى من الصفر |
| **Close management workflow** | month-close يقرأ حالة حقيقية ويقفل الفترة | owners/due dates/dependencies/sign-offs/roll-forward dashboard across entities | **Extend** الموجود |

## P1 — Audit / evidence intelligence

| القدرة | الموجود | الفجوة | قرار |
|---|---|---|---|
| **Evidence-to-cell / evidence-to-assertion cross-reference** | SHA-256، numbered evidence، PBC، workpapers، citations | رابط دقيق من نتيجة اختبار/خلية/قيمة إلى الصفحة/region داخل PDF أو الصورة، re-performance navigation | **Build** ضمن evidence graph |
| **Document matching / test of details** | sampling + document upload/checks | batch matching of sample rows to invoices/banks/contracts، extracted fields + exception markers + source coordinates | **Build** بعد structured extraction |
| **Configurable journal risk scoring** | journal tests، anomalies، Benford، audit findings | score واضح per entry/transaction مع control-points contribution، methodology weights، add-to-audit-plan | **Extend** audit analytics؛ لا تجعل ML score رأيًا |
| **Dynamic engagement content** | audit programme، opening requests، risk-driven PBC | rules engine يجعل checklists/workpapers/requests تظهر حسب entity/risk/framework بدل قائمة ثابتة | **Extend** programme engine |

## P2 — Connected reporting & integrations

| القدرة | الموجود | الفجوة | قرار |
|---|---|---|---|
| **Connected reporting lineage** | reports + audit trail + company search | الرقم في التقرير يرتبط بالمصدر/الحساب/القيد/المستند/control/workpaper بحيث update-once flows through outputs | **Build** evidence/data lineage layer |
| **Connector framework** | Excel/CSV/XLSX + أدوات/Workers متفرقة | عقود موحدة للبنوك/ERP/Drive/email/payroll/e-commerce، sync cursor، idempotency، schema mapping، error queue | **Build** connector SDK |
| **Structured PDF/Word financial extraction** | يخزن PDF/Word كمصدر، لا يخترع أرقامًا | table/line extraction with confidence + source coordinates + human mapping confirmation | **Build**؛ low-confidence never posts |
| **AI exception queue** | AI suggestions/human approval in several modules | queue موحد لكل AI suggestion: confidence، evidence، proposed action، approver، outcome، model/version | **Build** cross-cutting governance |

## ما لن ننسخه

- لن ننسخ UX أو methodology محمية من أي منتج.
- لن نعتبر marketing claims benchmark تقنيًا.
- لن نجعل AI يرحّل قيدًا، يقبل دليل مراجعة، يعتمد compliance، أو يصدر رأيًا مهنيًا تلقائيًا.
- أي connector/standard/compliance claim يحتاج اختبارًا مقابل المصدر الرسمي الفعال وقت الإصدار.

## ترتيب التنفيذ المقترح

1. Document vault + PBC client ACL.
2. Fixed assets.
3. IFRS 18 MPM registry/reconciliation.
4. ZATCA Phase 2 connector + validation.
5. Evidence cross-reference + structured document extraction.
6. Continuous reconciliation exception queue.
7. Multi-currency ثم consolidation/intercompany.
8. Connector framework والتقارير المتصلة.
