import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const src=fs.readFileSync(root+'ui/core/legacy-company-data.js','utf8');
function setup(data,{initial='company-A',wait=false}={}){
 let companyId=initial,busy=false,epoch='scope-1',pending=[],calls=[];
 const fakeDb={objectStoreNames:{contains:s=>Object.hasOwn(data,s)},close:()=>{},
   transaction:store=>({objectStore:()=>({getAll:()=>{
     const req={};
     const finish=()=>{req.result=data[store];req.onsuccess?.()};
     if(wait)pending.push(finish);else queueMicrotask(finish);
     return req;
   }})})};
 const indexedDB={open:name=>{
   calls.push(name);const req={result:fakeDb};
   queueMicrotask(()=>req.onsuccess?.());return req;
 }};
 const SK={company:{current:()=>({id:companyId})}},window={SK,
   SKosifSpace:{busy:()=>busy,chatScopeSnapshot:()=>({token:epoch})}};
 vm.runInNewContext(src,{window,SK,indexedDB,console,queueMicrotask});
 return {adapter:SK.legacyCompanyData,setCompany:id=>companyId=id,
   setToken:t=>epoch=t,setBusy:b=>busy=b,flush:()=>{for(const fn of pending.splice(0))fn()},
   calls};
}
test('owned rows preserve only this company and marked demo, never adopt untagged or foreign rows',()=>{
 const obj=setup({});
 const input=[{id:'a',companyId:'company-A'},{id:'b',companyId:'company-B'},
   {id:'missing'},{id:'demo',demo:true},{id:'fake',demo:true,companyId:'company-B'}];
 assert.deepEqual(obj.adapter.owned(input,'company-A').map(x=>x.id),['a']);
 assert.deepEqual(obj.adapter.owned(input,'company-B').map(x=>x.id),['b','fake']);
 assert.deepEqual(obj.adapter.owned(input,'demo-co').map(x=>x.id),['demo']);
 assert.equal(obj.adapter.owned(input,'').length,0);
});
test('reads only records with matching owner; rejects unknown stores',async()=>{
 const o=setup({sales_lines:[{id:'a',companyId:'company-A'},{id:'b',companyId:'company-B'},{id:'orphan'}]});
 assert.deepEqual((await o.adapter.read('sales_lines')).map(x=>x.id),['a']);
 assert.equal((await o.adapter.read('secrets')).length,0);
 assert.deepEqual(o.calls,['aghnam-app-v7']);
});
test('stale pending IndexedDB callback is discarded after a company switch',async()=>{
 const o=setup({customers:[{id:'a',companyId:'company-A'}]},{wait:true});
 const promise=o.adapter.read('customers');
 await new Promise(resolve=>setImmediate(resolve));
 o.setCompany('company-B');
 o.flush();
 assert.equal((await promise).length,0);
});
test('busy switching prevents database reads and stale scopes cannot leak',async()=>{
 const o=setup({customers:[{id:'a',companyId:'company-A'}]});
 o.setBusy(true);
 assert.equal((await o.adapter.read('customers')).length,0);
 assert.equal(o.calls.length,0);
 o.setBusy(false);
 assert.equal((await o.adapter.read('customers')).length,1);
});
test('all migrated report readers delegate to the shared company adapter',()=>{
 const modules=['ui/features/audit-bridge.js','ui/features/command-center.js',
 'ui/features/channel-profit.js','ui/features/month-close.js','ui/features/sales-intel.js',
 'ui/features/sales-lab.js','ui/core/flow.js','ui/features/customer-flow.js',
 'ui/features/pulse.js','ui/features/followup.js','ui/features/workspace.js'];
 for(const f of modules){
   const t=fs.readFileSync(root+f,'utf8');
   assert.match(t,/legacyCompanyData\.read\(/,f);
   assert.doesNotMatch(t,/indexedDB\.open\("aghnam-app-v7"\)/,f);
   assert.doesNotMatch(t,/SK\.store\.idbAll\(/,f);
 }
 const build=fs.readFileSync(root+'build.py','utf8');
 assert.ok(build.indexOf('"core/legacy-company-data.js"')>build.indexOf('"core/company.js"'));
 assert.ok(build.indexOf('"core/legacy-company-data.js"')<build.indexOf('"layouts/shell.js"'));
 assert.match(fs.readFileSync(root+'ui/core/flow.js','utf8'),/async function journeyBuild\(root\)/);
});

test('A -> B -> A company lifecycle invalidates a pending old A read',async()=>{
 const o=setup({sales_lines:[{id:'a',companyId:'company-A'}]},{wait:true});
 const pending=o.adapter.read('sales_lines');
 await new Promise(resolve=>setImmediate(resolve));
 o.setCompany('company-B');o.setToken('scope-2');
 o.setCompany('company-A');o.setToken('scope-3');
 o.flush();
 assert.equal((await pending).length,0);
});
test('order maps and product-tree require owned parents and owned line items',()=>{
 for(const file of ['ui/features/product-tree.js','ui/features/sales-map.js']){
  const source=fs.readFileSync(root+file,'utf8');
  assert.match(source,/legacyCompanyData\.read\("orders"\)/);
  assert.match(source,/legacyCompanyData\.read\("order_items"\)/);
  assert.doesNotMatch(source,/indexedDB\.open\("aghnam-app-v7"\)/);
  assert.match(source,/orderId/);
 }
 const reports=fs.readFileSync(root+'ui/features/reports.js','utf8');
 assert.match(reports,/legacyCompanyData\.read\(store\)/);
});

test('scoped snapshot keeps only rows owned by the current company',async()=>{
 const o=setup({customers:[{id:'a',companyId:'company-A'},{id:'b',companyId:'company-B'},{id:'none'},{id:'nested',companyId:'company-A',meta:{companyId:'company-B'}}],
 sales_lines:[{id:'line-A',companyId:'company-A'}],orders:[{id:'order-A',companyId:'company-A'}]});
 const snap=await o.adapter.snapshot();
 assert.equal(snap.format,'kosif-company-scoped-local-export');
 assert.equal(snap.restorable,false);
 assert.deepEqual(snap.stores.customers.map(r=>r.id),['a']);
 assert.deepEqual(snap.stores.orders.map(r=>r.id),['order-A']);
 assert.equal(snap.counts.customers,1);
 assert.equal(Object.keys(snap.stores).length,3);
});
test('demo-only untagged records remain excluded from snapshot',async()=>{
 const o=setup({customers:[{id:'demo',demo:true},{id:'tagged',companyId:'demo-co'}],sales_lines:[],orders:[]},{initial:'demo-co'});
 const snap=await o.adapter.snapshot();
 assert.deepEqual(snap.stores.customers.map(r=>r.id),['tagged']);
 o.setBusy(true);
 await assert.rejects(o.adapter.snapshot(),/COMPANY_EXPORT_SCOPE_NOT_READY/);
});

test('A B A lifecycle change cancels an in-flight snapshot',async()=>{
 const o=setup({customers:[{id:'a',companyId:'company-A'}],sales_lines:[],orders:[]},{wait:true});
 const task=o.adapter.snapshot();
 await new Promise(resolve=>setImmediate(resolve));
 o.setCompany('company-B');o.setToken('scope-2');
 o.setCompany('company-A');o.setToken('scope-3');
 o.flush();
 await assert.rejects(task,/COMPANY_EXPORT_SCOPE_CHANGED/);
});
test('company exports never call device-wide backup and unverified legacy sources are disabled',()=>{
 const text=fs.readFileSync(root+'ui/features/workspace.js','utf8');
 assert.doesNotMatch(text,/SK\.store\.backup\(\)/);
 assert.match(text,/SK\.legacyCompanyData\.snapshot\(\)/);
 assert.match(text,/VERIFIED_EXPORTS=new Set\(\["customers","sales","orders"\]\)/);
 assert.match(text,/if\(!VERIFIED_EXPORTS\.has\(b\.dataset\.x\)\)/);
 assert.match(text,/counts\[i\]===null/);
 assert.match(text,/\.filter\(r=>r\?\.companyId===companyId\)/);
});
