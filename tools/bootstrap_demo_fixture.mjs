// Focused in-memory IndexedDB boundary: only APIs used by actual public demo seed/snapshot.
// No browser, disk database, network, or private data.
export function memoryIDB(){
 const dbs=new Map();
 const factory={
  databases:async()=>[...dbs].map(([name,d])=>({name,version:d.version})),
  open(name,version){const req={};setImmediate(()=>{
   let d=dbs.get(name),upgrade=!d;if(!d){d={version:version||1,stores:new Map()};dbs.set(name,d)}
   if(version&&version>d.version){d.version=version;upgrade=true}
   const api={version:d.version,get objectStoreNames(){const a=[...d.stores.keys()];a.contains=n=>d.stores.has(n);return a},
    createObjectStore(n,options={}){d.stores.set(n,{keyPath:options.keyPath??null,rows:new Map()})},close(){},
    transaction(names,mode='readonly'){const tx={},scope=new Set(Array.isArray(names)?names:[names]);let pending=0,done=false,state='waiting';const tasks=[];
     if(!d.transactions)d.transactions=[];
     const record={scope,mode,done:false,start};d.transactions.push(record);
     function overlaps(a,b){return [...a.scope].some(n=>b.scope.has(n))}
     function start(){if(state!=='waiting'||d.transactions.some(x=>x===record?false:!x.done&&d.transactions.indexOf(x)<d.transactions.indexOf(record)&&overlaps(x,record)&&(x.mode==='readwrite'||record.mode==='readwrite')))return;
      state='running';for(const fn of tasks.splice(0))setImmediate(fn);finish();
     }
     const schedule=fn=>state==='running'?setImmediate(fn):tasks.push(fn);
     const finish=()=>setImmediate(()=>{if(state==='running'&&!pending&&!done){done=true;record.done=true;tx.oncomplete?.();for(const r of d.transactions)r.start()}});
     const request=fn=>{const q={};pending++;schedule(()=>{try{q.result=fn();q.onsuccess?.()}catch(e){q.error=e;q.onerror?.();tx.error=e;tx.onerror?.()}finally{pending--;finish()}});return q};
     tx.objectStore=n=>{if(!scope.has(n))throw Error('Store outside transaction '+n);const s=d.stores.get(n);if(!s)throw Error('Missing store '+n);return {keyPath:s.keyPath,
      count:()=>request(()=>s.rows.size),get:k=>request(()=>structuredClone(s.rows.get(k))),
      put:(v,k)=>request(()=>{const key=s.keyPath?v[s.keyPath]:k;s.rows.set(key,structuredClone(v));return key}),
      clear:()=>request(()=>s.rows.clear()),
      openCursor(){const q={};let entries=null,i=0;pending++;const step=()=>schedule(()=>{
       if(entries===null)entries=[...s.rows];
       if(i>=entries.length){q.result=null;q.onsuccess?.();pending--;finish();return}
       const [key,val]=entries[i++];q.result={primaryKey:key,key,value:structuredClone(val),continue:step,delete:()=>s.rows.delete(key)};q.onsuccess?.()
      });step();return q}
     }};setImmediate(start);return tx}

   };req.result=api;if(upgrade)req.onupgradeneeded?.();req.onsuccess?.()
  });return req}
 };
 return {factory,dbs};
}
export async function seedCompleteDemo(h){
 const idb=memoryIDB(),errors=[];h.W.indexedDB=idb.factory;h.W.SK.errors.report=(e,where)=>errors.push({where,message:e.message});
 h.W.SKosifCore.catalog=()=>({items:[]});h.W.SK.view=()=>{};h.W.SK.ui={uid:(()=>{let n=0;return p=>p+'-synthetic-'+(++n)})()};
 h.W.SKosifSpace.current();h.run('ui/features/ledger.js');h.run('ui/features/advances.js');h.run('ui/core/demo.js');
 const filled=await h.W.SK.demo.fill(null,{quiet:true});
 return {idb:{...idb,rows:store=>idb.dbs.get('aghnam-app-v7')?.stores.get(store)?.rows},filled,errors};
}

import fs from 'node:fs';
import zlib from 'node:zlib';
import vm from 'node:vm';
// Execute only public factory/normalizer code. SEED arrays are explicitly empty synthetic inputs;
// no embedded company records or browser startup script is evaluated.
export function corePricingFactory(h){
 const dir=new URL('../payload/',import.meta.url),encoded=fs.readdirSync(dir).filter(f=>/^index.html.gz.b64.part/.test(f)).sort().map(f=>fs.readFileSync(new URL(f,dir),'utf8').trim()).join('');
 const source=zlib.gunzipSync(Buffer.from(encoded,'base64')).toString().replace(/\r\n/g,'\n');
 const functionSource=name=>{const start=source.indexOf('function '+name+'(');if(start<0)throw Error('Missing public function '+name);return source.slice(start,source.indexOf('\n}',start)+2)};
 const settings=source.match(/const DEF_SETTINGS = .*?;\n/)[0],yieldSource=source.match(/const DEF_YIELD = \(\) => \(\{[\s\S]*?\n\}\);/)[0];
 const c=vm.createContext({Date,Set,Map,APP_SCHEMA_VERSION:Number(source.match(/const APP_SCHEMA_VERSION = (\d+);/)[1]),SEED_RAWS:[],SEED_BOXES:[],SEED_EXPS:[],clone:x=>structuredClone(x),num:h.W.SK.num,today:()=>new Date().toISOString().slice(0,10),nowIso:()=>new Date().toISOString()});
 vm.runInContext(settings+yieldSource+functionSource('normalizeArabicSearch')+'\nconst normName=value=>normalizeArabicSearch(value);\nconst memoRef=n=>`APPR-${new Date().getFullYear()}-${String(n).padStart(3,"0")}`;\nconst blankSign=prep=>({prepName:prep||"",prepNotes:"",finName:"",finNotes:"",decision:"approved",execName:"",execNotes:""});\nconst blankMemo=(n,prep)=>({ref:memoRef(n),date:today(),reason:"",items:[],sign:blankSign(prep)});\n'+functionSource('ensureDomainState')+'\n'+functionSource('seedState')+'\nthis.initial=seedState();this.normalize=ensureDomainState;',c);
 return {initial:structuredClone(c.initial),normalize:v=>structuredClone(c.normalize(structuredClone(v)))};
}
