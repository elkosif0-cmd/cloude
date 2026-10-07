// Actual bridge module, with only closure visibility added. Dynamic sibling-module
// calls are captured by VM SyntheticModule; no browser, server or real storage.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {harness,plain,root} from './apple-source-harness.mjs';

function bridge(h, delayStore) {
  const W=h.context,calls=[],imports=[],views={},store={engagement:{id:'SK-empty',documents:[],reports:[]},analysis:null};
  W.SK.icons={};W.SK.view=(id,definition)=>{views[id]=definition;};
  W.document={addEventListener(){},documentElement:{dataset:{},getAttribute(){return ''; }},createElement(){return {style:{},appendChild(){},before(){},remove(){},classList:{contains(){return false;}},shadowRoot:null};}};
  W.MutationObserver=class{observe(){}};W.addEventListener=()=>{};
  W.DataTransfer=class{constructor(){calls.push({call:'DataTransfer'});this.items={add(){}};this.files=[];}};
  W.File=class{};W.Event=class{};
  const noop=()=>{},names=['renderNow','renderAnalysisMetrics','renderDocuments','renderRecipe','reconcileReportIntake','renderReportIntake','renderCouncil','renderRequests','renderIssues','renderCoverage','renderCandidates','renderAdjustments','renderStatements','renderStatementLineage','renderCashFlow','renderEquity','renderDisclosures','renderTrace','renderReport','renderPublication','renderTraceInspector','renderCompletion','renderWorkspaceNavigation','renderDashboardSuite'];
  const modules=new Map();
  async function resolver(name){
    imports.push(name);if(name.endsWith('continuous-store.js')&&delayStore)await delayStore;
    if(modules.has(name))return modules.get(name);
    const exports=Object.fromEntries(names.map(n=>[n,noop]));
    if(name.endsWith('continuous-store.js'))Object.assign(exports,{store,resetEngagement:e=>{store.engagement=e;calls.push({call:'resetEngagement',argument:plain(e)});},derive:noop});
    if(name.endsWith('engagement-machine.js'))exports.createEngagement=config=>{calls.push({call:'createEngagement',argument:plain(config)});return {...config,documents:[],reports:[]};};
    if(name.endsWith('continuous-documents.js'))Object.assign(exports,{loadTrialBalance:(rows,label)=>calls.push({call:'loadTrialBalance',label,rows:plain(rows)}),loadDemo:()=>calls.push({call:'loadDemo'})});
    const mod=new vm.SyntheticModule(Object.keys(exports),function(){for(const[k,v]of Object.entries(exports))this.setExport(k,v);},{context:W,identifier:name});modules.set(name,mod);await mod.link(()=>{});await mod.evaluate();return mod;
  }
  const code=fs.readFileSync(root+'/ui/features/audit-bridge.js','utf8').replace(/\}\)\(\);\s*$/,'window.__bridgeTest={doSync,feedAnalytics};\n})();');
  new vm.Script(code,{filename:'actual-audit-bridge.js+closure-visibility',importModuleDynamically:resolver}).runInContext(W);
  const api={host:{shadowRoot:{getElementById:()=>({dispatchEvent:()=>calls.push({call:'dispatchEvent'})})}},want:'report',api:{setView:v=>calls.push({call:'setView',view:v})}};
  return {calls,imports,views,api};
}
test('source data cannot enter the ordinary studio or analytics through direct or deep-link boundaries',async()=>{
  const h=harness(),W=h.context;await W.SKosifTBReview.openClient('apple-2024');const b=bridge(h);
  const transport=W.SKosifTBReview.rows();assert.equal(transport.sourceOnly,true);assert.deepEqual(plain(transport.rows),[]);
  await W.__bridgeTest.doSync(b.api);W.__bridgeTest.feedAnalytics(b.api);
  const node={innerHTML:'',replaceChildren(){}};W.SKosifAuditBridge.mountStudio(node,'report');
  assert.match(node.innerHTML,/المصدر|منشورة/);b.views.auditanalytics.render(node);assert.match(node.innerHTML,/المصدر|منشورة/);
  assert.deepEqual(b.imports,[]);assert.deepEqual(b.calls,[]);
});
test('ordinary operational studio transport retains its existing conversion',async()=>{
  const h=harness(),W=h.context;await W.SKosifTBReview.load(h.E.reports.tbImport.SAMPLE_TB_CSV,'operation',{company:'Ordinary operation',country:'SA'});
  const b=bridge(h);await W.__bridgeTest.doSync(b.api);
  assert.ok(b.calls.some(c=>c.call==='createEngagement'));assert.ok(b.calls.some(c=>c.call==='loadTrialBalance'));
});
test('a source selection during pending studio import cancels the old operational conversion',async()=>{
  const h=harness(),W=h.context;await W.SKosifTBReview.load(h.E.reports.tbImport.SAMPLE_TB_CSV,'operation',{company:'Ordinary operation',country:'SA'});
  let release;const gate=new Promise(r=>{release=r;}),b=bridge(h,gate),pending=W.__bridgeTest.doSync(b.api);
  await W.SKosifTBReview.openClient('apple-2024');release();await pending;
  assert.equal(b.calls.some(c=>c.call==='createEngagement'||c.call==='loadTrialBalance'||c.call==='loadDemo'),false);
});

test('mapped corpus cannot silently enter a classifier that drops its statement mappings',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('amazon-2024');const before=JSON.stringify(h.state),b=bridge(h);
 assert.ok(W.SKosifTBReview.rows().mappingUnsupported,'explicit capability limit, not a source-only conversion');
 await W.__bridgeTest.doSync(b.api);W.__bridgeTest.feedAnalytics(b.api);
 const node={innerHTML:'',replaceChildren(){}};W.SKosifAuditBridge.mountStudio(node,'financials');assert.match(node.innerHTML,/تصنيف|ربط/);
 assert.deepEqual(b.calls,[]);assert.deepEqual(b.imports,[]);assert.equal(JSON.stringify(h.state),before);
 assert.equal(W.__test.compute().base.fs.keys.revenue.current,63795900,'primary mapped calculation retained');
});
