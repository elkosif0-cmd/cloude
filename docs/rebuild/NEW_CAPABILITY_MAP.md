# NEW CAPABILITY MAP

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

## Old → New matrix

| Old name / location | New ID | New location | Tier | Roles |
|---|---|---|---|---|
| لوحة العمل + بطل v23 + نبض v21 + بطل shell.js | `dash` | الأدوات المساعدة › العام › مركز القيادة | CORE | admin, accountant, warehouse, sales, viewer |
| مهام منصة V40 + مهام CRM V8.2 | `tasks` | الأدوات المساعدة › العام › المهام والإشعارات › المهام | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة الإشعارات في تصميم KOSIF | `notifications` | الأدوات المساعدة › العام › المهام والإشعارات › مركز الإشعارات | CORE | admin, accountant, warehouse, sales, viewer |
| جديد — شاشة المخاطر والملاحظات في تصميم KOSIF (خريطة المخاطر، توزيع الفئات، أحدث الملاحظات) | `risks` | الأدوات المساعدة › العام › المخاطر والملاحظات | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| تنظيم كل الأدوات غير المرتبطة مباشرة بملف المراجعة في مساحة مستقلة | `helperdesk` | الأدوات المساعدة › العام › الأدوات المساعدة المستقلة | UTILITIES | admin, accountant, warehouse, sales, viewer |
| مركز القرار | `decision` | الأدوات المساعدة › Jev والقرار › القرار › مركز القرار | INTELLIGENCE | admin, accountant, sales |
| Jev للقرار | `jev` | الأدوات المساعدة › Jev والقرار › القرار › Jev للقرار | INTELLIGENCE | admin, accountant, sales |
| Grand Fusion intelligence.council | `council` | الأدوات المساعدة › Jev والقرار › القرار › مجلس القرار | INTELLIGENCE | admin, accountant, sales |
| المخاطر | `risklab` | البرنامج المحاسبي الكامل › المالية والدفاتر › المخاطر والحساسية › المخاطر وجسر الربحية | ADVANCED | admin |
| مختبر الحساسية | `sensitivity` | البرنامج المحاسبي الكامل › المالية والدفاتر › المخاطر والحساسية › مختبر الحساسية | ADVANCED | admin, accountant |
| جديد — خريطة جغرافية للعملاء وتحليل المبيعات وتقرير الصنف | `salesmap` | الأدوات المساعدة › المبيعات والعملاء › خريطة العملاء وتحليل المبيعات | CORE | admin |
| الطلبات والتحصيل | `commerce` | البرنامج المحاسبي الكامل › المبيعات والعملاء › الطلبات والتحصيل | CORE | admin, accountant, sales |
| السوق والعملاء | `customers` | الأدوات المساعدة › المبيعات والعملاء › العملاء والائتمان › العملاء | CORE | admin, accountant, sales |
| تعميم «استوديو المنتج» (البند E من برنامج الشركة أولاً) | `customerflow` | الأدوات المساعدة › المبيعات والعملاء › العملاء والائتمان › استوديو العميل | CORE | admin, accountant, sales |
| متابعة العملاء الاحترافية V8.2 (وحدة v25 crm) | `followup` | الأدوات المساعدة › المبيعات والعملاء › العملاء والائتمان › متابعة العملاء | CORE | admin, accountant, sales |
| ائتمان المطاعم | `b2bcredit` | الأدوات المساعدة › المبيعات والعملاء › العملاء والائتمان › ائتمان المطاعم | MANAGEMENT | admin, accountant, sales |
| العروض والكتالوج | `offers` | الأدوات المساعدة › المبيعات والعملاء › العروض والكتالوج | CORE | admin, accountant, sales, viewer |
| المناسبات والتشغيل | `operations` | الأدوات المساعدة › المبيعات والعملاء › المناسبات والتشغيل | MANAGEMENT | admin, accountant, warehouse, sales, viewer |
| ذكاء المبيعات | `salesintel` | الأدوات المساعدة › المبيعات والعملاء › ذكاء المبيعات والطلب › ذكاء المبيعات | INTELLIGENCE | admin |
| ذكاء العملاء | `intelligence` | الأدوات المساعدة › المبيعات والعملاء › ذكاء المبيعات والطلب › ذكاء العملاء والطلب | INTELLIGENCE | admin |
| اقتصاديات الطلب | `economics` | الأدوات المساعدة › المبيعات والعملاء › ذكاء المبيعات والطلب › اقتصاديات الطلب | INTELLIGENCE | admin, accountant |
| المخزون | `inventory` | البرنامج المحاسبي الكامل › المخزون والموردون › المخزون والتتبع › المخزون | CORE | admin, accountant, warehouse, viewer |
| التتبع والتبريد | `traceability` | البرنامج المحاسبي الكامل › المخزون والموردون › المخزون والتتبع › التتبع والتبريد | MANAGEMENT | admin, warehouse |
| الموردون | `suppliers` | البرنامج المحاسبي الكامل › المخزون والموردون › الموردون والمشتريات › الموردون والمشتريات | CORE | admin, accountant, warehouse |
| Grand Fusion procurement + أسعار الموردين V40 | `purchasing` | البرنامج المحاسبي الكامل › المخزون والموردون › الموردون والمشتريات › أوامر الشراء والاستلام | CORE | admin, accountant, warehouse |
| خلطات اللحوم | `blending` | الأدوات المساعدة › المنتج والتكلفة › الإنتاج والخلطات › خلطات اللحوم | UTILITIES | admin, warehouse |
| دليل الشيف | `culinary` | الأدوات المساعدة › المنتج والتكلفة › الإنتاج والخلطات › دليل الشيف | UTILITIES | admin, warehouse |
| اقتصاديات الذبيحة | `carcass` | الأدوات المساعدة › المنتج والتكلفة › مختبر الذبيحة › اقتصاديات الذبيحة | ADVANCED | admin, accountant, warehouse |
| مختبر الجزارة | `yieldlab` | الأدوات المساعدة › المنتج والتكلفة › مختبر الذبيحة › مختبر الجزارة | ADVANCED | admin, warehouse |
| تفكيك الذبيحة | `nrv` | الأدوات المساعدة › المنتج والتكلفة › مختبر الذبيحة › تفكيك الذبيحة NRV | ADVANCED | admin |
| Grand Fusion finance (accounts, journals, GL, TB, reconciliation) | `ledger` | البرنامج المحاسبي الكامل › المالية والدفاتر › الدفاتر المحاسبية | CORE | admin, accountant |
| جديد — فهم القيود ومحاكاتها بذاكرة داخلية | `jesim` | البرنامج المحاسبي الكامل › المالية والدفاتر › محاكي القيود | CORE | admin |
| التدفق النقدي | `cash` | البرنامج المحاسبي الكامل › المالية والدفاتر › التدفق النقدي | CORE | admin, accountant, sales, viewer |
| جديد — مقارنة مرجعية من حزمة الأبحاث للمحاسب | `benchmarks` | البرنامج المحاسبي الكامل › المالية والدفاتر › المقارنة بالشركات العالمية | MANAGEMENT | admin |
| الذمم | `receivables` | البرنامج المحاسبي الكامل › المالية والدفاتر › الذمم والتحصيل | CORE | admin, accountant, sales |
| جديد | `advances` | البرنامج المحاسبي الكامل › المالية والدفاتر › السلف والدفعات المقدمة | CORE | admin |
| الهندسة المالية | `finance` | البرنامج المحاسبي الكامل › المالية والدفاتر › الهندسة المالية | ADVANCED | admin, accountant |
| جديد — شجرة المنتجات وربطها بالموردين والعملاء بالأسهم | `ptree` | الأدوات المساعدة › المنتج والتكلفة › شجرة المنتجات | CORE | admin |
| واجهة موحدة بدل تشتت الأصناف والتكاليف والتسعير والبوكسات | `productflow` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › استوديو المنتج | CORE | admin, accountant, warehouse, sales, viewer |
| سجل الأسعار | `catalog` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › الأصناف والأسعار | CORE | admin, accountant, warehouse, sales, viewer |
| مركز التكاليف | `costs` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › التكاليف والمصروفات | ADVANCED | admin |
| محاكي التسعير | `sim` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › التسعير السريع | CORE | admin |
| نواة التسعير | `kernel` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › نواة التسعير الصارمة | ADVANCED | admin, accountant |
| مذكرة الاعتماد | `memo` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › اعتماد الأسعار | MANAGEMENT | admin |
| مركب البوكسات | `builder` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › البوكسات | CORE | admin |
| تحليل مكونات البوكس | `analyzer` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › تحليل البوكس | ADVANCED | admin |
| استوديو المقارنة | `compare` | الأدوات المساعدة › المنتج والتكلفة › المنتج والتكلفة › المقارنة التحليلية | INTELLIGENCE | admin |
| ملصقات الموازين | `labels` | الأدوات المساعدة › المنتج والتكلفة › الملصقات والباركود › ملصقات الموازين | UTILITIES | admin, warehouse, sales |
| ماسح الباركود | `scanner` | الأدوات المساعدة › المنتج والتكلفة › الملصقات والباركود › ماسح الباركود | UTILITIES | admin, warehouse, sales |
| مطابقة المبيعات | `smartmatch` | البرنامج المحاسبي الكامل › المالية والدفاتر › المطابقة › مطابقة المبيعات | UTILITIES | admin, accountant, sales |
| مطابقة الإكسل | `excelrecon` | البرنامج المحاسبي الكامل › المالية والدفاتر › المطابقة › مطابقة الإكسل | UTILITIES | admin, accountant |
| الفاتورة الضريبية | `zatca` | البرنامج المحاسبي الكامل › المالية والدفاتر › نقطة البيع والفاتورة الضريبية | CORE | admin, accountant, sales |
| التصور الموحد 2026 — مساعد إعداد القوائم من بيانات خارجية | `reportingintake` | البرنامج المحاسبي الكامل › التقارير والبيانات › استلام البيانات وإعداد القوائم | CORE | admin, accountant, viewer |
| التقارير التنفيذية | `execreports` | البرنامج المحاسبي الكامل › التقارير والبيانات › التقارير التنفيذية | MANAGEMENT | admin, accountant, sales, viewer |
| مركز التقارير | `reports` | البرنامج المحاسبي الكامل › التقارير والبيانات › الطباعة والتصدير › مركز الطباعة | UTILITIES | admin, accountant, sales, viewer |
| Grand Fusion reports.exports | `exports` | البرنامج المحاسبي الكامل › التقارير والبيانات › الطباعة والتصدير › مركز التصدير | UTILITIES | admin, accountant, sales |
| الأرشيف | `archive` | البرنامج المحاسبي الكامل › التقارير والبيانات › الأرشيف والأنظمة الأصلية › الأرشيف والتغييرات | MANAGEMENT | admin, accountant |
| جديد — دمج smart-trial-balance-review (مجلس Gemini والجولات) و kosif-audit-pro (القوائم والتحليل) و Moon (المخاطر والرأي) و SEE (التصنيف والجاهزية) + استوديو KOSIF للمراجعة (تبويب «الاستوديو المتقدم» داخل الملف) | `tbreview` | المراجعة والتدقيق › المراجعة والمراجعة المالية › مركز المراجعة › ملف المراجعة | CORE | admin, accountant |
| التصور الموحد 2026 — جسر مساعد التقارير إلى ملف المراجعة | `auditinbox` | المراجعة والتدقيق › المراجعة والمراجعة المالية › مركز المراجعة › صندوق استلام المراجعة | CORE | admin, accountant |
| جديد — يحل محل قاعدة معايير smart-trial-balance-review ويكمّل مختبر المعايير | `codex` | المراجعة والتدقيق › المراجعة والمراجعة المالية › المعايير والمدونة › المدونة المحاسبية والمعايير | MANAGEMENT | admin, accountant, viewer |
| جديد — من global_financial_and_audit_research_bundle_extended_verified.pdf (12,506 صفحة) | `auditbench` | المراجعة والتدقيق › المراجعة والمراجعة المالية › المعايير والمدونة › المرجع العالمي للمراجعة | MANAGEMENT | admin |
| جديد — تشغيل المراجعة على شركات global_financial_and_audit_research_bundle_extended_verified.pdf ومقارنتها بتقارير مراجعيها | `corpuslab` | المراجعة والتدقيق › المراجعة والمراجعة المالية › المعايير والمدونة › مختبر الشركات العالمية | MANAGEMENT | admin |
| KOSIF Audit Studio | `auditdesk` | المراجعة والتدقيق › المراجعة والمراجعة المالية › مركز المراجعة › الاستوديو المتقدم | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditdocs` | المراجعة والتدقيق › المراجعة والمراجعة المالية › مركز المراجعة › المستندات والأدلة | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditissues` | المراجعة والتدقيق › المراجعة والمراجعة المالية › مركز المراجعة › الملاحظات والقضايا | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditcouncil` | المراجعة والتدقيق › المراجعة والمراجعة المالية › مركز المراجعة › مجلس المراجعين | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditfin` | المراجعة والتدقيق › المراجعة والمراجعة المالية › مركز المراجعة › القوائم والقيود | ADVANCED | admin, accountant |
| KOSIF Audit Studio | `auditreport` | المراجعة والتدقيق › المراجعة والمراجعة المالية › مركز المراجعة › التقارير والإصدار | ADVANCED | admin, accountant |
| KOSIF Audit Studio (classic) | `auditanalytics` | المراجعة والتدقيق › المراجعة والمراجعة المالية › التحليل والاختبارات | ADVANCED | admin, accountant |
| KOSIF Audit Studio (lab) | `auditlab` | المراجعة والتدقيق › المراجعة والمراجعة المالية › المعايير والمدونة › مختبر المعايير والأبحاث | ADVANCED | admin, accountant |
| الإعدادات | `settings` | الأدوات المساعدة › العام › الإعدادات والأجهزة › الإعدادات والمظهر | ADMIN | admin, accountant, warehouse, sales, viewer |
| جديد — تعليمات التثبيت (INSTALL-iPHONE-ar.txt) + نسخة v27 للابتوب وv28–v30 للآيفون | `devices` | الأدوات المساعدة › العام › الإعدادات والأجهزة › الأجهزة والمزامنة | UTILITIES | admin, accountant, warehouse, sales, viewer |
| Grand Fusion system.companies | `companies` | البرنامج المحاسبي الكامل › العام › إعداد الشركة والتعريفات › الشركات والفترات | ADMIN | admin, accountant |
| التصور الموحد 2026 — تعريفات الشركة قبل التسجيل المحاسبي | `masterdata` | البرنامج المحاسبي الكامل › العام › إعداد الشركة والتعريفات › التعريفات | CORE | admin, accountant |
| الحوكمة | `governance` | الأدوات المساعدة › العام › الحوكمة والصلاحيات › الحوكمة والجاهزية | ADMIN | admin |
| الصحة والاستثناءات | `health` | الأدوات المساعدة › العام › الحوكمة والصلاحيات › الصحة والتشخيص | ADMIN | admin |
| Capabilities v2 | `capabilitiesv2` | الأدوات المساعدة › العام › الحوكمة والصلاحيات › الصلاحيات ومساحات العمل | ADMIN | admin |
| التطبيقات المدمجة في إصدار v25 (CRM V8.2، V31، V33، V40) التي حُذفت — مستعادة بعد تنظيف بياناتها | `legacyapps` | البرنامج المحاسبي الكامل › التقارير والبيانات › الأرشيف والأنظمة الأصلية › الأنظمة الأصلية | UTILITIES | admin |

