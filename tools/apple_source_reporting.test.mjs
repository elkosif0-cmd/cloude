import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {harness, plain, root} from './apple-source-harness.mjs';

const bytes = fs.readFileSync(root + '/tools/fixtures/apple-fy2024-source.json');
const oracle = JSON.parse(bytes);
test('independent original source oracle remains frozen', () => assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), 'f35bbc22c3438262c35b63d226d62b88c3e252a9da054d9b7a4da4093e46e7f5'));
function checkSource(fs) {
  for (const [key, expected] of Object.entries({revenue:[391035,383285],profit:[93736,96995],assets:[364980,352583],equity:[56950,62146],operating:[123216,114301],pbz:[123485,113736],receivables:[33410,29508]}))
    assert.deepEqual(plain(fs.keys[key]), {current:expected[0]*100,prior:expected[1]*100}, key);
  for (const [key, expected] of Object.entries({vendorReceivables:[32833,31477],currentSecurities:[35228,31590],investments:[91479,100544],otherNca:[74834,64758],loansCl:[20879,15807],loansNcl:[85750,95281],otherNcl:[45888,49848],researchDevelopment:[31370,29915],sellingGeneralAdmin:[26097,24932],nonOperatingIncome:[269,-565]})) {
    const row = fs.lines.find(x=>x.key===key); assert.ok(row, key + ' classified source row');
    assert.equal(row.current, expected[0]*100,key); assert.equal(row.prior, expected[1]*100,key);
  }
  assert.equal(fs.checks.balanced,true);
}
function checkAbsent(fs,E) {
  assert.equal(fs.cf,null); assert.equal(fs.checks.cashTies,null); assert.equal(fs.checks.cfDifference,null);
  assert.equal(fs.cashFlowStatus?.status,'unavailable'); assert.equal(fs.cashFlowStatus?.check,'not-tested');
  assert.equal(fs.keys.cfo,undefined); assert.equal(fs.keys.capex,undefined);
  assert.equal(E.reports.analysis.freeCashFlow(fs),null);
  assert.equal(E.reports.analysis.beneishM(fs),null);
  for(const ratio of E.reports.analysis.ratios(fs).filter(x=>x.group==='cash')) assert.equal(ratio.current,null,ratio.key);
  assert.equal(E.reports.annualReport.performanceMeasures(fs).some(x=>x.key==='fcf'||x.key==='ebitda'),false);
}
test('generic Apple model preserves exact source classifications and amounts',()=>{
  const {E}=harness(),model=E.reports.corpusCompanies.companyTrialBalance('apple-2024');
  checkSource(E.reports.statements.buildStatements(E.reports.tbImport.parseTrialBalance(model.csv),model.overrides,{tax:'income'}));
});
test('generic source CSV retains source-only origin without caller context',()=>{
  const {E}=harness(),model=E.reports.corpusCompanies.companyTrialBalance('apple-2024'),tb=E.reports.tbImport.parseTrialBalance(model.csv);
  assert.equal(tb.sourceKind,'published-statements');
  checkAbsent(E.reports.statements.buildStatements(tb,model.overrides,{tax:'income'}),E);
});
test('source fiscal and issuer metadata is exact and source auditor is not a signing identity',()=>{
  const {E}=harness(),{ctx}=E.reports.corpusCompanies.companyTrialBalance('apple-2024');
  assert.equal(ctx.periodEnd,oracle.scope.fiscal_period_end);assert.equal(ctx.priorPeriodEnd,oracle.scope.comparative_period_end);
  assert.equal(ctx.issuerCountry,'US'); assert.equal(ctx.sourceModel.accountingBasis,'US_GAAP');
  assert.equal(ctx.sourceModel.currency,'USD');assert.equal(ctx.sourceModel.unit,'million');assert.equal(ctx.sourceModel.scope,'consolidated');
  assert.equal(ctx.sourceModel.sourceSha256,oracle.source.sha256);assert.equal(ctx.auditFirm,'');
  assert.equal(ctx.sourceModel.auditorReference.name,'Ernst & Young LLP');
});
test('actual selection and generic path use one reviewed model; source docs reject unsupported assurance',async()=>{
  const {context:W,E}=harness();await W.SKosifTBReview.openClient('apple-2024');const c=W.__test.compute(),model=E.reports.corpusCompanies.companyTrialBalance('apple-2024');
  assert.equal(c.d.tbText,model.csv);assert.deepEqual(plain(c.d.overrides),plain(model.overrides));checkSource(c.fsAfterAdj);checkAbsent(c.fsAfterAdj,E);
  const x=W.__test.docX(c);assert.equal(x.sourceOnly,true);assert.equal(x.sourceVerified,true);assert.equal(x.fw,'US_GAAP');
  assert.equal(x.ctx.priorPeriodEnd,'2023-09-30');assert.equal(x.opinion.opinion,'not-assessed');
  for(const kind of ['annual','release','notes','auditor','committee','icfr']){
    const html=W.SKosifReportDocs[kind](x);
    assert.match(html,/USD/);assert.match(html,/US_GAAP/);assert.match(html,/2024-09-28/);assert.match(html,/2023-09-30/);
    assert.doesNotMatch(html,/SOCPA|الريال السعودي|الزكاة|قمنا بمراجعة|أجرينا|الرقابة فعالة|rd-sign/);
    assert.match(html,/مرجع|المصدر/);
  }
});
test('source-only origin survives adjustment and manual source text edits',async()=>{
  const {context:W,E,state}=harness();await W.SKosifTBReview.openClient('apple-2024');
  const c=W.__test.compute();assert.equal(E.audit.tbReview.applyAdjustments(c.tb,[]).sourceKind,'published-statements');
  state.skosif_tbreview_v1.tbText=state.skosif_tbreview_v1.tbText.replace('29943','29944').replace(/^#.*\n/,'');
  const edited=W.__test.compute();checkAbsent(edited.fsAfterAdj,E);assert.equal(W.__test.docX(edited).sourceVerified,false);
  assert.doesNotMatch(W.SKosifReportDocs.annual(W.__test.docX(edited)),/391,035/);
});
test('source showcase remains not-assessed despite simulated rounds',async()=>{
  const {context:W,E}=harness();await W.SKosifTBReview.showcase('apple-2024');const c=W.__test.compute();
  checkSource(c.fsAfterAdj);checkAbsent(c.fsAfterAdj,E);assert.equal(W.__test.docX(c).opinion.opinion,'not-assessed');
  assert.doesNotMatch(W.SKosifReportDocs.auditor(W.__test.docX(c)),/rd-sign|قمنا بمراجعة|رأينا/);
});
test('source UI and generic report entry cannot show an earned opinion or Saudi cash-flow hints',async()=>{
  const {context:W}=harness();await W.SKosifTBReview.openClient('apple-2024');const c=W.__test.compute();
  assert.equal(c.derived.opinion,'not-assessed');
  assert.doesNotMatch(W.__test.fsTab(c),/الزكاة|IFRS 18|أضف عمود السنة السابقة|الرأي المشتق|رأي المراجع — مشتق/);
  const x=W.__test.docX(c);delete x.sourceOnly;
  assert.doesNotMatch(W.SKosifReportDocs.auditor(x),/rd-sign|قمنا بمراجعة|أجرينا/);
});
test('source equity displays reported accumulated deficit rather than its adapter bridge',()=>{
  const {E}=harness(),t=E.reports.corpusCompanies.companyTrialBalance('apple-2024'),s=E.reports.statements.buildStatements(E.reports.tbImport.parseTrialBalance(t.csv),t.overrides,{tax:'income'});
  assert.equal(s.sfp.find(r=>r.key==='retained').current,-19154*100);assert.equal(s.sfp.find(r=>r.key==='retained').prior,-214*100);
  assert.equal(s.sfp.some(r=>r.key==='resultYear'),false);
  assert.equal(s.keys.depreciation,undefined);
  assert.match(s.sfp.find(r=>r.key==='capital').en,/additional paid-in capital/);
  assert.match(s.sfp.find(r=>r.key==='reserves').en,/Accumulated other comprehensive loss/);
  assert.deepEqual(plain(s.soce.rows),[]);assert.equal(s.soceStatus?.status,'unavailable');
  assert.equal(s.pl.some(r=>r.key==='pbfz'),false);assert.equal(s.keys.pbfz,undefined);
  assert.equal(s.pl.find(r=>r.key==='pbz').current,12348500);
});
test('reopening source records preserves origin and another company does not inherit it',async()=>{
  const {context:W,state}=harness();const apple=await W.SKosifTBReview.openClient('apple-2024');const x=W.__test.docX(W.__test.compute());
  W.__test.newFile(W.__test.blank());await W.SKosifTBReview.load(W.SKEngines.reports.tbImport.SAMPLE_TB_CSV,'ordinary-ledger',{company:'Independent ordinary ledger',country:'SA'});assert.equal(W.__test.compute().sourceOnly,false);
  assert.match(W.SKosifReportDocs.annual(x),/Apple Inc/);assert.doesNotMatch(W.SKosifReportDocs.annual(x),/أرامكو|SAR/);
  await W.SKosifTBReview.openClient('apple-2024');assert.equal(W.__test.compute().sourceOnly,true);assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,true);
  delete state.skosif_tbreview_v1.ctx.sourceModel;delete state.skosif_tbreview_v1.sourceKind;
  const c=W.__test.compute();assert.equal(c.sourceOnly,true);assert.equal(c.fsAfterAdj.cf,null);assert.equal(W.__test.docX(c).sourceVerified,false);
});
test('source identity tampering blocks attribution of its numeric output',async()=>{
  for(const [field,value] of [['company','Another company'],['periodEnd','2024-12-31'],['priorPeriodEnd','2023-09-28']]){
    const {context:W,state}=harness();await W.SKosifTBReview.openClient('apple-2024');state.skosif_tbreview_v1.ctx[field]=value;
    const x=W.__test.docX(W.__test.compute());assert.equal(x.sourceVerified,false,field);assert.doesNotMatch(W.SKosifReportDocs.annual(x),/391,035/);
  }
});
test('memoized source verification is invalidated when the source record identity changes',async()=>{
  const {context:W,state}=harness();await W.SKosifTBReview.openClient('apple-2024');assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,true);
  state.skosif_tbreview_v1.sourceId='unknown-source-record';
  const x=W.__test.docX(W.__test.compute());assert.equal(x.sourceOnly,true);assert.equal(x.sourceVerified,false);
});
test('contextual source provenance survives public import and legacy saved-record loss of top-level markers',async()=>{
  const {context:W,E,state}=harness(),t=E.reports.corpusCompanies.companyTrialBalance('apple-2024'),text=t.csv.replace(/^#.*\n/,'');
  assert.equal(await W.SKosifTBReview.load(text,'source model',t.ctx),true);
  let c=W.__test.compute();assert.equal(c.sourceOnly,true);checkAbsent(c.fsAfterAdj,E);assert.equal(W.__test.docX(c).sourceVerified,false);
  state.skosif_tbreview_v1.overrides=plain(t.overrides);delete state.skosif_tbreview_v1.sourceKind;delete state.skosif_tbreview_v1.sourceId;delete state.skosif_tbreview_v1.bundleId;
  c=W.__test.compute();assert.equal(c.sourceOnly,true);checkAbsent(c.fsAfterAdj,E);
});
test('partial or conflicting saved source identity fails closed without contaminating a separate operational record',async()=>{
  const {context:W,E,state}=harness();await W.SKosifTBReview.openClient('apple-2024');
  state.skosif_tbreview_v1.bundleId='different-source';assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,false);
  const d=state.skosif_tbreview_v1;d.tbText=d.tbText.replace(/^#.*\n/,'');delete d.sourceId;delete d.sourceKind;delete d.bundleId;delete d.ctx.corpusId;delete d.ctx.sourceKind;d.ctx.sourceModel={scope:'consolidated'};
  let c=W.__test.compute();assert.equal(c.sourceOnly,true);checkAbsent(c.fsAfterAdj,E);assert.equal(W.__test.docX(c).sourceVerified,false);
  W.__test.newFile(W.__test.blank());await W.SKosifTBReview.load(E.reports.tbImport.SAMPLE_TB_CSV,'operational',{company:'Separate operation',country:'SA'});
  c=W.__test.compute();assert.equal(c.sourceOnly,false);assert.equal(c.fsAfterAdj.checks.cashTies,true);
});
test('captured source report keeps its own figures if the live computation is later mutated',async()=>{
  const {context:W}=harness();await W.SKosifTBReview.openClient('apple-2024');const c=W.__test.compute(),x=W.__test.docX(c);
  c.fsAfterAdj.pl.find(r=>r.key==='revenue').current=1;
  assert.equal(x.fs.pl.find(r=>r.key==='revenue').current,39103500);
});
test('source CSV and print carry frozen identity and explicit absence status',async()=>{
  const {context:W}=harness();await W.SKosifTBReview.openClient('apple-2024');const c=W.__test.compute();
  const csv=W.__test.sourceCsv(c);assert.ok(csv);assert.match(csv.filename,/Apple Inc.*2024-09-28/);
  const content=JSON.stringify(csv);assert.match(content,/USD/);assert.match(content,/US_GAAP/);assert.match(content,/2023-09-30/);assert.match(content,/unavailable/);
  let printed='',branded=0;W.SK.brandPrint=()=>branded++;W.open=()=>({document:{open(){},write(s){printed=s;},close(){},createElement(){return {};},head:{appendChild(){}}},focus(){},print(){}});
  W.__test.printReport(c);assert.match(printed,/Apple Inc/);assert.match(printed,/US_GAAP/);assert.doesNotMatch(printed,/الرأي المشتق|الهللة|rd-sign/);assert.equal(branded,0);
});
test('direct assurance engine rejects source-only and saved simulated evidence',async()=>{
  const {context:W,E,state}=harness();await W.SKosifTBReview.openClient('apple-2024');let c=W.__test.compute();
  assert.equal(E.audit.aiReview.deriveOpinion(c.tb,c.base,E.audit.aiReview.newSession(c.d.ctx),[],{cash:'accepted'}).opinion,'not-assessed');
  await W.SKosifTBReview.showcase('apple-2024');c=W.__test.compute();
  assert.deepEqual(plain(E.audit.aiReview.evidenceFromSession(c.base,c.session)),{});
  assert.equal(c.session.final.aiOpinion,'لم يُقيّم');
  assert.ok(c.session.rounds.every(r=>r.origin&&r.decision!=='sufficient'&&r.reviewed.every(d=>d.verdict!=='مقبول')));
  assert.doesNotMatch(JSON.stringify(c.session),/الأدلة كافية وملائمة|كل المخاطر الجوهرية|لا اعتراض على إصدار التقرير/);
  W.__test.newFile(W.__test.blank());await W.SKosifTBReview.load(W.SKEngines.reports.tbImport.SAMPLE_TB_CSV,'ordinary-ledger',{company:'Independent ordinary ledger',country:'SA'});await W.SKosifTBReview.openClient('apple-2024');c=W.__test.compute();
  assert.deepEqual(plain(E.audit.aiReview.evidenceFromSession(c.base,c.session)),{});
  assert.equal(E.audit.aiReview.deriveOpinion(c.tb,c.base,c.session,[]).opinion,'not-assessed');
  // A saved legacy round must remain blocked even if it predates the origin flag.
  state.skosif_tbreview_v1.session.rounds[0].summary='الأدلة كافية وملائمة';state.skosif_tbreview_v1.session.final.aiOpinion='غير معدل';
  delete state.skosif_tbreview_v1.session.origin;
  state.skosif_tbreview_v1.session.rounds[0].origin=undefined;
  c=W.__test.compute();assert.doesNotMatch(W.__test.aiTab(c),/الأدلة كافية وملائمة|غير معدل/);
});
test('source management and PBC letter routes cannot imply an actual engagement',async()=>{
  const {context:W}=harness();await W.SKosifTBReview.openClient('apple-2024');const c=W.__test.compute();
  let printed='';W.SK.brandPrint=()=>{};W.open=()=>({document:{open(){},write(s){printed=s;},close(){},createElement(){return {};},head:{appendChild(){}}},focus(){},print(){}});
  for(const name of ['printLetter','printPbcLetter']){W.__test[name](c);assert.doesNotMatch(printed,/في إطار مراجعتنا|تنفيذاً لخطاب التكليف|قمنا بمراجعة/);assert.match(printed,/مرجع|المصدر/);}
});
test('all declared source identity fields are checked, even where the renderer uses canonical metadata',async()=>{
  const mutations=[c=>c.sourceModel.scope='parent-only',c=>c.consolidated=false,c=>c.reportingFramework='IFRS',c=>c.currency='EUR',c=>c.sourceModel.issuer='Different Co',c=>c.issuerCountry='SA',c=>c.sourceModel.facts.pop(),c=>c.sourceModel.facts.push(c.sourceModel.facts[0]),c=>c.sourceModel.sourcePages=[1]];
  for(const mutate of mutations){const {context:W,state}=harness();await W.SKosifTBReview.openClient('apple-2024');mutate(state.skosif_tbreview_v1.ctx);assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,false);}
});
test('explicit simulation origin cannot become professional evidence in an ordinary engagement',()=>{
  const {E}=harness(),AI=E.audit.aiReview,DE=E.audit.demoEngagement,tb=E.reports.tbImport.parseTrialBalance(E.reports.tbImport.SAMPLE_TB_CSV),review=E.audit.tbReview.reviewTrialBalance(tb,{});
  let s=AI.newSession({company:'Test',period:'2025',framework:'IFRS'});
  const ctx={company:'Test',periodEnd:'2025-12-31'};s=AI.addRound(s,AI.normalizeRound(DE.round1(review,ctx),s,tb,'test'));
  const docs=DE.documents(review,s.rounds[0].requests,ctx);for(const d of docs)s=AI.addUpload(s,{...d,mimeType:'text/plain',size:d.text.length});
  s=AI.addRound(s,AI.normalizeRound(DE.round2(review,s.rounds[0].requests,docs,ctx),s,tb,'test'));
  assert.deepEqual(plain(AI.evidenceFromSession(review,s)),{});assert.equal(AI.deriveOpinion(tb,review,s,[]).opinion,'not-assessed');
  assert.equal(AI.normalizeFinal({overallOpinion:'غير معدل'},s,tb).aiOpinion,'لم يُقيّم');
  // The exact historical SQC demo model label is also a known simulation marker.
  const legacy=plain(s);delete legacy.origin;for(const r of legacy.rounds){delete r.origin;r.model='محاكاة SQC (دون مفتاح)';for(const d of r.reviewed)delete d.origin;}for(const u of legacy.uploads)delete u.origin;
  assert.equal(AI.deriveOpinion(tb,review,legacy,[]).opinion,'not-assessed');
});
test('pending legacy models fail closed while a genuine operational sample retains baseline math',()=>{
  const {E}=harness();const expected=JSON.parse(fs.readFileSync(root+'/tools/fixtures/non-apple-statements-baseline.json','utf8'));
  for(const [id,baseline] of Object.entries(expected)){
    const t=E.reports.corpusCompanies.companyTrialBalance(id);if(!t){assert.ok(E.reports.corpusCompanies.sourceUnavailableReason(id));continue;}if(t.ctx.sourceModel?.replay){const s=E.reports.statements.buildStatements(E.reports.tbImport.parseTrialBalance(t.csv),t.overrides);assert.equal(s.replay.status,'available',id);assert.equal(s.reconstructionStatus.status,'unavailable',id);continue;}assert.deepEqual(plain(E.reports.statements.buildStatements(E.reports.tbImport.parseTrialBalance(t.csv),t.overrides,{tax:'income'})),baseline,id);
  }
  const operational=E.reports.statements.buildStatements(E.reports.tbImport.parseTrialBalance(E.reports.tbImport.SAMPLE_TB_CSV));
  assert.equal(operational.checks.cashTies,true);assert.notEqual(operational.cf,null);
});

