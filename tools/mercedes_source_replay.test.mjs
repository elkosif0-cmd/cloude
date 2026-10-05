import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {harness,plain,root} from './apple-source-harness.mjs';
const dir=process.env.SQC_MERCEDES_ORACLE_DIR||root+'/tools/fixtures/mercedes-source-evidence',read=p=>JSON.parse(fs.readFileSync(dir+'/'+p,'utf8'));
const oracle=read('primary-source-oracle.json'),core=read('core/models/source-model.json'),narrative=read('narrative/selected-narrative-model.json');
function adapter(h){const a=h.E.reports.mercedesSource?.reviewedMercedesSource('mercedes-2025');assert.ok(a,'Mercedes requires a dedicated published-source adapter');return a;}
function fixture(h){const t=h.E.reports.corpusCompanies.companyTrialBalance('mercedes-2025');assert.equal(t?.ctx?.sourceModel?.id,'mercedes-2025','Generic company selection must resolve the reviewed source adapter');return t;}
function output(h,t){return h.E.reports.statements.buildStatements(h.E.reports.tbImport.parseTrialBalance(t.csv),t.overrides,{tax:'income'});}
test('independent oracle frozen before implementation matches immutable checkpoint hashes',()=>{
 const f=read('primary-freeze-manifest.json');
 for(const[p,sha]of Object.entries(f.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+p)).digest('hex'),sha,p);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+'/primary-source-oracle.json')).digest('hex'),f.primarySourceOracleSha256);
 assert.equal(f.primaryNumericCells,464);assert.equal(read('parent-verified-unified-ledger.json').length,409);
});
test('adapter has exact Group IFRS identity and preserves every reviewed evidence model',()=>{
 const h=harness(),a=adapter(h),s=a.sourceModel;
 assert.equal(s.issuer,'Mercedes-Benz Group AG');assert.equal(s.issuerCountry,'DE');assert.equal(s.currency,'EUR');assert.equal(s.unit,'million');
 assert.equal(s.accountingBasis,'IFRS_EU');assert.equal(s.scope,'consolidated');assert.equal(s.periodStart,'2025-01-01');assert.equal(s.periodEnd,'2025-12-31');assert.equal(s.priorPeriodEnd,'2024-12-31');
 assert.equal(s.sourceSha256,core.source_pdf_sha256);assert.equal(s.sourcePackageSha256,'d3389e9e0eff5ac1de876e0905d35b4a3e9b54dde5f0d828f991848c79949ad4');
 assert.equal(s.narrativePackageSha256,'97e5b9f8489377cb3bea0ce309e9ef98802e18c012ab83aa9b17be4c239773f9');
 assert.equal(s.reviewedModelSha256,'dd83f48a95700e34b736eb6c5b93c57fb9e504ae6d470f450d3642dc7e02e9f7');
 assert.deepEqual(plain(s.reviewedFacts.core),core);assert.deepEqual(plain(s.reviewedFacts.narrative),narrative);
 assert.deepEqual(plain(s.reviewedFacts.sustainability),read('narrative/sustainability-governance/selected-quantitative-tables.json'));
 assert.deepEqual(plain(s.reviewedFacts.climate),read('narrative/sustainability-governance/climate-supplement/selected-quantitative-tables.json'));
 assert.deepEqual(plain(s.reviewedFacts.coreExceptions),read('core/source-exceptions.json'));
 assert.deepEqual(plain(s.reviewedFacts.narrativeExceptions),read('narrative/source-exceptions.json'));
 assert.equal(s.reviewedFacts.narrative.forecast_2026.rows.length,16);
 assert.ok(s.replay.unavailable.some(x=>x.id==='parent-hgb'));assert.ok(s.replay.unavailable.some(x=>x.id==='forecasts'));
 assert.ok(s.replay.tables.every(t=>!t.id.includes('hgb')&&!t.id.includes('forecast')));
});
test('all 464 independent primary source amounts, labels, order and dashes are preserved',()=>{
 const h=harness(),a=adapter(h);let compared=0;
 assert.deepEqual(plain(a.sourceModel.replay.tables.map(t=>t.id)),['income','eps','oci','assets','equity_liabilities','cash_flow','equity_2024','equity_2025']);
 for(const[id,expected]of Object.entries(oracle)){
  const t=a.sourceModel.replay.tables.find(t=>t.id===id);assert.ok(t,id);assert.equal(t.rows.length,expected.rows.length,id);assert.deepEqual(plain(t.columns.map(x=>x.id)),expected.columns);
  expected.rows.forEach((o,i)=>{const row=t.rows[i];assert.equal(row.label,o.label,id+':'+i);assert.equal(row.sourcePage,o.sourcePage);assert.equal(row.status,'reported');assert.equal(row.unit,id==='eps'?'EUR per share':'EUR million');
   expected.columns.forEach((c,j)=>{assert.equal(row.cells[c].value,o.values[j],id+'.'+o.id+'.'+c);assert.equal(row.cells[c].status,'reported');if(o.displays[j]==='–')assert.equal(row.cells[c].display,'–');compared++;});
  });
 }
 assert.equal(compared,464);
});
test('cash instants and full equity source instants remain separate from annual flows',()=>{
 const h=harness(),r=adapter(h).sourceModel.replay.tables;
 const cf=r.find(t=>t.id==='cash_flow'),row=id=>cf.rows.find(r=>r.id===id);
 assert.equal(row('closing_total').cells['2025'].value,12276);assert.equal(row('closing_balance_sheet').cells['2025'].value,12254);assert.equal(row('closing_hfs').cells['2025'].value,22);
 for(const y of ['2025','2024']){
  assert.deepEqual(plain(row('opening_total').cells[y].period),{kind:'instant',end:y+'-01-01'});
  assert.deepEqual(plain(row('closing_total').cells[y].period),{kind:'instant',end:y+'-12-31'});
  assert.deepEqual(plain(cf.columns.find(c=>c.id===y).period),{kind:'duration',start:y+'-01-01',end:y+'-12-31'});
  const eq=r.find(t=>t.id==='equity_'+y);assert.equal(eq.rows.length,11);assert.equal(eq.columns.length,10);
  for(const c of eq.columns){assert.deepEqual(plain(eq.rows[0].cells[c.id].period),{kind:'instant',end:y+'-01-01'});assert.deepEqual(plain(eq.rows[10].cells[c.id].period),{kind:'instant',end:y+'-12-31'});}
 }
});
test('source scope and assurance boundaries preserve ECL, recasts, associate periods and unresolved exceptions',()=>{
 const s=adapter(harness()).sourceModel,c=s.reviewedFacts.core;
 assert.equal(c.tables.ecl_total.rows.closing['2025'],'1003');assert.equal(c.tables.fs_receivables.rows.allowance_total['2025'],'-985');
 assert.equal(c.tables.daimler_truck_associate_income.periods['2025'].end,'2025-09-30');assert.equal(c.tables.daimler_truck_associate_income.direct_growth_comparison_allowed,false);
 assert.equal(c.assurance.financial_statement_audit.separate_icfr_effectiveness_opinion,false);assert.equal(c.assurance.sustainability.overall_level,'limited');
 assert.equal(c.assurance.sustainability.reasonable_assurance_only.length,5);assert.match(s.replay.limitations.join(' '),/3355/);
 assert.equal(s.auditorReference.name,'PricewaterhouseCoopers GmbH Wirtschaftsprüfungsgesellschaft');assert.equal(s.auditorReference.date,'2026-03-03');
 assert.ok(s.replay.unavailable.some(x=>x.id==='icfr-effectiveness'));assert.ok(s.replay.unavailable.some(x=>x.id==='sustainability'));
 assert.ok(s.replay.limitations.some(x=>x.includes('12276')&&x.includes('12254')&&x.includes('22')));
 assert.ok(s.replay.checks.every(x=>x.assurance==='none'));assert.ok(s.replay.checks.some(x=>x.residual!==0));
 for(const x of s.replay.checks)assert.equal(x.residual,x.computed-x.reported,x.id);
});
test('generic selection enters exact replay and never operational reconstruction or assurance',()=>{
 const h=harness(),t=fixture(h),out=output(h,t);assert.equal(t.balanced,null);assert.equal(t.ctx.auditFirm,'');assert.notEqual(t.ctx.auditStandard,'PCAOB');assert.equal(out.replay.status,'available');
 assert.equal(out.reconstructionStatus.status,'unavailable');assert.deepEqual(plain(out.keys),{});assert.deepEqual(plain(out.pl),[]);assert.deepEqual(plain(out.sfp),[]);assert.equal(out.cf,null);assert.deepEqual(plain(out.soce.rows),[]);
 for(const key of ['balanced','difference','priorBalanced','cashTies','cfDifference'])assert.equal(out.checks[key],null);
 assert.deepEqual(plain(h.E.reports.analysis.ratios(out)),[]);assert.equal(h.E.reports.analysis.freeCashFlow(out),null);assert.deepEqual(plain(h.E.reports.annualReport.performanceMeasures(out)),[]);
 assert.throws(()=>h.E.audit.tbReview.reviewTrialBalance(h.E.reports.tbImport.parseTrialBalance(t.csv),{overrides:t.overrides}),/published|source|unavailable/i);
});
test('real replay path rejects amount, source marker, row-label and override mutations',()=>{
 const h=harness(),t=fixture(h);
 const mutations=[x=>x.csv=x.csv.replace('132214','132215'),x=>x.csv=x.csv.replace('mercedes-2025','unreviewed-2025'),x=>x.csv=x.csv.replace('Revenue','Wrong revenue'),x=>x.overrides={...x.overrides,MB_income_revenue:'cash'}];
 for(const mutate of mutations){const x=plain(t);mutate(x);const out=output(h,x);assert.equal(out.replay?.status,'unavailable');assert.deepEqual(plain(out.replay.tables),[]);}
});
test('actual UI selection, document and export use all exact source values and periods',async()=>{
 const h=harness(),W=h.context,t=fixture(h);await W.SKosifTBReview.openClient('mercedes-2025');const c=W.__test.compute(),x=W.__test.docX(c);
 assert.equal(c.d.tbText,t.csv);assert.equal(c.sourceReplay,true);assert.equal(x.sourceVerified,true);assert.equal(x.opinion.opinion,'not-assessed');
 const html=W.SKosifReportDocs.annual(x);assert.match(html,/132,214/);assert.match(html,/12,276/);assert.match(html,/12,254/);assert.match(html,/EUR per share/);assert.match(html,/2025-01-01/);assert.match(html,/2024-12-31/);assert.match(html,/Consolidated Statement of Changes in Equity/);
 assert.doesNotMatch(html,/Apple|SOCPA|قمنا بمراجعة|rd-sign/);
 const exported=W.__test.sourceCsv(c);assert.ok(exported);assert.equal(exported.rows.length,464);
 for(const key of ['period_end','period_start','unit','cell_status'])assert.ok(exported.headers.includes(key));
 const audit=W.SKosifReportDocs.auditor(x);assert.match(audit,/PricewaterhouseCoopers/);assert.match(audit,/2026-03-03/);assert.doesNotMatch(audit,/rd-sign|قمنا بمراجعة/);
 const rows=W.SKosifTBReview.rows();assert.equal(rows.sourceOnly,true);assert.deepEqual(plain(rows.rows),[]);
});
test('UI rejects all identity, period, amount, note-scope and evidence-model edits without leaking canonical figures',async()=>{
 const mutations=[d=>d.ctx.company='Mercedes-Benz AG',d=>d.ctx.currency='USD',d=>d.ctx.periodEnd='2026-12-31',d=>d.ctx.periodStart='2025-02-01',d=>d.ctx.sourceModel.accountingBasis='HGB',d=>d.ctx.sourceModel.scope='parent',d=>d.ctx.sourceModel.unit='billion',d=>d.ctx.sourceModel.sourceSha256='0'.repeat(64),d=>d.ctx.sourceModel.replay.tables[1].rows[0].unit='EUR million',d=>d.ctx.sourceModel.reviewedFacts.narrative.forecast_2026.status='actual',d=>d.ctx.sourceModel.reviewedFacts.core.assurance.financial_statement_audit.separate_icfr_effectiveness_opinion=true,d=>d.ctx.sourceModel.periodStart='2025-02-01',d=>d.ctx.sourceModel.replay.tables[0].rows[0].cells['2025'].value=0,d=>d.ctx.sourceModel.replay.tables[0].columns[0].period.end='2026-12-31',d=>d.ctx.sourceModel.reviewedFacts.core.tables.ecl_total.rows.closing['2025']='985',d=>d.ctx.sourceModel.reviewedFacts.core.tables.daimler_truck_associate_income.periods['2025'].end='2025-12-31',d=>d.tbText=d.tbText.replace('132214','132215'),d=>d.tbText=d.tbText.replace('mercedes-2025','apple-2024'),d=>d.accepted=[{id:'source-adjustment',amount:1}]];
 for(const mutate of mutations){const h=harness(),W=h.context;fixture(h);await W.SKosifTBReview.openClient('mercedes-2025');mutate(h.state.skosif_tbreview_v1);const c=W.__test.compute(),x=W.__test.docX(c);assert.equal(c.sourceOnly,true);assert.equal(x.sourceVerified,false);assert.doesNotMatch(W.SKosifReportDocs.annual(x),/132,214/);assert.equal(W.__test.sourceCsv(c),null);}
});
test('repeated selection and source-origin tampering preserve isolation from operational clients',async()=>{
 const h=harness(),W=h.context,t=fixture(h);await W.SKosifTBReview.openClient('mercedes-2025');assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,true);
 W.__test.newFile(W.__test.blank());await W.SKosifTBReview.load(W.SKEngines.reports.tbImport.SAMPLE_TB_CSV,'ordinary-ledger',{company:'Independent ordinary ledger',country:'SA'});assert.equal(W.__test.compute().sourceOnly,false);await W.SKosifTBReview.openClient('mercedes-2025');assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,true);
 await W.SKosifTBReview.load(t.csv.replace(/^#.*\n/,''),'source',t.ctx);assert.equal(W.__test.compute().sourceOnly,true);assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,false);
});

