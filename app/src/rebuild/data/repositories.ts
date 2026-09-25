import type {RawItem,BoxItem,ExpenseItem} from '../../types/pricing';
import type {AppSettings} from '../../types/settings';
import type {Customer,Order,SalesLine,OrderItem,Payment,SalesDescription} from '../../types/commerce';
import type {AuditLogEntry} from '../../types/audit';
import {privateCatalog} from './bootstrap';
import {appEvents} from '../core/events';

const read=<T>(k:string,d:T):T=>{try{const raw=localStorage.getItem(k);if(raw===null)return d;const v=JSON.parse(raw);return(v??d)as T}catch{return d}};
const has=(k:string)=>{try{return localStorage.getItem(k)!==null}catch{return false}};
const write=(k:string,v:unknown)=>localStorage.setItem(k,JSON.stringify(v));

const KEYS={
 settings:'aghn_settings_v19',raws:'aghn_raws_v19',boxes:'aghn_boxes_v19',expenses:'aghn_expenses_v19',
 audit:'aghn_audit_v19',customers:'aghn_customers_v19',orders:'aghn_orders_v19',
 salesLines:'skosif_rebuild_sales_lines_v1',salesDescriptions:'skosif_rebuild_sales_descriptions_v1',orderItems:'skosif_rebuild_order_items_v1',payments:'skosif_rebuild_payments_v1',
 inventory:'skosif_erp_inventory_v1',expiry:'skosif_inv_expiry_batches',supplierBatches:'skosif_v31_supplier_batches',
 finance:'skosif_erp_finance_v1',income:'skosif_income_statements_v1',payables:'skosif_erp_payables_v1',
 jev:'aghnam_v29_jev_log',migration:'skosif_rebuild_migration_v1',
 trace:'skosif_v38_batches',cold:'skosif_v38_coldchain',credit:'skosif_v38_ledger',
 aging:'skosif_ops_aging_chamber',subscriptions:'skosif_ops_subscriptions',poHistory:'skosif_ops_po_history',
 butcherShifts:'skosif_ops_butcher_shifts',batchOrders:'skosif_v38_batch_orders'
} as const;

const DEFAULT_SETTINGS:AppSettings={
 companyName:'S.kosif',logoUrl:'',vatNumber:'',commercialRegister:'',phone:'',address:'',reportPreparerName:'',
 defaultVatRate:.15,targetProfitMargin:.20,excellentThreshold:.25,goodThreshold:.15,wasteMethod:'yield',
 marginBasis:'net',costDisplayMethod:'net',roundingMethod:'twoDecimals',purchaseVatReviewActive:true,
 suppliers:[],currencies:[{code:'SAR',nameAr:'ريال سعودي',rateToSar:1,symbol:'ر.س'}],activeCurrencyCode:'SAR'
};

function catalogCollection<T>(key:string,privateRows:unknown[]):T[]{
 if(has(key))return read<T[]>(key,[]);
 return Array.isArray(privateRows)?privateRows as T[]:[];
}
export interface InventoryState{stock:Record<string,number>;reorder:Record<string,number>;moves:any[];counts:any[]}