## User-facing entries → internal domains → hubs

The front door and the sidebar expose exactly three entries (FOUNDATION §3): the complete accounting program, audit, helper tools. Reporting, analysis, Jev and settings are cross-cutting layers: a screen lists the other entries it is shared with (`also`), it is never a fourth gateway. The eight historical domains remain an internal compatibility/company-scoping layer; one menu entry is shown per hub and every page keeps its id, permission and deep link.

| Entry | Internal domain | Menu entry | Pages | Shared with |
|---|---|---|---|---|
| البرنامج المحاسبي الكامل | العام | إعداد الشركة والتعريفات | `companies` الشركات والفترات · `masterdata` التعريفات | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | المبيعات والعملاء | الطلبات والفوترة | `commerce` الطلبات والتحصيل | — |
| البرنامج المحاسبي الكامل | المخزون والموردون | المخزون والتتبع | `inventory` المخزون · `traceability` التتبع والتبريد | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | المخزون والموردون | الموردون والمشتريات | `suppliers` الموردون والمشتريات · `purchasing` أوامر الشراء والاستلام | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | المالية والدفاتر | المخاطر والحساسية | `risklab` المخاطر وجسر الربحية · `sensitivity` مختبر الحساسية | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | المالية والدفاتر | الدفاتر المحاسبية | `ledger` الدفاتر المحاسبية | — |
| البرنامج المحاسبي الكامل | المالية والدفاتر | محاكي القيود | `jesim` محاكي القيود | — |
| البرنامج المحاسبي الكامل | المالية والدفاتر | التدفق النقدي | `cash` التدفق النقدي | — |
| البرنامج المحاسبي الكامل | المالية والدفاتر | المقارنة بالشركات العالمية | `benchmarks` المقارنة بالشركات العالمية | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | المالية والدفاتر | الذمم والتحصيل | `receivables` الذمم والتحصيل | — |
| البرنامج المحاسبي الكامل | المالية والدفاتر | السلف والدفعات المقدمة | `advances` السلف والدفعات المقدمة | — |
| البرنامج المحاسبي الكامل | المالية والدفاتر | الهندسة المالية | `finance` الهندسة المالية | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | المالية والدفاتر | المطابقة | `smartmatch` مطابقة المبيعات · `excelrecon` مطابقة الإكسل | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | المالية والدفاتر | نقطة البيع والفاتورة الضريبية | `zatca` نقطة البيع والفاتورة الضريبية | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | التقارير والبيانات | استلام البيانات وإعداد القوائم | `reportingintake` استلام البيانات وإعداد القوائم | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | التقارير والبيانات | التقارير التنفيذية | `execreports` التقارير التنفيذية | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | التقارير والبيانات | الطباعة والتصدير | `reports` مركز الطباعة · `exports` مركز التصدير | الأدوات المساعدة |
| البرنامج المحاسبي الكامل | التقارير والبيانات | الأرشيف والأنظمة الأصلية | `archive` الأرشيف والتغييرات · `legacyapps` الأنظمة الأصلية | الأدوات المساعدة |
| المراجعة والتدقيق | المراجعة والمراجعة المالية | مركز المراجعة | `tbreview` ملف المراجعة · `auditinbox` صندوق استلام المراجعة · `auditdesk` الاستوديو المتقدم · `auditdocs` المستندات والأدلة · `auditissues` الملاحظات والقضايا · `auditcouncil` مجلس المراجعين · `auditfin` القوائم والقيود · `auditreport` التقارير والإصدار | — |
| المراجعة والتدقيق | المراجعة والمراجعة المالية | المعايير والمدونة | `codex` المدونة المحاسبية والمعايير · `auditbench` المرجع العالمي للمراجعة · `corpuslab` مختبر الشركات العالمية · `auditlab` مختبر المعايير والأبحاث | البرنامج المحاسبي الكامل |
| المراجعة والتدقيق | المراجعة والمراجعة المالية | التحليل والاختبارات | `auditanalytics` التحليل والاختبارات | — |
| الأدوات المساعدة | العام | مركز القيادة | `dash` مركز القيادة | البرنامج المحاسبي الكامل، المراجعة والتدقيق |
| الأدوات المساعدة | العام | المهام والإشعارات | `tasks` المهام · `notifications` مركز الإشعارات | البرنامج المحاسبي الكامل، المراجعة والتدقيق |
| الأدوات المساعدة | العام | المخاطر والملاحظات | `risks` المخاطر والملاحظات | البرنامج المحاسبي الكامل، المراجعة والتدقيق |
| الأدوات المساعدة | العام | الأدوات المساعدة المستقلة | `helperdesk` الأدوات المساعدة المستقلة | البرنامج المحاسبي الكامل |
| الأدوات المساعدة | العام | الإعدادات والأجهزة | `settings` الإعدادات والمظهر · `devices` الأجهزة والمزامنة | البرنامج المحاسبي الكامل، المراجعة والتدقيق |
| الأدوات المساعدة | العام | الحوكمة والصلاحيات | `governance` الحوكمة والجاهزية · `health` الصحة والتشخيص · `capabilitiesv2` الصلاحيات ومساحات العمل | البرنامج المحاسبي الكامل، المراجعة والتدقيق |
| الأدوات المساعدة | المنتج والتكلفة | الإنتاج والخلطات | `blending` خلطات اللحوم · `culinary` دليل الشيف | البرنامج المحاسبي الكامل |
| الأدوات المساعدة | المنتج والتكلفة | مختبر الذبيحة | `carcass` اقتصاديات الذبيحة · `yieldlab` مختبر الجزارة · `nrv` تفكيك الذبيحة NRV | البرنامج المحاسبي الكامل |
| الأدوات المساعدة | المنتج والتكلفة | شجرة المنتجات | `ptree` شجرة المنتجات | البرنامج المحاسبي الكامل |
| الأدوات المساعدة | المنتج والتكلفة | المنتج والتكلفة | `productflow` استوديو المنتج · `catalog` الأصناف والأسعار · `costs` التكاليف والمصروفات · `sim` التسعير السريع · `kernel` نواة التسعير الصارمة · `memo` اعتماد الأسعار · `builder` البوكسات · `analyzer` تحليل البوكس · `compare` المقارنة التحليلية | البرنامج المحاسبي الكامل |
| الأدوات المساعدة | المنتج والتكلفة | الملصقات والباركود | `labels` ملصقات الموازين · `scanner` ماسح الباركود | — |
| الأدوات المساعدة | المبيعات والعملاء | خريطة العملاء والمبيعات | `salesmap` خريطة العملاء وتحليل المبيعات | — |
| الأدوات المساعدة | المبيعات والعملاء | العملاء والائتمان | `customers` العملاء · `customerflow` استوديو العميل · `followup` متابعة العملاء · `b2bcredit` ائتمان المطاعم | — |
| الأدوات المساعدة | المبيعات والعملاء | العروض والكتالوج | `offers` العروض والكتالوج | — |
| الأدوات المساعدة | المبيعات والعملاء | المناسبات والتشغيل | `operations` المناسبات والتشغيل | — |
| الأدوات المساعدة | المبيعات والعملاء | ذكاء المبيعات والطلب | `salesintel` ذكاء المبيعات · `intelligence` ذكاء العملاء والطلب · `economics` اقتصاديات الطلب | — |
| الأدوات المساعدة | Jev والقرار | القرار | `decision` مركز القرار · `jev` Jev للقرار · `council` مجلس القرار | البرنامج المحاسبي الكامل، المراجعة والتدقيق |

