# SYSTEM CAPABILITY INVENTORY

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

Total capabilities: **64** (screens). Cross-cutting capabilities are listed after the table.

| ID | Capability | Module | Current Location | Data Used | Dependencies | Status | Keep/Remove/Merge/Rebuild |
|---|---|---|---|---|---|---|---|
| `dash` | مركز القيادة | core+ui/features/command-center.js | مركز القيادة › يومي | `aghnam-pricing-v3`, `IDB aghnam-app-v7` | SKosifCore, Engine, IndexedDB | Working | Rebuild |
| `decision` | مركز القرار | core (v19.5 + v20.2) | مركز القيادة › يومي | `aghnam-pricing-v3`, `IDB aghnam-app-v7` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `tasks` | المهام | ui/features/workspace.js | مركز القيادة › يومي | `skosif_tasks_v1` | SKosifCore | Working | Rebuild |
| `notifications` | مركز الإشعارات | ui/features/notifications.js + ui/layouts/topbar.js (الجرس) | مركز القيادة › يومي | `skosif_notify_v1`, `skosif_tasks_v1`, `skosif_risks_v1`, `skosif_audit_trail` | SKosifCore | Working | Rebuild |
| `risks` | المخاطر والملاحظات | ui/features/risks.js + ui/components/charts.js | مركز القيادة › يومي | `skosif_risks_v1` | SKosifCore | Working | Rebuild |
| `commerce` | الطلبات والتحصيل | core | المبيعات والعملاء › يومي | `IDB orders`, `IDB order_items`, `IDB payments`, `IDB ops_orders` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `customers` | العملاء | core | المبيعات والعملاء › يومي | `IDB customers`, `IDB sales_lines`, `IDB imports` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `followup` | متابعة العملاء | ui/features/followup.js | المبيعات والعملاء › يومي | `skosif_followup_v1`, `IDB customers` | SKosifCore, IndexedDB | Working | Rebuild |
| `offers` | العروض والكتالوج | ui/offers.js | المبيعات والعملاء › يومي | `skosif_v32_offers`, `skosif_v32_cart`, `skosif_v32_cols` | SKosifCore | Working | Keep |
| `zatca` | نقطة البيع والفاتورة الضريبية | ui/enterprise.js | المبيعات والعملاء › يومي | `skosif_v32_cart` | SKosifCore | Working | Keep |
| `b2bcredit` | ائتمان المطاعم | ui/enterprise.js | المبيعات والعملاء › يومي | `skosif_v38_ledger` | SKosifCore | Working | Keep |
| `operations` | المناسبات والتشغيل | ui/operations.js | المبيعات والعملاء › يومي | `skosif_ops_subscriptions`, `skosif_ops_butcher_shifts`, `skosif_ops_po_history`, `skosif_ops_bbq`, `skosif_ops_aging_chamber` | SKosifCore | Working | Keep |
| `salesintel` | ذكاء المبيعات | core (v16) | المبيعات والعملاء › متقدم | `IDB sales_lines` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `intelligence` | ذكاء العملاء والطلب | core (v18) | المبيعات والعملاء › متقدم | `IDB customers`, `IDB sales_lines` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `economics` | اقتصاديات الطلب | core (v9) | المبيعات والعملاء › متقدم | `IDB orders`, `aghnam-econ-fees-v1` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `inventory` | المخزون | ui/inventory.js + ui/erp-plus.js | المخزون والإنتاج › يومي | `aghnam_v29_inventory`, `skosif_inv_expiry_batches`, `skosif_erp_inventory_v1` | SKosifCore | Working | Keep |
| `traceability` | التتبع والتبريد | ui/enterprise.js | المخزون والإنتاج › يومي | `skosif_v38_batches`, `skosif_v38_coldchain` | SKosifCore | Working | Keep |
| `blending` | خلطات اللحوم | ui/enterprise.js | المخزون والإنتاج › يومي | — | SKosifCore | Working | Keep |
| `culinary` | دليل الشيف | ui/enterprise.js | المخزون والإنتاج › يومي | — | SKosifCore | Working | Keep |
| `carcass` | اقتصاديات الذبيحة | ui/meatops.js | المخزون والإنتاج › متقدم | — | SKosifCore | Working | Keep |
| `yieldlab` | مختبر الجزارة | core (v18) | المخزون والإنتاج › متقدم | `aghnam-v18-yield-trials` | SKosifCore, Engine | Working | Keep |
| `nrv` | تفكيك الذبيحة NRV | core (v19) | المخزون والإنتاج › متقدم | `aghnam-v19-nrv-trials` | SKosifCore, Engine | Working | Keep |
| `suppliers` | الموردون والمشتريات | ui/supply.js + ui/erp-plus.js | المشتريات والموردون › يومي | `skosif_v31_supplier_batches`, `skosif_erp_payables_v1` | SKosifCore | Working | Keep |
| `purchasing` | أوامر الشراء والاستلام | ui/features/purchasing.js + SKEngines.procurement | المشتريات والموردون › يومي | `skosif_purchasing_v1` | SKosifCore | Working | Rebuild |
| `cash` | التدفق النقدي | ui/supply.js + ui/erp-plus.js | المالية والمحاسبة › يومي | `skosif_v31_monthly_opex`, `skosif_erp_finance_v1` | SKosifCore | Working | Keep |
| `receivables` | الذمم والتحصيل | ui/meatops.js | المالية والمحاسبة › يومي | `skosif_ar_paste` | SKosifCore | Working | Keep |
| `ledger` | الدفاتر المحاسبية | ui/features/ledger.js + SKEngines.finance | المالية والمحاسبة › يومي | `skosif_ledger_v1` | SKosifCore | Working | Rebuild |
| `finance` | الهندسة المالية | core (v18) | المالية والمحاسبة › متقدم | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `catalog` | الأصناف والأسعار | core | الكتالوج والتسعير › يومي | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `builder` | البوكسات | core | الكتالوج والتسعير › يومي | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `sim` | التسعير السريع | core | الكتالوج والتسعير › يومي | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `memo` | اعتماد الأسعار | core | الكتالوج والتسعير › يومي | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `labels` | ملصقات الموازين | ui/enterprise.js | الكتالوج والتسعير › يومي | — | SKosifCore | Working | Keep |
| `scanner` | ماسح الباركود | ui/enterprise.js | الكتالوج والتسعير › يومي | `skosif_v32_cart` | SKosifCore | Working | Keep |
| `kernel` | نواة التسعير الصارمة | ui/kernel.js + ui/pricing-core.js | الكتالوج والتسعير › متقدم | — | SKosifCore | Working | Keep |
| `costs` | التكاليف والمصروفات | core | الكتالوج والتسعير › متقدم | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `analyzer` | تحليل البوكس | core | الكتالوج والتسعير › متقدم | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `compare` | المقارنة التحليلية | core | الكتالوج والتسعير › متقدم | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `jev` | Jev للقرار | ui/jev.js | Jev والذكاء › يومي | `aghnam_v29_jev_log`, `skosif_jev_draft`, `session aghnamJevSession` | SKosifCore | Working | Keep |
| `council` | مجلس القرار | ui/features/workspace.js + SKEngines.intelligence | Jev والذكاء › يومي | `skosif_council_v1` | SKosifCore | Working | Rebuild |
| `risklab` | المخاطر وجسر الربحية | core (v19) | Jev والذكاء › متقدم | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `sensitivity` | مختبر الحساسية | ui/tools.js | Jev والذكاء › متقدم | `skosif_v33_decision` | SKosifCore | Working | Keep |
| `execreports` | التقارير التنفيذية | ui/reports.js | التقارير والتحليلات › يومي | `skosif_rep_pl`, `IDB customers`, `IDB sales_lines`, `skosif_v31_supplier_batches` | SKosifCore, IndexedDB | Working | Keep |
| `reports` | مركز الطباعة | core | التقارير والتحليلات › يومي | `aghnam-pricing-v3`, `aghnam-pricing-prints-v1` | SKosifCore, Engine | Working | Keep |
| `archive` | الأرشيف والتغييرات | core | التقارير والتحليلات › يومي | `aghnam-pricing-v3`, `IDB pricing_snapshots` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `exports` | مركز التصدير | ui/features/workspace.js | التقارير والتحليلات › يومي | `كل المفاتيح` | SKosifCore | Working | Rebuild |
| `smartmatch` | مطابقة المبيعات | ui/smartmatch.js | الكتالوج والتسعير › متقدم | `skosif_v34_product_aliases` | SKosifCore | Working | Keep |
| `excelrecon` | مطابقة الإكسل | ui/tools.js | الكتالوج والتسعير › متقدم | — | SKosifCore | Working | Keep |
| `tbreview` | مراجعة ميزان المراجعة | ui/features/tb-review.js + ui/core/ai.js + ui/components/xlsx.js + SKEngines.audit.{tbReview,aiReview,documentCheck} + SKEngines.reports.{tbImport,statements,analysis} | المراجعة والتأكيد › يومي | `skosif_tbreview_v1`, `IDB skosif-tbreview-docs`, `skosif_ai_keys (الجهاز فقط)` | SKosifCore, IndexedDB | Working | Rebuild |
| `codex` | المدونة المحاسبية والمعايير | ui/features/codex.js + SKEngines.audit.{codex,standardsUpdate} | المراجعة والتأكيد › يومي | `skosif_codex_updates_v1` | SKosifCore | Working | Rebuild |
| `auditdesk` | مركز المراجعة | ui/audit (v5) | المراجعة والتأكيد › متقدم | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditdocs` | المستندات والأدلة | ui/audit (v5) + ui/audit-bridge.js | المراجعة والتأكيد › متقدم | `IDB sales_lines`, `skosif_v31_supplier_batches`, `skosif_erp_finance_v1`, `skosif_v38_ledger` | SKosifCore, IndexedDB | Working | Keep |
| `auditissues` | الملاحظات والقضايا | ui/audit (v5) | المراجعة والتأكيد › متقدم | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditcouncil` | مجلس المراجعين | ui/audit (v5) | المراجعة والتأكيد › متقدم | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditfin` | القوائم والقيود | ui/audit (v5) | المراجعة والتأكيد › متقدم | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditreport` | التقارير والإصدار | ui/audit (v5) | المراجعة والتأكيد › متقدم | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditanalytics` | التحليل المالي والمخاطر | ui/audit/classic | المراجعة والتأكيد › متقدم | `audit classic storage` | SKosifCore | Working | Keep |
| `auditlab` | مختبر المعايير | ui/audit/lab | المراجعة والتأكيد › متقدم | `audit lab storage` | SKosifCore | Working | Keep |
| `settings` | الإعدادات والمظهر | core + ui/shell.js | النظام والتكاملات › يومي | `aghnam-pricing-v3`, `skosif_prefs` | SKosifCore, Engine | Working | Keep |
| `devices` | الأجهزة والمزامنة | ui/features/devices.js + ui/core/device.js + ui/components/keys.js | النظام والتكاملات › يومي | `skosif_prefs`, `sk-device-log`, `IDB aghnam-app-v7` | SKosifCore, IndexedDB | Working | Rebuild |
| `companies` | الشركات والفترات | ui/features/workspace.js + SKEngines.system | النظام والتكاملات › متقدم | `skosif_companies_v1` | SKosifCore | Working | Rebuild |
| `health` | الصحة والتشخيص | core (v19.8) + ui/jev.js | النظام والتكاملات › متقدم | `aghnam-v17-runtime-errors`, `skosif_error_log` | SKosifCore, Engine | Working | Keep |
| `governance` | الحوكمة والجاهزية | core (v18/v19) + ui/core/audit.js | النظام والتكاملات › متقدم | `aghnam-pricing-v3`, `skosif_audit_trail` | SKosifCore, Engine | Working | Keep |
| `capabilitiesv2` | الصلاحيات ومساحات العمل | ui/capabilities-v2.js + capabilities-v2/worker.js | النظام والتكاملات › متقدم | `skosif_cap_v2_config`, `skosif_cap_v2_local_workspace` | SKosifCore | Working | Keep |

## Cross-cutting capabilities

| ID | Capability | Module | Data | Decision |
|---|---|---|---|---|
| X-search | البحث الموحد + لوحة الأوامر Ctrl+K | ui/components/palette.js (يحل محل v21 palette وزر v23) | `skosif_palette_recent`, `aghnam-v21-pins` | Rebuild |
| X-backup | نسخ احتياطي/استعادة كاملة مع تجربة جافة وتراجع | ui/core/store.js + core backup | كل مفاتيح التطبيق + IDB | Merge (نسختان سابقتان) |
| X-errors | معالجة أخطاء مركزية بلا alert() | ui/core/errors.js | `skosif_error_log` | Rebuild |
| X-audit | سجل تدقيق للأحداث والإجراءات | ui/core/audit.js | `skosif_audit_trail` | Rebuild |
| X-perm | الصلاحيات User→Role→Capability→Action | ui/core/perm.js | `skosif_role_mode` | Merge (erp-plus ROLES) |
| X-events | ناقل الأحداث | ui/core/bus.js | — | Rebuild |
| X-theme | المظهر فاتح/داكن/تلقائي + الكثافة | ui/layouts/shell.js | `skosif_prefs` | Rebuild (12 ثيماً → نظام تصميم واحد) |
| X-lock | القفل التلقائي وفك التشفير | ui/core/sk.js + unlock.html | `skosif_autolock_min` | Keep |
| X-pwa | العمل دون اتصال وتحديث النسخة | sw.js + ui/core/pwa.js | Cache Storage | Keep |
| X-jev | Jev داخل مسارات العمل | ui/jev.js + jev-api/worker.js | `aghnam_v29_jev_log` | Keep |
| X-print | الطباعة وPDF | core reports + ui modules | — | Keep |
| X-whatsapp | إرسال واتساب | offers/reports/operations | — | Keep |
| X-excel | استيراد/تصدير Excel/CSV | core DataHub + SK.csv | IDB imports | Keep |
| X-cloud | الربط السحابي وCapabilities v2 | capabilities-v2/worker.js | D1 | Keep |
