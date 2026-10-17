import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { harness, plain, root } from './apple-source-harness.mjs';
const bytes=fs.readFileSync(root+'/tools/fixtures/mcdonalds/issuer-model.json');
const oracle=JSON.parse(bytes);
const sourceId='mcdonalds-2022';
const value=(table,row,year)=>Math.round(Number(oracle.tables[table].rows[row].values[year])*100);

test('McDonald’s independent oracle was frozen before app coding',()=>{
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'873af9d6ab999fa21b8c278edab2d4423bfe3e32318ce362ea27e58d5b7a327e');
});
test('reviewed FY2022 exists and does not validate an FY2025 alias',()=>{
 const {E}=harness();
 assert.ok(E.reports.publishedSource.reviewedPublishedSource(sourceId),'missing reviewed McDonald’s FY2022 adapter');
 assert.equal(E.reports.publishedSource.reviewedPublishedSource('mcdonalds-2025'),null);
 assert.ok(E.reports.corpusCompanies.companyTrialBalance(sourceId),'missing actual registry integration');
});
function model(E){const t=E.reports.corpusCompanies.companyTrialBalance(sourceId);assert.ok(t);return t;}
function checkStatements(s){
 assert.equal(s.sourceKind,'published-statements');assert.equal(s.reconstructionStatus.status,'unavailable');
 assert.equal(s.replay.status,'available');assert.deepEqual(plain(s.pl),[]);assert.deepEqual(plain(s.sfp),[]);assert.deepEqual(plain(s.keys),{});
 assert.equal(s.cf,null);assert.equal(s.checks.cashTies,null);assert.equal(s.checks.balanced,null);assert.equal(s.checks.difference,null);
 assert.equal(s.soceStatus.status,'unavailable');assert.equal(s.soce.rows.length,0);
 let n=0;const facts=new Map(oracle.facts.map(f=>[f.fact_id,f]));
 for(const t of s.replay.tables)for(const r of t.rows)for(const c of Object.values(r.cells)){
  const f=facts.get(c.sourceFactId);assert.ok(f);assert.equal(c.value,f.value===null?null:Number(f.value));n++;
 }
 assert.equal(n,378);assert.ok(s.replay.checks.every(c=>c.status==='exact'&&c.residual===0));
}
test('generic actual engine preserves primary leaves and negative equity without invented statements',()=>{
 const {E}=harness(),t=model(E),s=E.reports.statements.buildStatements(E.reports.tbImport.parseTrialBalance(t.csv),t.overrides,{tax:'income'});
 checkStatements(s);

});
test('all source tables typed facts dates units evidence hashes and unknowns survive payload',()=>{
 const {E}=harness(),t=model(E),p=t.ctx.sourceModel.sourcePayload;
 assert.deepEqual(plain(p.identity),oracle.identity);
 assert.deepEqual(plain(p.tables),oracle.tables);
 assert.deepEqual(plain(p.facts),oracle.facts);
 assert.equal(p.facts.length,970);assert.equal(p.facts.filter(f=>f.value===null).length,7);
 assert.equal(t.ctx.periodEnd,'2022-12-31');assert.equal(t.ctx.priorPeriodEnd,'2021-12-31');assert.equal(t.ctx.periodStart,'2022-01-01');
 assert.equal(t.ctx.sourceModel.reviewedModelSha256,'873af9d6ab999fa21b8c278edab2d4423bfe3e32318ce362ea27e58d5b7a327e');
 assert.equal(t.ctx.sourceModel.sourceSha256,oracle.source.pdf_sha256);
 assert.deepEqual(plain(t.ctx.sourceModel.auditorReference.pages),[2195,2196,2197]);assert.equal(t.ctx.auditFirm,'');
});
test('actual selection and report renderer attribute McDonald’s source and never Apple or FY2025',async()=>{
 const {E,context:W}=harness(),t=model(E);assert.ok(await W.SKosifTBReview.openClient(sourceId));
 const c=W.__test.compute();checkStatements(c.fsAfterAdj);assert.equal(c.d.tbText,t.csv);
 const x=W.__test.docX(c);assert.equal(x.sourceVerified,true);assert.equal(x.opinion.opinion,'not-assessed');
 for(const kind of ['annual','release','notes','auditor','committee','icfr']){
  const html=W.SKosifReportDocs[kind](x);assert.match(html,/McDonald/);assert.match(html,/2022-12-31/);assert.match(html,/2021-12-31/);
  assert.doesNotMatch(html,/Apple|2025-12-31|الصفحة 129|rd-sign|قمنا بمراجعة|أجرينا مراجعة|الزكاة|SOCPA/);
 }
 assert.match(W.SKosifReportDocs.auditor(x),/2023-02-24/);
});
test('changed facts or identity lose verification while source origin remains non-assurance',async()=>{
 for(const mutate of [d=>d.ctx.periodEnd='2025-12-31',d=>d.ctx.company='Other issuer',d=>d.ctx.currency='EUR',d=>d.ctx.sourceModel.scope='parent-only',d=>d.tbText=d.tbText.replace('2583.8','2584.8'),d=>d.ctx.sourceModel.sourcePayload.facts[0].value='118200']){
  const {context:W,state}=harness();await W.SKosifTBReview.openClient(sourceId);assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,true);
  mutate(state.skosif_tbreview_v1);const c=W.__test.compute();assert.equal(c.sourceOnly,true);assert.equal(c.fsAfterAdj.cf,null);assert.equal(W.__test.docX(c).sourceVerified,false);
 }
});
test('import edit reopen and source simulation preserve boundary without contaminating operational files',async()=>{
 const {E,context:W,state}=harness(),t=model(E);
 await W.SKosifTBReview.load(t.csv,'source data',t.ctx);assert.equal(W.__test.compute().sourceOnly,true);
 await W.SKosifTBReview.openClient(sourceId);await W.SKosifTBReview.showcase(sourceId);let c=W.__test.compute();
 assert.equal(c.derived.opinion,'not-assessed');assert.equal(c.sourceReplay,true);assert.equal(W.SKosifTBReview.rows().rows.length,0);
 W.__test.newFile(W.__test.blank());await W.SKosifTBReview.load(W.SKEngines.reports.tbImport.SAMPLE_TB_CSV,'ordinary-ledger',{company:'Independent ordinary ledger',country:'SA'});assert.equal(W.__test.compute().sourceOnly,false);
 await W.SKosifTBReview.openClient(sourceId);c=W.__test.compute();assert.equal(c.sourceOnly,true);checkStatements(c.fsAfterAdj);
 state.skosif_tbreview_v1.tbText=state.skosif_tbreview_v1.tbText.replace(/^#.*\n/,'');
 assert.equal(W.__test.compute().sourceOnly,true);assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,false);
});
test('every rendered source cell and exported row matches the independent original observation',async()=>{
 const {context:W}=harness();await W.SKosifTBReview.openClient(sourceId);const c=W.__test.compute(),x=W.__test.docX(c),html=W.SKosifReportDocs.annual(x),csv=W.__test.sourceCsv(c);
 assert.equal(csv.rows.length,378);const facts=new Map(oracle.facts.map(f=>[f.fact_id,f]));let count=0;
 for(const section of html.matchAll(/<section class="rd-replay-table" data-source-table="([^"]+)">([\s\S]*?)<\/section>/g)){
  const table=oracle.tables[section[1]];assert.ok(table);
  for(const row of section[2].matchAll(/<tr data-source-row="([^"]+)">([\s\S]*?)<\/tr>/g)){
   const cells=[...row[2].matchAll(/<td class="n" data-cell-status="([^"]+)" data-period-end="([^"]+)" data-period-kind="([^"]+)" data-unit="([^"]+)">([\s\S]*?)<\/td>/g)];assert.equal(cells.length,table.columns.length);
   for(let i=0;i<cells.length;i++){
    const f=facts.get(section[1]+'.'+row[1]+'.'+table.columns[i]),cell=cells[i],display=table.rows[row[1]].source_display?.[table.columns[i]],text=cell[5].split('<small>')[0];
    assert.equal(cell[1],f.value===null?'unavailable':'reported');assert.equal(cell[2],f.observation_date||f.period_end);assert.equal(cell[3],f.temporal_kind);
    if(f.value===null)assert.equal(text,'غير متاح');else if(display!==undefined)assert.equal(text,display);else assert.equal(Number(text.replace(/,/g,'')),Number(f.value));count++;
   }
  }
 }
 assert.equal(count,378);
 for(const values of csv.rows){const r=Object.fromEntries(csv.headers.map((key,i)=>[key,values[i]])),f=facts.get(r.source_fact_id);assert.ok(f);
  assert.equal(r.issuer,oracle.identity.issuer);assert.equal(r.source_sha256,oracle.source.pdf_sha256);assert.equal(r.accounting_basis,'US_GAAP');assert.equal(r.normalized_value,f.value===null?'':Number(f.value));assert.equal(r.value,f.value===null?'unavailable':oracle.tables[f.table_id].rows[f.row_id].source_display?.[f.column_key]??Number(f.value));assert.equal(r.period_end,f.observation_date||f.period_end);assert.equal(r.period_kind,f.temporal_kind);assert.equal(r.cell_status,f.value===null?'unavailable':'reported');assert.equal(r.source_page,f.source_page);
 }
});
test('generic replay rejects actual transport and mapping mutations and unsupported analytics stay unavailable',()=>{
 const {E}=harness(),t=model(E),tb=E.reports.tbImport.parseTrialBalance(t.csv);
 for(const mutate of [b=>b.rows[0].balance+=100,b=>b.rows.pop(),b=>b.rows.push(b.rows[0]),b=>b.sourceId='mcdonalds-2025',b=>b.hasPrior=false]){
  const bad=plain(tb);mutate(bad);const s=E.reports.statements.buildStatements(bad,t.overrides);assert.equal(s.replay.status,'unavailable');assert.deepEqual(plain(s.replay.tables),[]);assert.deepEqual(plain(s.keys),{});
 }
 const altered=E.reports.statements.buildStatements(tb,{...t.overrides,'11101':'revenue'});assert.equal(altered.replay.status,'unavailable');
 const s=E.reports.statements.buildStatements(tb,t.overrides);assert.deepEqual(plain(E.reports.analysis.ratios(s)),[]);assert.equal(E.reports.analysis.freeCashFlow(s),null);assert.deepEqual(plain(E.reports.annualReport.performanceMeasures(s)),[]);
 assert.throws(()=>E.audit.tbReview.reviewTrialBalance(tb,{overrides:t.overrides}),/operational audit review is unavailable/);
});
test('accepted adjustments and altered metadata block report rows and source export, not merely assurance',async()=>{
 for(const mutate of [d=>d.accepted=[{id:'invented-adjustment'}],d=>d.ctx.sourceModel.sourceSha256='0'.repeat(64),d=>d.ctx.sourceModel.replay.tables[0].rows[0].cells['2022'].value=118200,d=>delete d.ctx.sourceModel,d=>d.sourceId='mcdonalds-2025']){
  const {context:W,state}=harness();await W.SKosifTBReview.openClient(sourceId);mutate(state.skosif_tbreview_v1);
  const c=W.__test.compute(),x=W.__test.docX(c);assert.equal(x.sourceVerified,false);assert.equal(W.__test.sourceCsv(c),null);assert.doesNotMatch(W.SKosifReportDocs.annual(x),/data-source-row|23,182.6/);assert.equal(W.SKosifTBReview.rows().sourceOnly,true);
 }
});
