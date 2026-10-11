import test from 'node:test';
import assert from 'node:assert/strict';
import {harness,plain} from './apple-source-harness.mjs';
test('public replay API resolves its own canonical model and cannot certify caller-supplied facts',()=>{
 const {E}=harness(),t=E.reports.corpusCompanies.companyTrialBalance('pg-2026'),tb=E.reports.tbImport.parseTrialBalance(t.csv),forged=plain({csv:t.csv,overrides:t.overrides,sourceModel:t.ctx.sourceModel});
 forged.sourceModel.replay.tables[0].rows[0].cells['2026'].value=999;
 const v=E.reports.sourceReplay.validatePublishedReplay(tb,t.overrides,forged);
 assert.equal(v.status,'available');assert.equal(v.tables[0].rows[0].cells['2026'].value,87032);
 const invalid=structuredClone(tb);invalid.sourceId='invented-model';forged.sourceModel.id='invented-model';
 const r=E.reports.sourceReplay.buildReplayStatements(invalid,t.overrides,forged);assert.equal(r.replay.status,'unavailable');assert.deepEqual(plain(r.replay.tables),[]);
});
test('known source ID with tampered parser metadata cannot erase the source boundary',()=>{
 const {E}=harness(),t=E.reports.corpusCompanies.companyTrialBalance('pg-2026'),tb=E.reports.tbImport.parseTrialBalance(t.csv);delete tb.sourceKind;
 const out=E.reports.statements.buildStatements(tb,t.overrides);assert.equal(out.sourceKind,'published-statements');assert.equal(out.replay.status,'unavailable');assert.deepEqual(plain(out.keys),{});delete tb.sourceId;const missing=E.reports.statements.buildStatements(tb,t.overrides);assert.equal(missing.sourceKind,'published-statements');assert.equal(missing.replay.status,'unavailable');
});
test('exact source fiscal-period and legacy-year catalog boundaries are selectable without a FIGURES stub',async()=>{
 const {E,context:W}=harness();const cat=E.reports.corpusCompanies.publishedSourceCompanies();
 assert.ok(cat.some(c=>c.id==='mcdonalds-2022'&&c.fy==='FY2022'));assert.equal(E.reports.corpusCompanies.FIGURES['mcdonalds-2022'],undefined);
 assert.equal(await W.SKosifTBReview.openClient('mcdonalds-2025'),null);assert.equal(E.reports.publishedSource.reviewedPublishedSource('mcdonalds-2025'),null);
});
test('UI exact source binding rejects NaN replacing a source null, including after a cached valid computation',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('pg-2026');assert.equal(W.__test.compute().sourceVerified,true);
 const model=h.state.skosif_tbreview_v1.ctx.sourceModel;const eq=model.replay.tables.find(t=>t.id==='equity_2024');const blank=eq.rows.flatMap(r=>Object.values(r.cells)).find(c=>c.value===null);assert.ok(blank);blank.value=NaN;
 assert.equal(W.__test.compute().sourceVerified,false);assert.equal(W.__test.sourceCsv(W.__test.compute()),null);
});
test('strict source equality refuses non-JSON values and property tricks without coercion',()=>{
 const {E}=harness(),eq=E.reports.sourceReplay.sourceModelsEqual;
 assert.equal(eq({a:[1,null,'x']},{a:[1,null,'x']}),true);
 for(const [actual,expected]of [[NaN,null],[Infinity,null],[undefined,undefined],[new Map(),{}],[new Date('2026-01-01'),{}],[{x:undefined},{}],[Array(1),[null]],[{a:-0},{a:0}]])assert.equal(eq(actual,expected),false);
 const getter={};Object.defineProperty(getter,'x',{get(){throw Error('Getter must not execute');},enumerable:true});assert.equal(eq(getter,{x:1}),false);
 const cycle={};cycle.x=cycle;assert.equal(eq(cycle,cycle),false);
 const symbol={};symbol[Symbol('hidden')]=1;assert.equal(eq(symbol,{}),false);
});
test('source indexes identify the real McDonald’s FY2022 annual report without a misleading FY2025 alias',()=>{
 const {E}=harness(),report=E.audit.globalBenchmarks.reportOf('mcdonalds-2022');assert.ok(report);assert.equal(report.fy,'FY2022');assert.equal(report.auditor,'Ernst & Young LLP');assert.equal(report.since,1964);
 assert.equal(E.audit.globalBenchmarks.reportOf('mcdonalds-2025'),undefined);
 const index=E.reports.globalCorpus.reportList().find(r=>r.id==='mcdonalds-2022');assert.ok(index);assert.equal(index.fy,'FY2022');assert.ok(E.reports.globalCorpus.reportStructure(index.id).some(r=>r.key==='cash_flow'&&r.page===2175));
 assert.doesNotMatch(E.reports.corpusCompanies.NO_STATEMENTS['mcdonalds-2025'],/letter and highlights only/);
});
test('generic replay rejects edits hidden by minor-unit rounding and blank-to-zero import normalization',()=>{
 const{E}=harness(),t=E.reports.corpusCompanies.companyTrialBalance('pg-2026');
 const changes=[t.csv.replace('87032','87032.001'),t.csv.replace('6.62','6.624'),t.csv.replace('"0","0"','"","0"')];
 for(const csv of changes){assert.notEqual(csv,t.csv);const tb=E.reports.tbImport.parseTrialBalance(csv),result=E.reports.statements.buildStatements(tb,t.overrides);assert.equal(result.replay.status,'unavailable');assert.equal(result.replay.tables.length,0);}
 const tb=E.reports.tbImport.parseTrialBalance(t.csv);assert.equal(E.reports.statements.buildStatements(tb,t.overrides).replay.status,'available');delete tb.sourceTransport;assert.equal(E.reports.statements.buildStatements(tb,t.overrides).replay.status,'unavailable');
});
