import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../ui/features/earth-company-addons.js', import.meta.url), 'utf8');
function harness() {
  const company = {id:'co-A',name:'SECRET COMPANY NAME',sector:'health',country:'SA',currency:'SAR',ownerScope:'FULL_ACCOUNTING'};
  const SK = {
    company:{current:()=>({...company})},gate:{current:()=> 'accounting'},
    caps:{all:()=>[{id:'ledger',label:'القيود',gateway:'accounting'}]},
    demo:{settled:()=>true},load:(_k,d)=>d,save:()=>true,
    audit:{log(){}},toast(){}
  };
  const window={SK,SKosifSpace:{busy:()=>false},
    SKosifCompanyPlatform:{state:()=>({companyId:company.id,installedTools:['ledger']})}};
  vm.runInNewContext(source,{SK,window,document:{},console},{filename:'earth-company-addons.js'});
  return {api:window.KOSIFEarthAddons,company};
}
const fixture=()=>({format:'kosif-extension-proposal/v1',scope:'current-company',
  title:'تطوير التقرير',summary:'عرض أوضح',
  changes:[{area:'ui',action:'modify',target:'لوحة الشركة',description:'تحسين العرض'}]});

test('export is a Python context without company identity or provider keys',()=>{
  const {api}=harness(),py=api.devPython('co-A');
  assert.match(py,/import json/);
  assert.match(py,/kosif-extension-proposal\/v1/);
  assert.doesNotMatch(py,/SECRET COMPANY NAME|co-A|skosif_ai_keys|ANTHROPIC_API_KEY/);
});
test('import strips extra fields and never returns executable code',()=>{
  const {api}=harness();
  const proposal=fixture();proposal.code="dangerous()";proposal.changes[0].shell="run";
  const parsed=api.validateDevProposal(JSON.stringify(proposal));
  assert.equal(parsed.code,undefined);
  assert.equal(parsed.changes[0].shell,undefined);
  assert.equal(parsed.changes.length,1);
});
test('invalid and cross-company proposals rejected',()=>{
  const {api}=harness();
  assert.throws(()=>api.validateDevProposal('import os'),/JSON/);
  assert.throws(()=>api.validateDevProposal(JSON.stringify({...fixture(),scope:'other'})),/نطاقه/);
  assert.throws(()=>api.validateDevProposal('x'.repeat(70000)),/64/);
  assert.throws(()=>api.validateDevProposal(JSON.stringify({...fixture(),changes:[{area:'ui',action:'execute',target:'x',description:'y'}]})),/نوع/);
});
test('switching company fails closed and keys are isolated',()=>{
  const {api,company}=harness();
  assert.notEqual(api.devStorageKey('co-A'),api.devStorageKey('co-B'));
  company.id='co-B';
  assert.throws(()=>api.devPython('co-A'),/الشركة/);
});