export const repos={
 settings:()=>read<AppSettings>(KEYS.settings,DEFAULT_SETTINGS),
 raws:()=>catalogCollection<RawItem>(KEYS.raws,privateCatalog().raws),
 boxes:()=>catalogCollection<BoxItem>(KEYS.boxes,privateCatalog().boxes),
 expenses:()=>catalogCollection<ExpenseItem>(KEYS.expenses,privateCatalog().expenses),
 audit:()=>read<AuditLogEntry[]>(KEYS.audit,[]),
 customers:()=>read<Customer[]>(KEYS.customers,[]),
 orders:()=>read<Order[]>(KEYS.orders,[]),
 salesLines:()=>read<SalesLine[]>(KEYS.salesLines,[]),
 salesDescriptions:()=>read<SalesDescription[]>(KEYS.salesDescriptions,[]),
 orderItems:()=>read<OrderItem[]>(KEYS.orderItems,[]),
 payments:()=>read<Payment[]>(KEYS.payments,[]),
 inventory:()=>read<InventoryState>(KEYS.inventory,{stock:{},reorder:{},moves:[],counts:[]}),
 expiry:()=>read<any[]>(KEYS.expiry,[]),
 supplierBatches:()=>read<any[]>(KEYS.supplierBatches,[]),
 finance:()=>read<{flows:any[]}>(KEYS.finance,{flows:[]}),
 incomeStatements:()=>read<any[]>(KEYS.income,[]),
 payables:()=>read<{rows:any[]}>(KEYS.payables,{rows:[]}),
 jevLog:()=>read<any[]>(KEYS.jev,[]),
 migration:()=>read<any>(KEYS.migration,null),
 traceBatches:()=>read<any[]>(KEYS.trace,[]),
 coldChain:()=>read<any[]>(KEYS.cold,[]),
 creditLedger:()=>read<any[]>(KEYS.credit,[]),
 agingLots:()=>read<any[]>(KEYS.aging,[]),
 subscriptions:()=>read<any[]>(KEYS.subscriptions,[]),
 poHistory:()=>read<any[]>(KEYS.poHistory,[]),
 butcherShifts:()=>read<any[]>(KEYS.butcherShifts,[]),
 batchOrders:()=>read<any[]>(KEYS.batchOrders,[]),
 saveSettings(v:AppSettings){write(KEYS.settings,v);appEvents.emit('settings.changed')},
 saveRaws(v:RawItem[]){write(KEYS.raws,v);appEvents.emit('catalog.changed',{kind:'raw'})},
 saveBoxes(v:BoxItem[]){write(KEYS.boxes,v);appEvents.emit('catalog.changed',{kind:'box'})},
 saveExpenses(v:ExpenseItem[]){write(KEYS.expenses,v);appEvents.emit('expense.changed')},
 saveInventory(v:InventoryState){write(KEYS.inventory,v);appEvents.emit('inventory.changed')},
 saveExpiry(v:any[]){write(KEYS.expiry,v);appEvents.emit('inventory.expiry.changed')},
 saveSupplierBatches(v:any[]){write(KEYS.supplierBatches,v);appEvents.emit('supplier.batch.changed')},
 saveFinance(v:{flows:any[]}){write(KEYS.finance,v);appEvents.emit('finance.changed')},
 saveIncomeStatements(v:any[]){write(KEYS.income,v);appEvents.emit('income_statement.saved')},
 savePayables(v:{rows:any[]}){write(KEYS.payables,v);appEvents.emit('payables.changed')},
 saveCustomers(v:Customer[]){write(KEYS.customers,v);appEvents.emit('customer.changed')},
 saveOrders(v:Order[]){write(KEYS.orders,v);appEvents.emit('order.changed')},
 saveSalesLines(v:SalesLine[]){write(KEYS.salesLines,v);appEvents.emit('sales.changed')},
 saveSalesDescriptions(v:SalesDescription[]){write(KEYS.salesDescriptions,v);appEvents.emit('sales.changed')},
 saveOrderItems(v:OrderItem[]){write(KEYS.orderItems,v);appEvents.emit('order.changed')},
 savePayments(v:Payment[]){write(KEYS.payments,v);appEvents.emit('payment.changed')},
 saveAudit(v:AuditLogEntry[]){write(KEYS.audit,v);appEvents.emit('audit.changed')},
 saveTraceBatches(v:any[]){write(KEYS.trace,v);appEvents.emit('trace.changed')},
 saveColdChain(v:any[]){write(KEYS.cold,v);appEvents.emit('cold.changed')},
 saveCreditLedger(v:any[]){write(KEYS.credit,v);appEvents.emit('credit.changed')},
 saveAgingLots(v:any[]){write(KEYS.aging,v);appEvents.emit('aging.changed')},
 saveSubscriptions(v:any[]){write(KEYS.subscriptions,v);appEvents.emit('subscription.changed')},
 savePoHistory(v:any[]){write(KEYS.poHistory,v);appEvents.emit('po.changed')},
 saveButcherShifts(v:any[]){write(KEYS.butcherShifts,v);appEvents.emit('butcher.changed')},
 saveBatchOrders(v:any[]){write(KEYS.batchOrders,v);appEvents.emit('batch.changed')},
};