function renderReview(h) {
  const node={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},dataset:{}};
  h.context.scrollTo=()=>{};
  h.context.__test.setTestRoot(node);
  return node;
}
function assertSourceShell(node,issuer) {
  assert.match(node.innerHTML,/tbr-source-replay/);
  assert.match(node.innerHTML,/عرض القوائم المنشورة من المصدر/);
  assert.ok(node.innerHTML.includes(issuer),issuer);
  assert.match(node.innerHTML,/data-source-kind="published-statements"/);
  assert.doesNotMatch(node.innerHTML,/data-tab=|data-a="demo-audit"|tbr-flowmap|data-studio-host/);
}
for(const [id,issuer] of [['apple-2024','Apple Inc.'],['pg-2026','Procter'],['homedepot-2025','Home Depot'],['mcdonalds-2022','McDonald'],['mercedes-2025','Mercedes']])
  test(id+': initial, repeated, saved reopen and deep-linked tabs stay in the source-only shell',async()=>{
    const h=harness(),W=h.context,node=renderReview(h);
    const fid=await W.SKosifTBReview.openClient(id);assertSourceShell(node,issuer);
    W.SKosifTBReview.open('tb');assertSourceShell(node,issuer);
    W.__test.newFile(W.__test.blank());
    assert.equal(await W.SKosifTBReview.openClient(id),fid);assertSourceShell(node,issuer);
    W.__test.newFile(W.__test.blank());W.__test.openFile(fid);assertSourceShell(node,issuer);
    for(const tab of ['plan','docs','ai','conf','adj','close','fs']){W.SKosifTBReview.open(tab);assertSourceShell(node,issuer);}
    assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,true);
    assert.equal(h.state.skosif_tbreview_v1.session,null,'opening never runs a demo audit');
  });