test('each of 244 imported source amount mutations is rejected by the real statement path',()=>{
 const h=harness(),t=fixture(h),lines=t.csv.split('\n');let rejected=0;
 for(let i=2;i<lines.length;i++)for(const col of [2,3]){
  const changed=[...lines],fields=h.E.reports.tbImport.splitLine(changed[i],',');fields[col]=String(Number(fields[col])+1);changed[i]=fields.map(x=>'"'+x.replace(/"/g,'""')+'"').join(',');
  const out=output(h,{...t,csv:changed.join('\n')});assert.equal(out.replay?.status,'unavailable',i+':'+col);assert.equal(out.replay.tables.length,0);rejected++;
 }
 assert.equal(rejected,244);
});
test('every source-rendered and exported primary cell retains its original value, unit and effective period',async()=>{
 const h=harness(),W=h.context;fixture(h);await W.SKosifTBReview.openClient('mercedes-2025');const c=W.__test.compute(),html=W.SKosifReportDocs.annual(W.__test.docX(c)),csv=W.__test.sourceCsv(c),at=key=>csv.headers.indexOf(key);let count=0;
 for(const[id,t]of Object.entries(oracle)){
  const section=html.match(new RegExp('data-source-table="'+id+'">([\\s\\S]*?)</section>'))?.[1];assert.ok(section,id);
  for(const r of t.rows){
   const row=section.match(new RegExp('data-source-row="'+r.id+'">([\\s\\S]*?)</tr>'))?.[1];assert.ok(row,id+'.'+r.id);
   const rendered=[...row.matchAll(/<td class="n"([^>]*)>([^<]*)(?:<small>[\s\S]*?<\/small>)?<\/td>/g)];assert.equal(rendered.length,t.columns.length);
   t.columns.forEach((col,j)=>{
    const sourceId=`primary.${id}.${r.id}.${col}`,exported=csv.rows.find(x=>x[at('source_fact_id')]===sourceId);assert.ok(exported,sourceId);
    assert.equal(exported[at('normalized_value')],r.values[j]);assert.equal(exported[at('value')],r.displays[j]==='–'?'–':r.values[j]);assert.equal(exported[at('line')],r.label);assert.equal(exported[at('source_page')],r.sourcePage);assert.equal(exported[at('cell_status')],'reported');
    const unit=id==='eps'?'EUR per share':'EUR million';assert.equal(exported[at('unit')],unit);assert.ok(rendered[j][1].includes('data-unit="'+unit+'"'));
    const y=/^equity_20/.test(id)?id.slice(-4):col,opening=r.id==='opening'||r.id.startsWith('opening_'),closing=r.id==='closing'||r.id.startsWith('closing_'),isInstant=['assets','equity_liabilities'].includes(id)||opening||closing,end=y+(opening?'-01-01':'-12-31');
    assert.equal(exported[at('period_end')],end);assert.equal(exported[at('period_kind')],isInstant?'instant':'duration');assert.equal(exported[at('period_start')],isInstant?'':y+'-01-01');assert.ok(rendered[j][1].includes('data-period-end="'+end+'"'));
    assert.equal(rendered[j][2],r.displays[j]==='–'?'–':new Intl.NumberFormat('en-US',{maximumFractionDigits:10}).format(r.values[j]));count++;
   });
  }
 }
 assert.equal(count,464);
});
test('unknown or partial saved source identity returns unavailable instead of operational audit or an exception',async()=>{
 for(const mutate of [d=>d.sourceId='unknown-source-record',d=>{d.tbText=d.tbText.replace(/^#.*\n/,'');delete d.sourceId;delete d.sourceKind;delete d.bundleId;delete d.ctx.corpusId;delete d.ctx.sourceKind;d.ctx.sourceModel={scope:'consolidated'};}]){
  const h=harness(),W=h.context;fixture(h);await W.SKosifTBReview.openClient('mercedes-2025');mutate(h.state.skosif_tbreview_v1);let c;assert.doesNotThrow(()=>{c=W.__test.compute();});const x=W.__test.docX(c);assert.equal(c.sourceOnly,true);assert.equal(x.sourceVerified,false);assert.equal(W.__test.sourceCsv(c),null);assert.doesNotMatch(W.SKosifReportDocs.annual(x),/132,214/);
 }
});
test('each of 464 edited saved replay amounts is denied by actual UI source binding and the valid control recovers',async()=>{
 const h=harness(),W=h.context;fixture(h);await W.SKosifTBReview.openClient('mercedes-2025');const d=h.state.skosif_tbreview_v1;let rejected=0;
 for(const t of d.ctx.sourceModel.replay.tables)for(const row of t.rows)for(const col of t.columns){
  const original=row.cells[col.id].value;row.cells[col.id].value=original+1;const c=W.__test.compute();assert.equal(c.sourceVerified,false,t.id+'.'+row.id+'.'+col.id);assert.equal(c.fsAfterAdj.replay.tables.length,0);assert.equal(W.__test.sourceCsv(c),null);row.cells[col.id].value=original;rejected++;
 }
 assert.equal(rejected,464);assert.equal(W.__test.compute().sourceVerified,true);assert.equal(W.__test.sourceCsv(W.__test.compute()).rows.length,464);
});
test('adapter returns fresh independent values and refuses unrelated issuer IDs',()=>{
 const h=harness(),one=adapter(h);one.sourceModel.reviewedFacts.core.tables.income.rows.revenue['2025']='0';one.sourceModel.replay.tables[0].rows[0].cells['2025'].value=0;
 const two=adapter(h);assert.equal(two.sourceModel.reviewedFacts.core.tables.income.rows.revenue['2025'],'132214');assert.equal(two.sourceModel.replay.tables[0].rows[0].cells['2025'].value,132214);assert.equal(h.E.reports.mercedesSource.reviewedMercedesSource('mercedes-2024'),null);
});
test('primary row contexts do not misclassify grand totals or the two equity-method OCI rows',()=>{
 const s=adapter(harness()).sourceModel,t=id=>s.replay.tables.find(t=>t.id===id),r=(table,id)=>t(table).rows.find(r=>r.id===id);
 assert.equal(r('assets','total_assets').context,'Assets');assert.equal(r('equity_liabilities','total_equity_liabilities').context,'Equity and liabilities');
 assert.match(r('oci','equity_method_reclassifiable').context,/may be reclassified/);assert.match(r('oci','equity_method_nonreclassifiable').context,/will not be reclassified/);
});
test('exact source transport rejects sub-cent EPS and amount changes plus blank-for-zero',()=>{
 const h=harness(),t=fixture(h);
 for(const mutate of [s=>s.replace('"132214"','"132214.001"'),s=>s.replace('"5.34"','"5.341"'),s=>s.replace('"-325","0"','"-325",""')]){
  const csv=mutate(t.csv);assert.notEqual(csv,t.csv);const result=output(h,{...t,csv});assert.equal(result.replay.status,'unavailable');assert.deepEqual(plain(result.replay.tables),[]);
 }
 const tb=h.E.reports.tbImport.parseTrialBalance(t.csv);delete tb.sourceTransport;assert.equal(h.E.reports.statements.buildStatements(tb,t.overrides).replay.status,'unavailable');
});
