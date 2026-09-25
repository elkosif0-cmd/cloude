# NEW CAPABILITY MAP

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

## Old → New matrix

| Old name / location | New ID | New location | Tier | Roles |
|---|---|---|---|---|
| لوحة العمل + بطل v23 + نبض v21 + بطل shell.js | `dash` | Primary › اليوم › مركز القيادة | CORE | admin, accountant, warehouse, sales, viewer |
| مركز القرار | `decision` | Primary › اليوم › مركز القرار | INTELLIGENCE | admin, accountant, sales |
| Jev للقرار | `jev` | Primary › اليوم › Jev للقرار | INTELLIGENCE | admin, accountant, sales |
| الطلبات والتحصيل | `commerce` | Primary › البيع والعملاء › الطلبات والتحصيل | CORE | admin, accountant, sales |
| السوق والعملاء | `customers` | Primary › البيع والعملاء › العملاء | CORE | admin, accountant, sales |
| العروض والكتالوج | `offers` | Primary › البيع والعملاء › العروض والكتالوج | CORE | admin, accountant, sales, viewer |
| الفاتورة الضريبية | `zatca` | Primary › البيع والعملاء › نقطة البيع والفاتورة الضريبية | CORE | admin, accountant, sales |
| ائتمان المطاعم | `b2bcredit` | Primary › البيع والعملاء › ائتمان المطاعم | MANAGEMENT | admin, accountant, sales |
| المناسبات والتشغيل | `operations` | Primary › البيع والعملاء › المناسبات والتشغيل | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| سجل الأسعار | `catalog` | Primary › الأصناف والأسعار › الأصناف والأسعار | CORE | admin, accountant, warehouse, sales, viewer |
| مركب البوكسات | `builder` | Primary › الأصناف والأسعار › البوكسات | CORE | admin |
| محاكي التسعير | `sim` | Primary › الأصناف والأسعار › التسعير السريع | CORE | admin |
| مذكرة الاعتماد | `memo` | Primary › الأصناف والأسعار › اعتماد الأسعار | MANAGEMENT | admin |
| ملصقات الموازين | `labels` | Primary › الأصناف والأسعار › ملصقات الموازين | UTILITIES | admin, warehouse, sales |
| ماسح الباركود | `scanner` | Primary › الأصناف والأسعار › ماسح الباركود | UTILITIES | admin, warehouse, sales |
| المخزون | `inventory` | Primary › المخزون والتجهيز › المخزون | CORE | admin, accountant, warehouse, viewer |
| الموردون | `suppliers` | Primary › المخزون والتجهيز › الموردون والمشتريات | CORE | admin, accountant, warehouse |
| التتبع والتبريد | `traceability` | Primary › المخزون والتجهيز › التتبع والتبريد | MANAGEMENT | admin, warehouse |
| خلطات اللحوم | `blending` | Primary › المخزون والتجهيز › خلطات اللحوم | UTILITIES | admin, warehouse |
| دليل الشيف | `culinary` | Primary › المخزون والتجهيز › دليل الشيف | UTILITIES | admin, warehouse |
| التدفق النقدي | `cash` | Primary › المال والتقارير › التدفق النقدي | CORE | admin, accountant, sales, viewer |
| الذمم | `receivables` | Primary › المال والتقارير › الذمم والتحصيل | CORE | admin, accountant, sales |
| التقارير التنفيذية | `execreports` | Primary › المال والتقارير › التقارير التنفيذية | MANAGEMENT | admin, accountant, sales, viewer |
| مركز التقارير | `reports` | Primary › المال والتقارير › مركز الطباعة | UTILITIES | admin, accountant, sales, viewer |
| الأرشيف | `archive` | Primary › المال والتقارير › الأرشيف والتغييرات | MANAGEMENT | admin, accountant |
| ذكاء المبيعات | `salesintel` | Advanced › التحليل › ذكاء المبيعات | INTELLIGENCE | admin |
| اقتصاديات الطلب | `economics` | Advanced › التحليل › اقتصاديات الطلب | INTELLIGENCE | admin, accountant |
| ذكاء العملاء | `intelligence` | Advanced › التحليل › ذكاء العملاء والطلب | INTELLIGENCE | admin |
| الهندسة المالية | `finance` | Advanced › التحليل › الهندسة المالية | ADVANCED | admin, accountant |
| المخاطر | `risklab` | Advanced › التحليل › المخاطر وجسر الربحية | ADVANCED | admin |
| مختبر الحساسية | `sensitivity` | Advanced › التحليل › مختبر الحساسية | ADVANCED | admin, accountant |
| استوديو المقارنة | `compare` | Advanced › التحليل › المقارنة التحليلية | INTELLIGENCE | admin |
| نواة التسعير | `kernel` | Advanced › هندسة التسعير › نواة التسعير الصارمة | ADVANCED | admin, accountant |
| مركز التكاليف | `costs` | Advanced › هندسة التسعير › التكاليف والمصروفات | ADVANCED | admin |
| تحليل مكونات البوكس | `analyzer` | Advanced › هندسة التسعير › تحليل البوكس | ADVANCED | admin |
| مختبر الجزارة | `yieldlab` | Advanced › الذبيحة والجزارة › مختبر الجزارة | ADVANCED | admin, warehouse |
| تفكيك الذبيحة | `nrv` | Advanced › الذبيحة والجزارة › تفكيك الذبيحة NRV | ADVANCED | admin |
| اقتصاديات الذبيحة | `carcass` | Advanced › الذبيحة والجزارة › اقتصاديات الذبيحة | ADVANCED | admin, accountant, warehouse |
| مطابقة المبيعات | `smartmatch` | Advanced › المطابقة › مطابقة المبيعات | UTILITIES | admin, accountant, sales |
| مطابقة الإكسل | `excelrecon` | Advanced › المطابقة › مطابقة الإكسل | UTILITIES | admin, accountant |
| KOSIF Audit Studio | `auditdesk` | Advanced › المحاسبة والمراجعة › مركز المراجعة | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditdocs` | Advanced › المحاسبة والمراجعة › المستندات والأدلة | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditissues` | Advanced › المحاسبة والمراجعة › الملاحظات والقضايا | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditcouncil` | Advanced › المحاسبة والمراجعة › مجلس المراجعين | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditfin` | Advanced › المحاسبة والمراجعة › القوائم والقيود | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditreport` | Advanced › المحاسبة والمراجعة › التقارير والإصدار | ADVANCED | admin, accountant |
| KOSIF Audit Studio (classic) | `auditanalytics` | Advanced › المحاسبة والمراجعة › التحليل المالي والمخاطر | ADVANCED | admin, accountant |
| KOSIF Audit Studio (lab) | `auditlab` | Advanced › المحاسبة والمراجعة › مختبر المعايير | ADVANCED | admin, accountant |
| الصحة والاستثناءات | `health` | Advanced › النظام › الصحة والتشخيص | ADMIN | admin |
| الحوكمة | `governance` | Advanced › النظام › الحوكمة والجاهزية | ADMIN | admin |
| Capabilities v2 | `capabilitiesv2` | Advanced › النظام › الصلاحيات ومساحات العمل | ADMIN | admin |
| الإعدادات | `settings` | Advanced › النظام › الإعدادات والمظهر | ADMIN | admin, accountant, warehouse, sales, viewer |

## By tier

- **CORE** — العمل اليومي الأساسي (12): `dash`, `commerce`, `customers`, `offers`, `zatca`, `catalog`, `builder`, `sim`, `inventory`, `suppliers`, `cash`, `receivables`
- **MANAGEMENT** — الإدارة والمتابعة (6): `b2bcredit`, `operations`, `memo`, `traceability`, `execreports`, `archive`
- **INTELLIGENCE** — التحليل والذكاء (6): `decision`, `jev`, `salesintel`, `economics`, `intelligence`, `compare`
- **ADVANCED** — الهندسة المتقدمة (17): `finance`, `risklab`, `sensitivity`, `kernel`, `costs`, `analyzer`, `yieldlab`, `nrv`, `carcass`, `auditdesk`, `auditdocs`, `auditissues`, `auditcouncil`, `auditfin`, `auditreport`, `auditanalytics`, `auditlab`
- **UTILITIES** — أدوات مساعدة (7): `labels`, `scanner`, `blending`, `culinary`, `reports`, `smartmatch`, `excelrecon`
- **ADMIN** — النظام والإدارة (4): `health`, `governance`, `capabilitiesv2`, `settings`

Coverage gate: 52/52 legacy screens mapped (100%).