test('ordinary trial balance still renders the audit shell after reopening an Apple source file',async()=>{
  const h=harness(),W=h.context,node=renderReview(h);
  const apple=await W.SKosifTBReview.openClient('apple-2024');const ordinary=W.__test.newFile(W.__test.blank());
  await W.SKosifTBReview.load(h.E.reports.tbImport.SAMPLE_TB_CSV,'ordinary-ledger',{company:'Ordinary audit company',country:'SA'});
  W.__test.openFile(apple);assertSourceShell(node,'Apple Inc.');W.__test.openFile(ordinary);
  assert.match(node.innerHTML,/data-tab="tb"/);assert.match(node.innerHTML,/data-a="demo-audit"/);assert.doesNotMatch(node.innerHTML,/tbr-source-replay/);
  assert.equal(W.__test.compute().sourceOnly,false);
});
test('blocked source selections preserve the current source screen and edited identity stays unavailable',async()=>{
  const h=harness(),W=h.context,node=renderReview(h);await W.SKosifTBReview.openClient('apple-2024');
  const saved=JSON.stringify(h.state.skosif_tbreview_v1);
  for(const model of h.E.reports.corpusCompanies.auditModelCatalog().filter(x=>!x.openable)){
    assert.equal(await W.SKosifTBReview.openClient(model.id),null,model.id);
    assert.equal(JSON.stringify(h.state.skosif_tbreview_v1),saved);assertSourceShell(node,'Apple Inc.');
  }
  h.state.skosif_tbreview_v1.ctx.company='Tampered source identity';W.SKosifTBReview.open('tb');
  assertSourceShell(node,'Apple Inc.');assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,false);
  assert.doesNotMatch(node.innerHTML,/391,035/);assert.equal(W.__test.sourceCsv(W.__test.compute()),null);
});
