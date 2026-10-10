import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const source=readFileSync(new URL('ui/features/earth-adaptive-actions.js',root),'utf8');
const css=readFileSync(new URL('ui/features/earth-adaptive-actions.css',root),'utf8');
const build=readFileSync(new URL('build.py',root),'utf8');
function harness({gate='accounting',ownerScope='FULL_ACCOUNTING',busy=false,settled=true,can=()=>true}={}){
  const c={id:'company-A',ownerScope};
  const members=[{id:'next',label:'الخطوة الثانية',hidden:false},{id:'other-gate',label:'قسم مختلف',hidden:false},{id:'secret',label:'غير مسموح',hidden:true}];
  const sk={gate:{current:()=>gate},company:{current:()=>c},demo:{settled:()=>settled},perm:{can},caps:{
    get:id=>({id,label:id}),hub:()=>({id:'hub'}),members:()=>members,
    inGatewayOf:item=>item.id!=='other-gate'
  }};
  const calls=[],core={view:()=> 'screen',go:id=>calls.push(id)};
  const win={SK:sk,SKosifCore:core,SKosifSpace:{busy:()=>busy}};
  const doc={readyState:'loading',addEventListener:()=>{}};
  const context=vm.createContext({window:win,document:doc,setTimeout:()=>0});
  vm.runInContext(source,context);
  return {ui:win.KOSIFEarthIntelligentUI,sk,core,calls,c};
}
test('build includes the adaptive controller and CSS',()=>{
  assert.ok(build.includes('"features/earth-adaptive-actions.js"'));
  assert.ok(build.includes('"features/earth-adaptive-actions.css"'));
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/max-width:650px/);
  assert.match(css,/min-height:44px/);
});
test('company-scoped route suggestions use canonical registry, current permissions and gateway',()=>{
  const {ui}=harness();
  const p=ui.plan();
  assert.equal(p.ready,true);
  assert.deepEqual(Array.from(p.candidates,x=>x.id),['next']);
});
test('never allow new route before company selection or during demo hydration',()=>{
  for(const scenario of [{ownerScope:'AUDIT_ONLY'},{busy:true},{settled:false}]){
    const {ui}=harness(scenario);
    assert.equal(ui.plan().ready,false);
    assert.equal(ui.plan().candidates.length,0);
  }
});
test('permission changes and company-switch races prevent stale action dispatch',()=>{
  const {ui,sk,calls,c}=harness();
  const old=ui.plan();
  assert.equal(ui.dispatch(old,'next'),true);
  sk.perm.can=()=>false;
  assert.equal(ui.dispatch(old,'next'),false);
  sk.perm.can=()=>true;
  c.id='company-B';
  assert.equal(ui.dispatch(old,'next'),false);
  assert.deepEqual(calls,['next']);
});
test('no customer-data storage, fetches, mutations, cross-gateway jumps, or silent AI claims',()=>{
  for(const forbidden of ['localStorage','sessionStorage','indexedDB','fetch(','.setTool(','.save(','setCompany(','AI-generated','GPT-6 API']){
    assert.equal(source.includes(forbidden),false,forbidden);
  }
  const {ui}=harness({gate:'audit'});
  assert.equal(ui.plan().gate,'audit');
  assert.equal(ui.plan().candidates.every(x=>x.id==='next'),true);
});
