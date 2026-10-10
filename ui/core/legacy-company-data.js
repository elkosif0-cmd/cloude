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
SK.legacyCompanyData=Object.freeze({read,owned,currentCompanyId:company});
})();