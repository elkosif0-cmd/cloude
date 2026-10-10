import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../ui/core/demo.js',import.meta.url),'utf8');
const start=source.indexOf('let settled=false,bootRetries=0;');
const end=source.indexOf('/* the paste-based tools',start);
assert.ok(start>0&&end>start,'expected demo boot implementation not present');
const isolated=source.slice(start,end)+'\nglobalThis.ready=()=>settled;globalThis.retries=()=>bootRetries;globalThis.start=()=>boot();';
function setup(busy){
 const jobs=[],errors=[];let bars=0,seeds=0,reads=0;
 const space={intent:async()=>{},busy:()=>busy(++reads)};
 const context=vm.createContext({
  window:{SKosifSpace:space},SKosifSpace:space,
  SK:{company:{current:()=>({id:'company-A',model:true})},errors:{report:(e,code)=>errors.push({error:e.message,code})}},
  seedModel:async()=>{seeds++;return false;},bar:()=>{bars++;},
  setTimeout:(cb,ms)=>{assert.equal(ms,250);jobs.push(cb);},
 });
 vm.runInContext(isolated,context);
 async function flush(limit=200){
  let count=0;while(jobs.length){if(++count>limit)throw Error('retry loop unbounded');await jobs.shift()();await new Promise(setImmediate)}
  return count;
 }
 return{context,jobs,errors,flush,counts:()=>({bars,seeds,reads})};
}
test('normal company initialization settles exactly once',async()=>{
 const s=setup(()=>false);await s.context.start();
 assert.equal(s.context.ready(),true);assert.deepEqual(s.counts(),{bars:1,seeds:1,reads:1});
 await s.context.start();assert.deepEqual(s.counts(),{bars:1,seeds:1,reads:1});
});
test('transient company handoff retries without seeding or enabling edits early',async()=>{
 const s=setup(n=>n<=3);
 await s.context.start();
 assert.equal(s.context.ready(),false);assert.deepEqual(s.counts(),{bars:0,seeds:0,reads:1});
 const n=await s.flush();
 assert.equal(n,3);assert.equal(s.context.ready(),true);
 assert.deepEqual(s.counts(),{bars:1,seeds:1,reads:4});
 assert.equal(s.errors.length,0);
});
test('persistent busy handoff fails closed with bounded retries and one error',async()=>{
 const s=setup(()=>true);
 await s.context.start();
 const n=await s.flush();
 assert.equal(n,160);assert.equal(s.context.ready(),false);
 assert.equal(s.counts().bars,0);assert.equal(s.counts().seeds,0);
 assert.equal(s.errors.length,1);
 assert.equal(s.errors[0].code,'demo:boot-timeout');
 assert.equal(s.jobs.length,0);
});