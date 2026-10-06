import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {harness,plain,root} from './apple-source-harness.mjs';
const oracleDir=root+'/tools/fixtures/pg-source-evidence';
const oracle=JSON.parse(fs.readFileSync(oracleDir+'/reviewed-package/issuer-model.json','utf8'));
const labels=JSON.parse(fs.readFileSync(oracleDir+'/source-labels.json','utf8'));
function fixture(h){const t=h.E.reports.corpusCompanies.companyTrialBalance('pg-2026');assert.ok(t?.ctx?.sourceModel,'P&G must resolve to reviewed source adapter, not synthetic legacy accounts');return t;}
function output(h,t){return h.E.reports.statements.buildStatements(h.E.reports.tbImport.parseTrialBalance(t.csv),t.overrides,{tax:'income'});}
test('frozen independent source package and label oracle remain unchanged',()=>{
 const f=JSON.parse(fs.readFileSync(oracleDir+'/freeze.json','utf8'));
 assert.equal(f.frozenBeforeAdapter,true);
 for(const[p,hash]of Object.entries(f.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(oracleDir+'/'+p)).digest('hex'),hash,p);
 assert.equal(f.files['reviewed-package/issuer-model.json'],'2a5f3a67336ff1bead2b390a0ac860bc5ab5f0a2ae8484d3811c7f52011153a5');
});
test('generic P&G selection is source-only exact identity and full reviewed-model provenance',()=>{
 const h=harness(),t=fixture(h),s=t.ctx.sourceModel;
 assert.equal(s.issuer,oracle.issuer);assert.equal(s.entities,oracle.issuerScope);
 assert.equal(s.periodStart,'2025-07-01');assert.equal(s.periodEnd,'2026-06-30');assert.equal(s.priorPeriodEnd,'2025-06-30');
 assert.equal(s.accountingBasis,'US_GAAP');assert.equal(s.scope,'consolidated');assert.equal(s.currency,'USD');assert.equal(s.unit,'million');
 assert.equal(s.sourceSha256,oracle.source.bundleSha256);assert.equal(s.sourcePackageSha256,'c871ddf587f724d48654f6ebfecebd071df20bdb30ab04720116748844180792');
 assert.deepEqual(plain(s.reviewedFacts),oracle);assert.equal(t.ctx.auditFirm,'');
 assert.equal(s.auditorReference.name,oracle.assurance.auditor);assert.deepEqual(plain(s.auditorReference.pages),[2001,2002]);
 assert.equal(t.balanced,null);assert.match(t.source,/source|Source/);
});
test('every primary row, label, period and amount replays exactly, including reported rounding residuals',()=>{
 const h=harness(),t=fixture(h),out=output(h,t);assert.equal(out.replay?.status,'available');
 for(const[st,rowLabels]of Object.entries(labels)){
  const expected=oracle.statements[st],table=out.replay.tables.find(t=>t.id===st);assert.ok(table,st);
  assert.equal(table.rows.length,Object.keys(rowLabels).length,st);
  assert.deepEqual(table.columns.map(c=>c.period.end),expected.periods.map(y=>y+'-06-30'));
  for(const[id,label]of Object.entries(rowLabels)){
   const r=table.rows.find(r=>r.id===id);assert.ok(r,st+'.'+id);assert.equal(r.label,label);assert.equal(r.sourcePage,expected.sourcePhysicalPage);assert.equal(r.status,'reported');
   for(const col of table.columns){const y=col.period.end.slice(0,4);assert.equal(r.cells[col.id].value,expected.rows[id][y],st+'.'+id+'.'+y);assert.equal(r.cells[col.id].status,'reported');}
  }
 }
 const bs=out.replay.tables.find(t=>t.id==='balance_sheet');assert.equal(bs.columns.length,2);
 const inv=bs.rows.find(r=>r.id==='inventory_total');assert.equal(inv.cells['2025'].value,7551);
 assert.equal(bs.rows.filter(r=>['inventory_materials','inventory_work_in_process','inventory_finished_goods'].includes(r.id)).reduce((n,r)=>n+r.cells['2025'].value,0),7550);
 assert.ok(out.replay.checks.some(c=>c.residual!==0&&c.status==='rounding-residual'));assert.ok(out.replay.checks.every(c=>c.assurance==='none'));
});
test('equity matrix preserves all 330 source cells, null blanks and thousand-share units',()=>{
 const h=harness(),out=output(h,fixture(h)),eq=oracle.statements.equity_components;
 for(const[y,period]of Object.entries(eq.periods)){
  const table=out.replay.tables.find(t=>t.id==='equity_'+y);assert.ok(table);assert.equal(table.rows.length,period.rows.length);
  assert.deepEqual(table.columns.map(c=>c.id),eq.columns);
  assert.equal(table.columns[0].unit,'thousand shares');
  table.rows.forEach((row,i)=>eq.columns.forEach(col=>{const v=period.rows[i].values[col];assert.equal(row.cells[col].value,v,y+':'+i+':'+col);assert.equal(row.cells[col].status,v===null?'blank':'reported');}));
 }
});
test('replay never enters transaction reconstruction, inferred cash flows, ratios or EBITDA',()=>{
 const h=harness(),t=fixture(h),tb=h.E.reports.tbImport.parseTrialBalance(t.csv),out=output(h,t);
 assert.equal(tb.sourceKind,'published-statements');assert.equal(tb.balanced,false);assert.equal(out.reconstructionStatus?.status,'unavailable');
 assert.deepEqual(plain(out.pl),[]);assert.deepEqual(plain(out.sfp),[]);assert.deepEqual(plain(out.soce.rows),[]);assert.deepEqual(plain(out.keys),{});assert.equal(out.cf,null);
 for(const k of ['balanced','difference','priorBalanced','cashTies','cfDifference'])assert.equal(out.checks[k],null,k);
 assert.equal(h.E.reports.analysis.freeCashFlow(out),null);assert.deepEqual(plain(h.E.reports.analysis.ratios(out)),[]);assert.deepEqual(plain(h.E.reports.annualReport.performanceMeasures(out)),[]);
 assert.throws(()=>h.E.audit.tbReview.reviewTrialBalance(tb,{overrides:t.overrides}),/published|source|unavailable/i);
});
test('generic replay rejects modified source transport and override without replaying canonical numbers',()=>{
 const h=harness(),t=fixture(h);
 for(const change of [x=>x.csv=x.csv.replace('87032','87033'),x=>x.overrides={...x.overrides,PG_income_net_sales:'cash'},x=>x.csv=x.csv.replace('NET SALES','Revenue with wrong label')]){
  const x=plain(t);change(x);const out=output(h,x);assert.equal(out.replay.status,'unavailable');assert.deepEqual(plain(out.replay.tables),[]);
 }
});
test('actual UI selection, report and CSV replay all source periods and exact labels',async()=>{
 const h=harness(),t=fixture(h),W=h.context;await W.SKosifTBReview.openClient('pg-2026');const c=W.__test.compute(),x=W.__test.docX(c);
 assert.equal(c.d.tbText,t.csv);assert.equal(c.sourceOnly,true);assert.equal(c.sourceReplay,true);assert.equal(x.sourceVerified,true);assert.equal(x.opinion.opinion,'not-assessed');
 const html=W.SKosifReportDocs.annual(x);assert.match(html,/2024-06-30/);assert.match(html,/2025-06-30/);assert.match(html,/2026-06-30/);assert.match(html,/USD per common share/);assert.match(html,/19,556/);
 assert.match(html,/MATERIALS|Materials and supplies/);assert.match(html,/TRADEMARKS AND OTHER INTANGIBLE ASSETS/);assert.doesNotMatch(html,/Apple|الصفحة 129|SOCPA|قمنا بمراجعة|rd-sign/);
 const csv=W.__test.sourceCsv(c);assert.ok(csv);assert.ok(csv.headers.includes('period_end'));assert.ok(csv.headers.includes('cell_status'));assert.ok(csv.headers.includes('unit'));
 assert.ok(csv.rows.some(r=>r.includes('2024-06-30')&&r.includes('NET SALES')&&r.includes(84039)));
 const audit=W.SKosifReportDocs.auditor(x);assert.match(audit,/Deloitte/);assert.doesNotMatch(audit,/Apple|قمنا بمراجعة|rd-sign/);
 const transported=W.SKosifTBReview.rows();assert.equal(transported.sourceOnly,true);assert.deepEqual(plain(transported.rows),[]);
});
test('edited data and source identity fail UI source fidelity, remain source-only after reopen/import',async()=>{
 for(const mutate of [d=>d.ctx.company='Different issuer',d=>d.ctx.periodStart='2025-01-01',d=>d.ctx.sourceModel.currency='EUR',d=>d.ctx.periodEnd='2026-12-31',d=>d.tbText=d.tbText.replace('87032','87033').replace(/^#.*\n/,''),d=>d.ctx.sourceModel.replay.tables[0].rows[0].cells['2026'].value=999]){
  const h=harness(),W=h.context;fixture(h);await W.SKosifTBReview.openClient('pg-2026');mutate(h.state.skosif_tbreview_v1);const c=W.__test.compute(),x=W.__test.docX(c);assert.equal(c.sourceOnly,true);assert.equal(x.sourceVerified,false);assert.doesNotMatch(W.SKosifReportDocs.annual(x),/87,032/);assert.equal(W.__test.sourceCsv(c),null);
 }
 const h=harness(),W=h.context,t=fixture(h);await W.SKosifTBReview.openClient('pg-2026');W.__test.newFile(W.__test.blank());await W.SKosifTBReview.load(W.SKEngines.reports.tbImport.SAMPLE_TB_CSV,'ordinary-ledger',{company:'Independent ordinary ledger',country:'SA'});assert.equal(W.__test.compute().sourceOnly,false);await W.SKosifTBReview.openClient('pg-2026');assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,true);
 await W.SKosifTBReview.load(t.csv.replace(/^#.*\n/,''),'source',t.ctx);assert.equal(W.__test.compute().sourceOnly,true);assert.equal(W.__test.docX(W.__test.compute()).sourceVerified,false);
});
test('original PDF extraction agrees with every primary amount sequence and every exact source label',()=>{
 const rows=JSON.parse(fs.readFileSync(oracleDir+'/original/original-amount-rows.json','utf8'));
 assert.equal(rows.length,85);for(const row of rows){const st=oracle.statements[row.statement];assert.deepEqual(row.values,st.periods.map(y=>st.rows[row.row][y]));const text=fs.readFileSync(oracleDir+'/original/original-page-'+row.page+'.txt','utf8').replace(/\s+/g,' ');assert.ok(text.includes(row.label),row.row);}
});
test('private P&G data and labels are immutable even to another internal module',async()=>{
 const{transformSync}=await import('../app/node_modules/esbuild/lib/main.js');const vm=await import('node:vm'),module={exports:{}};vm.runInNewContext(transformSync(fs.readFileSync(root+'/app/src/engine/fusion/reports/sources/procter-gamble-data.ts','utf8'),{loader:'ts',format:'cjs'}).code,{module,exports:module.exports});
 assert.equal(Object.isFrozen(module.exports.PG_REVIEWED.statements.income.rows.net_sales),true);assert.equal(Object.isFrozen(module.exports.PG_LABELS.income),true);
 assert.throws(()=>{module.exports.PG_REVIEWED.statements.income.rows.net_sales['2026']=1;},TypeError);
});
test('all 85 primary transport-row amount changes are rejected by the real generic replay path',()=>{
 const h=harness(),t=fixture(h),tb=h.E.reports.tbImport.parseTrialBalance(t.csv);assert.equal(tb.rows.length,85);
 for(let i=0;i<tb.rows.length;i++){const changed=plain(tb);changed.rows[i].balance+=100;const result=h.E.reports.statements.buildStatements(changed,t.overrides);assert.equal(result.replay.status,'unavailable',tb.rows[i].code);assert.equal(result.replay.tables.length,0);}
});
test('six new actual UI binding tests reject the old unequal-value substitutions, without relabeling old checks as executed',async()=>{
 const controls=JSON.parse(fs.readFileSync(oracleDir+'/reviewed-package/numerical-oracles.json','utf8')).negativeControls.filter(x=>x.incorrectSubstitution!==undefined);assert.equal(controls.length,6);
 for(const control of controls){assert.equal(control.applicationResult,'not executed');const h=harness(),W=h.context;await W.SKosifTBReview.openClient('pg-2026');const model=h.state.skosif_tbreview_v1.ctx.sourceModel.reviewedFacts;const targets={GAAP_EPS_vs_core:model.statements.income.rows.diluted_eps,group_net_vs_attributable:model.statements.income.rows.earnings_attributable_pg,OCF_vs_adjusted_FCF:model.statements.cash_flow.rows.operating_cash_flow,derivative_notional_vs_asset:model.notes['9_financial_instruments'].derivatives.rows.fair_value_assets,lease_undiscounted_vs_present_value:model.notes['12_leases'].balances.rows.total_liability,period_end_shares_vs_diluted_average:model.earnings_per_share.rows.diluted_weighted_average_shares};assert.equal(targets[control.id]['2026'],control.sourceExpected);targets[control.id]['2026']=control.incorrectSubstitution;const c=W.__test.compute();assert.equal(c.sourceVerified,false,control.id);assert.equal(c.fsAfterAdj.replay.status,'unavailable');assert.equal(W.__test.sourceCsv(c),null);}
});
test('all 553 actual rendered and CSV cells retain original values units statuses and effective dates',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('pg-2026');const c=W.__test.compute(),x=W.__test.docX(c),html=W.SKosifReportDocs.annual(x),csv=W.__test.sourceCsv(c),field=k=>csv.headers.indexOf(k);let count=0;
 const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
 for(const table of x.fs.replay.tables){
  const section=html.match(new RegExp('data-source-table="'+table.id+'">([\\s\\S]*?)</section>'))?.[1];assert.ok(section,table.id);
  for(let i=0;i<table.rows.length;i++){const row=table.rows[i],rendered=section.match(new RegExp('data-source-row="'+row.id+'">([\\s\\S]*?)</tr>'))?.[1];assert.ok(rendered);const cells=[...rendered.matchAll(/<td class="n" data-cell-status="([^"]+)" data-period-end="([^"]+)" data-period-kind="([^"]+)" data-unit="([^"]+)">([\s\S]*?)<\/td>/g)];assert.equal(cells.length,table.columns.length);
   table.columns.forEach((col,j)=>{const source=table.id.startsWith('equity_')?oracle.statements.equity_components.periods[table.id.slice(7)].rows[i].values[col.id]:oracle.statements[table.id].rows[row.id][col.id];const cell=row.cells[col.id],unit=col.unit||row.unit,period=cell.period||col.period;assert.equal(cell.value,source);assert.equal(cells[j][1],source===null?'blank':'reported');assert.equal(cells[j][2],period.end);assert.equal(cells[j][3],period.kind);assert.equal(decode(cells[j][4]),unit);const shown=decode(cells[j][5].replace(/<small>[\s\S]*$/,''));assert.equal(shown,source===null?'':cell.display??new Intl.NumberFormat('en-US',{maximumFractionDigits:10}).format(source));
    const record=csv.rows.find(r=>r[field('source_fact_id')]===cell.sourceFactId);assert.ok(record,cell.sourceFactId);assert.equal(record[field('normalized_value')],source===null?'':source);assert.equal(record[field('value')],source===null?'':cell.display??source);assert.equal(record[field('unit')],unit);assert.equal(record[field('period_end')],period.end);assert.equal(record[field('cell_status')],source===null?'blank':'reported');count++;
   });
  }
 }
 assert.equal(count,553);assert.equal(csv.rows.length,553);
});
test('captured P&G report is immutable by later live edits or issuer changes',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('pg-2026');const c=W.__test.compute(),x=W.__test.docX(c);c.fsAfterAdj.replay.tables[0].rows[0].cells['2026'].value=1;await W.SKosifTBReview.openClient('homedepot-2025');const output=W.SKosifReportDocs.annual(x);assert.match(output,/87,032/);assert.doesNotMatch(output,/The Home Depot|164,683/);
});
test('equity source dashes preserve glyphs over normalized zero carriers and statement hierarchy does not infer totals from capitalization',()=>{
 const h=harness(),tables=fixture(h).ctx.sourceModel.replay.tables;let dashes=0;
 for(const t of tables.filter(t=>t.id.startsWith('equity_')))for(const r of t.rows)for(const cell of Object.values(r.cells))if(cell.value===0){assert.equal(cell.status,'reported');assert.equal(cell.display,'—');dashes++;}
 assert.equal(dashes,5);const bs=tables.find(t=>t.id==='balance_sheet');for(const key of ['goodwill','property_plant_equipment_net','intangibles_net','longterm_debt','deferred_income_taxes'])assert.equal(bs.rows.find(r=>r.id===key).level,'line',key);assert.equal(bs.rows.find(r=>r.id==='total_assets').level,'total');
});
