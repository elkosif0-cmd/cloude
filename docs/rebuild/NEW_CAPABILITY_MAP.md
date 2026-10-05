# NEW CAPABILITY MAP

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

## Old → New matrix

| Old name / location | New ID | New location | Tier | Roles |
|---|---|---|---|---|
| لوحة العمل + بطل v23 + نبض v21 + بطل shell.js | `dash` | العام › مركز القيادة | CORE | admin, accountant, warehouse, sales, viewer |
| مهام منصة V40 + مهام CRM V8.2 | `tasks` | العام › المهام والإشعارات › المهام | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة الإشعارات في تصميم KOSIF | `notifications` | العام › المهام والإشعارات › مركز الإشعارات | CORE | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة المخاطر والملاحظات في تصميم KOSIF (خريطة المخاطر، توزيع الفئات، أحدث الملاحظات) | `risks` | العام › المخاطر والملاحظات | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| تنظيم كل الأدوات غير المرتبطة مباشرة بملف المراجعة في مساحة مستقلة | `helperdesk` | العام › خريطة الشركة | UTILITIES | admin, accountant, warehouse, sales, viewer |
| مركز القرار | `decision` | Jev والقرار › مركز القرار | INTELLIGENCE | admin, accountant, sales |
| Jev للقرار | `jev` | Jev والقرار › Jev ومجلس القرار › Jev للقرار | INTELLIGENCE | admin, accountant, sales |
| Grand Fusion intelligence.council | `council` | Jev والقرار › Jev ومجلس القرار › مجلس القرار | INTELLIGENCE | admin, accountant, sales |
| المخاطر | `risklab` | المالية والدفاتر › المخاطر والحساسية › المخاطر وجسر الربحية | ADVANCED | admin |
| مختبر الحساسية | `sensitivity` | المالية والدفاتر › المخاطر والحساسية › مختبر الحساسية | ADVANCED | admin, accountant |
| جديد — خريطة جغرافية للعملاء وتحليل المبيعات وتقرير الصنف | `salesmap` | المبيعات والعملاء › خريطة العملاء وتحليل المبيعات | CORE | admin |
| الطلبات والتحصيل | `commerce` | المبيعات والعملاء › الطلبات والفوترة › الطلبات والتحصيل | CORE | admin, accountant, sales |
| الفاتورة الضريبية | `zatca` | المبيعات والعملاء › الطلبات والفوترة › نقطة البيع والفاتورة الضريبية | CORE | admin, accountant, sales |
| السوق والعملاء | `customers` | المبيعات والعملاء › العملاء والائتمان › العملاء | CORE | admin, accountant, sales |
| تعميم «استوديو المنتج» (البند E من برنامج الشركة أولاً) | `customerflow` | المبيعات والعملاء › العملاء والائتمان › استوديو العميل | CORE | admin, accountant, sales |
| متابعة العملاء الاحترافية V8.2 (وحدة v25 crm) | `followup` | المبيعات والعملاء › العملاء والائتمان › متابعة العملاء | CORE | admin, accountant, sales |
| ائتمان المطاعم | `b2bcredit` | المبيعات والعملاء › العملاء والائتمان › ائتمان المطاعم | MANAGEMENT | admin, accountant, sales |
| العروض والكتالوج | `offers` | المبيعات والعملاء › العروض والكتالوج | CORE | admin, accountant, sales, viewer |
| المناسبات والتشغيل | `operations` | المبيعات والعملاء › المناسبات والتشغيل | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| ذكاء المبيعات | `salesintel` | المبيعات والعملاء › ذكاء المبيعات والطلب › ذكاء المبيعات | INTELLIGENCE | admin |
| ذكاء العملاء | `intelligence` | المبيعات والعملاء › ذكاء المبيعات والطلب › ذكاء العملاء والطلب | INTELLIGENCE | admin |
| اقتصاديات الطلب | `economics` | المبيعات والعملاء › ذكاء المبيعات والطلب › اقتصاديات الطلب | INTELLIGENCE | admin, accountant |
| المخزون | `inventory` | المخزون والموردون › المخزون والتتبع › المخزون | CORE | admin, accountant, warehouse, viewer |
| التتبع والتبريد | `traceability` | المخزون والموردون › المخزون والتتبع › التتبع والتبريد | MANAGEMENT | admin, warehouse |
| الموردون | `suppliers` | المخزون والموردون › الموردون والمشتريات › الموردون والمشتريات | CORE | admin, accountant, warehouse |
| Grand Fusion procurement + أسعار الموردين V40 | `purchasing` | المخزون والموردون › الموردون والمشتريات › أوامر الشراء والاستلام | CORE | admin, accountant, warehouse |
| خلطات اللحوم | `blending` | المنتج والتكلفة › الإنتاج والخلطات › خلطات اللحوم | UTILITIES | admin, warehouse |
| دليل الشيف | `culinary` | المنتج والتكلفة › الإنتاج والخلطات › دليل الشيف | UTILITIES | admin, warehouse |
| اقتصاديات الذبيحة | `carcass` | المنتج والتكلفة › مختبر الذبيحة › اقتصاديات الذبيحة | ADVANCED | admin, accountant, warehouse |
| مختبر الجزارة | `yieldlab` | المنتج والتكلفة › مختبر الذبيحة › مختبر الجزارة | ADVANCED | admin, warehouse |
| تفكيك الذبيحة | `nrv` | المنتج والتكلفة › مختبر الذبيحة › تفكيك الذبيحة NRV | ADVANCED | admin |
| Grand Fusion finance (accounts, journals, GL, TB, reconciliation) | `ledger` | المالية والدفاتر › الدفاتر المحاسبية | CORE | admin, accountant |
| جديد — فهم القيود ومحاكاتها بذاكرة داخلية | `jesim` | المالية والدفاتر › محاكي القيود | CORE | admin |
| التدفق النقدي | `cash` | المالية والدفاتر › التدفق النقدي | CORE | admin, accountant, sales, viewer |
| جديد — مقارنة مرجعية من حزمة الأبحاث للمحاسب | `benchmarks` | المالية والدفاتر › المقارنة بالشركات العالمية | MANAGEMENT | admin |
| الذمم | `receivables` | المالية والدفاتر › الذمم والتحصيل | CORE | admin, accountant, sales |
| جديد | `advances` | المالية والدفاتر › السلف والدفعات المقدمة | CORE | admin |
| الهندسة المالية | `finance` | المالية والدفاتر › الهندسة المالية | ADVANCED | admin, accountant |
| جديد — شجرة المنتجات وربطها بالموردين والعملاء بالأسهم | `ptree` | المنتج والتكلفة › شجرة المنتجات | CORE | admin |
| واجهة موحدة بدل تشتت الأصناف والتكاليف والتسعير والبوكسات | `productflow` | المنتج والتكلفة › المنتج والتكلفة › استوديو المنتج | CORE | admin, accountant, warehouse, sales, viewer |
| سجل الأسعار | `catalog` | المنتج والتكلفة › المنتج والتكلفة › الأصناف والأسعار | CORE | admin, accountant, warehouse, sales, viewer |
| مركز التكاليف | `costs` | المنتج والتكلفة › المنتج والتكلفة › التكاليف والمصروفات | ADVANCED | admin |
| محاكي التسعير | `sim` | المنتج والتكلفة › المنتج والتكلفة › التسعير السريع | CORE | admin |
| نواة التسعير | `kernel` | المنتج والتكلفة › المنتج والتكلفة › نواة التسعير الصارمة | ADVANCED | admin, accountant |
| مذكرة الاعتماد | `memo` | المنتج والتكلفة › المنتج والتكلفة › اعتماد الأسعار | MANAGEMENT | admin |
| مركب البوكسات | `builder` | المنتج والتكلفة › المنتج والتكلفة › البوكسات | CORE | admin |
| تحليل مكونات البوكس | `analyzer` | المنتج والتكلفة › المنتج والتكلفة › تحليل البوكس | ADVANCED | admin |
| استوديو المقارنة | `compare` | المنتج والتكلفة › المنتج والتكلفة › المقارنة التحليلية | INTELLIGENCE | admin |
| ملصقات الموازين | `labels` | المنتج والتكلفة › الملصقات والباركود › ملصقات الموازين | UTILITIES | admin, warehouse, sales |
| ماسح الباركود | `scanner` | المنتج والتكلفة › الملصقات والباركود › ماسح الباركود | UTILITIES | admin, warehouse, sales |
| مطابقة المبيعات | `smartmatch` | المالية والدفاتر › المطابقة › مطابقة المبيعات | UTILITIES | admin, accountant, sales |
| مطابقة الإكسل | `excelrecon` | المالية والدفاتر › المطابقة › مطابقة الإكسل | UTILITIES | admin, accountant |
| التقارير التنفيذية | `execreports` | التقارير والبيانات › التقارير التنفيذية | MANAGEMENT | admin, accountant, sales, viewer |
| مركز التقارير | `reports` | التقارير والبيانات › الطباعة والتصدير › مركز الطباعة | UTILITIES | admin, accountant, sales, viewer |
| Grand Fusion reports.exports | `exports` | التقارير والبيانات › الطباعة والتصدير › مركز التصدير | UTILITIES | admin, accountant, sales |
| الأرشيف | `archive` | التقارير والبيانات › الأرشيف والأنظمة الأصلية › الأرشيف والتغييرات | MANAGEMENT | admin, accountant |
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
| التطبيقات المدمجة في إصدار v25 (CRM V8.2، V31، V33، V40) التي حُذفت — مستعادة بعد تنظيف بياناتها | `legacyapps` | التقارير والبيانات › الأرشيف والأنظمة الأصلية › الأنظمة الأصلية | UTILITIES | admin |

