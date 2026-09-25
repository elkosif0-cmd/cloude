# SYSTEM CAPABILITY INVENTORY

Generated from `ui/core/capabilities.json` by `tools/capability_docs.py` — do not edit by hand.

Total capabilities: **52** (screens). Cross-cutting capabilities are listed after the table.

| ID | Capability | Module | Current Location | Data Used | Dependencies | Status | Keep/Remove/Merge/Rebuild |
|---|---|---|---|---|---|---|---|
| `dash` | مركز القيادة | core+ui/features/command-center.js | القائمة الأساسية › اليوم | `aghnam-pricing-v3`, `IDB aghnam-app-v7` | SKosifCore, Engine, IndexedDB | Working | Rebuild |
| `decision` | مركز القرار | core (v19.5 + v20.2) | القائمة الأساسية › اليوم | `aghnam-pricing-v3`, `IDB aghnam-app-v7` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `jev` | Jev للقرار | ui/jev.js | القائمة الأساسية › اليوم | `aghnam_v29_jev_log`, `skosif_jev_draft`, `session aghnamJevSession` | SKosifCore | Working | Keep |
| `commerce` | الطلبات والتحصيل | core | القائمة الأساسية › البيع والعملاء | `IDB orders`, `IDB order_items`, `IDB payments`, `IDB ops_orders` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `customers` | العملاء | core | القائمة الأساسية › البيع والعملاء | `IDB customers`, `IDB sales_lines`, `IDB imports` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `offers` | العروض والكتالوج | ui/offers.js | القائمة الأساسية › البيع والعملاء | `skosif_v32_offers`, `skosif_v32_cart`, `skosif_v32_cols` | SKosifCore | Working | Keep |
| `zatca` | نقطة البيع والفاتورة الضريبية | ui/enterprise.js | القائمة الأساسية › البيع والعملاء | `skosif_v32_cart` | SKosifCore | Working | Keep |
| `b2bcredit` | ائتمان المطاعم | ui/enterprise.js | القائمة الأساسية › البيع والعملاء | `skosif_v38_ledger` | SKosifCore | Working | Keep |
| `operations` | المناسبات والتشغيل | ui/operations.js | القائمة الأساسية › البيع والعملاء | `skosif_ops_subscriptions`, `skosif_ops_butcher_shifts`, `skosif_ops_po_history`, `skosif_ops_bbq`, `skosif_ops_aging_chamber` | SKosifCore | Working | Keep |
| `catalog` | الأصناف والأسعار | core | القائمة الأساسية › الأصناف والأسعار | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `builder` | البوكسات | core | القائمة الأساسية › الأصناف والأسعار | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `sim` | التسعير السريع | core | القائمة الأساسية › الأصناف والأسعار | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `memo` | اعتماد الأسعار | core | القائمة الأساسية › الأصناف والأسعار | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `labels` | ملصقات الموازين | ui/enterprise.js | القائمة الأساسية › الأصناف والأسعار | — | SKosifCore | Working | Keep |
| `scanner` | ماسح الباركود | ui/enterprise.js | القائمة الأساسية › الأصناف والأسعار | `skosif_v32_cart` | SKosifCore | Working | Keep |
| `inventory` | المخزون | ui/inventory.js + ui/erp-plus.js | القائمة الأساسية › المخزون والتجهيز | `aghnam_v29_inventory`, `skosif_inv_expiry_batches`, `skosif_erp_inventory_v1` | SKosifCore | Working | Keep |
| `suppliers` | الموردون والمشتريات | ui/supply.js + ui/erp-plus.js | القائمة الأساسية › المخزون والتجهيز | `skosif_v31_supplier_batches`, `skosif_erp_payables_v1` | SKosifCore | Working | Keep |
| `traceability` | التتبع والتبريد | ui/enterprise.js | القائمة الأساسية › المخزون والتجهيز | `skosif_v38_batches`, `skosif_v38_coldchain` | SKosifCore | Working | Keep |
| `blending` | خلطات اللحوم | ui/enterprise.js | القائمة الأساسية › المخزون والتجهيز | — | SKosifCore | Working | Keep |
| `culinary` | دليل الشيف | ui/enterprise.js | القائمة الأساسية › المخزون والتجهيز | — | SKosifCore | Working | Keep |
| `cash` | التدفق النقدي | ui/supply.js + ui/erp-plus.js | القائمة الأساسية › المال والتقارير | `skosif_v31_monthly_opex`, `skosif_erp_finance_v1` | SKosifCore | Working | Keep |
| `receivables` | الذمم والتحصيل | ui/meatops.js | القائمة الأساسية › المال والتقارير | `skosif_ar_paste` | SKosifCore | Working | Keep |
| `execreports` | التقارير التنفيذية | ui/reports.js | القائمة الأساسية › المال والتقارير | `skosif_rep_pl`, `IDB customers`, `IDB sales_lines`, `skosif_v31_supplier_batches` | SKosifCore, IndexedDB | Working | Keep |
| `reports` | مركز الطباعة | core | القائمة الأساسية › المال والتقارير | `aghnam-pricing-v3`, `aghnam-pricing-prints-v1` | SKosifCore, Engine | Working | Keep |
| `archive` | الأرشيف والتغييرات | core | القائمة الأساسية › المال والتقارير | `aghnam-pricing-v3`, `IDB pricing_snapshots` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `salesintel` | ذكاء المبيعات | core (v16) | الأدوات المتقدمة › التحليل | `IDB sales_lines` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `economics` | اقتصاديات الطلب | core (v9) | الأدوات المتقدمة › التحليل | `IDB orders`, `aghnam-econ-fees-v1` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `intelligence` | ذكاء العملاء والطلب | core (v18) | الأدوات المتقدمة › التحليل | `IDB customers`, `IDB sales_lines` | SKosifCore, Engine, IndexedDB | Working | Keep |
| `finance` | الهندسة المالية | core (v18) | الأدوات المتقدمة › التحليل | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `risklab` | المخاطر وجسر الربحية | core (v19) | الأدوات المتقدمة › التحليل | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `sensitivity` | مختبر الحساسية | ui/tools.js | الأدوات المتقدمة › التحليل | `skosif_v33_decision` | SKosifCore | Working | Keep |
| `compare` | المقارنة التحليلية | core | الأدوات المتقدمة › التحليل | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `kernel` | نواة التسعير الصارمة | ui/kernel.js + ui/pricing-core.js | الأدوات المتقدمة › هندسة التسعير | — | SKosifCore | Working | Keep |
| `costs` | التكاليف والمصروفات | core | الأدوات المتقدمة › هندسة التسعير | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `analyzer` | تحليل البوكس | core | الأدوات المتقدمة › هندسة التسعير | `aghnam-pricing-v3` | SKosifCore, Engine | Working | Keep |
| `yieldlab` | مختبر الجزارة | core (v18) | الأدوات المتقدمة › الذبيحة والجزارة | `aghnam-v18-yield-trials` | SKosifCore, Engine | Working | Keep |
| `nrv` | تفكيك الذبيحة NRV | core (v19) | الأدوات المتقدمة › الذبيحة والجزارة | `aghnam-v19-nrv-trials` | SKosifCore, Engine | Working | Keep |
| `carcass` | اقتصاديات الذبيحة | ui/meatops.js | الأدوات المتقدمة › الذبيحة والجزارة | — | SKosifCore | Working | Keep |
| `smartmatch` | مطابقة المبيعات | ui/smartmatch.js | الأدوات المتقدمة › المطابقة | `skosif_v34_product_aliases` | SKosifCore | Working | Keep |
| `excelrecon` | مطابقة الإكسل | ui/tools.js | الأدوات المتقدمة › المطابقة | — | SKosifCore | Working | Keep |
| `auditdesk` | مركز المراجعة | ui/audit (v5) | الأدوات المتقدمة › المحاسبة والمراجعة | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditdocs` | المستندات والأدلة | ui/audit (v5) + ui/audit-bridge.js | الأدوات المتقدمة › المحاسبة والمراجعة | `IDB sales_lines`, `skosif_v31_supplier_batches`, `skosif_erp_finance_v1`, `skosif_v38_ledger` | SKosifCore, IndexedDB | Working | Keep |
| `auditissues` | الملاحظات والقضايا | ui/audit (v5) | الأدوات المتقدمة › المحاسبة والمراجعة | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditcouncil` | مجلس المراجعين | ui/audit (v5) | الأدوات المتقدمة › المحاسبة والمراجعة | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditfin` | القوائم والقيود | ui/audit (v5) | الأدوات المتقدمة › المحاسبة والمراجعة | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditreport` | التقارير والإصدار | ui/audit (v5) | الأدوات المتقدمة › المحاسبة والمراجعة | `audit studio IDB` | SKosifCore | Working | Keep |
| `auditanalytics` | التحليل المالي والمخاطر | ui/audit/classic | الأدوات المتقدمة › المحاسبة والمراجعة | `audit classic storage` | SKosifCore | Working | Keep |
| `auditlab` | مختبر المعايير | ui/audit/lab | الأدوات المتقدمة › المحاسبة والمراجعة | `audit lab storage` | SKosifCore | Working | Keep |
| `health` | الصحة والتشخيص | core (v19.8) + ui/jev.js | الأدوات المتقدمة › النظام | `aghnam-v17-runtime-errors`, `skosif_error_log` | SKosifCore, Engine | Working | Keep |
| `governance` | الحوكمة والجاهزية | core (v18/v19) + ui/core/audit.js | الأدوات المتقدمة › النظام | `aghnam-pricing-v3`, `skosif_audit_trail` | SKosifCore, Engine | Working | Keep |
| `capabilitiesv2` | الصلاحيات ومساحات العمل | ui/capabilities-v2.js + capabilities-v2/worker.js | الأدوات المتقدمة › النظام | `skosif_cap_v2_config`, `skosif_cap_v2_local_workspace` | SKosifCore | Working | Keep |
| `settings` | الإعدادات والمظهر | core + ui/shell.js | الأدوات المتقدمة › النظام | `aghnam-pricing-v3`, `skosif_prefs` | SKosifCore, Engine | Working | Keep |

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
