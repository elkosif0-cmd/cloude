import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const source=fs.readFileSync(fileURLToPath(new URL('../ui/features/reports.js',import.meta.url)),'utf8');
function mountFor(companyId='company-A') {
  let selected=companyId;
  const sk={
    company:{current:()=>({id:selected})},
    load:(key,fallback)=>fallback,
    save:()=>true,
    esc:val=>String(val),
    money:val=>String(val),
    num:val=>Number(val)||0,
    csv:{download:()=>{}},
    view:()=>{}
  };
  const window={SK:sk};
  const context={window,SK:sk,localStorage:{getItem:()=>null},console};
  vm.runInNewContext(source,context,{filename:'ui/features/reports.js'});
  return {filter:records=>window.SKosifReports.scopedLegacyRows(records),
          select:id=>{selected=id}};
}

test('company A never sees rows belonging to B or untagged legacy rows',()=>{
 const model=mountFor('company-A');
 const rows=[
   {id:'a',companyId:'company-A',amount:25},
   {id:'b',companyId:'company-B',amount:900000},
   {id:'old',amount:100000},
   {id:'demo',demo:true,amount:50000}
 ];
 assert.deepEqual(model.filter(rows).map(x=>x.id),['a']);
 model.select('company-B');
 assert.deepEqual(model.filter(rows).map(x=>x.id),['b']);
 model.select('company-A');
 assert.deepEqual(model.filter(rows).map(x=>x.id),['a']);
});

test('unassigned, malformed or missing company remains fail-closed',()=>{
 const model=mountFor('');
 assert.equal(model.filter([{id:'untagged'}, {id:'marked',companyId:'company-A'}]).length,0);
 model.select('company-A');
 assert.equal(model.filter(null).length,0);
 assert.equal(model.filter([null,undefined,'a',{companyId:1},{companyId:null},{companyId:'company-a'},{}]).length,0);
});

test('legacy demo records are visible only inside the demo company, never to other tenants',()=>{
 const model=mountFor('demo-co');
 const rows=[{id:'demo',demo:true}, {id:'assignedDemo',companyId:'demo-co'}, {id:'realA',companyId:'company-A'}, {id:'badDemo',demo:true,companyId:'company-B'}];
 assert.deepEqual(model.filter(rows).map(x=>x.id),['demo','assignedDemo']);
 model.select('company-A');
 assert.deepEqual(model.filter(rows).map(x=>x.id),['realA']);
});

test('report reads always apply owner filter and refresh generation for company switches',()=>{
 assert.match(source,/REAL\.customers=companyOwnedRows\(customers,companyId\)/);
 assert.match(source,/REAL\.lines=companyOwnedRows\(lines,companyId\)/);
 assert.match(source,/generation!==REAL\.generation\|\|reportCompanyId\(\)!==companyId/);
 assert.match(source,/if\(REAL\.companyId!==reportCompanyId\(\)\|\|!REAL\.loaded\)/);
 assert.doesNotMatch(source,/REAL\.lines\s*=\s*l\s*;/);
});
