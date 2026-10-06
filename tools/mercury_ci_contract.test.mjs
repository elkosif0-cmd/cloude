import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const file=new URL('./mercury_ci_e2e.mjs',import.meta.url);
test('visual harness is CI-only, exact-head and synthetic',()=>{
 assert.ok(fs.existsSync(file),'Native CI harness is required');
 const s=fs.readFileSync(file,'utf8');
 for(const token of ['GITHUB_ACTIONS','SQC_TESTED_SHA','managementBrowserSeed','populated','empty','large','reducedMotion','pdfinfo','pdftoppm','baseline','candidate','download'])assert.ok(s.includes(token),token);
 assert.ok(s.includes('failures.length'));
 assert.ok(s.includes('sources'));
});

// Execute only the actual addInitScript registration/callback in a Node VM.
// Never import the browser harness or launch Playwright from a pure test.
async function seedHarness(name){
 const source=fs.readFileSync(new URL('./'+name,import.meta.url),'utf8'),start=source.indexOf('await context.addInitScript('),end=source.indexOf('const page=',start);
 assert.ok(start>=0&&end>start,'actual fixture registration must be identifiable');
 const call=source.slice(start,end).trim(),local=new Map(),session=new Map(),writes=[];
 const storage=(map,kind)=>({getItem:k=>map.get(k)??null,setItem(k,v){map.set(k,String(v));writes.push([kind,k,String(v)])}});
 let callback,args;
 const origin='http://127.0.0.1:8765',window={};window.top=window;
 const ctx={window,location:{origin},origin,seed:{skosif_ledger_v1:{synthetic:true,entries:[]}},localStorage:storage(local,'local'),sessionStorage:storage(session,'session'),context:{addInitScript(fn,value){callback=fn;args=value}}};
 await vm.runInNewContext('(async()=>{'+call+'})()',ctx);
 assert.equal(typeof callback,'function');
 return{ctx,local,session,writes,run:()=>callback(args)};
}
for(const name of ['mercury_ci_e2e.mjs','dashboard_box_kpi_e2e.mjs']){
 test(name+': preview/print frames never seed or overwrite the active context',async()=>{const h=await seedHarness(name);h.ctx.window.top={};h.run();h.run();h.run();assert.deepEqual(h.writes,[])});
 test(name+': first expected-origin main document receives the synthetic seed',async()=>{const h=await seedHarness(name);h.run();assert.deepEqual(JSON.parse(h.local.get('skosif_ledger_v1')),{synthetic:true,entries:[]});assert.equal(h.local.get('skosif_role_mode'),'"admin"');assert.equal(h.session.get('sqc_space_chosen'),'1')});
 test(name+': subsequent top-level reload preserves changed company data',async()=>{const h=await seedHarness(name);h.run();const count=h.writes.length;h.local.set('skosif_ledger_v1','changed-after-first-load');h.run();assert.equal(h.writes.length,count);assert.equal(h.local.get('skosif_ledger_v1'),'changed-after-first-load')});
 test(name+': blank/export/foreign-origin documents never receive app data',async()=>{for(const origin of ['null','https://elsewhere.invalid']){const h=await seedHarness(name);h.ctx.location.origin=origin;h.run();assert.deepEqual(h.writes,[])}});
}
