# NEW CAPABILITY MAP

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

## Old → New matrix

| Old name / location | New ID | New location | Tier | Roles |
|---|---|---|---|---|
| لوحة العمل + بطل v23 + نبض v21 + بطل shell.js | `dash` | مركز القيادة › مركز القيادة | CORE | admin, accountant, warehouse, sales, viewer |
| مركز القرار | `decision` | مركز القيادة › مركز القرار | INTELLIGENCE | admin, accountant, sales |
| مهام منصة V40 + مهام CRM V8.2 | `tasks` | مركز القيادة › المهام | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة الإشعارات في تصميم KOSIF | `notifications` | مركز القيادة › مركز الإشعارات | CORE | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة المخاطر والملاحظات في تصميم KOSIF (خريطة المخاطر، توزيع الفئات، أحدث الملاحظات) | `risks` | مركز القيادة › المخاطر والملاحظات | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| الطلبات والتحصيل | `commerce` | المبيعات والعملاء › الطلبات والتحصيل | CORE | admin, accountant, sales |
| السوق والعملاء | `customers` | المبيعات والعملاء › العملاء | CORE | admin, accountant, sales |
| متابعة العملاء الاحترافية V8.2 (وحدة v25 crm) | `followup` | المبيعات والعملاء › متابعة العملاء | CORE | admin, accountant, sales |
| العروض والكتالوج | `offers` | المبيعات والعملاء › العروض والكتالوج | CORE | admin, accountant, sales, viewer |
| الفاتورة الضريبية | `zatca` | المبيعات والعملاء › نقطة البيع والفاتورة الضريبية | CORE | admin, accountant, sales |
| ائتمان المطاعم | `b2bcredit` | المبيعات والعملاء › ائتمان المطاعم | MANAGEMENT | admin, accountant, sales |
| المناسبات والتشغيل | `operations` | المبيعات والعملاء › المناسبات والتشغيل | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| ذكاء المبيعات | `salesintel` | المبيعات والعملاء › ذكاء المبيعات (advanced) | INTELLIGENCE | admin |
| ذكاء العملاء | `intelligence` | المبيعات والعملاء › ذكاء العملاء والطلب (advanced) | INTELLIGENCE | admin |
| اقتصاديات الطلب | `economics` | المبيعات والعملاء › اقتصاديات الطلب (advanced) | INTELLIGENCE | admin, accountant |
| المخزون | `inventory` | المخزون والإنتاج › المخزون | CORE | admin, accountant, warehouse, viewer |
| التتبع والتبريد | `traceability` | المخزون والإنتاج › التتبع والتبريد | MANAGEMENT | admin, warehouse |
| خلطات اللحوم | `blending` | المخزون والإنتاج › خلطات اللحوم | UTILITIES | admin, warehouse |
| دليل الشيف | `culinary` | المخزون والإنتاج › دليل الشيف | UTILITIES | admin, warehouse |
| اقتصاديات الذبيحة | `carcass` | المخزون والإنتاج › اقتصاديات الذبيحة (advanced) | ADVANCED | admin, accountant, warehouse |
| مختبر الجزارة | `yieldlab` | المخزون والإنتاج › مختبر الجزارة (advanced) | ADVANCED | admin, warehouse |
| تفكيك الذبيحة | `nrv` | المخزون والإنتاج › تفكيك الذبيحة NRV (advanced) | ADVANCED | admin |
| الموردون | `suppliers` | المشتريات والموردون › الموردون والمشتريات | CORE | admin, accountant, warehouse |
| Grand Fusion procurement + أسعار الموردين V40 | `purchasing` | المشتريات والموردون › أوامر الشراء والاستلام | CORE | admin, accountant, warehouse |
| التدفق النقدي | `cash` | المالية والمحاسبة › التدفق النقدي | CORE | admin, accountant, sales, viewer |
| الذمم | `receivables` | المالية والمحاسبة › الذمم والتحصيل | CORE | admin, accountant, sales |
| Grand Fusion finance (accounts, journals, GL, TB, reconciliation) | `ledger` | المالية والمحاسبة › الدفاتر المحاسبية | CORE | admin, accountant |
| الهندسة المالية | `finance` | المالية والمحاسبة › الهندسة المالية (advanced) | ADVANCED | admin, accountant |
| سجل الأسعار | `catalog` | الكتالوج والتسعير › الأصناف والأسعار | CORE | admin, accountant, warehouse, sales, viewer |
| مركب البوكسات | `builder` | الكتالوج والتسعير › البوكسات | CORE | admin |
| محاكي التسعير | `sim` | الكتالوج والتسعير › التسعير السريع | CORE | admin |
| مذكرة الاعتماد | `memo` | الكتالوج والتسعير › اعتماد الأسعار | MANAGEMENT | admin |
| ملصقات الموازين | `labels` | الكتالوج والتسعير › ملصقات الموازين | UTILITIES | admin, warehouse, sales |
| ماسح الباركود | `scanner` | الكتالوج والتسعير › ماسح الباركود | UTILITIES | admin, warehouse, sales |
| نواة التسعير | `kernel` | الكتالوج والتسعير › نواة التسعير الصارمة (advanced) | ADVANCED | admin, accountant |
| مركز التكاليف | `costs` | الكتالوج والتسعير › التكاليف والمصروفات (advanced) | ADVANCED | admin |
| تحليل مكونات البوكس | `analyzer` | الكتالوج والتسعير › تحليل البوكس (advanced) | ADVANCED | admin |
| استوديو المقارنة | `compare` | الكتالوج والتسعير › المقارنة التحليلية (advanced) | INTELLIGENCE | admin |
| Jev للقرار | `jev` | Jev والذكاء › Jev للقرار | INTELLIGENCE | admin, accountant, sales |
| Grand Fusion intelligence.council | `council` | Jev والذكاء › مجلس القرار | INTELLIGENCE | admin, accountant, sales |
| المخاطر | `risklab` | Jev والذكاء › المخاطر وجسر الربحية (advanced) | ADVANCED | admin |
| مختبر الحساسية | `sensitivity` | Jev والذكاء › مختبر الحساسية (advanced) | ADVANCED | admin, accountant |
| التقارير التنفيذية | `execreports` | التقارير والتحليلات › التقارير التنفيذية | MANAGEMENT | admin, accountant, sales, viewer |
| مركز التقارير | `reports` | التقارير والتحليلات › مركز الطباعة | UTILITIES | admin, accountant, sales, viewer |
| الأرشيف | `archive` | التقارير والتحليلات › الأرشيف والتغييرات | MANAGEMENT | admin, accountant |
| Grand Fusion reports.exports | `exports` | التقارير والتحليلات › مركز التصدير | UTILITIES | admin, accountant, sales |
| مطابقة المبيعات | `smartmatch` | التقارير والتحليلات › مطابقة المبيعات (advanced) | UTILITIES | admin, accountant, sales |
| مطابقة الإكسل | `excelrecon` | التقارير والتحليلات › مطابقة الإكسل (advanced) | UTILITIES | admin, accountant |
| KOSIF Audit Studio | `auditdesk` | المراجعة والتأكيد › مركز المراجعة (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditdocs` | المراجعة والتأكيد › المستندات والأدلة (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditissues` | المراجعة والتأكيد › الملاحظات والقضايا (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditcouncil` | المراجعة والتأكيد › مجلس المراجعين (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditfin` | المراجعة والتأكيد › القوائم والقيود (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditreport` | المراجعة والتأكيد › التقارير والإصدار (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio (classic) | `auditanalytics` | المراجعة والتأكيد › التحليل المالي والمخاطر (advanced) | ADVANCED | admin, accountant |
| KOSIF Audit Studio (lab) | `auditlab` | المراجعة والتأكيد › مختبر المعايير (advanced) | ADVANCED | admin, accountant |
| الإعدادات | `settings` | النظام والتكاملات › الإعدادات والمظهر | ADMIN | admin, accountant, warehouse, sales, viewer |
| جديد — تعليمات التثبيت (INSTALL-iPHONE-ar.txt) + نسخة v27 للابتوب وv28–v30 للآيفون | `devices` | النظام والتكاملات › الأجهزة والمزامنة | UTILITIES | admin, accountant, warehouse, sales, viewer |
| Grand Fusion system.companies | `companies` | النظام والتكاملات › الشركات والفترات (advanced) | ADMIN | admin, accountant |
| الصحة والاستثناءات | `health` | النظام والتكاملات › الصحة والتشخيص (advanced) | ADMIN | admin |
| الحوكمة | `governance` | النظام والتكاملات › الحوكمة والجاهزية (advanced) | ADMIN | admin |
| Capabilities v2 | `capabilitiesv2` | النظام والتكاملات › الصلاحيات ومساحات العمل (advanced) | ADMIN | admin |

## By tier

- **CORE** — العمل اليومي الأساسي (16): `dash`, `notifications`, `commerce`, `customers`, `followup`, `offers`, `zatca`, `inventory`, `suppliers`, `purchasing`, `cash`, `receivables`, `ledger`, `catalog`, `builder`, `sim`
- **MANAGEMENT** — الإدارة والمتابعة (8): `tasks`, `risks`, `b2bcredit`, `operations`, `traceability`, `memo`, `execreports`, `archive`
- **INTELLIGENCE** — التحليل والذكاء (7): `decision`, `salesintel`, `intelligence`, `economics`, `compare`, `jev`, `council`
- **ADVANCED** — الهندسة المتقدمة (17): `carcass`, `yieldlab`, `nrv`, `finance`, `kernel`, `costs`, `analyzer`, `risklab`, `sensitivity`, `auditdesk`, `auditdocs`, `auditissues`, `auditcouncil`, `auditfin`, `auditreport`, `auditanalytics`, `auditlab`
- **UTILITIES** — أدوات مساعدة (9): `blending`, `culinary`, `labels`, `scanner`, `reports`, `exports`, `smartmatch`, `excelrecon`, `devices`
- **ADMIN** — النظام والإدارة (5): `settings`, `companies`, `health`, `governance`, `capabilitiesv2`

Coverage gate: 62 screens in 10 domains; see CAPABILITY_COVERAGE_ALL_VERSIONS.md for every historical version.