## Menu: domains and hubs

One menu entry per hub; the pages of a hub open as tabs on top of each other (each keeps its own id, permission and deep link).

| Domain | Menu entry | Pages |
|---|---|---|
| العام | مركز القيادة | `dash` مركز القيادة |
| العام | المهام والإشعارات | `tasks` المهام · `notifications` مركز الإشعارات |
| العام | المخاطر والملاحظات | `risks` المخاطر والملاحظات |
| العام | خريطة الشركة | `helperdesk` خريطة الشركة |
| العام | الإعدادات والأجهزة | `settings` الإعدادات والمظهر · `devices` الأجهزة والمزامنة |
| العام | الشركات والفترات | `companies` الشركات والفترات |
| العام | الحوكمة والصلاحيات | `governance` الحوكمة والجاهزية · `health` الصحة والتشخيص · `capabilitiesv2` الصلاحيات ومساحات العمل |
| المراجعة والمراجعة المالية | مركز المراجعة | `tbreview` ملف المراجعة · `auditdesk` الاستوديو المتقدم · `auditdocs` المستندات والأدلة · `auditissues` الملاحظات والقضايا · `auditcouncil` مجلس المراجعين · `auditfin` القوائم والقيود · `auditreport` التقارير والإصدار · `auditanalytics` التحليل والاختبارات |
| المراجعة والمراجعة المالية | المعايير والمدونة | `codex` المدونة المحاسبية والمعايير · `auditbench` المرجع العالمي للمراجعة · `corpuslab` مختبر الشركات العالمية · `auditlab` مختبر المعايير والأبحاث |
| المنتج والتكلفة | الإنتاج والخلطات | `blending` خلطات اللحوم · `culinary` دليل الشيف |
| المنتج والتكلفة | مختبر الذبيحة | `carcass` اقتصاديات الذبيحة · `yieldlab` مختبر الجزارة · `nrv` تفكيك الذبيحة NRV |
| المنتج والتكلفة | شجرة المنتجات | `ptree` شجرة المنتجات |
| المنتج والتكلفة | المنتج والتكلفة | `productflow` استوديو المنتج · `catalog` الأصناف والأسعار · `costs` التكاليف والمصروفات · `sim` التسعير السريع · `kernel` نواة التسعير الصارمة · `memo` اعتماد الأسعار · `builder` البوكسات · `analyzer` تحليل البوكس · `compare` المقارنة التحليلية |
| المنتج والتكلفة | الملصقات والباركود | `labels` ملصقات الموازين · `scanner` ماسح الباركود |
| المبيعات والعملاء | خريطة العملاء والمبيعات | `salesmap` خريطة العملاء وتحليل المبيعات |
| المبيعات والعملاء | الطلبات والفوترة | `commerce` الطلبات والتحصيل · `zatca` نقطة البيع والفاتورة الضريبية |
| المبيعات والعملاء | العملاء والائتمان | `customers` العملاء · `customerflow` استوديو العميل · `followup` متابعة العملاء · `b2bcredit` ائتمان المطاعم |
| المبيعات والعملاء | العروض والكتالوج | `offers` العروض والكتالوج |
| المبيعات والعملاء | المناسبات والتشغيل | `operations` المناسبات والتشغيل |
| المبيعات والعملاء | ذكاء المبيعات والطلب | `salesintel` ذكاء المبيعات · `intelligence` ذكاء العملاء والطلب · `economics` اقتصاديات الطلب |
| المخزون والموردون | المخزون والتتبع | `inventory` المخزون · `traceability` التتبع والتبريد |
| المخزون والموردون | الموردون والمشتريات | `suppliers` الموردون والمشتريات · `purchasing` أوامر الشراء والاستلام |
| المالية والدفاتر | المخاطر والحساسية | `risklab` المخاطر وجسر الربحية · `sensitivity` مختبر الحساسية |
| المالية والدفاتر | الدفاتر المحاسبية | `ledger` الدفاتر المحاسبية |
| المالية والدفاتر | محاكي القيود | `jesim` محاكي القيود |
| المالية والدفاتر | التدفق النقدي | `cash` التدفق النقدي |
| المالية والدفاتر | المقارنة بالشركات العالمية | `benchmarks` المقارنة بالشركات العالمية |
| المالية والدفاتر | الذمم والتحصيل | `receivables` الذمم والتحصيل |
| المالية والدفاتر | السلف والدفعات المقدمة | `advances` السلف والدفعات المقدمة |
| المالية والدفاتر | الهندسة المالية | `finance` الهندسة المالية |
| المالية والدفاتر | المطابقة | `smartmatch` مطابقة المبيعات · `excelrecon` مطابقة الإكسل |
| التقارير والبيانات | التقارير التنفيذية | `execreports` التقارير التنفيذية |
| التقارير والبيانات | الطباعة والتصدير | `reports` مركز الطباعة · `exports` مركز التصدير |
| التقارير والبيانات | الأرشيف والأنظمة الأصلية | `archive` الأرشيف والتغييرات · `legacyapps` الأنظمة الأصلية |
| Jev والقرار | مركز القرار | `decision` مركز القرار |
| Jev والقرار | Jev ومجلس القرار | `jev` Jev للقرار · `council` مجلس القرار |

