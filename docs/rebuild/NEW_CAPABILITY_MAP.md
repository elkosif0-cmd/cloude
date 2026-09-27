# NEW CAPABILITY MAP

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

## Old → New matrix

| Old name / location | New ID | New location | Tier | Roles |
|---|---|---|---|---|
| لوحة العمل + بطل v23 + نبض v21 + بطل shell.js | `dash` | مركز القيادة العام › مركز القيادة | CORE | admin, accountant, warehouse, sales, viewer |
| مهام منصة V40 + مهام CRM V8.2 | `tasks` | مركز القيادة العام › المهام والإشعارات › المهام | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة الإشعارات في تصميم KOSIF | `notifications` | مركز القيادة العام › المهام والإشعارات › مركز الإشعارات | CORE | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة المخاطر والملاحظات في تصميم KOSIF (خريطة المخاطر، توزيع الفئات، أحدث الملاحظات) | `risks` | مركز القيادة العام › المخاطر والملاحظات | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| مركز القرار | `decision` | جيف والقرار › مركز القرار | INTELLIGENCE | admin, accountant, sales |
| Jev للقرار | `jev` | جيف والقرار › Jev ومجلس القرار › Jev للقرار | INTELLIGENCE | admin, accountant, sales |
| Grand Fusion intelligence.council | `council` | جيف والقرار › Jev ومجلس القرار › مجلس القرار | INTELLIGENCE | admin, accountant, sales |
| المخاطر | `risklab` | جيف والقرار › المخاطر والحساسية › المخاطر وجسر الربحية | ADVANCED | admin |
| مختبر الحساسية | `sensitivity` | جيف والقرار › المخاطر والحساسية › مختبر الحساسية | ADVANCED | admin, accountant |
| الطلبات والتحصيل | `commerce` | المبيعات والعملاء › الطلبات والفوترة › الطلبات والتحصيل | CORE | admin, accountant, sales |
| الفاتورة الضريبية | `zatca` | المبيعات والعملاء › الطلبات والفوترة › نقطة البيع والفاتورة الضريبية | CORE | admin, accountant, sales |
| السوق والعملاء | `customers` | المبيعات والعملاء › العملاء والائتمان › العملاء | CORE | admin, accountant, sales |
| متابعة العملاء الاحترافية V8.2 (وحدة v25 crm) | `followup` | المبيعات والعملاء › العملاء والائتمان › متابعة العملاء | CORE | admin, accountant, sales |
| ائتمان المطاعم | `b2bcredit` | المبيعات والعملاء › العملاء والائتمان › ائتمان المطاعم | MANAGEMENT | admin, accountant, sales |
| العروض والكتالوج | `offers` | المبيعات والعملاء › العروض والكتالوج | CORE | admin, accountant, sales, viewer |
| المناسبات والتشغيل | `operations` | المبيعات والعملاء › المناسبات والتشغيل | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| ذكاء المبيعات | `salesintel` | المبيعات والعملاء › ذكاء المبيعات والطلب › ذكاء المبيعات | INTELLIGENCE | admin |
| خريطة جغرافية للعملاء: السعودية ثم منطقة مكة وجدة ثم أحياء جدة بالألوان حسب عدد الطلبات | `geomap` | المبيعات والعملاء › خريطة العملاء الجغرافية | INTELLIGENCE | admin |
| ذكاء العملاء | `intelligence` | المبيعات والعملاء › ذكاء المبيعات والطلب › ذكاء العملاء والطلب | INTELLIGENCE | admin |
| اقتصاديات الطلب | `economics` | المبيعات والعملاء › ذكاء المبيعات والطلب › اقتصاديات الطلب | INTELLIGENCE | admin, accountant |
| المخزون | `inventory` | المخزون والموردون والإنتاج › المخزون والتتبع › المخزون | CORE | admin, accountant, warehouse, viewer |
| التتبع والتبريد | `traceability` | المخزون والموردون والإنتاج › المخزون والتتبع › التتبع والتبريد | MANAGEMENT | admin, warehouse |
| الموردون | `suppliers` | المخزون والموردون والإنتاج › الموردون والمشتريات › الموردون والمشتريات | CORE | admin, accountant, warehouse |
| Grand Fusion procurement + أسعار الموردين V40 | `purchasing` | المخزون والموردون والإنتاج › الموردون والمشتريات › أوامر الشراء والاستلام | CORE | admin, accountant, warehouse |
| خلطات اللحوم | `blending` | المخزون والموردون والإنتاج › الإنتاج والخلطات › خلطات اللحوم | UTILITIES | admin, warehouse |
| دليل الشيف | `culinary` | المخزون والموردون والإنتاج › الإنتاج والخلطات › دليل الشيف | UTILITIES | admin, warehouse |
| اقتصاديات الذبيحة | `carcass` | المخزون والموردون والإنتاج › مختبر الذبيحة › اقتصاديات الذبيحة | ADVANCED | admin, accountant, warehouse |
| مختبر الجزارة | `yieldlab` | المخزون والموردون والإنتاج › مختبر الذبيحة › مختبر الجزارة | ADVANCED | admin, warehouse |
| تفكيك الذبيحة | `nrv` | المخزون والموردون والإنتاج › مختبر الذبيحة › تفكيك الذبيحة NRV | ADVANCED | admin |
| Grand Fusion finance (accounts, journals, GL, TB, reconciliation) | `ledger` | المالية والمحاسبة › الدفاتر المحاسبية | CORE | admin, accountant |
| التدفق النقدي | `cash` | المالية والمحاسبة › التدفق النقدي | CORE | admin, accountant, sales, viewer |
| الذمم | `receivables` | المالية والمحاسبة › الذمم والتحصيل | CORE | admin, accountant, sales |
| جديد | `advances` | المالية والمحاسبة › السلف والدفعات المقدمة | CORE | admin |
| الهندسة المالية | `finance` | المالية والمحاسبة › الهندسة المالية | ADVANCED | admin, accountant |
| واجهة موحدة بدل تشتت الأصناف والتكاليف والتسعير والبوكسات | `productflow` | المنتج والتكاليف والتسعير › المنتج والتكلفة › استوديو المنتج | CORE | admin, accountant, warehouse, sales, viewer |
| فكرة الأسهم: إضافة عنصر ثم توصيل السهم واختيار نوع العلاقة؛ شجرة المنتج وتحويل المواد الخام إلى أسهم الموردين | `linkmap` | المنتج والتكاليف والتسعير › خريطة الربط (الأسهم) | CORE | admin |
| سجل الأسعار | `catalog` | المنتج والتكاليف والتسعير › المنتج والتكلفة › الأصناف والأسعار | CORE | admin, accountant, warehouse, sales, viewer |
| مركز التكاليف | `costs` | المنتج والتكاليف والتسعير › المنتج والتكلفة › التكاليف والمصروفات | ADVANCED | admin |
| محاكي التسعير | `sim` | المنتج والتكاليف والتسعير › المنتج والتكلفة › التسعير السريع | CORE | admin |
| نواة التسعير | `kernel` | المنتج والتكاليف والتسعير › المنتج والتكلفة › نواة التسعير الصارمة | ADVANCED | admin, accountant |
| مذكرة الاعتماد | `memo` | المنتج والتكاليف والتسعير › المنتج والتكلفة › اعتماد الأسعار | MANAGEMENT | admin |
| مركب البوكسات | `builder` | المنتج والتكاليف والتسعير › المنتج والتكلفة › البوكسات | CORE | admin |
| تحليل مكونات البوكس | `analyzer` | المنتج والتكاليف والتسعير › المنتج والتكلفة › تحليل البوكس | ADVANCED | admin |
| استوديو المقارنة | `compare` | المنتج والتكاليف والتسعير › المنتج والتكلفة › المقارنة التحليلية | INTELLIGENCE | admin |
| ملصقات الموازين | `labels` | المنتج والتكاليف والتسعير › الملصقات والباركود › ملصقات الموازين | UTILITIES | admin, warehouse, sales |
| ماسح الباركود | `scanner` | المنتج والتكاليف والتسعير › الملصقات والباركود › ماسح الباركود | UTILITIES | admin, warehouse, sales |
| مطابقة المبيعات | `smartmatch` | التقارير والبيانات › المطابقة › مطابقة المبيعات | UTILITIES | admin, accountant, sales |
| مطابقة الإكسل | `excelrecon` | التقارير والبيانات › المطابقة › مطابقة الإكسل | UTILITIES | admin, accountant |
| التقارير التنفيذية | `execreports` | التقارير والبيانات › التقارير التنفيذية | MANAGEMENT | admin, accountant, sales, viewer |
| تقارير مختلفة عن أي صنف في الأدوات المساعدة — تطوير للأدوات الحالية | `itemreport` | التقارير والبيانات › تقرير الصنف | MANAGEMENT | admin |
| مركز التقارير | `reports` | التقارير والبيانات › الطباعة والتصدير › مركز الطباعة | UTILITIES | admin, accountant, sales, viewer |
| Grand Fusion reports.exports | `exports` | التقارير والبيانات › الطباعة والتصدير › مركز التصدير | UTILITIES | admin, accountant, sales |
| الأرشيف | `archive` | التقارير والبيانات › الأرشيف والتغييرات | MANAGEMENT | admin, accountant |
| جديد — دمج smart-trial-balance-review (مجلس Gemini والجولات) و kosif-audit-pro (القوائم والتحليل) و Moon (المخاطر والرأي) و SEE (التصنيف والجاهزية) + استوديو KOSIF للمراجعة (تبويب «الاستوديو المتقدم» داخل الملف) | `tbreview` | ملفات المراجعة › مركز المراجعة › ملف المراجعة | CORE | admin, accountant |
| جديد — يحل محل قاعدة معايير smart-trial-balance-review ويكمّل مختبر المعايير | `codex` | المعايير والمرجع العالمي › المعايير والمدونة › المدونة المحاسبية والمعايير | MANAGEMENT | admin, accountant, viewer |
| جديد — من global_financial_and_audit_research_bundle_extended_verified.pdf (12,506 صفحة) | `auditbench` | المعايير والمرجع العالمي › المعايير والمدونة › المرجع العالمي للمراجعة | MANAGEMENT | admin |
| KOSIF Audit Studio | `auditdesk` | ملفات المراجعة › مركز المراجعة › الاستوديو المتقدم | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditdocs` | ملفات المراجعة › مركز المراجعة › المستندات والأدلة | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditissues` | ملفات المراجعة › مركز المراجعة › الملاحظات والقضايا | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditcouncil` | ملفات المراجعة › مركز المراجعة › مجلس المراجعين | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditfin` | ملفات المراجعة › مركز المراجعة › القوائم والقيود | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditreport` | ملفات المراجعة › مركز المراجعة › التقارير والإصدار | ADVANCED | admin, accountant |
| KOSIF Audit Studio (classic) | `auditanalytics` | ملفات المراجعة › مركز المراجعة › التحليل والاختبارات | ADVANCED | admin, accountant |
| KOSIF Audit Studio (lab) | `auditlab` | المعايير والمرجع العالمي › المعايير والمدونة › مختبر المعايير والأبحاث | ADVANCED | admin, accountant |
| الإعدادات | `settings` | النظام والتكاملات › الإعدادات والأجهزة › الإعدادات والمظهر | ADMIN | admin, accountant, warehouse, sales, viewer |
| جديد — تعليمات التثبيت (INSTALL-iPHONE-ar.txt) + نسخة v27 للابتوب وv28–v30 للآيفون | `devices` | النظام والتكاملات › الإعدادات والأجهزة › الأجهزة والمزامنة | UTILITIES | admin, accountant, warehouse, sales, viewer |
| Grand Fusion system.companies | `companies` | النظام والتكاملات › الشركات والفترات | ADMIN | admin, accountant |
| الحوكمة | `governance` | النظام والتكاملات › الحوكمة والصلاحيات › الحوكمة والجاهزية | ADMIN | admin |
| الصحة والاستثناءات | `health` | النظام والتكاملات › الحوكمة والصلاحيات › الصحة والتشخيص | ADMIN | admin |
| Capabilities v2 | `capabilitiesv2` | النظام والتكاملات › الحوكمة والصلاحيات › الصلاحيات ومساحات العمل | ADMIN | admin |
| تنظيم كل الأدوات غير المرتبطة مباشرة بملف المراجعة في مساحة مستقلة | `helperdesk` | مدخل الأدوات والشركة › الشركة وشجرة الأدوات | UTILITIES | admin, accountant, warehouse, sales, viewer |
| جديد — تشغيل المراجعة على شركات global_financial_and_audit_research_bundle_extended_verified.pdf ومقارنتها بتقارير مراجعيها | `corpuslab` | ملفات المراجعة › مختبر الشركات العالمية | MANAGEMENT | admin |

## Menu: domains and hubs

One menu entry per hub; the pages of a hub open as tabs on top of each other (each keeps its own id, permission and deep link).

| Domain | Menu entry | Pages |
|---|---|---|
| مركز القيادة العام | مركز القيادة | `dash` مركز القيادة |
| مركز القيادة العام | المهام والإشعارات | `tasks` المهام · `notifications` مركز الإشعارات |
| مركز القيادة العام | المخاطر والملاحظات | `risks` المخاطر والملاحظات |
| ملفات المراجعة | مركز المراجعة | `tbreview` ملف المراجعة · `auditdesk` الاستوديو المتقدم · `auditdocs` المستندات والأدلة · `auditissues` الملاحظات والقضايا · `auditcouncil` مجلس المراجعين · `auditfin` القوائم والقيود · `auditreport` التقارير والإصدار · `auditanalytics` التحليل والاختبارات |
| ملفات المراجعة | الشركات العالمية (عملاء تجريبيون) | `corpuslab` مختبر الشركات العالمية |
| المعايير والمرجع العالمي | المعايير والمدونة | `codex` المدونة المحاسبية والمعايير · `auditbench` المرجع العالمي للمراجعة · `auditlab` مختبر المعايير والأبحاث |
| مدخل الأدوات والشركة | الشركة وشجرة الأدوات | `helperdesk` الشركة وشجرة الأدوات |
| المنتج والتكاليف والتسعير | المنتج والتكلفة | `productflow` استوديو المنتج · `catalog` الأصناف والأسعار · `costs` التكاليف والمصروفات · `sim` التسعير السريع · `kernel` نواة التسعير الصارمة · `memo` اعتماد الأسعار · `builder` البوكسات · `analyzer` تحليل البوكس · `compare` المقارنة التحليلية |
| المنتج والتكاليف والتسعير | خريطة الربط (الأسهم) | `linkmap` خريطة الربط (الأسهم) |
| المنتج والتكاليف والتسعير | الملصقات والباركود | `labels` ملصقات الموازين · `scanner` ماسح الباركود |
| المبيعات والعملاء | الطلبات والفوترة | `commerce` الطلبات والتحصيل · `zatca` نقطة البيع والفاتورة الضريبية |
| المبيعات والعملاء | العملاء والائتمان | `customers` العملاء · `followup` متابعة العملاء · `b2bcredit` ائتمان المطاعم |
| المبيعات والعملاء | العروض والكتالوج | `offers` العروض والكتالوج |
| المبيعات والعملاء | المناسبات والتشغيل | `operations` المناسبات والتشغيل |
| المبيعات والعملاء | ذكاء المبيعات والطلب | `salesintel` ذكاء المبيعات · `intelligence` ذكاء العملاء والطلب · `economics` اقتصاديات الطلب |
| المبيعات والعملاء | خريطة العملاء الجغرافية | `geomap` خريطة العملاء الجغرافية |
| المخزون والموردون والإنتاج | المخزون والتتبع | `inventory` المخزون · `traceability` التتبع والتبريد |
| المخزون والموردون والإنتاج | الموردون والمشتريات | `suppliers` الموردون والمشتريات · `purchasing` أوامر الشراء والاستلام |
| المخزون والموردون والإنتاج | الإنتاج والخلطات | `blending` خلطات اللحوم · `culinary` دليل الشيف |
| المخزون والموردون والإنتاج | مختبر الذبيحة | `carcass` اقتصاديات الذبيحة · `yieldlab` مختبر الجزارة · `nrv` تفكيك الذبيحة NRV |
| المالية والمحاسبة | الدفاتر المحاسبية | `ledger` الدفاتر المحاسبية |
| المالية والمحاسبة | التدفق النقدي | `cash` التدفق النقدي |
| المالية والمحاسبة | الذمم والتحصيل | `receivables` الذمم والتحصيل |
| المالية والمحاسبة | السلف والدفعات المقدمة | `advances` السلف والدفعات المقدمة |
| المالية والمحاسبة | الهندسة المالية | `finance` الهندسة المالية |
| التقارير والبيانات | المطابقة | `smartmatch` مطابقة المبيعات · `excelrecon` مطابقة الإكسل |
| التقارير والبيانات | التقارير التنفيذية | `execreports` التقارير التنفيذية |
| التقارير والبيانات | تقرير الصنف | `itemreport` تقرير الصنف |
| التقارير والبيانات | الطباعة والتصدير | `reports` مركز الطباعة · `exports` مركز التصدير |
| التقارير والبيانات | الأرشيف والتغييرات | `archive` الأرشيف والتغييرات |
| جيف والقرار | مركز القرار | `decision` مركز القرار |
| جيف والقرار | Jev ومجلس القرار | `jev` Jev للقرار · `council` مجلس القرار |
| جيف والقرار | المخاطر والحساسية | `risklab` المخاطر وجسر الربحية · `sensitivity` مختبر الحساسية |
| النظام والتكاملات | الإعدادات والأجهزة | `settings` الإعدادات والمظهر · `devices` الأجهزة والمزامنة |
| النظام والتكاملات | الشركات والفترات | `companies` الشركات والفترات |
| النظام والتكاملات | الحوكمة والصلاحيات | `governance` الحوكمة والجاهزية · `health` الصحة والتشخيص · `capabilitiesv2` الصلاحيات ومساحات العمل |

72 screens in 36 menu entries.

## By tier

- **CORE** — العمل اليومي الأساسي (20): `dash`, `notifications`, `commerce`, `zatca`, `customers`, `followup`, `offers`, `inventory`, `suppliers`, `purchasing`, `ledger`, `cash`, `receivables`, `advances`, `productflow`, `linkmap`, `catalog`, `sim`, `builder`, `tbreview`
- **MANAGEMENT** — الإدارة والمتابعة (12): `tasks`, `risks`, `b2bcredit`, `operations`, `traceability`, `memo`, `execreports`, `itemreport`, `archive`, `codex`, `auditbench`, `corpuslab`
- **INTELLIGENCE** — التحليل والذكاء (8): `decision`, `jev`, `council`, `salesintel`, `geomap`, `intelligence`, `economics`, `compare`
- **ADVANCED** — الهندسة المتقدمة (17): `risklab`, `sensitivity`, `carcass`, `yieldlab`, `nrv`, `finance`, `costs`, `kernel`, `analyzer`, `auditdesk`, `auditdocs`, `auditissues`, `auditcouncil`, `auditfin`, `auditreport`, `auditanalytics`, `auditlab`
- **UTILITIES** — أدوات مساعدة (10): `blending`, `culinary`, `labels`, `scanner`, `smartmatch`, `excelrecon`, `reports`, `exports`, `devices`, `helperdesk`
- **ADMIN** — النظام والإدارة (5): `settings`, `companies`, `governance`, `health`, `capabilitiesv2`

Coverage gate: 72 screens in 11 domains; see CAPABILITY_COVERAGE_ALL_VERSIONS.md for every historical version.
