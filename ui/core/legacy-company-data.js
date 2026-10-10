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
  const active=()=>!!id&&token!=null&&company()===id&&!busy()&&lifecycle()===token&&
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

/* READ-ONLY restore-preview: never call SK.store.restore, write IDB/localStorage,
   trust an unsigned file as identity, or confuse overlapping record IDs with
   verified equal records. The old v1 snapshot is explicitly non-restorable. */
const PREVIEW_MAX_CHARS=3*1024*1024,PREVIEW_MAX_ROWS=25000;
const PREVIEW_ID=/^[\p{L}\p{N}_.:-]{1,128}$/u;
function safeTree(value,companyId){
  const queue=[[value,0]],seen=new WeakSet();let nodes=0;
  while(queue.length){
    const [node,depth]=queue.pop();
    if(!node||typeof node!=="object")continue;
    if(seen.has(node))throw new Error("RESTORE_PREVIEW_CYCLE");
    seen.add(node);
    if(++nodes>50000||depth>32)throw new Error("RESTORE_PREVIEW_COMPLEXITY_LIMIT");
    for(const [key,val] of Object.entries(node)){
      if(["__proto__","constructor","prototype"].includes(key))throw new Error("RESTORE_PREVIEW_UNSAFE_KEY");
      if(key==="companyId"&&val!==companyId)throw new Error("RESTORE_PREVIEW_CROSS_COMPANY_NESTED");
      if(val&&typeof val==="object")queue.push([val,depth+1]);
    }
  }
}
function uniqueIds(rows,store,scope){
  const keys=new Set();
  for(const record of rows){
    if(!record||typeof record!=="object"||Array.isArray(record)||
        record.companyId!==scope)throw new Error("RESTORE_PREVIEW_ROW_OWNER_MISMATCH");
    const value=record.id;
    if(typeof value!=="string"||!PREVIEW_ID.test(value))throw new Error("RESTORE_PREVIEW_ROW_ID_INVALID");
    const key=value.toLowerCase();
    if(keys.has(key))throw new Error("RESTORE_PREVIEW_DUPLICATE_ROW_ID");
    keys.add(key);
    safeTree(record,scope);
  }
  return keys;
}
async function previewRestore(fileText){
  if(typeof fileText!=="string"||fileText.length===0||fileText.length>PREVIEW_MAX_CHARS)
    throw new Error("RESTORE_PREVIEW_FILE_SIZE");
  let pack;try{pack=JSON.parse(fileText)}catch{throw new Error("RESTORE_PREVIEW_JSON_INVALID")}
  if(!pack||typeof pack!=="object"||Array.isArray(pack)||
      pack.format!=="kosif-company-scoped-local-export"||
      pack.version!==1||pack.restorable!==false||
      pack.authorization!=="local-owner-markers-only-not-server-verified")
    throw new Error("RESTORE_PREVIEW_MANIFEST_UNSUPPORTED");
  if(Object.keys(pack).some(key=>["__proto__","constructor","prototype"].includes(key)))
    throw new Error("RESTORE_PREVIEW_UNSAFE_KEY");
  if(Object.keys(pack).some(key=>!["format","version","createdAt","scope","restorable","authorization","excluded","counts","stores"].includes(key)))
    throw new Error("RESTORE_PREVIEW_UNEXPECTED_FIELD");
  const scopeId=company(),epoch=lifecycle();
  const active=()=>scopeId&&epoch!=null&&company()===scopeId&&!busy()&&lifecycle()===epoch&&
    (!window.SKosifSpace?.current||window.SKosifSpace.current()?.id===scopeId);
  if(!active())throw new Error("RESTORE_PREVIEW_SCOPE_NOT_READY");
  if(pack.scope?.companyId!==scopeId||Object.keys(pack.scope||{}).length!==1)
    throw new Error("RESTORE_PREVIEW_CROSS_COMPANY_MANIFEST");
  if(!pack.stores||!pack.counts||
    typeof pack.stores!=="object"||typeof pack.counts!=="object"||
    Array.isArray(pack.stores)||Array.isArray(pack.counts)||
    Object.keys(pack.stores).length!==SNAPSHOT_STORES.length||
    Object.keys(pack.counts).length!==SNAPSHOT_STORES.length)
    throw new Error("RESTORE_PREVIEW_STORES_UNSUPPORTED");
  safeTree(pack,scopeId);
  const result={},allNewOrders=new Set();
  let total=0;
  for(const store of SNAPSHOT_STORES){
    const rows=pack.stores[store];
    if(!Array.isArray(rows)||rows.length>PREVIEW_MAX_ROWS||
        pack.counts[store]!==rows.length)throw new Error("RESTORE_PREVIEW_COUNTS_INVALID");
    total+=rows.length;
    if(total>PREVIEW_MAX_ROWS)throw new Error("RESTORE_PREVIEW_TOTAL_LIMIT");
    const ids=uniqueIds(rows,store,scopeId);
    if(store==="orders")for(const key of ids)allNewOrders.add(key);
    const current=await read(store);
    if(!active())throw new Error("RESTORE_PREVIEW_SCOPE_CHANGED");
    const currentIds=uniqueIds(current.filter(row=>row?.companyId===scopeId),store,scopeId);
    result[store]={
      candidate:rows.length,current:currentIds.size,
      newIdentifiers:[...ids].filter(key=>!currentIds.has(key)).length,
      overlappingIdentifiers:[...ids].filter(key=>currentIds.has(key)).length,
      currentIdentifiersAbsentFromFile:[...currentIds].filter(key=>!ids.has(key)).length
    };
  }
  for(const line of pack.stores.sales_lines){
    if(line.orderId!=null&&(!PREVIEW_ID.test(String(line.orderId))||
       !allNewOrders.has(String(line.orderId).toLowerCase())))
      throw new Error("RESTORE_PREVIEW_ORPHAN_ORDER_ITEM");
  }
  if(!active())throw new Error("RESTORE_PREVIEW_SCOPE_CHANGED");
  return Object.freeze({
    format:"kosif-company-restore-readonly-preview-v1",
    scope:{companyId:scopeId},
    candidateFormat:pack.format,
    status:"checked-for-local-preview-only",
    integrity:"no-server-signature-or-authority",
    restoreAllowed:false,writesPerformed:0,rollbackUsed:false,
    counts:result,
    warning:"File is not restorable; overlapping identifiers are not equal content. Server identity, complete tenant data and custody remain unverified."
  });
}

SK.legacyCompanyData=Object.freeze({read,owned,currentCompanyId:company,snapshot,previewRestore});
})();