75 screens in 36 menu entries.

## By tier

- **CORE** — العمل اليومي الأساسي (23): `dash`, `notifications`, `salesmap`, `commerce`, `zatca`, `customers`, `customerflow`, `followup`, `offers`, `inventory`, `suppliers`, `purchasing`, `ledger`, `jesim`, `cash`, `receivables`, `advances`, `ptree`, `productflow`, `catalog`, `sim`, `builder`, `tbreview`
- **MANAGEMENT** — الإدارة والمتابعة (12): `tasks`, `risks`, `b2bcredit`, `operations`, `traceability`, `benchmarks`, `memo`, `execreports`, `archive`, `codex`, `auditbench`, `corpuslab`
- **INTELLIGENCE** — التحليل والذكاء (7): `decision`, `jev`, `council`, `salesintel`, `intelligence`, `economics`, `compare`
- **ADVANCED** — الهندسة المتقدمة (17): `risklab`, `sensitivity`, `carcass`, `yieldlab`, `nrv`, `finance`, `costs`, `kernel`, `analyzer`, `auditdesk`, `auditdocs`, `auditissues`, `auditcouncil`, `auditfin`, `auditreport`, `auditanalytics`, `auditlab`
- **UTILITIES** — أدوات مساعدة (11): `helperdesk`, `blending`, `culinary`, `labels`, `scanner`, `smartmatch`, `excelrecon`, `reports`, `exports`, `devices`, `legacyapps`
- **ADMIN** — النظام والإدارة (5): `settings`, `companies`, `governance`, `health`, `capabilitiesv2`

Coverage gate: 75 screens in 8 domains; see CAPABILITY_COVERAGE_ALL_VERSIONS.md for every historical version.
