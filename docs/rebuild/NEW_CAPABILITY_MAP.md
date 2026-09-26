# NEW CAPABILITY MAP

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

## Old → New matrix

| Old name / location | New ID | New location | Tier | Roles |
|---|---|---|---|---|
| لوحة العمل + بطل v23 + نبض v21 + بطل shell.js | `dash` | مركز القيادة › مركز القيادة | CORE | admin, accountant, warehouse, sales, viewer |
| مهام منصة V40 + مهام CRM V8.2 | `tasks` | مركز القيادة › المهام والإشعارات › المهام | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة الإشعارات في تصميم KOSIF | `notifications` | مركز القيادة › المهام والإشعارات › مركز الإشعارات | CORE | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة المخاطر والملاحظات في تصميم KOSIF (خريطة المخاطر، توزيع الفئات، أحدث الملاحظات) | `risks` | مركز القيادة › المخاطر والملاحظات | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| مركز القرار | `decision` | القرار والذكاء › مركز القرار | INTELLIGENCE | admin, accountant, sales |
| Jev للقرار | `jev` | القرار والذكاء › Jev ومجلس القرار › Jev للقرار | INTELLIGENCE | admin, accountant, sales |
| Grand Fusion intelligence.council | `council` | القرار والذكاء › Jev ومجلس القرار › مجلس القرار | INTELLIGENCE | admin, accountant, sales |
| المخاطر | `risklab` | القرار والذكاء › المخاطر والحساسية › المخاطر وجسر الربحية (advanced) | ADVANCED | admin |
| مختبر الحساسية | `sensitivity` | القرار والذكاء › المخاطر والحساسية › مختبر الحساسية (advanced) | ADVANCED | admin, accountant |
| الطلبات والتحصيل | `commerce` | المبيعات والعملاء › الطلبات والفوترة › الطلبات والتحصيل | CORE | admin, accountant, sales |
| الفاتورة الضريبية | `zatca` | المبيعات والعملاء › الطلبات والفوترة › نقطة البيع والفاتورة الضريبية | CORE | admin, accountant, sales |
| السوق والعملاء | `customers` | المبيعات والعملاء › العملاء والائتمان › العملاء | CORE | admin, accountant, sales |
| متابعة العملاء الاحترافية V8.2 (وحدة v25 crm) | `followup` | المبيعات والعملاء › العملاء والائتمان › متابعة العملاء | CORE | admin, accountant, sales |
| ائتمان المطاعم | `b2bcredit` | المبيعات والعملاء › العملاء والائتمان › ائتمان المطاعم | MANAGEMENT | admin, accountant, sales |
| العروض والكتالوج | `offers` | المبيعات والعملاء › العروض والكتالوج | CORE | admin, accountant, sales, viewer |
| المناسبات والتشغيل | `operations` | المبيعات والعملاء › المناسبات والتشغيل | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| ذكاء المبيعات | `salesintel` | المبيعات والعملاء › ذكاء المبيعات والطلب › ذكاء المبيعات (advanced) | INTELLIGENCE | admin |
| ذكاء العملاء | `intelligence` | المبيعات والعملاء › ذكاء المبيعات والطلب › ذكاء العملاء والطلب (advanced) | INTELLIGENCE | admin |
| اقتصاديات الطلب | `economics` | المبيعات والعملاء › ذكاء المبيعات والطلب › اقتصاديات الطلب (advanced) | INTELLIGENCE | admin, accountant |
| المخزون | `inventory` | المخزون والمشتريات › المخزون والتتبع › المخزون | CORE | admin, accountant, warehouse, viewer |
| التتبع والتبريد | `traceability` | المخزون والمشتريات › المخزون والتتبع › التتبع والتبريد | MANAGEMENT | admin, warehouse |
| الموردون | `suppliers` | المخزون والمشتريات › الموردون والمشتريات › الموردون والمشتريات | CORE | admin, accountant, warehouse |
| Grand Fusion procurement + أسعار الموردين V40 | `purchasing` | المخزون والمشتريات › الموردون والمشتريات › أوامر الشراء والاستلام | CORE | admin, accountant, warehouse |
| خلطات اللحوم | `blending` | المخزون والمشتريات › الإنتاج والخلطات › خلطات اللحوم | UTILITIES | admin, warehouse |
| دليل الشيف | `culinary` | المخزون والمشتريات › الإنتاج والخلطات › دليل الشيف | UTILITIES | admin, warehouse |
| اقتصاديات الذبيحة | `carcass` | المخزون والمشتريات › مختبر الذبيحة › اقتصاديات الذبيحة (advanced) | ADVANCED | admin, accountant, warehouse |
| مختبر الجزارة | `yieldlab` | المخزون والمشتريات › مختبر الذبيحة › مختبر الجزارة (advanced) | ADVANCED | admin, warehouse |
| تفكيك الذبيحة | `nrv` | المخزون والمشتريات › مختبر الذبيحة › تفكيك الذبيحة NRV (advanced) | ADVANCED | admin |
| Grand Fusion finance (accounts, journals, GL, TB, reconciliation) | `ledger` | المالية والمحاسبة › الدفاتر المحاسبية | CORE | admin, accountant |
| التدفق النقدي | `cash` | المالية والمحاسبة › التدفق النقدي | CORE | admin, accountant, sales, viewer |
| الذمم | `receivables` | المالية والمحاسبة › الذمم والتحصيل | CORE | admin, accountant, sales |
| جديد | `advances` | المالية والمحاسبة › السلف والدفعات المقدمة | CORE | admin |
| الهندسة المالية | `finance` | المالية والمحاسبة › الهندسة المالية (advanced) | ADVANCED | admin, accountant |
| واجهة موحدة بدل تشتت الأصناف والتكاليف والتسعير والبوكسات | `productflow` | الكتالوج والتسعير › المنتج والتكلفة › استوديو المنتج | CORE | admin, accountant, warehouse, sales, viewer |
| سجل الأسعار | `catalog` | الكتالوج والتسعير › المنتج والتكلفة › الأصناف والأسعار | CORE | admin, accountant, warehouse, sales, viewer |
| مركز التكاليف | `costs` | الكتالوج والتسعير › المنتج والتكلفة › التكاليف والمصروفات (advanced) | ADVANCED | admin |
| محاكي التسعير | `sim` | الكتالوج والتسعير › المنتج والتكلفة › التسعير السريع | CORE | admin |
| نواة التسعير | `kernel` | الكتالوج والتسعير › المنتج والتكلفة › نواة التسعير الصارمة (advanced) | ADVANCED | admin, accountant |
| مذكرة الاعتماد | `memo` | الكتالوج والتسعير › المنتج والتكلفة › اعتماد الأسعار | MANAGEMENT | admin |
| مركب البوكسات | `builder` | الكتالوج والتسعير › المنتج والتكلفة › البوكسات | CORE | admin |
| تحليل مكونات البوكس | `analyzer` | الكتالوج والتسعير › المنتج والتكلفة › تحليل البوكس (advanced) | ADVANCED | admin |
| استوديو المقارنة | `compare` | الكتالوج والتسعير › المنتج والتكلفة › المقارنة التحليلية (advanced) | INTELLIGENCE | admin |
| ملصقات الموازين | `labels` | الكتالوج والتسعير › الملصقات والباركود › ملصقات الموازين | UTILITIES | admin, warehouse, sales |
| ماسح الباركود | `scanner` | الكتالوج والتسعير › الملصقات والباركود › ماسح الباركود | UTILITIES | admin, warehouse, sales |
| مطابقة المبيعات | `smartmatch` | الكتالوج والتسعير › المطابقة › مطابقة المبيعات (advanced) | UTILITIES | admin, accountant, sales |
| مطابقة الإكسل | `excelrecon` | الكتالوج والتسعير › المطابقة › مطابقة الإكسل (advanced) | UTILITIES | admin, accountant |
| التقارير التنفيذية | `execreports` | التقارير والتحليلات › التقارير التنفيذية | MANAGEMENT | admin, accountant, sales, viewer |
| مركز التقارير | `reports` | التقارير والتحليلات › الطباعة والتصدير › مركز الطباعة | UTILITIES | admin, accountant, sales, viewer |
| Grand Fusion reports.exports | `exports` | التقارير والتحليلات › الطباعة والتصدير › مركز التصدير | UTILITIES | admin, accountant, sales |
| الأرشيف | `archive` | التقارير والتحليلات › الأرشيف والتغييرات | MANAGEMENT | admin, accountant |
| جديد — دمج smart-trial-balance-review (مجلس Gemini والجولات) و kosif-audit-pro (القوائم والتحليل) و Moon (المخاطر والرأي) و SEE (التصنيف والجاهزية) + استوديو KOSIF للمراجعة (تبويب «الاستوديو المتقدم» داخل الملف) | `tbreview` | المراجعة والتأكيد › مركز المراجعة › ملف المراجعة | CORE | admin, accountant |
| جديد — يحل محل قاعدة معايير smart-trial-balance-review ويكمّل مختبر المعايير | `codex` | المراجعة والتأكيد › المعايير والمدونة › المدونة المحاسبية والمعايير | MANAGEMENT | admin, accountant, viewer |
| جديد — من global_financial_and_audit_research_bundle_extended_verified.pdf (12,506 صفحة) | `auditbench` | المراجعة والتأكيد › المعايير والمدونة › المرجع العالمي للمراجعة | MANAGEMENT | admin |
| KOSIF Audit Studio | `auditdesk` | المراجعة والتأكيد › مركز المراجعة › الاستوديو المتقدم (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditdocs` | المراجعة والتأكيد › مركز المراجعة › المستندات والأدلة (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditissues` | المراجعة والتأكيد › مركز المراجعة › الملاحظات والقضايا (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditcouncil` | المراجعة والتأكيد › مركز المراجعة › مجلس المراجعين (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditfin` | المراجعة والتأكيد › مركز المراجعة › القوائم والقيود (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditreport` | المراجعة والتأكيد › مركز المراجعة › التقارير والإصدار (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio (classic) | `auditanalytics` | المراجعة والتأكيد › مركز المراجعة › التحليل والاختبارات (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio (lab) | `auditlab` | المراجعة والتأكيد › المعايير والمدونة › مختبر المعايير والأبحاث (advanced) | ADVANCED | admin, accountant |
| الإعدادات | `settings` | النظام والتكاملات › الإعدادات والأجهزة › الإعدادات والمظهر | ADMIN | admin, accountant, warehouse, sales, viewer |
| جديد — تعليمات التثبيت (INSTALL-iPHONE-ar.txt) + نسخة v27 للابتوب وv28–v30 للآيفون | `devices` | النظام والتكاملات › الإعدادات والأجهزة › الأجهزة والمزامنة | UTILITIES | admin, accountant, warehouse, sales, viewer |
| Grand Fusion system.companies | `companies` | النظام والتكاملات › الشركات والفترات (advanced) | ADMIN | admin, accountant |
| الحوكمة | `governance` | النظام والتكاملات › الحوكمة والصلاحيات › الحوكمة والجاهزية (advanced) | ADMIN | admin |
| الصحة والاستثناءات | `health` | النظام والتكاملات › الحوكمة والصلاحيات › الصحة والتشخيص (advanced) | ADMIN | admin |
| Capabilities v2 | `capabilitiesv2` | النظام والتكاملات › الحوكمة والصلاحيات › الصلاحيات ومساحات العمل (advanced) | ADMIN | admin |

## Menu: domains and hubs

One menu entry per hub; the pages of a hub open as tabs on top of each other (each keeps its own id, permission and deep link).

| Domain | Menu entry | Pages |
|---|---|---|
| مركز القيادة | مركز القيادة | `dash` مركز القيادة |
| مركز القيادة | المهام والإشعارات | `tasks` المهام · `notifications` مركز الإشعارات |
| مركز القيادة | المخاطر والملاحظات | `risks` المخاطر والملاحظات |
| القرار والذكاء | مركز القرار | `decision` مركز القرار |
| القرار والذكاء | Jev ومجلس القرار | `jev` Jev للقرار · `council` مجلس القرار |
| القرار والذكاء | المخاطر والحساسية | `risklab` المخاطر وجسر الربحية · `sensitivity` مختبر الحساسية |
| المبيعات والعملاء | الطلبات والفوترة | `commerce` الطلبات والتحصيل · `zatca` نقطة البيع والفاتورة الضريبية |
| المبيعات والعملاء | العملاء والائتمان | `customers` العملاء · `followup` متابعة العملاء · `b2bcredit` ائتمان المطاعم |
| المبيعات والعملاء | العروض والكتالوج | `offers` العروض والكتالوج |
| المبيعات والعملاء | المناسبات والتشغيل | `operations` المناسبات والتشغيل |
| المبيعات والعملاء | ذكاء المبيعات والطلب | `salesintel` ذكاء المبيعات · `intelligence` ذكاء العملاء والطلب · `economics` اقتصاديات الطلب |
| المخزون والمشتريات | المخزون والتتبع | `inventory` المخزون · `traceability` التتبع والتبريد |
| المخزون والمشتريات | الموردون والمشتريات | `suppliers` الموردون والمشتريات · `purchasing` أوامر الشراء والاستلام |
| المخزون والمشتريات | الإنتاج والخلطات | `blending` خلطات اللحوم · `culinary` دليل الشيف |
| المخزون والمشتريات | مختبر الذبيحة | `carcass` اقتصاديات الذبيحة · `yieldlab` مختبر الجزارة · `nrv` تفكيك الذبيحة NRV |
| المالية والمحاسبة | الدفاتر المحاسبية | `ledger` الدفاتر المحاسبية |
| المالية والمحاسبة | التدفق النقدي | `cash` التدفق النقدي |
| المالية والمحاسبة | الذمم والتحصيل | `receivables` الذمم والتحصيل |
| المالية والمحاسبة | السلف والدفعات المقدمة | `advances` السلف والدفعات المقدمة |
| المالية والمحاسبة | الهندسة المالية | `finance` الهندسة المالية |
| الكتالوج والتسعير | المنتج والتكلفة | `productflow` استوديو المنتج · `catalog` الأصناف والأسعار · `costs` التكاليف والمصروفات · `sim` التسعير السريع · `kernel` نواة التسعير الصارمة · `memo` اعتماد الأسعار · `builder` البوكسات · `analyzer` تحليل البوكس · `compare` المقارنة التحليلية |
| الكتالوج والتسعير | الملصقات والباركود | `labels` ملصقات الموازين · `scanner` ماسح الباركود |
| الكتالوج والتسعير | المطابقة | `smartmatch` مطابقة المبيعات · `excelrecon` مطابقة الإكسل |
| التقارير والتحليلات | التقارير التنفيذية | `execreports` التقارير التنفيذية |
| التقارير والتحليلات | الطباعة والتصدير | `reports` مركز الطباعة · `exports` مركز التصدير |
| التقارير والتحليلات | الأرشيف والتغييرات | `archive` الأرشيف والتغييرات |
| المراجعة والتأكيد | مركز المراجعة | `tbreview` ملف المراجعة · `auditdesk` الاستوديو المتقدم · `auditdocs` المستندات والأدلة · `auditissues` الملاحظات والقضايا · `auditcouncil` مجلس المراجعين · `auditfin` القوائم والقيود · `auditreport` التقارير والإصدار · `auditanalytics` التحليل والاختبارات |
| المراجعة والتأكيد | المعايير والمدونة | `codex` المدونة المحاسبية والمعايير · `auditbench` المرجع العالمي للمراجعة · `auditlab` مختبر المعايير والأبحاث |
| النظام والتكاملات | الإعدادات والأجهزة | `settings` الإعدادات والمظهر · `devices` الأجهزة والمزامنة |
| النظام والتكاملات | الشركات والفترات | `companies` الشركات والفترات |
| النظام والتكاملات | الحوكمة والصلاحيات | `governance` الحوكمة والجاهزية · `health` الصحة والتشخيص · `capabilitiesv2` الصلاحيات ومساحات العمل |

67 screens in 31 menu entries.

## By tier

- **CORE** — العمل اليومي الأساسي (19): `dash`, `notifications`, `commerce`, `zatca`, `customers`, `followup`, `offers`, `inventory`, `suppliers`, `purchasing`, `ledger`, `cash`, `receivables`, `advances`, `productflow`, `catalog`, `sim`, `builder`, `tbreview`
- **MANAGEMENT** — الإدارة والمتابعة (10): `tasks`, `risks`, `b2bcredit`, `operations`, `traceability`, `memo`, `execreports`, `archive`, `codex`, `auditbench`
- **INTELLIGENCE** — التحليل والذكاء (7): `decision`, `jev`, `council`, `salesintel`, `intelligence`, `economics`, `compare`
- **ADVANCED** — الهندسة المتقدمة (17): `risklab`, `sensitivity`, `carcass`, `yieldlab`, `nrv`, `finance`, `costs`, `kernel`, `analyzer`, `auditdesk`, `auditdocs`, `auditissues`, `auditcouncil`, `auditfin`, `auditreport`, `auditanalytics`, `auditlab`
- **UTILITIES** — أدوات مساعدة (9): `blending`, `culinary`, `labels`, `scanner`, `smartmatch`, `excelrecon`, `reports`, `exports`, `devices`
- **ADMIN** — النظام والإدارة (5): `settings`, `companies`, `governance`, `health`, `capabilitiesv2`

Coverage gate: 67 screens in 9 domains; see CAPABILITY_COVERAGE_ALL_VERSIONS.md for every historical version.
