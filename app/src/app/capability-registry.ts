import type {CapabilityDefinition} from './capability-types';

export type RegistryIssue = { kind:'id'|'route'|'decision'; value:string };

export const coreCapabilities: CapabilityDefinition[] = [
  { id:'home.command-center', label:'مركز القيادة', route:'/', domain:'home', decision:'REBUILD' },

  { id:'sales.orders', label:'الطلبات والمبيعات', route:'/sales/orders', domain:'sales', decision:'REBUILD' },
  { id:'sales.customers', label:'العملاء', route:'/sales/customers', domain:'sales', decision:'MERGE' },
  { id:'sales.margin', label:'هامش الربح', route:'/sales/margin', domain:'sales', decision:'MERGE' },
  { id:'sales.posting', label:'ترحيل المبيعات', route:'/sales/posting', domain:'sales', decision:'REBUILD' },
  { id:'sales.tax-invoice', label:'الفاتورة الضريبية والمدفوعات', route:'/sales/tax-invoice', domain:'sales', decision:'REBUILD' },

  { id:'stock.inventory', label:'المخزون', route:'/stock/inventory', domain:'stock', decision:'MERGE' },
  { id:'stock.movements', label:'حركات المخزون', route:'/stock/movements', domain:'stock', decision:'REBUILD' },
  { id:'stock.yield', label:'اقتصاديات العائد والهدر', route:'/stock/yield', domain:'stock', decision:'MERGE' },
  { id:'stock.traceability', label:'التتبع والصلاحية والتبريد', route:'/stock/traceability', domain:'stock', decision:'REBUILD' },
  { id:'stock.blending', label:'خلطات اللحوم', route:'/stock/blending', domain:'stock', decision:'MERGE' },
  { id:'stock.culinary', label:'دليل الشيف', route:'/stock/culinary', domain:'stock', decision:'MERGE' },

  { id:'procurement.orders', label:'أوامر الشراء', route:'/procurement/orders', domain:'procurement', decision:'REBUILD' },
  { id:'procurement.receipts', label:'الاستلام ومطابقة الكميات', route:'/procurement/receipts', domain:'procurement', decision:'REBUILD' },
  { id:'procurement.suppliers', label:'الموردون', route:'/procurement/suppliers', domain:'procurement', decision:'MERGE' },
  { id:'procurement.posting', label:'ترحيل الاستلام', route:'/procurement/posting', domain:'procurement', decision:'REBUILD' },

  { id:'finance.accounts', label:'دليل الحسابات', route:'/finance/accounts', domain:'finance', decision:'REBUILD' },
  { id:'finance.journals', label:'القيود اليومية', route:'/finance/journals', domain:'finance', decision:'REBUILD' },
  { id:'finance.general-ledger', label:'الأستاذ العام', route:'/finance/general-ledger', domain:'finance', decision:'REBUILD' },
  { id:'finance.trial-balance', label:'ميزان المراجعة', route:'/finance/trial-balance', domain:'finance', decision:'REBUILD' },
  { id:'finance.receivables', label:'الذمم المدينة', route:'/finance/receivables', domain:'finance', decision:'MERGE' },
  { id:'finance.payables', label:'الذمم الدائنة', route:'/finance/payables', domain:'finance', decision:'MERGE' },
  { id:'finance.reconciliation', label:'المطابقات', route:'/finance/reconciliation', domain:'finance', decision:'REBUILD' },
  { id:'finance.cash-flow', label:'التدفق النقدي', route:'/finance/cash-flow', domain:'finance', decision:'REBUILD' },

  { id:'audit.planning', label:'تخطيط المراجعة', route:'/audit/planning', domain:'audit', decision:'REBUILD' },
  { id:'audit.journal-analytics', label:'تحليل القيود', route:'/audit/journal-analytics', domain:'audit', decision:'MERGE' },
  { id:'audit.materiality', label:'الأهمية النسبية', route:'/audit/materiality', domain:'audit', decision:'MERGE' },
  { id:'audit.sampling', label:'العينات', route:'/audit/sampling', domain:'audit', decision:'MERGE' },
  { id:'audit.pbc', label:'طلبات PBC', route:'/audit/pbc', domain:'audit', decision:'MERGE' },
  { id:'audit.issues', label:'ملاحظات المراجعة', route:'/audit/issues', domain:'audit', decision:'MERGE' },
  { id:'audit.evidence', label:'أدلة المراجعة', route:'/audit/evidence', domain:'audit', decision:'REBUILD' },
  { id:'audit.workpapers', label:'أوراق العمل', route:'/audit/workpapers', domain:'audit', decision:'REBUILD' },
  { id:'audit.standards', label:'مكتبة المعايير', route:'/audit/standards', domain:'audit', decision:'REBUILD' },
  { id:'audit.report', label:'تقرير المراجع', route:'/audit/report', domain:'audit', decision:'REBUILD' },

  { id:'catalog.items', label:'الأصناف والكتالوج', route:'/catalog/items', domain:'catalog', decision:'MERGE' },
  { id:'catalog.pricing', label:'التكلفة والتسعير', route:'/catalog/pricing', domain:'catalog', decision:'MERGE' },
  { id:'catalog.offers', label:'العروض واعتماد الأسعار', route:'/catalog/offers', domain:'catalog', decision:'REBUILD' },
  { id:'catalog.labels', label:'ملصقات الموازين', route:'/catalog/labels', domain:'catalog', decision:'MERGE' },
  { id:'catalog.scanner', label:'ماسح الباركود', route:'/catalog/scanner', domain:'catalog', decision:'MERGE' },
  { id:'catalog.box-builder', label:'بناء البوكسات', route:'/catalog/box-builder', domain:'catalog', decision:'MERGE' },

  { id:'intelligence.decision-center', label:'مركز القرار', route:'/intelligence/decision-center', domain:'intelligence', decision:'MERGE' },
  { id:'intelligence.jev', label:'Jev', route:'/intelligence/jev', domain:'intelligence', decision:'MERGE' },
  { id:'intelligence.council', label:'مجلس الذكاء', route:'/intelligence/council', domain:'intelligence', decision:'REBUILD' },

  { id:'reports.executive', label:'التحليلات التنفيذية', route:'/reports/executive', domain:'reports', decision:'REBUILD' },
  { id:'reports.smart-match', label:'مطابقة المبيعات الذكية', route:'/reports/smart-match', domain:'reports', decision:'MERGE' },
  { id:'reports.excel-recon', label:'مطابقة الإكسل', route:'/reports/excel-recon', domain:'reports', decision:'MERGE' },
  { id:'reports.exports', label:'التقارير والتصدير', route:'/reports/exports', domain:'reports', decision:'MERGE' },

  { id:'system.companies', label:'الشركات والفترات', route:'/system/companies', domain:'system', decision:'REBUILD' },
  { id:'system.permissions', label:'الصلاحيات', route:'/system/permissions', domain:'system', decision:'REBUILD' },
  { id:'system.integrations', label:'التكاملات', route:'/system/integrations', domain:'system', decision:'REBUILD' },
  { id:'system.legacy-migration', label:'نقل البيانات القديمة', route:'/system/legacy-migration', domain:'system', decision:'REBUILD' },
  { id:'system.governance', label:'الحوكمة والنسخ الاحتياطي', route:'/system/governance', domain:'system', decision:'REBUILD' },
];

export function inspectEntries(entries:CapabilityDefinition[]):RegistryIssue[]{
  const issues:RegistryIssue[]=[];
  const ids=new Set<string>();
  const routes=new Set<string>();
  for(const entry of entries){
    if(ids.has(entry.id)) issues.push({kind:'id',value:entry.id});
    ids.add(entry.id);
    if(routes.has(entry.route)) issues.push({kind:'route',value:entry.route});
    routes.add(entry.route);
    if(!entry.decision) issues.push({kind:'decision',value:entry.id});
  }
  return issues;
}