export function appendAudit(entry:Omit<AuditLogEntry,'id'|'timestamp'>){
 const row:AuditLogEntry={...entry,id:'audit-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),timestamp:new Date().toISOString()};
 repos.saveAudit([row,...repos.audit()].slice(0,2000));return row;
}

export function migratePrivateCatalog():{changed:boolean;counts:Record<string,number>;warnings:string[]}{
 const p=privateCatalog(),warnings:string[]=[];let changed=false;
 // Private bootstrap is imported only if the user has never written that canonical collection.
 if(!has(KEYS.raws)&&p.raws.length){write(KEYS.raws,p.raws);changed=true}
 if(!has(KEYS.boxes)&&p.boxes.length){write(KEYS.boxes,p.boxes);changed=true}
 if(!has(KEYS.expenses)&&p.expenses.length){write(KEYS.expenses,p.expenses);changed=true}
 const manifest={version:1,at:new Date().toISOString(),changed,counts:{privateRaws:p.raws.length,privateBoxes:p.boxes.length,privateExpenses:p.expenses.length,canonicalRaws:repos.raws().length,canonicalBoxes:repos.boxes().length,canonicalExpenses:repos.expenses().length},warnings};
 write(KEYS.migration,manifest);return manifest;
}

export async function readIdbStore(dbNames:string[],store:string):Promise<any[]>{
 for(const name of dbNames){
  const result=await new Promise<any[]|null>(resolve=>{let req:IDBOpenDBRequest;try{req=indexedDB.open(name)}catch{return resolve(null)}
   let upgraded=false;req.onupgradeneeded=e=>{upgraded=true;try{(e.target as IDBOpenDBRequest).transaction?.abort()}catch{}};
   req.onerror=()=>resolve(null);req.onsuccess=()=>{const db=req.result;if(upgraded||!db.objectStoreNames.contains(store)){db.close();return resolve(null)}
    const g=db.transaction(store,'readonly').objectStore(store).getAll();g.onsuccess=()=>{const v=g.result||[];db.close();resolve(v)};g.onerror=()=>{db.close();resolve(null)}}});
  if(result)return result;
 }
 return[];
}

export async function migrateIndexedDb():Promise<{customers:number;salesLines:number;salesDescriptions:number;orders:number;orderItems:number;payments:number;warnings:string[]}>{
 const dbNames=['AghnamAlWadiDB_v19','aghnam-app-v7'],warnings:string[]=[];
 const [customers,orders,sales,salesDescriptions,orderItems,payments]=await Promise.all([
  readIdbStore(dbNames,'customers'),readIdbStore(dbNames,'orders'),readIdbStore(dbNames,'sales_lines'),
  readIdbStore(dbNames,'sales_descriptions'),readIdbStore(dbNames,'order_items'),readIdbStore(dbNames,'payments')
 ]);
 if(!has(KEYS.customers)&&customers.length)repos.saveCustomers(customers as Customer[]);
 if(!has(KEYS.orders)&&orders.length)repos.saveOrders(orders as Order[]);
 if(!has(KEYS.salesLines)&&sales.length)repos.saveSalesLines(sales as SalesLine[]);
 if(!has(KEYS.salesDescriptions)&&salesDescriptions.length)repos.saveSalesDescriptions(salesDescriptions as SalesDescription[]);
 if(!has(KEYS.orderItems)&&orderItems.length)repos.saveOrderItems(orderItems as OrderItem[]);
 if(!has(KEYS.payments)&&payments.length)repos.savePayments(payments as Payment[]);
 if(!sales.length)warnings.push('لا توجد أسطر مبيعات في قواعد IndexedDB المعروفة.');
 const counts={customers:customers.length,salesLines:sales.length,salesDescriptions:salesDescriptions.length,orders:orders.length,orderItems:orderItems.length,payments:payments.length};
 const prior=repos.migration()||{};write(KEYS.migration,{...prior,indexedDb:{at:new Date().toISOString(),...counts,warnings}});
 return{...counts,warnings};
}

export function exportLocalSnapshot(){
 const data:Record<string,unknown>={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key)continue;if(key.startsWith('aghn')||key.startsWith('skosif')||key.startsWith('s_kosif')||key.startsWith('kosif')){try{data[key]=JSON.parse(localStorage.getItem(key)||'null')}catch{data[key]=localStorage.getItem(key)}}}
 return{app:'S.kosif',schema:'zero-ui-rebuild-v1',exportedAt:new Date().toISOString(),data};
}
