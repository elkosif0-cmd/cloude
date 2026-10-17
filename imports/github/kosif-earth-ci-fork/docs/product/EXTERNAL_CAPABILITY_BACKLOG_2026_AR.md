# KOSIF — قدرات مقترحة من البحث الخارجي 2026

> **هذا الملف Backlog خارجي فقط.** لا يعني أن العناصر أدناه موجودة في KOSIF، ولا تُحسب ضمن Capability Registry إلا بعد تنفيذها واختبارها.
>
> تاريخ البحث: 2026-10-05. تمت مقارنة الرؤية الحالية بمصادر رسمية/أصلية قدر الإمكان، لا بهدف نسخ منتجات أخرى بل لاكتشاف فجوات متوقعة في منصة مالية ومراجعة حديثة.

## ملخص الأولويات

| الأولوية | القدرة المقترحة | حالة KOSIF الآن | القرار |
|---|---|---|---|
| P0 | ZATCA Fatoora Phase 2 integration | سطح VAT/ZATCA موجود؛ الربط التقني الكامل غير مكتمل | Build |
| P0 | IFRS 18 transition + MPM workflow | محركات القوائم وجاهزية IFRS 18 موجودة جزئيًا | Complete |
| P0 | Server document vault + client/PBC portal | PBC متعدد الجولات + ACL موجودان؛ الخزنة/البوابة الخارجية ناقصتان | Build |
| P1 | Continuous close + reconciliation cockpit | قفل فترات، مطابقة واختبارات موجودة؛ orchestration المستمر ناقص | Merge/Extend |
| P1 | Connected reporting + end-to-end lineage | SHA-256، source refs وبعض lineage موجودة | Extend |
| P1 | Evidence extraction + cross-reference | XLSX يعمل؛ PDF/Word/images لا تتحول بعد إلى نموذج مالي قابل للتتبع | Build |
| P1 | Full-population journal anomaly scoring | journal tests والمراجعة موجودة؛ risk-scored population workbench يحتاج تعميق | Extend |
| P2 | Automated validation of client submissions | handoff/PBC موجود؛ pre-acceptance validation قابل للتوسعة | Extend |

## 1. IFRS 18 — الانتقال والعرض وMPM

IFRS Foundation تنص على أن IFRS 18 يسري على الفترات السنوية التي تبدأ في أو بعد 1 يناير 2027، ويستبدل IAS 1. ومن أهم ما يضيفه مجاميع فرعية معرفة في قائمة الربح أو الخسارة ومتطلبات الإفصاح عن Management-defined Performance Measures (MPMs).

المصدر الرسمي:
https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/

حالة KOSIF:
- محرك القوائم الحالي يبني operating profit وprofit before financing/tax/zakat.
- يوجد IFRS 18 readiness guidance.
- توجد MPM/performance-measure مخرجات في التقرير السنوي.
- المطلوب: workflow انتقال كامل، mapping واعتماد للتصنيفات، inventory للمقاييس المنشورة، reconciliation موثق لكل MPM، comparative transition checks، وربط الإفصاح بالمصدر.

Backlog:
- IFRS18-TRANSITION-WORKBENCH
- MPM-INVENTORY-AND-RECONCILIATION
- IFRS18-COMPARATIVE-RESTATE-CHECK
- IFRS18-DISCLOSURE-LINEAGE

## 2. ZATCA — Fatoora Phase 2

ZATCA توضح أن Phase 2 هي Integration Phase وتشمل ربط حل الفوترة بمنصة Fatoora، تنسيقًا محددًا، وحقولًا إضافية. في Wave 25 المنشورة 24 يوليو 2026، شملت المعايير المكلفين الذين تجاوزت إيراداتهم الخاضعة للـVAT مبلغ 187,500 ريال خلال 2022–2025، مع موعد تكامل لا يتجاوز 1 فبراير 2027 للفئة المستهدفة.

المصادر الرسمية:
https://zatca.gov.sa/en/E-Invoicing/Introduction/Pages/Roll-out-phases.aspx
https://zatca.gov.sa/en/MediaCenter/News/Pages/Wave25-E-invoicing.aspx

حالة KOSIF:
- توجد واجهات VAT/ZATCA وقيود إقفال الضريبة.
- لا ينبغي وصف QR/فاتورة محلية بأنها Phase 2 compliance.
- الربط التقني، clearance/reporting، XML/UBL validation، cryptographic stamping/device lifecycle وحالات Fatoora تحتاج مسارًا منفصلًا.

Backlog:
- ZATCA-PHASE2-CONNECTOR
- FATOORA-DOCUMENT-VALIDATOR
- EINVOICE-STATUS-AND-RETRY-QUEUE
- ZATCA-CREDENTIAL-DEVICE-LIFECYCLE
- VAT-RETURN-TO-EINVOICE-RECONCILIATION

## 3. Continuous Close & Reconciliation Cockpit

BlackLine تعرض financial close كعملية موحدة تعتمد على account reconciliations، auto-reconciliation rules، transaction matching، وحالة فورية للتوقيت والجودة، مع استيعاب بيانات من ERP والبنوك والرواتب والإيرادات والمشتريات.

المصدر:
https://www.blackline.com/products/financial-close/

حالة KOSIF:
- ledger period locks، month close، bank/settlement reconciliation، VAT close، journal integrity chain موجودة.
- ينقص تجميعها في دورة مستمرة واحدة مع ownership، exceptions، aging، SLA، blockers، auto-match confidence، وevidence of close.