## Sectors of the accounting entry (FOUNDATION §3.7)

| Sector | Priority | Scope |
|---|---|---|
| `health` المستشفيات والرعاية الصحية | نعم | مراكز تكلفة الأقسام، التأمين والمطالبات، الصيدلية والمختبر، تكلفة الحالة |
| `hospitality` الفنادق والضيافة | نعم | الغرف والإشغال، F&B، الودائع، قنوات الحجز، الإقفال الليلي |
| `construction` المقاولات والمشروعات | نعم | العقود والمستخلصات ونسب الإنجاز وWIP والمحتجزات |
| `meat` اللحوم والتجزئة المرتبطة | نعم | الأوزان والمردود، التقطيع والهدر، الدفعات والتتبع البارد، تكلفة الكيلو |
| `digital` التسويق الإلكتروني | نعم | العملاء والحملات والقنوات، الإنفاق الإعلاني، Retainer، الربحية حسب الحملة |
| `education` التعليم | — | السنوات والفصول، الرسوم والتحصيل، المنح، ذمم الطلاب |
| `manufacturing` المصانع | — | BOM وأوامر التشغيل، تحت التشغيل، التكلفة المعيارية والانحرافات |
| `bakery` المخابز | — | الوصفات ودفعات الإنتاج، المردود والتالف والصلاحية |
| `agriculture` الزراعة والمزارع | — | المواسم والحظائر كمراكز تكلفة، الأعلاف، النفوق، تكلفة الدورة |
| `trade` التجارة والخدمات العامة | — | فروع ومستودعات، شراء وبيع، هوامش ومخزون وائتمان — وكل نشاط آخر |

