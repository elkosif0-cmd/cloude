/* S.kosif core — data adapters and full backup (SK.store).
   One backup for the whole app: every app localStorage key + every IndexedDB store of
   aghnam-app-v7. Restore is two-step: a dry run returns a preview without writing;
   applying it first keeps a pre-restore snapshot so rollback() can undo it. data() returns the
   same backup object without downloading it (the encrypted iPhone ⇄ laptop transfer uses it). */
(()=>{
"use strict";
const DB="aghnam-app-v7",PREFIX=/^(aghnam|skosif|kosif|s_kosif|sales_customer_followup)/,FORMAT="skosif-backup",VERSION=2;
const SKIP=new Set(["skosif_error_log","skosif_ai_keys","skosif_chat_v1"]);/* the Gemini key never leaves this device */
let snapshot=null;

function appKeys(){const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&PREFIX.test(k)&&!SKIP.has(k))out.push(k)}return out.sort()}
function openDb(){
  return new Promise((res,rej)=>{
    if(!("indexedDB" in window))return res(null);
    let r;try{r=indexedDB.open(DB)}catch{return res(null)}
    r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);
    r.onupgradeneeded=()=>{/* the database does not exist yet: nothing to back up */};
  });
}
const reqP=q=>new Promise((res,rej)=>{q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
async function idbAll(store){const db=await openDb();if(!db||!db.objectStoreNames.contains(store))return[];return reqP(db.transaction(store).objectStore(store).getAll())}
async function readIdb(){
  const db=await openDb();if(!db)return{};
  const out={};
  for(const name of [...db.objectStoreNames])out[name]=await reqP(db.transaction(name).objectStore(name).getAll());
  db.close();return out;
}
async function writeIdb(stores){
  const db=await openDb();if(!db)throw new Error("قاعدة البيانات المحلية غير متاحة");
  for(const [name,rows] of Object.entries(stores||{})){
    if(!db.objectStoreNames.contains(name))continue;
    await new Promise((res,rej)=>{const tx=db.transaction(name,"readwrite"),st=tx.objectStore(name);st.clear();(rows||[]).forEach(r=>st.put(r));tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)});
  }
  db.close();
}
async function sha256(text){
  if(!(window.crypto&&crypto.subtle))return "";
  const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function collect(){
  const local={};appKeys().forEach(k=>{local[k]=localStorage.getItem(k)});
  const idb=await readIdb();
  const body=JSON.stringify({local,idb});
  return{format:FORMAT,version:VERSION,app:"SQC",createdAt:new Date().toISOString(),
    counts:{keys:Object.keys(local).length,rows:Object.fromEntries(Object.entries(idb).map(([k,v])=>[k,v.length]))},
    sha256:await sha256(body),local,idb};
}
async function backup(){
  const b=await collect();
  SK.download("SQC-backup-"+b.createdAt.slice(0,10)+".json",new Blob([JSON.stringify(b)],{type:"application/json"}));
  SK.bus&&SK.bus.emit("backup",{keys:b.counts.keys,rows:b.counts.rows});
  return b.counts;
}
async function parse(fileOrText){
  const text=typeof fileOrText==="string"?fileOrText:await fileOrText.text();
  let b;try{b=JSON.parse(text)}catch{throw new Error("الملف ليس JSON صالحاً")}
  if(b&&b.format===FORMAT){
    const sum=await sha256(JSON.stringify({local:b.local,idb:b.idb}));
    if(b.sha256&&sum&&sum!==b.sha256)throw new Error("بصمة الملف لا تطابق محتواه — الملف معدّل أو تالف");
    return{local:b.local||{},idb:b.idb||{},createdAt:b.createdAt};
  }
  /* earlier settings-card export: {app:"S.kosif",data:{key:value}} (the name before SQC) */
  if(b&&(b.app==="SQC"||b.app==="S.kosif")&&b.data&&typeof b.data==="object"){
    const local={};Object.entries(b.data).forEach(([k,v])=>{if(PREFIX.test(k))local[k]=typeof v==="string"?v:JSON.stringify(v)});
    return{local,idb:{},createdAt:b.exportedAt};
  }
  throw new Error("هذا ليس ملف نسخة احتياطية من SQC");
}
/* dry run: what would change, nothing is written */
async function preview(fileOrText){
  const b=await parse(fileOrText),cur=appKeys();
  const keys={add:[],change:[],same:[]};
  Object.entries(b.local).forEach(([k,v])=>{const now=localStorage.getItem(k);if(now==null)keys.add.push(k);else if(now!==v)keys.change.push(k);else keys.same.push(k)});
  const keep=cur.filter(k=>!(k in b.local));
  const rows=Object.fromEntries(Object.entries(b.idb).map(([k,v])=>[k,(v||[]).length]));
  return{createdAt:b.createdAt,keys,untouched:keep,rows,_b:b};
}
async function restore(fileOrText,opts={}){
  const p=await preview(fileOrText);
  if(opts.dryRun)return p;
  snapshot=await collect();
  const b=p._b;
  Object.entries(b.local).forEach(([k,v])=>{try{localStorage.setItem(k,v)}catch{throw new Error("مساحة التخزين لا تكفي لاستعادة "+k)}});
  if(Object.keys(b.idb).length)await writeIdb(b.idb);
  SK.bus&&SK.bus.emit("restore",{keys:Object.keys(b.local).length,rows:p.rows});
  return p;
}
async function rollback(){
  if(!snapshot)throw new Error("لا توجد نقطة استرجاع في هذه الجلسة");
  const s=snapshot;
  appKeys().forEach(k=>{if(!(k in s.local))localStorage.removeItem(k)});
  Object.entries(s.local).forEach(([k,v])=>localStorage.setItem(k,v));
  await writeIdb(s.idb);
  snapshot=null;
  SK.bus&&SK.bus.emit("restore",{rollback:true});
}
function downloadSnapshot(){if(snapshot)SK.download("SQC-before-restore-"+snapshot.createdAt.slice(0,19).replace(/:/g,"")+".json",new Blob([JSON.stringify(snapshot)],{type:"application/json"}))}
function usage(){let bytes=0;const keys=appKeys();keys.forEach(k=>{bytes+=(localStorage.getItem(k)||"").length*2});return{keys:keys.length,bytes}}

SK.store=Object.freeze({keys:appKeys,idbAll,data:collect,backup,preview,restore,rollback,hasSnapshot:()=>!!snapshot,downloadSnapshot,usage});
})();
