import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../ui/core/company.js',import.meta.url),'utf8');
const KEY='skosif_companies_v1';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
function setup(gateway,id,records=[],spaceId=id){
 const map=new Map([[KEY,{companies:clone(records),periods:[],active:{companyId:id}}]]);
 let gate=gateway,selected=spaceId,nowId=id;
 const SK={
  load:(key,fallback)=>map.has(key)?clone(map.get(key)):clone(fallback),
  save:(key,v)=>{map.set(key,clone(v));return true},
  gate:{current:()=>gate},ui:{uid:()=> 'id-created'},
  bus:{on:()=>{},emit:()=>{}},
  caps:{sector:()=>true}
 };
 const w={
  SK,localStorage:{getItem:()=>null},sessionStorage:{getItem:()=>null,setItem:()=>{}},
  document:{getElementById:()=>null},setTimeout:()=>{},addEventListener:()=>{},
  SKosifCore:{setOrg:()=>false},
  SKosifSpace:{current:()=>({id:nowId,name:'opened '+nowId}),list:()=>[]}
 };
 w.window=w;
 vm.runInNewContext(source,w,{filename:'company.js'});
 return{SK,db:map,company:SK.company,select:(id,g)=>{nowId=id;gate=g},read:()=>map.get(KEY)};
}
test('new independent Tools workspace is TOOLS_ONLY from the first render and after reconciliation',()=>{
 const x=setup('tools','tools-workspace-1');
 assert.equal(x.company.current().ownerScope,'TOOLS_ONLY');
 const rec=x.read().companies.find(c=>c.id==='tools-workspace-1');
 assert.ok(rec);assert.equal(rec.ownerScope,'TOOLS_ONLY');
 assert.equal(x.company.scopeOf('tools-workspace-1'),'TOOLS_ONLY');
});
test('new Audit-only workspace is AUDIT_ONLY and not an accounting company',()=>{
 const x=setup('audit','audit-case-1');
 assert.equal(x.company.current().ownerScope,'AUDIT_ONLY');
 assert.equal(x.read().companies.find(c=>c.id==='audit-case-1').ownerScope,'AUDIT_ONLY');
});
test('accounting creates FULL_ACCOUNTING and a linked accounting company stays accounting when opened from Tools',()=>{
 const record={id:'account-a',name:'Company A',ownerScope:'FULL_ACCOUNTING',currency:'SAR'};
 const x=setup('tools','account-a',[record]);
 assert.equal(x.company.current().ownerScope,'FULL_ACCOUNTING');
 assert.equal(x.read().companies.find(c=>c.id==='account-a').ownerScope,'FULL_ACCOUNTING');
 x.select('other-account','accounting');
 x.company.reconcile();
 assert.equal(x.read().companies.find(c=>c.id==='other-account').ownerScope,'FULL_ACCOUNTING');
});
test('existing legacy record with no ownerScope retains accounting ownership instead of silently upgrading',()=>{
 const x=setup('tools','legacy-company',[{id:'legacy-company',name:'Legacy'}]);
 assert.equal(x.company.current().ownerScope,'FULL_ACCOUNTING');
 assert.equal(x.read().companies.find(c=>c.id==='legacy-company').ownerScope,undefined);
});
test('metadata creation and renaming preserve chosen workspace scope',()=>{
 const x=setup('tools','space-main',[]);
 // Provisional space-main has no records: updating its metadata creates
 // a single TOOLS_ONLY record and subsequent rename preserves that owner.
 assert.equal(x.company.current().ownerScope,'TOOLS_ONLY');
 assert.equal(x.company.updateMeta({sector:'trade'}),true);
 let rec=x.read().companies.find(c=>c.id==='space-main');
 assert.equal(rec.ownerScope,'TOOLS_ONLY');
 assert.equal(x.company.rename('Tool operations'),true);
 rec=x.read().companies.find(c=>c.id==='space-main');
 assert.equal(rec.ownerScope,'TOOLS_ONLY');
});
test('tools-only company is not exposed by accounting list after context switch',()=>{
 const t={id:'tools-only',name:'Standalone tool',ownerScope:'TOOLS_ONLY'};
 const a={id:'account-a',name:'Accounting',ownerScope:'FULL_ACCOUNTING'};
 const x=setup('accounting','account-a',[a,t]);
 const result=Array.from(x.company.list());
 assert.equal(result.some(z=>z.id==='tools-only'),false);
 assert.equal(result.some(z=>z.id==='account-a'),true);
 x.select('tools-only','tools');
 const toolList=Array.from(x.company.list());
 assert.equal(toolList.some(z=>z.id==='tools-only'),true);
});

test('reserved legacy tools-home without explicit ownerScope is repaired only in tools gate',()=>{
 const legacy={id:'space-tools',name:'Standalone Tools (legacy)',currency:'SAR'};
 const x=setup('tools','space-tools',[legacy]);
 const rec=x.read().companies.find(c=>c.id==='space-tools');
 assert.equal(rec.ownerScope,'TOOLS_ONLY');
 assert.equal(x.company.current().ownerScope,'TOOLS_ONLY');
});
test('existing explicit accounting ownership is NEVER converted by opening Tools',()=>{
 const rec={id:'space-tools',name:'Named accounting company',ownerScope:'FULL_ACCOUNTING'};
 const x=setup('tools','space-tools',[rec]);
 assert.equal(x.read().companies.find(c=>c.id==='space-tools').ownerScope,'FULL_ACCOUNTING');
});
test('ambiguous non-reserved legacy company is never relabeled as a tool workspace',()=>{
 const legacy={id:'co-leg-123',name:'Legacy company'};
 const x=setup('tools','co-leg-123',[legacy]);
 assert.equal(x.company.current().ownerScope,'FULL_ACCOUNTING');
 assert.equal(x.read().companies.find(c=>c.id==='co-leg-123').ownerScope,undefined);
});
test('reserved workspace is not reinterpreted unless the tools gate actually selected it',()=>{
 const legacy={id:'space-tools',name:'Old default'};
 const x=setup('accounting','space-tools',[legacy]);
 assert.equal(x.read().companies.find(c=>c.id==='space-tools').ownerScope,undefined);
});