Backlog:
- CONTINUOUS-CLOSE-COCKPIT
- RECON-EXCEPTION-QUEUE
- AUTO-MATCH-RULES-WITH-CONFIDENCE
- CLOSE-CERTIFICATION-EVIDENCE
- CLOSE-DEPENDENCY-GRAPH

## 4. Connected Reporting & Data Lineage

Workiva تركز على ربط البيانات من مصادر منظمة وغير منظمة بالمخرجات النهائية وتقليل إعادة الإدخال اليدوي، مع end-to-end data lineage.

المصدر:
https://www.workiva.com/solutions/sec-reporting

حالة KOSIF:
- SHA-256 للمستندات، source refs، traceability في المراجعة، وربط الحسابات بالقوائم موجود جزئيًا.
- المطلوب lineage موحد يصل:
  source document/row → normalized record → journal/TB line → FS line → note/KPI → published report.

Backlog:
- UNIFIED-FINANCIAL-LINEAGE-GRAPH
- REPORT-CELL-PROVENANCE
- SOURCE-TO-DISCLOSURE-TRACE
- STALE-SOURCE-INVALIDATION
- CONNECTED-NARRATIVE-NUMBER-BINDING

## 5. Client/PBC Portal

Caseware تستخدم Requests/Queries لإرسال طلبات معلومات ومستندات إلى جهات اتصال العميل، مع assignee، due date، status، uploads، وتعقب الاستجابة. Client Requests تجمع المطلوب للعميل في بوابة واحدة وتحدّث الحالات تلقائيًا، مع validation قبل القبول.

المصادر:
https://www.caseware.com/docs/en/cloud/audit-international/planning/collect-information-from-the-client
https://www.caseware.com/docs/en-us/cloud/caseware-cloud/engagement-management/client-requests/what-is-client-requests

حالة KOSIF:
- PBC، rounds، unavailable/partial/accepted، evidence review موجود.
- Workspace ACL والمشاركة الخادمية موجودان.
- ينقص Portal منفصل للعميل محدود الصلاحيات، due dates/reminders، request ownership، secure upload vault، وتعقب ما يراه العميل دون كشف ملف المراجعة الداخلي.

Backlog:
- CLIENT-PBC-PORTAL
- REQUEST-ASSIGNEE-DUE-DATE-SLA
- CLIENT-VISIBILITY-POLICY
- SECURE-CLIENT-UPLOAD-VAULT
- PBC-REMINDERS-AND-ESCALATION
- SUBMISSION-PREACCEPTANCE-VALIDATION

## 6. استخراج الأدلة والربط بالعينة

DataSnipper تصف سير عمل يطابق بيانات Excel مع مستندات داعمة مثل الفواتير وكشوف البنوك والعقود، وينشئ cross-reference بين العينة والمصدر، ويدعم استخراج عناصر من دفعات مستندات والبحث داخل PDFs/images/scans.

المصادر:
https://www.datasnipper.com/external-audit/test-of-detail
https://knowledge.datasnipper.com/en/articles/685955-how-to-document-your-audit-procedures-with-datasnipper

حالة KOSIF:
- ingest + SHA-256 + XLSX TB + audit document store موجود.
- PDF/Word/image extraction إلى structured facts مع bounding/source reference ليس مكتملًا.

Backlog:
- DOCUMENT-FACT-EXTRACTION
- SAMPLE-TO-SOURCE-CROSSREFERENCE
- BATCH-INVOICE-BANK-CONTRACT-EXTRACTION
- EVIDENCE-COORDINATE-AND-PAGE-ANCHORS
- EXTRACTED-FACT-CONFIDENCE-REVIEW

## 7. Full-population Journal Analytics

MindBridge تعرض anomaly detection كجزء من journal-entry testing المرتبط بمخاطر management override وبـISA 240 وغيرها، مع التعامل مع populations/sub-populations والعينات.

المصدر:
https://www.mindbridge.ai/resources/mindbridge-for-journal-entry-testing/

حالة KOSIF:
- journal tests، rare/unusual patterns، after-close/end-period logic، integrity chain، audit review، وفحص القيد بالمعايير/AI موجودة.
- المطلوب واجهة population-level risk scoring قابلة للتفسير، stratification، drilldown، وربط كل سبب مخاطرة بإجراء المراجعة.

Backlog:
- JOURNAL-POPULATION-RISK-SCORING
- RISK-REASON-CODES
- POPULATION-STRATIFICATION
- ANOMALY-TO-AUDIT-PROCEDURE
- JOURNAL-RISK-OVERRIDE-REVIEW

## قاعدة إدخال عناصر البحث الخارجي إلى المنتج

لا تنتقل أي نقطة من هذا الملف إلى Capability Registry إلا بعد:
1. تعيينها إلى إحدى البوابات الأربع.
2. تحديد مصدر البيانات وCompany/Tenant scope.
3. تحديد deterministic vs AI.
4. تحديد authority/human gate.
5. تحديد المصدر التنظيمي/المهني عند الانطباق.
6. تنفيذ tests/receipts.
7. تحديد audit trail / lineage.
8. تمييز ما إذا كانت قدرة جديدة أو امتدادًا لقدرة موجودة.

## ترتيب التنفيذ المقترح

1. ZATCA Phase 2 + server document vault/client PBC portal.
2. IFRS 18 transition/MPM completion.
3. Continuous Close cockpit.
4. Unified financial lineage graph.
5. PDF/Word/image evidence extraction and cross-reference.
6. Population journal risk scoring.
