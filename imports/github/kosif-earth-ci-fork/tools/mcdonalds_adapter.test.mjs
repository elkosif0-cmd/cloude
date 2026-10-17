import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness,plain,root} from './apple-source-harness.mjs';
const oracle=JSON.parse(fs.readFileSync(root+'/tools/fixtures/mcdonalds/issuer-model.json'));
const {E}=harness(),A=E.reports.publishedMcdonaldsSource;
const m=A.reviewedMcDonaldsSource('mcdonalds-2022');
test('adapter refuses FY2025 and preserves the complete independently frozen source payload',()=>{
 assert.ok(m);assert.equal(A.reviewedMcDonaldsSource('mcdonalds-2025'),null);assert.deepEqual(plain(m.sourceModel.sourcePayload),oracle);
 assert.equal(m.sourceModel.reviewedModelSha256,'873af9d6ab999fa21b8c278edab2d4423bfe3e32318ce362ea27e58d5b7a327e');
 assert.equal(m.sourceModel.periodStart,'2022-01-01');assert.equal(m.sourceModel.periodEnd,'2022-12-31');assert.equal(m.sourceModel.priorPeriodEnd,'2021-12-31');
 assert.equal(m.sourceModel.accountingBasis,'US_GAAP');assert.equal(m.sourceModel.currency,'USD');assert.equal(m.sourceModel.scope,'consolidated');assert.equal(m.sourceModel.auditorReference.applicationOutputAssured,false);
});
test('all 970 trusted facts pass and actual per-fact value/evidence mutations are rejected',()=>{
 let valid=0,rejected=0;
 for(const original of oracle.facts){
  assert.equal(A.validateMcDonaldsClaims([original],[original.fact_id]).length,0);valid++;
  const bad=structuredClone(original);bad.value=bad.value===null?'0':String(Number(bad.value)+1);
  assert.ok(A.validateMcDonaldsClaims([bad],[bad.fact_id]).some(e=>e.code==='SOURCE_FACT_MISMATCH'));rejected++;
 }
 assert.equal(valid,970);assert.equal(rejected,970);assert.equal(A.validateMcDonaldsClaims(oracle.facts).length,0);
 assert.ok(A.validateMcDonaldsClaims(oracle.facts.slice(1)).some(e=>e.code==='MISSING_REQUIRED_FACT'));
 assert.ok(A.validateMcDonaldsClaims([oracle.facts[0],oracle.facts[0]],[oracle.facts[0].fact_id]).some(e=>e.code==='DUPLICATE_FACT'));
 for(const field of ['issuer','report_fiscal_year_end','unit','currency','measurement_basis','fact_kind','source_pdf_sha256','source_page','temporal_kind','period_start','period_end','source_text_sha256','source_image_sha256']){
  const bad=structuredClone(oracle.facts[0]);bad[field]='mutated';assert.ok(A.validateMcDonaldsClaims([bad],[bad.fact_id]).length,field);
 }
});
test('each replay cell equals an original fact with its actual units and temporal type',()=>{
 const index=new Map(oracle.facts.map(f=>[f.fact_id,f]));let cells=0;assert.equal(m.sourceModel.replay.tables.length,7);
 for(const table of m.sourceModel.replay.tables){
  assert.equal(table.sourcePages[0],oracle.tables[table.id].source_physical_page);
  for(const row of table.rows)for(const [year,cell] of Object.entries(row.cells)){
   const f=index.get(cell.sourceFactId);assert.ok(f,cell.sourceFactId);assert.equal(f.table_id,table.id);assert.equal(f.row_id,row.id);assert.equal(f.column_key,year);
   assert.equal(cell.value,f.value===null?null:Number(f.value));assert.equal(cell.status,f.value===null?'unavailable':'reported');
   if(f.temporal_kind==='instant'){assert.equal(cell.period.kind,'instant');assert.equal(cell.period.end,f.observation_date);}else{assert.equal(cell.period.start,f.period_start);assert.equal(cell.period.end,f.period_end);}cells++;
  }
 }
 assert.equal(cells,378);
 const cf=m.sourceModel.replay.tables.find(t=>t.id==='cash_flow');assert.equal(cf.rows.find(r=>r.id==='cash_begin').cells['2022'].period.end,'2022-01-01');
 const bs=m.sourceModel.replay.tables.find(t=>t.id==='balance_sheet');assert.equal(bs.columns.length,2);assert.equal(bs.rows.find(r=>r.id==='total_equity').cells['2022'].value,-6003.4);
 const income=m.sourceModel.replay.tables.find(t=>t.id==='income_statement');assert.equal(income.columns.length,3);assert.equal(income.rows.find(r=>r.id==='diluted_eps').unit,'USD per common share');assert.equal(income.rows.some(r=>/gross profit|cost of goods sold/i.test(r.label)),false);
});
test('source transport preserves closing equity without any balancing plugs or period-profit bridge',()=>{
 const tb=E.reports.tbImport.parseTrialBalance(m.csv);assert.equal(tb.sourceKind,'published-statements');assert.equal(tb.sourceId,'mcdonalds-2022');
 assert.equal(tb.rows.find(r=>r.code==='33001').balance,-5954390);assert.equal(tb.rows.find(r=>r.code==='32002').balance,7162440);
 assert.equal(tb.balanced,false);assert.equal(tb.difference,-617740);assert.equal(tb.priorDifference,-754520);assert.deepEqual(plain(m.sourceModel.transport.balancingEntries),[]);
 for(const r of m.sourceModel.facts){const expected=oracle.tables[r.id.split('.')[0]].rows[r.id.split('.')[1]].values;assert.equal(r.current,Number(expected['2022']));assert.equal(r.prior,Number(expected['2021']));}
});
test('real mathematical checks expose input mutations and preserve known nonidentical cash/equity purchases',()=>{
 const base=A.calculateMcDonaldsChecks();assert.equal(base.length,116);assert.ok(base.every(c=>c.status==='exact'&&c.residual===0&&c.assurance==='none'));
 for(const [table,row,year] of [['income_statement','total_revenue','2022'],['cash_flow','fx','2022'],['balance_sheet','treasury_stock','2022'],['equity_movements','dividends','2020'],['debt_carrying','fair_value','2022'],['lease_maturities','interest','amount']]){
  const bad=structuredClone(oracle.tables);bad[table].rows[row].values[year]=String(Number(bad[table].rows[row].values[year])+1);assert.ok(A.calculateMcDonaldsChecks(bad).some(c=>c.status==='mismatch'&&Math.abs(c.residual)>=1));
 }
 assert.equal(oracle.tables.cash_flow.rows.treasury_purchase.values['2020'],'-907.8');assert.equal(oracle.tables.equity_movements.rows.treasury_purchase_amount.values['2020'],'-874.1');assert.equal(oracle.tables.debt_maturities.rows['2023'].values.amount,'0.0');assert.equal(oracle.tables.balance_sheet.rows.debt_long_term.values['2022'],'35903.5');
});
test('fresh models cannot relabel later calls and canonical validator rejects self-authored expectations',()=>{
 const x=A.reviewedMcDonaldsSource('mcdonalds-2022');x.sourceModel.sourcePayload.facts[0].value='118200';x.sourceModel.issuer='Changed';
 const y=A.reviewedMcDonaldsSource('mcdonalds-2022');assert.equal(y.sourceModel.issuer,oracle.identity.issuer);assert.equal(y.sourceModel.sourcePayload.facts[0].value,oracle.facts[0].value);assert.ok(A.validateMcDonaldsClaims(x.sourceModel.sourcePayload.facts).length);
});
test('malformed non-JSON values cannot pass as null unknowns or empty dimensions',()=>{
 for(const unknown of oracle.facts.filter(f=>f.value===null))for(const value of [NaN,Infinity,-Infinity,undefined,()=>{},1n]){
  const bad={...unknown,value};assert.ok(A.validateMcDonaldsClaims([bad],[unknown.fact_id]).length,String(value));
 }
 for(const value of [new Date(),new Map(),new Set(),/x/,Object.create({inherited:true})]){
  const bad={...oracle.facts[0],dimensions:value};assert.ok(A.validateMcDonaldsClaims([bad],[bad.fact_id]).length,Object.prototype.toString.call(value));
 }
 const bad={...oracle.facts[0]};bad.dimensions=bad;assert.ok(A.validateMcDonaldsClaims([bad],[bad.fact_id]).length);
});
test('primary statement footings and equity components respond to actual mutated leaves and totals',()=>{
 for(const [t,r,y] of [['balance_sheet','liabilities_and_equity','2022'],['balance_sheet','ppe_accumulated','2021'],['balance_sheet','affiliates','2022'],['comprehensive_income','fx_recognized','2022'],['comprehensive_income','hedge_recognized','2020'],['equity_balances','pension_aoci','2020'],['equity_balances','treasury_shares','2021'],['equity_movements','options_apic','2022']]){
  const bad=structuredClone(oracle.tables);bad[t].rows[r].values[y]=String(Number(bad[t].rows[r].values[y])+1);
  assert.ok(A.calculateMcDonaldsChecks(bad).some(c=>c.status==='mismatch'),t+'.'+r+'.'+y);
 }
 const cf=m.sourceModel.replay.tables.find(t=>t.id==='cash_flow');for(const id of ['interest_paid','tax_paid'])assert.match(cf.rows.find(r=>r.id===id).context,/Supplemental cash flow disclosures/);
});
test('mathematical checks reject unsupported precision and unsafe numeric input',()=>{
 for(const value of ['23182.6001','900719925474099199.99','NaN','Infinity',null,Infinity]){
  const bad=structuredClone(oracle.tables);bad.income_statement.rows.total_revenue.values['2022']=value;
  assert.throws(()=>A.calculateMcDonaldsChecks(bad),/Invalid source value/,String(value));
 }
});
test('ICFR attribution keeps the report date distinct from the control measurement date',()=>{
 const icfr=m.sourceModel.auditorReference.internalControl;assert.equal(icfr.date,'2023-02-24');assert.equal(icfr.asOf,'2022-12-31');assert.deepEqual(plain(icfr.pages),[2197]);
});
