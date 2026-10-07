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

test('mapped Amazon secondary preview uses canonical values and source metadata without a second classifier',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('amazon-2024');const before=JSON.stringify(h.state),c=W.__test.compute(),b=bridge(h),t=W.SKosifTBReview.rows();
 assert.ok(t.canonicalStatements,'canonical statement snapshot is available');
 const s=t.canonicalStatements;assert.equal(s.framework,'US GAAP');assert.equal(s.jurisdiction,'US');assert.equal(s.currency,'USD');assert.equal(s.unit,'million');
 for(const [k,v]of Object.entries({revenue:63795900,profit:5924800,assets:62489400,equity:28597000})){assert.equal(s.before.keys[k].current,v);assert.equal(s.after.keys[k].current,c.fsAfterAdj.keys[k].current)}
 assert.equal(s.before.keys.equity.current,s.before.keys.assets.current-s.before.keys.liabilities.current,'closing equity includes current profit');
 assert.equal(s.provenance.corpusId,'amazon-2024');assert.deepEqual(plain(s.provenance.pages),{is:1065,bs:1067});
 assert.ok(s.after.lines.find(l=>l.key==='cogs').accounts.some(a=>a.code==='5101'));
 for(const view of ['overview','financials','report']){
  const node={innerHTML:'',replaceChildren(){}};W.SKosifAuditBridge.mountStudio(node,view);
  for(const value of ['637,959','59,248','624,894','285,970','US GAAP','USD','million','amazon-2024'])assert.ok(node.innerHTML.includes(value),`${view} shows ${value}`);
  assert.doesNotMatch(node.innerHTML,/IFRS|SOCPA|المملكة العربية السعودية|data-issue|buildDraftButton/);
  assert.match(node.innerHTML,/غير صالح للإصدار/);assert.match(node.innerHTML,/قبل التسويات/);assert.match(node.innerHTML,/بعد التسويات/);
 }
 assert.deepEqual(b.imports,[]);assert.deepEqual(b.calls,[]);assert.equal(JSON.stringify(h.state),before);
 const primary=W.__test.fsStatements(c,{hp:true},c.fsAfterAdj,null,null,'',{})+W.__test.policyNote(2,c);assert.doesNotMatch(primary,/عرض IFRS 18|المعتمدة في المملكة العربية السعودية|وبالريال السعودي/);assert.match(primary,/US GAAP/);
});

test('canonical preview follows primary accepted changes and preserves comparative numbers and mapping lineage',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('amazon-2024');const c=W.__test.compute();
 // Apply a balanced synthetic accepted adjustment through the actual primary engines.
 const adj={id:'synthetic-accepted',lines:[{code:'5101',name:'تكلفة الإيرادات',debit:100,credit:0},{code:'1101',name:'النقد وما في حكمه',debit:0,credit:100}]};
 c.accepted=[adj];c.fsAfterAdj=h.E.reports.statements.buildStatements(h.E.audit.tbReview.applyAdjustments(c.tb,[adj]),c.d.overrides,{tax:'income'});
 const s=W.SKosifTBReview.rows().canonicalStatements;
 assert.equal(s.after.keys.profit.current,5924700);assert.equal(s.before.keys.profit.current,5924800);assert.equal(s.after.keys.profit.prior,3042500);
 assert.deepEqual(plain(s.acceptedIds),['synthetic-accepted']);assert.equal(s.provenance.statementBasis,'primary-computed-model');
 const b=bridge(h),node={innerHTML:'',replaceChildren(){}};W.SKosifAuditBridge.mountStudio(node,'financials');assert.match(node.innerHTML,/59,247\.00/);assert.match(node.innerHTML,/326,289\.00/);assert.match(node.innerHTML,/synthetic-accepted/);assert.match(node.innerHTML,/5101/);assert.deepEqual(b.imports,[]);
 s.after.keys.profit.current=0;assert.equal(c.fsAfterAdj.keys.profit.current,5924700,'transport is detached from computed model');
});


test('modified unbalanced primary model carries the same balance warnings into secondary preview',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('amazon-2024');const d=W.SK.load('skosif_tbreview_v1');
 d.tbText=d.tbText.split('\n').map(line=>{const cells=line.split(',');if(cells[0]==='1101')cells[2]=String(Number(cells[2])+1);return cells.join(',')}).join('\n');W.SK.save('skosif_tbreview_v1',d);
 const s=W.SKosifTBReview.rows().canonicalStatements;assert.equal(s.before.checks.balanced,false);assert.equal(s.provenance.modifiedFromModel,true);
 bridge(h);const node={innerHTML:'',replaceChildren(){}};W.SKosifAuditBridge.mountStudio(node,'report');
 assert.match(node.innerHTML,/قبل التسويات: غير متوازنة/);assert.match(node.innerHTML,/بعد التسويات: غير متوازنة/);assert.match(node.innerHTML,/فرق 1\.00/);
});

test('changed corpus unit metadata cannot silently relabel the canonical amounts',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('amazon-2024');const d=W.SK.load('skosif_tbreview_v1');d.ctx.curSym='SAR';W.SK.save('skosif_tbreview_v1',d);
 assert.equal(W.SKosifTBReview.rows().canonicalStatements,null);const b=bridge(h),node={innerHTML:'',replaceChildren(){}};W.SKosifAuditBridge.mountStudio(node,'report');assert.doesNotMatch(node.innerHTML,/637,959/);assert.deepEqual(b.imports,[]);
});

test('canonical comparison retains cleared rows and zero baselines for introduced rows',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('amazon-2024');const c=W.__test.compute(),tb=structuredClone(c.tb);
 tb.hasPrior=false;tb.rows.forEach(r=>r.prior=null);
 const amount=tb.rows.find(r=>r.code==='5101').balance,adj={id:'synthetic-reclassification',lines:[{code:'5209',name:'مصروفات البيع والتوزيع',type:'expense',debit:amount,credit:0},{code:'5101',name:'تكلفة الإيرادات',debit:0,credit:amount}]};
 const overrides={...c.d.overrides,'5209':'selling'};c.fsBefore=h.E.reports.statements.buildStatements(tb,overrides,{tax:'income'});c.fsAfterAdj=h.E.reports.statements.buildStatements(h.E.audit.tbReview.applyAdjustments(tb,[adj]),overrides,{tax:'income'});c.accepted=[adj];
 assert.ok(c.fsBefore.pl.find(r=>r.key==='cogs'));assert.equal(c.fsAfterAdj.pl.some(r=>r.key==='cogs'),false);assert.equal(c.fsBefore.pl.some(r=>r.key==='selling'),false);assert.ok(c.fsAfterAdj.pl.find(r=>r.key==='selling'));
 bridge(h);const node={innerHTML:'',replaceChildren(){}};W.SKosifAuditBridge.mountStudio(node,'financials');
 const row=label=>node.innerHTML.match(new RegExp('<tr><td>'+label+'</td>(.*?)</tr>'))?.[1];
 assert.match(row('تكلفة الإيرادات'),/>-326,288\.00<.*>0\.00<.*>326,288\.00<.*>—</);
 assert.match(row('مصروفات البيع والتوزيع'),/>0\.00<.*>-326,288\.00<.*>-326,288\.00<.*>—</);
});
