import {loadRawItems,loadBoxItems,loadExpenses,loadSettings,loadAuditLogs,saveRawItems,saveBoxItems,saveExpenses} from '../../storage/localStorage';
import type {RawItem,BoxItem,ExpenseItem} from '../../types/pricing';
import type {Customer,Order} from '../../types/commerce';
import {privateCatalog} from './bootstrap';
import {appEvents} from '../core/events';
const read=<T>(k:string,d:T):T=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return(v??d)as T}catch{return d}};
const write=(k:string,v:unknown)=>localStorage.setItem(k,JSON.stringify(v));
export interface InventoryState{stock:Record<string,number>;reorder:Record<string,number>;moves:any[];counts:any[]}
export const repos={
 settings:()=>loadSettings(),
 raws:()=>loadRawItems(),
 boxes:()=>loadBoxItems(),
 expenses:()=>loadExpenses(),
 audit:()=>loadAuditLogs(),
 customers:()=>read<Customer[]>('aghn_customers_v19',[]),
 orders:()=>read<Order[]>('aghn_orders_v19',[]),
 inventory:()=>read<InventoryState>('skosif_erp_inventory_v1',{stock:{},reorder:{},moves:[],counts:[]}),
 expiry:()=>read<any[]>('skosif_inv_expiry_batches',[]),
 supplierBatches:()=>read<any[]>('skosif_v31_supplier_batches',[]),
 finance:()=>read<{flows:any[]}>('skosif_erp_finance_v1',{flows:[]}),
 incomeStatements:()=>read<any[]>('skosif_income_statements_v1',[]),
 payables:()=>read<{rows:any[]}>('skosif_erp_payables_v1',{rows:[]}),
 jevLog:()=>read<any[]>('aghnam_v29_jev_log',[]),
 migration:()=>read<any>('skosif_rebuild_migration_v1',null),
 saveInventory(v:InventoryState){write('skosif_erp_inventory_v1',v);appEvents.emit('inventory.changed')},
 saveFinance(v:{flows:any[]}){write('skosif_erp_finance_v1',v);appEvents.emit('finance.changed')},
 saveIncomeStatements(v:any[]){write('skosif_income_statements_v1',v);appEvents.emit('income_statement.saved')},
 saveCustomers(v:Customer[]){write('aghn_customers_v19',v);appEvents.emit('customer.changed')},
 saveOrders(v:Order[]){write('aghn_orders_v19',v);appEvents.emit('order.changed')},
};
export function migratePrivateCatalog():{changed:boolean;counts:Record<string,number>;warnings:string[]}{
 const p=privateCatalog(),warnings:string[]=[];let changed=false;
 const currentR=loadRawItems(),currentB=loadBoxItems(),currentE=loadExpenses();
 // The private block can contain a historical shape. Only import when canonical user collections are empty;
 // otherwise it is preserved as encrypted bootstrap evidence and never overwrites user edits.
 if(!currentR.length&&p.raws.length){try{saveRawItems(p.raws as RawItem[]);changed=true}catch{warnings.push('تعذر تحويل المواد الخام الخاصة تلقائياً')}} 
 if(!currentB.length&&p.boxes.length){try{saveBoxItems(p.boxes as BoxItem[]);changed=true}catch{warnings.push('تعذر تحويل البوكسات الخاصة تلقائياً')}}
 if(!currentE.length&&p.expenses.length){try{saveExpenses(p.expenses as ExpenseItem[]);changed=true}catch{warnings.push('تعذر تحويل المصروفات الخاصة تلقائياً')}}
 const manifest={version:1,at:new Date().toISOString(),changed,counts:{privateRaws:p.raws.length,privateBoxes:p.boxes.length,privateExpenses:p.expenses.length,canonicalRaws:loadRawItems().length,canonicalBoxes:loadBoxItems().length,canonicalExpenses:loadExpenses().length},warnings};
 write('skosif_rebuild_migration_v1',manifest);return manifest;
}
export async function readIdbStore(dbNames:string[],store:string):Promise<any[]>{
 for(const name of dbNames){const result=await new Promise<any[]|null>(resolve=>{let req:IDBOpenDBRequest;try{req=indexedDB.open(name)}catch{return resolve(null)};let upgraded=false;req.onupgradeneeded=e=>{upgraded=true;try{(e.target as IDBOpenDBRequest).transaction?.abort()}catch{}};req.onerror=()=>resolve(null);req.onsuccess=()=>{const db=req.result;if(upgraded||!db.objectStoreNames.contains(store)){db.close();return resolve(null)};const g=db.transaction(store,'readonly').objectStore(store).getAll();g.onsuccess=()=>{const v=g.result||[];db.close();resolve(v)};g.onerror=()=>{db.close();resolve(null)}}});if(result)return result}
 return[];
}
