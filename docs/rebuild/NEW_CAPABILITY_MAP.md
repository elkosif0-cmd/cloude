# NEW CAPABILITY MAP

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

## Old → New matrix

| Old name / location | New ID | New location | Tier | Roles |
|---|---|---|---|---|
| لوحة العمل + بطل v23 + نبض v21 + بطل shell.js | `dash` | العام › مركز القيادة | CORE | admin, accountant, warehouse, sales, viewer |
| مهام منصة V40 + مهام CRM V8.2 | `tasks` | العام › المهام والإشعارات › المهام | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة الإشعارات في تصميم KOSIF | `notifications` | العام › المهام والإشعارات › مركز الإشعارات | CORE | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة المخاطر والملاحظات في تصميم KOSIF (خريطة المخاطر، توزيع الفئات، أحدث الملاحظات) | `risks` | العام › المخاطر والملاحظات | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| تنظيم كل الأدوات غير المرتبطة مباشرة بملف المراجعة في مساحة مستقلة | `helperdesk` | الأدوات المساعدة للمحاسب › مركز الأدوات المساعدة | UTILITIES | admin, accountant, warehouse, sales, viewer |
| مركز القرار | `decision` | Jev والقرار › مركز القرار | INTELLIGENCE | admin, accountant, sales |
| Jev للقرار | `jev` | Jev والقرار › Jev ومجلس القرار › Jev للقرار | INTELLIGENCE | admin, accountant, sales |
| Grand Fusion intelligence.council | `council` | Jev والقرار › Jev ومجلس القرار › مجلس القرار | INTELLIGENCE | admin, accountant, sales |
| المخاطر | `risklab` | الأدوات المساعدة للمحاسب › المخاطر والحساسية › المخاطر وجسر الربحية | ADVANCED | admin |
| مختبر الحساسية | `sensitivity` | الأدوات المساعدة للمحاسب › المخاطر والحساسية › مختبر الحساسية | ADVANCED | admin, accountant |
| جديد — خريطة جغرافية للعملاء وتحليل المبيعات وتقرير الصنف | `salesmap` | الأدوات المساعدة للمحاسب › خريطة العملاء وتحليل المبيعات | CORE | admin |
| الطلبات والتحصيل | `commerce` | الأدوات المساعدة للمحاسب › الطلبات والفوترة › الطلبات والتحصيل | CORE | admin, accountant, sales |
| الفاتورة الضريبية | `zatca` | الأدوات المساعدة للمحاسب › الطلبات والفوترة › نقطة البيع والفاتورة الضريبية | CORE | admin, accountant, sales |
| السوق والعملاء | `customers` | الأدوات المساعدة للمحاسب › العملاء والائتمان › العملاء | CORE | admin, accountant, sales |
| متابعة العملاء الاحترافية V8.2 (وحدة v25 crm) | `followup` | الأدوات المساعدة للمحاسب › العملاء والائتمان › متابعة العملاء | CORE | admin, accountant, sales |
| ائتمان المطاعم | `b2bcredit` | الأدوات المساعدة للمحاسب › العملاء والائتمان › ائتمان المطاعم | MANAGEMENT | admin, accountant, sales |
| العروض والكتالوج | `offers` | الأدوات المساعدة للمحاسب › العروض والكتالوج | CORE | admin, accountant, sales, viewer |
| المناسبات والتشغيل | `operations` | الأدوات المساعدة للمحاسب › المناسبات والتشغيل | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| ذكاء المبيعات | `salesintel` | الأدوات المساعدة للمحاسب › ذكاء المبيعات والطلب › ذكاء المبيعات | INTELLIGENCE | admin |
| ذكاء العملاء | `intelligence` | الأدوات المساعدة للمحاسب › ذكاء المبيعات والطلب › ذكاء العملاء والطلب | INTELLIGENCE | admin |
| اقتصاديات الطلب | `economics` | الأدوات المساعدة للمحاسب › ذكاء المبيعات والطلب › اقتصاديات الطلب | INTELLIGENCE | admin, accountant |
| المخزون | `inventory` | الأدوات المساعدة للمحاسب › المخزون والتتبع › المخزون | CORE | admin, accountant, warehouse, viewer |
| التتبع والتبريد | `traceability` | الأدوات المساعدة للمحاسب › المخزون والتتبع › التتبع والتبريد | MANAGEMENT | admin, warehouse |
| الموردون | `suppliers` | الأدوات المساعدة للمحاسب › الموردون والمشتريات › الموردون والمشتريات | CORE | admin, accountant, warehouse |
| Grand Fusion procurement + أسعار الموردين V40 | `purchasing` | الأدوات المساعدة للمحاسب › الموردون والمشتريات › أوامر الشراء والاستلام | CORE | admin, accountant, warehouse |
| خلطات اللحوم | `blending` | الأدوات المساعدة للمحاسب › الإنتاج والخلطات › خلطات اللحوم | UTILITIES | admin, warehouse |
| دليل الشيف | `culinary` | الأدوات المساعدة للمحاسب › الإنتاج والخلطات › دليل الشيف | UTILITIES | admin, warehouse |
| اقتصاديات الذبيحة | `carcass` | الأدوات المساعدة للمحاسب › مختبر الذبيحة › اقتصاديات الذبيحة | ADVANCED | admin, accountant, warehouse |
| مختبر الجزارة | `yieldlab` | الأدوات المساعدة للمحاسب › مختبر الذبيحة › مختبر الجزارة | ADVANCED | admin, warehouse |
| تفكيك الذبيحة | `nrv` | الأدوات المساعدة للمحاسب › مختبر الذبيحة › تفكيك الذبيحة NRV | ADVANCED | admin |
| Grand Fusion finance (accounts, journals, GL, TB, reconciliation) | `ledger` | الأدوات المساعدة للمحاسب › الدفاتر المحاسبية | CORE | admin, accountant |
| جديد — فهم القيود ومحاكاتها بذاكرة داخلية | `jesim` | الأدوات المساعدة للمحاسب › محاكي القيود | CORE | admin |
| التدفق النقدي | `cash` | الأدوات المساعدة للمحاسب › التدفق النقدي | CORE | admin, accountant, sales, viewer |
| جديد — مقارنة مرجعية من حزمة الأبحاث للمحاسب | `benchmarks` | الأدوات المساعدة للمحاسب › المقارنة بالشركات العالمية | MANAGEMENT | admin |
| الذمم | `receivables` | الأدوات المساعدة للمحاسب › الذمم والتحصيل | CORE | admin, accountant, sales |
| جديد | `advances` | الأدوات المساعدة للمحاسب › السلف والدفعات المقدمة | CORE | admin |
| الهندسة المالية | `finance` | الأدوات المساعدة للمحاسب › الهندسة المالية | ADVANCED | admin, accountant |
| جديد — شجرة المنتجات وربطها بالموردين والعملاء بالأسهم | `ptree` | الأدوات المساعدة للمحاسب › شجرة المنتجات | CORE | admin |
| واجهة موحدة بدل تشتت الأصناف والتكاليف والتسعير والبوكسات | `productflow` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › استوديو المنتج | CORE | admin, accountant, warehouse, sales, viewer |
| سجل الأسعار | `catalog` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › الأصناف والأسعار | CORE | admin, accountant, warehouse, sales, viewer |
| مركز التكاليف | `costs` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › التكاليف والمصروفات | ADVANCED | admin |
| محاكي التسعير | `sim` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › التسعير السريع | CORE | admin |
| نواة التسعير | `kernel` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › نواة التسعير الصارمة | ADVANCED | admin, accountant |
| مذكرة الاعتماد | `memo` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › اعتماد الأسعار | MANAGEMENT | admin |
| مركب البوكسات | `builder` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › البوكسات | CORE | admin |
| تحليل مكونات البوكس | `analyzer` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › تحليل البوكس | ADVANCED | admin |
| استوديو المقارنة | `compare` | الأدوات المساعدة للمحاسب › المنتج والتكلفة › المقارنة التحليلية | INTELLIGENCE | admin |
| ملصقات الموازين | `labels` | الأدوات المساعدة للمحاسب › الملصقات والباركود › ملصقات الموازين | UTILITIES | admin, warehouse, sales |
| ماسح الباركود | `scanner` | الأدوات المساعدة للمحاسب › الملصقات والباركود › ماسح الباركود | UTILITIES | admin, warehouse, sales |
| مطابقة المبيعات | `smartmatch` | الأدوات المساعدة للمحاسب › المطابقة › مطابقة المبيعات | UTILITIES | admin, accountant, sales |
| مطابقة الإكسل | `excelrecon` | الأدوات المساعدة للمحاسب › المطابقة › مطابقة الإكسل | UTILITIES | admin, accountant |
| التقارير التنفيذية | `execreports` | الأدوات المساعدة للمحاسب › التقارير التنفيذية | MANAGEMENT | admin, accountant, sales, viewer |
| مركز التقارير | `reports` | الأدوات المساعدة للمحاسب › الطباعة والتصدير › مركز الطباعة | UTILITIES | admin, accountant, sales, viewer |
| Grand Fusion reports.exports | `exports` | الأدوات المساعدة للمحاسب › الطباعة والتصدير › مركز التصدير | UTILITIES | admin, accountant, sales |
| الأرشيف | `archive` | الأدوات المساعدة للمحاسب › الأرشيف والتغييرات | MANAGEMENT | admin, accountant |
| جديد — دمج smart-trial-balance-review (مجلس Gemini والجولات) و kosif-audit-pro (القوائم والتحليل) و Moon (المخاطر والرأي) و SEE (التصنيف والجاهزية) + استوديو KOSIF للمراجعة (تبويب «الاستوديو المتقدم» داخل الملف) | `tbreview` | المراجعة والمراجعة المالية › مركز المراجعة › ملف المراجعة | CORE | admin, accountant |
| جديد — يحل محل قاعدة معايير smart-trial-balance-review ويكمّل مختبر المعايير | `codex` | المراجعة والمراجعة المالية › المعايير والمدونة › المدونة المحاسبية والمعايير | MANAGEMENT | admin, accountant, viewer |
| جديد — من global_financial_and_audit_research_bundle_extended_verified.pdf (12,506 صفحة) | `auditbench` | المراجعة والمراجعة المالية › المعايير والمدونة › المرجع العالمي للمراجعة | MANAGEMENT | admin |
| جديد — تشغيل المراجعة على شركات global_financial_and_audit_research_bundle_extended_verified.pdf ومقارنتها بتقارير مراجعيها | `corpuslab` | المراجعة والمراجعة المالية › المعايير والمدونة › مختبر الشركات العالمية | MANAGEMENT | admin |
| KOSIF Audit Studio | `auditdesk` | المراجعة والمراجعة المالية › مركز المراجعة › الاستوديو المتقدم | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditdocs` | المراجعة والمراجعة المالية › مركز المراجعة › المستندات والأدلة | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditissues` | المراجعة والمراجعة المالية › مركز المراجعة › الملاحظات والقضايا | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditcouncil` | المراجعة والمراجعة المالية › مركز المراجعة › مجلس المراجعين | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditfin` | المراجعة والمراجعة المالية › مركز المراجعة › القوائم والقيود | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditreport` | المراجعة والمراجعة المالية › مركز المراجعة › التقارير والإصدار | ADVANCED | admin, accountant |
| KOSIF Audit Studio (classic) | `auditanalytics` | المراجعة والمراجعة المالية › مركز المراجعة › التحليل والاختبارات | ADVANCED | admin, accountant |
| KOSIF Audit Studio (lab) | `auditlab` | المراجعة والمراجعة المالية › المعايير والمدونة › مختبر المعايير والأبحاث | ADVANCED | admin, accountant |
| الإعدادات | `settings` | العام › الإعدادات والأجهزة › الإعدادات والمظهر | ADMIN | admin, accountant, warehouse, sales, viewer |
| جديد — تعليمات التثبيت (INSTALL-iPHONE-ar.txt) + نسخة v27 للابتوب وv28–v30 للآيفون | `devices` | العام › الإعدادات والأجهزة › الأجهزة والمزامنة | UTILITIES | admin, accountant, warehouse, sales, viewer |
| Grand Fusion system.companies | `companies` | العام › الشركات والفترات | ADMIN | admin, accountant |
| الحوكمة | `governance` | العام › الحوكمة والصلاحيات › الحوكمة والجاهزية | ADMIN | admin |
| الصحة والاستثناءات | `health` | العام › الحوكمة والصلاحيات › الصحة والتشخيص | ADMIN | admin |
| Capabilities v2 | `capabilitiesv2` | العام › الحوكمة والصلاحيات › الصلاحيات ومساحات العمل | ADMIN | admin |

## Menu: domains and hubs

One menu entry per hub; the pages of a hub open as tabs on top of each other (each keeps its own id, permission and deep link).

| Domain | Menu entry | Pages |
|---|---|---|
| العام | مركز القيادة | `dash` مركز القيادة |
| العام | المهام والإشعارات | `tasks` المهام · `notifications` مركز الإشعارات |
| العام | المخاطر والملاحظات | `risks` المخاطر والملاحظات |
| العام | الإعدادات والأجهزة | `settings` الإعدادات والمظهر · `devices` الأجهزة والمزامنة |
| العام | الشركات والفترات | `companies` الشركات والفترات |
| العام | الحوكمة والصلاحيات | `governance` الحوكمة والجاهزية · `health` الصحة والتشخيص · `capabilitiesv2` الصلاحيات ومساحات العمل |
| المراجعة والمراجعة المالية | مركز المراجعة | `tbreview` ملف المراجعة · `auditdesk` الاستوديو المتقدم · `auditdocs` المستندات والأدلة · `auditissues` الملاحظات والقضايا · `auditcouncil` مجلس المراجعين · `auditfin` القوائم والقيود · `auditreport` التقارير والإصدار · `auditanalytics` التحليل والاختبارات |
| المراجعة والمراجعة المالية | المعايير والمدونة | `codex` المدونة المحاسبية والمعايير · `auditbench` المرجع العالمي للمراجعة · `corpuslab` مختبر الشركات العالمية · `auditlab` مختبر المعايير والأبحاث |
| الأدوات المساعدة للمحاسب | مركز الأدوات المساعدة | `helperdesk` مركز الأدوات المساعدة |
| الأدوات المساعدة للمحاسب | المخاطر والحساسية | `risklab` المخاطر وجسر الربحية · `sensitivity` مختبر الحساسية |
| الأدوات المساعدة للمحاسب | خريطة العملاء والمبيعات | `salesmap` خريطة العملاء وتحليل المبيعات |
| الأدوات المساعدة للمحاسب | الطلبات والفوترة | `commerce` الطلبات والتحصيل · `zatca` نقطة البيع والفاتورة الضريبية |
| الأدوات المساعدة للمحاسب | العملاء والائتمان | `customers` العملاء · `followup` متابعة العملاء · `b2bcredit` ائتمان المطاعم |
| الأدوات المساعدة للمحاسب | العروض والكتالوج | `offers` العروض والكتالوج |
| الأدوات المساعدة للمحاسب | المناسبات والتشغيل | `operations` المناسبات والتشغيل |
| الأدوات المساعدة للمحاسب | ذكاء المبيعات والطلب | `salesintel` ذكاء المبيعات · `intelligence` ذكاء العملاء والطلب · `economics` اقتصاديات الطلب |
| الأدوات المساعدة للمحاسب | المخزون والتتبع | `inventory` المخزون · `traceability` التتبع والتبريد |
| الأدوات المساعدة للمحاسب | الموردون والمشتريات | `suppliers` الموردون والمشتريات · `purchasing` أوامر الشراء والاستلام |
| الأدوات المساعدة للمحاسب | الإنتاج والخلطات | `blending` خلطات اللحوم · `culinary` دليل الشيف |
| الأدوات المساعدة للمحاسب | مختبر الذبيحة | `carcass` اقتصاديات الذبيحة · `yieldlab` مختبر الجزارة · `nrv` تفكيك الذبيحة NRV |
| الأدوات المساعدة للمحاسب | الدفاتر المحاسبية | `ledger` الدفاتر المحاسبية |
| الأدوات المساعدة للمحاسب | محاكي القيود | `jesim` محاكي القيود |
| الأدوات المساعدة للمحاسب | التدفق النقدي | `cash` التدفق النقدي |
| الأدوات المساعدة للمحاسب | المقارنة بالشركات العالمية | `benchmarks` المقارنة بالشركات العالمية |
| الأدوات المساعدة للمحاسب | الذمم والتحصيل | `receivables` الذمم والتحصيل |
| الأدوات المساعدة للمحاسب | السلف والدفعات المقدمة | `advances` السلف والدفعات المقدمة |
| الأدوات المساعدة للمحاسب | الهندسة المالية | `finance` الهندسة المالية |
| الأدوات المساعدة للمحاسب | شجرة المنتجات | `ptree` شجرة المنتجات |
| الأدوات المساعدة للمحاسب | المنتج والتكلفة | `productflow` استوديو المنتج · `catalog` الأصناف والأسعار · `costs` التكاليف والمصروفات · `sim` التسعير السريع · `kernel` نواة التسعير الصارمة · `memo` اعتماد الأسعار · `builder` البوكسات · `analyzer` تحليل البوكس · `compare` المقارنة التحليلية |
| الأدوات المساعدة للمحاسب | الملصقات والباركود | `labels` ملصقات الموازين · `scanner` ماسح الباركود |
| الأدوات المساعدة للمحاسب | المطابقة | `smartmatch` مطابقة المبيعات · `excelrecon` مطابقة الإكسل |
| الأدوات المساعدة للمحاسب | التقارير التنفيذية | `execreports` التقارير التنفيذية |
| الأدوات المساعدة للمحاسب | الطباعة والتصدير | `reports` مركز الطباعة · `exports` مركز التصدير |
| الأدوات المساعدة للمحاسب | الأرشيف والتغييرات | `archive` الأرشيف والتغييرات |
| Jev والقرار | مركز القرار | `decision` مركز القرار |
| Jev والقرار | Jev ومجلس القرار | `jev` Jev للقرار · `council` مجلس القرار |

73 screens in 36 menu entries.

## By tier

- **CORE** — العمل اليومي الأساسي (22): `dash`, `notifications`, `salesmap`, `commerce`, `zatca`, `customers`, `followup`, `offers`, `inventory`, `suppliers`, `purchasing`, `ledger`, `jesim`, `cash`, `receivables`, `advances`, `ptree`, `productflow`, `catalog`, `sim`, `builder`, `tbreview`
- **MANAGEMENT** — الإدارة والمتابعة (12): `tasks`, `risks`, `b2bcredit`, `operations`, `traceability`, `benchmarks`, `memo`, `execreports`, `archive`, `codex`, `auditbench`, `corpuslab`
- **INTELLIGENCE** — التحليل والذكاء (7): `decision`, `jev`, `council`, `salesintel`, `intelligence`, `economics`, `compare`
- **ADVANCED** — الهندسة المتقدمة (17): `risklab`, `sensitivity`, `carcass`, `yieldlab`, `nrv`, `finance`, `costs`, `kernel`, `analyzer`, `auditdesk`, `auditdocs`, `auditissues`, `auditcouncil`, `auditfin`, `auditreport`, `auditanalytics`, `auditlab`
- **UTILITIES** — أدوات مساعدة (10): `helperdesk`, `blending`, `culinary`, `labels`, `scanner`, `smartmatch`, `excelrecon`, `reports`, `exports`, `devices`
- **ADMIN** — النظام والإدارة (5): `settings`, `companies`, `governance`, `health`, `capabilitiesv2`

Coverage gate: 73 screens in 4 domains; see CAPABILITY_COVERAGE_ALL_VERSIONS.md for every historical version.
