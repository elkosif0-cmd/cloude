# سجل مصادر القدرات — جرد GitHub الأولي الشامل

**النطاق:** جميع المستودعات الـ17 الظاهرة للحساب في 2026-10-05.  
**الغرض:** منع ضياع العمل السابق، ومنع عدّ المكتبات العامة كقدرات منتج جاهزة.

## A. مصادر المنتج المالية المباشرة

| المستودع | النوع | القدرات المثبتة/المهمة | الوجهة |
|---|---|---|---|
| `cloude` | مصدر الإنتاج المتكامل | 75 شاشة مسجلة؛ دفتر/COA/قيود/TB/مطابقات/ذمم/VAT/تدفق/تقارير/مراجعة/PBC/أدلة/مجلس/معايير/شركات وصلاحيات | كل البوابات، وهو shell الإنتاج |
| `kosif-audit-studio` | محرك مراجعة متقدم | استيراد TB، BigInt، مخاطر، materiality، sampling، journal tests، PBC، evidence SHA-256، workpapers، council، standards، rounds | المراجعة الذكية |
| `smart-trial-balance-review` | نموذج جولات مراجعة | Excel/CSV، ربط IFRS، مجلس، طلب مستندات، تقييم كل مستند، جولات حتى الاكتمال، تقرير نهائي | المراجعة + مساعد التقارير |
| `kosif-audit-pro` | نموذج حوكمة مراجعة | 10 جولات A01-A10، 26 gate، BigInt، PBC مرتبط بخطر/تأكيد/إجراء، lineage، human sign-off | المراجعة الذكية |
| `new` | تصميم/خطة منصة مالية جديدة | accounting core، AR/AP، assets، inventory، close، reconciliation، statements، evidence graph، AI control plane، workflow، integrations | مرجع معماري وانتقاء |
| `see` | baseline سحابي محكوم | engagement lifecycle، D1/R2 evidence، audit events، report versions، human gates، future GL/reconciliation/RBAC | المراجعة + البنية متعددة المستخدمين |

## B. طبقات ذكاء ومهارات داعمة

| المستودع | الدور | ما نأخذه منه |
|---|---|---|
| `kosif-omni` | واجهة مهارات موحدة | audit/IFRS desk، journal/reconcile/VAT، council/runtime، evidence calibration، tool governance |
| `think` | orchestration | reasoning/execution lanes، verifier، office/Excel، automation؛ لا يُعامل كسجل مالي authoritative |
| `kosif-atlas` | مكتبة مهارات كبيرة | مصدر انتقاء فقط؛ توجد مهارات مالية/محاسبية كثيرة ويجب مراجعة الترخيص والسلوك قبل الدمج |
| `kosif-atlas-private` | مكتبة موسعة | مصدر بحث داخلي للمهارات؛ ليست قدرة منتج تلقائيًا |
| `100-superskills` | curated skills | 15,122 مهارة مفهرسة؛ 955 accounting-audit، 897 financial-modeling، 176 Excel؛ منها accounting-ifrs-journal ومطابقات/VAT/IAS |

## C. مستودعات تحتوي دعمًا غير مباشر أو نسخًا/مراجع

| المستودع | التصنيف الحالي | القرار |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | يحتوي نسخًا من مراجع KOSIF Think Pro وaudit/IFRS رغم الاسم | مصدر تاريخي/نسخ؛ لا نعتمد عليه قبل مقارنة الأصل |
| `moon` | لم يظهر منه أصل مالي مباشر في المسح النصي الأول | دعم orchestration فقط عند ثبوت الحاجة |
| `whatsapp-personal-bridge` | قناة اتصال | تكامل إشعارات/PBC لاحقًا، لا منطق مالي |
| `mafateeh-al-tharwa` | غير مالي بالنسبة لهدف المنصة الحالي | خارج سجل المنتج المالي |
| `mafateeh-al-tharwa2` | غير مالي بالنسبة لهدف المنصة الحالي | خارج سجل المنتج المالي |
| `-` | لا دليل مالي في المسح الحالي | خارج النطاق حتى يظهر دليل |
| `new` | مذكور أعلاه كمصدر تصميم مباشر | لا تُكرر مكونات لم تُنفذ |
| `moon` | مذكور أعلاه | لا تُحسب قدراته العامة كمحاسبة |

## D. القدرات التي ثبت وجودها بالفعل في cloude

### البرنامج المحاسبي
- companies & fiscal periods
- chart of accounts
- balanced journal entries
- general ledger
- native trial balance
- bank/settlement reconciliation
- receivables/payables
- cash flow
- advances
- purchasing/suppliers/inventory
- product tree/costs/pricing
- VAT/POS/ZATCA surface
- sales posting bridge
- audit trail / permissions / backup

### مساعد التقارير
- Excel/CSV imports
- executive reports
- financial statement/report engines
- export center
- global peer benchmarks
- integrated annual report / narrative engine
- in-app PDF/Word/Excel/HTML preview/export

### المراجعة
- materiality
- risk/assertion mapping
- journal testing
- Benford
- sampling
- PBC
- evidence
- issues/misstatements
- workpapers and fieldwork
- reviewer council
- standards/codex
- global audit reference/corpus replay
- completion gate
- final/management reports

### الأدوات المساعدة
- costs
- fast pricing
- strict pricing kernel
- box builder/analyzer
- sensitivity
- risk lab
- Excel reconciliation
- smart matching
- sales/customer analytics
- finance calculators
- Jev/decision support

## E. فجوات أو عناصر يجب تطويرها/ترقيتها

1. إعادة تصميم navigation إلى البوابات الأربع المعتمدة بدل التقسيم الحالي.
2. تعريفات master data موحدة لكل شركة قبل المحاسبة.
3. فصل صارم لـ`تصيف` عبر auth/RBAC خادمي، لا password UI فقط.
4. fixed assets/depreciation كجزء صريح من accounting core.
5. multi-currency/FX.
6. period close checklist + locks + close evidence.
7. continuous reconciliation/close.
8. IFRS 18-ready statements and disclosures.
9. ZATCA Fatoora Phase-2 integration and SDK validation.
10. server-side multi-tenant storage for shared workspaces and real audit data.
11. evidence graph موحد بين accounting/reporting/audit.
12. connector framework للبنوك وERP/Drive/email.
13. confidence + exception queue لمقترحات AI بدل التنفيذ الصامت.
14. client/PBC portal بصلاحيات محدودة.
15. canonical Capability Registry يجمع المنتج + المصادر التاريخية + حالة التنفيذ.

## F. قواعد الدمج

- `cloude` هو shell الإنتاج الحالي.
- الكود من المستودعات الأخرى لا يُنسخ بالجملة؛ يُقارن بما هو موجود ويُنقل كـengine أو contract مع tests.
- Atlas/SuperSkills = مكتبة دعم؛ لا تظهر 15 ألف مهارة للمستخدم كـ15 ألف ميزة.
- كل قدرة يجب أن تحمل: source repo/path، target portal، state، owner module، tests، data scope، authority class.
- أي قدرة مكررة تُدمج تحت canonical capability واحدة مع provenance متعدد المصادر.