78 screens in 38 menu entries.

## By tier

- **CORE** — العمل اليومي الأساسي (26): `dash`, `notifications`, `salesmap`, `commerce`, `customers`, `customerflow`, `followup`, `offers`, `inventory`, `suppliers`, `purchasing`, `ledger`, `jesim`, `cash`, `receivables`, `advances`, `ptree`, `productflow`, `catalog`, `sim`, `builder`, `zatca`, `reportingintake`, `tbreview`, `auditinbox`, `masterdata`
- **MANAGEMENT** — الإدارة والمتابعة (12): `tasks`, `risks`, `b2bcredit`, `operations`, `traceability`, `benchmarks`, `memo`, `execreports`, `archive`, `codex`, `auditbench`, `corpuslab`
- **INTELLIGENCE** — التحليل والذكاء (7): `decision`, `jev`, `council`, `salesintel`, `intelligence`, `economics`, `compare`
- **ADVANCED** — الهندسة المتقدمة (17): `risklab`, `sensitivity`, `carcass`, `yieldlab`, `nrv`, `finance`, `costs`, `kernel`, `analyzer`, `auditdesk`, `auditdocs`, `auditissues`, `auditcouncil`, `auditfin`, `auditreport`, `auditanalytics`, `auditlab`
- **UTILITIES** — أدوات مساعدة (11): `helperdesk`, `blending`, `culinary`, `labels`, `scanner`, `smartmatch`, `excelrecon`, `reports`, `exports`, `devices`, `legacyapps`
- **ADMIN** — النظام والإدارة (5): `settings`, `companies`, `governance`, `health`, `capabilitiesv2`

Coverage gate: 78 screens in 3 user-facing entries and 8 internal domains; see CAPABILITY_COVERAGE_ALL_VERSIONS.md for every historical version.
