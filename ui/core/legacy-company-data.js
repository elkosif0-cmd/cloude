/* Company-scoped read-only compatibility adapter for old, device-wide IndexedDB.
   Not a substitute for server authorization, and never migrates/adopts orphan data. */
(()=>{
"use strict";
const DB="aghnam-app-v7",ALLOWED=new Set(["customers","sales_lines","orders","order_items","payments","sales_descriptions","customer_master_rows","ops_orders"]);
const company=()=>String(window.SK?.company?.current?.()?.id||"").trim();
const busy=()=>!!window.SKosifSpace?.busy?.();
/* The lifecycle token changes even when a user switches A -> B -> A while an IDB read is pending. */
const lifecycle=()=>window.SKosifSpace?.chatScopeSnapshot?.()?.token??null;
function owned(rows,id){
  if(!id||!Array.isArray(rows))return[];
  return rows.filter(r=>r&&typeof r==="object"&&!Array.isArray(r)&&(
    (typeof r.companyId==="string"&&r.companyId===id)||
    (id==="demo-co"&&r.demo===true&&r.companyId==null)
  ));
}
async function read(store){
  if(!ALLOWED.has(store))return[];
  const id=company(),scopeAtStart=lifecycle();
  if(!id||busy())return[];
  let rows=[];
  try{rows=await new Promise(resolve=>{
    let q;try{q=indexedDB.open(DB)}catch{return resolve([])}
    q.onupgradeneeded=()=>{try{q.transaction.abort()}catch{}};
    q.onerror=()=>resolve([]);
    q.onsuccess=()=>{
      const db=q.result;
      if(!db.objectStoreNames.contains(store)){db.close();return resolve([])}
      const t=db.transaction(store,"readonly"),s=t.objectStore(store).getAll();
      s.onsuccess=()=>{db.close();resolve(s.result||[])};
      s.onerror=()=>{db.close();resolve([])};
      t.onabort=()=>{db.close();resolve([])};
    };
  })}catch{return[]}
  if(company()!==id||busy()||scopeAtStart!==lifecycle())return[];
  return owned(rows,id);
}
/* Limited company export: a non-restorable convenience snapshot, NOT a full
   device backup or server proof of authorization. Store writes remain untouched. */
const SNAPSHOT_STORES=Object.freeze(["customers","sales_lines","orders"]);
function nestedForeignOwner(value,id){
  const pending=[value],visited=new WeakSet();let traversed=0;
  while(pending.length){
    const next=pending.pop();
    if(!next||typeof next!=="object"||visited.has(next))continue;
    visited.add(next);
    if(++traversed>10000) return true; /* fail closed on unusual data */
    if(typeof next.companyId==="string"&&next.companyId!==id)return true;
    for(const v of Object.values(next))if(v&&typeof v==="object")pending.push(v);
  }
  return false;
}
async function snapshot(){
  const id=company(),token=lifecycle();
  const active=()=>company()===id&&!busy()&&lifecycle()===token&&
    (!window.SKosifSpace?.current||window.SKosifSpace.current()?.id===id);
  if(!id||!active())throw new Error("COMPANY_EXPORT_SCOPE_NOT_READY");
  const stores={};
  for(const store of SNAPSHOT_STORES){
    const entries=await read(store);
    if(!active())throw new Error("COMPANY_EXPORT_SCOPE_CHANGED");
    stores[store]=entries.filter(row=>row?.companyId===id&&!nestedForeignOwner(row,id));
  }
  if(!active())throw new Error("COMPANY_EXPORT_SCOPE_CHANGED");
  return {
    format:"kosif-company-scoped-local-export",version:1,
    createdAt:new Date().toISOString(),scope:{companyId:id},
    restorable:false,authorization:"local-owner-markers-only-not-server-verified",
    excluded:"other-company rows, untagged records, app localStorage, attachments, backup settings, and unverified IDB stores",
    counts:Object.fromEntries(SNAPSHOT_STORES.map(store=>[store,stores[store].length])),stores
  };
}
SK.legacyCompanyData=Object.freeze({read,owned,currentCompanyId:company,snapshot});
})();