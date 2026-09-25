import type {CapabilityDefinition} from './capability-types';

export type RegistryIssue = { kind:'id'|'route'|'decision'; value:string };

export const coreCapabilities: CapabilityDefinition[] = [
  { id:'home.command-center', label:'مركز القيادة', route:'/', domain:'home', decision:'REBUILD' },

  { id:'sales.orders', label:'الطلبات والمبيعات', route:'/sales/orders', domain:'sales', decision:'REBUILD' },
  { id:'sales.customers', label:'العملاء', route:'/sales/customers', domain:'sales', decision:'MERGE' },
  { id:'sales.margin', label:'هامش الربح', route:'/sales/margin', domain:'sales', decision:'MERGE' },

  { id:'stock.inventory', label:'المخزون', route:'/stock/inventory', domain:'stock', decision:'MERGE' },
  { id:'stock.movements', label:'حركات المخزون', route:'/stock/movements', domain:'stock', decision:'REBUILD' },

  { id:'procurement.orders', label:'أوامر الشراء', route:'/procurement/orders', domain:'procurement', decision:'REBUILD' },
  { id:'procurement.receipts', label:'الاستلام ومطابقة الكميات', route:'/procurement/receipts', domain:'procurement', decision:'REBUILD' },
  { id:'procurement.suppliers', label:'الموردون', route:'/procurement/suppliers', domain:'procurement', decision:'MERGE' },

  { id:'finance.accounts', label:'دليل الحسابات', route:'/finance/accounts', domain:'finance', decision:'REBUILD' },
  { id:'finance.journals', label:'القيود اليومية', route:'/finance/journals', domain:'finance', decision:'REBUILD' },
  { id:'finance.general-ledger', label:'الأستاذ العام', route:'/finance/general-ledger', domain:'finance', decision:'REBUILD' },
  { id:'finance.trial-balance', label:'ميزان المراجعة', route:'/finance/trial-balance', domain:'finance', decision:'REBUILD' },
  { id:'finance.receivables', label:'الذمم المدينة', route:'/finance/receivables', domain:'finance', decision:'MERGE' },

  { id:'audit.planning', label:'تخطيط المراجعة', route:'/audit/planning', domain:'audit', decision:'REBUILD' },
  { id:'audit.journal-analytics', label:'تحليل القيود', route:'/audit/journal-analytics', domain:'audit', decision:'MERGE' },
  { id:'audit.materiality', label:'الأهمية النسبية', route:'/audit/materiality', domain:'audit', decision:'MERGE' },
  { id:'audit.sampling', label:'العينات', route:'/audit/sampling', domain:'audit', decision:'MERGE' },
  { id:'audit.pbc', label:'طلبات PBC', route:'/audit/pbc', domain:'audit', decision:'MERGE' },
  { id:'audit.issues', label:'ملاحظات المراجعة', route:'/audit/issues', domain:'audit', decision:'MERGE' },

  { id:'catalog.items', label:'الأصناف والكتالوج', route:'/catalog/items', domain:'catalog', decision:'MERGE' },
  { id:'catalog.pricing', label:'التكلفة والتسعير', route:'/catalog/pricing', domain:'catalog', decision:'MERGE' },

  { id:'intelligence.jev', label:'Jev', route:'/intelligence/jev', domain:'intelligence', decision:'MERGE' },
  { id:'intelligence.council', label:'مجلس الذكاء', route:'/intelligence/council', domain:'intelligence', decision:'REBUILD' },

  { id:'reports.executive', label:'التحليلات التنفيذية', route:'/reports/executive', domain:'reports', decision:'REBUILD' },
  { id:'reports.exports', label:'التقارير والتصدير', route:'/reports/exports', domain:'reports', decision:'MERGE' },

  { id:'system.companies', label:'الشركات والفترات', route:'/system/companies', domain:'system', decision:'REBUILD' },
  { id:'system.permissions', label:'الصلاحيات', route:'/system/permissions', domain:'system', decision:'REBUILD' },
  { id:'system.integrations', label:'التكاملات', route:'/system/integrations', domain:'system', decision:'REBUILD' },
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
