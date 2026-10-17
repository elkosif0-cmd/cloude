import {describe,expect,it} from 'vitest';
import {companyTrialBalance,corpusModelTrialBalance,corpusCompanies,publishedSourceCompanies,auditModelCatalog,FIGURES,NO_STATEMENTS} from './corpus-companies-engine';
import {parseTrialBalance,SAMPLE_TB_CSV} from './tb-import-engine';
import {buildStatements} from './statements-engine';
import {legacyReferenceId} from './reference-index-engine';
import {REPORTS} from '../audit/global-benchmarks-engine';
import {registerReviewedSources} from './published-source-engine';
import {reviewedHomeDepotSource} from './home-depot-source-engine';
import {reviewedMcDonaldsSource} from './published-mcdonalds-source-engine';
import {reviewedMercedesSource} from './mercedes-source-engine';
import {reviewedVolkswagenSource} from './volkswagen-source-engine';
/* in the app these four join from ui/data/engines-sources.js (SKEngines.loadSources()); here they are registered directly */
registerReviewedSources(reviewedHomeDepotSource,reviewedMcDonaldsSource,reviewedMercedesSource,reviewedVolkswagenSource);
import {reviewTrialBalance} from '../audit/tb-review-engine';
describe('published-company model eligibility',()=>{
 it('keeps all source-reference metadata but distinguishes actual reviewed model availability',()=>{
  expect(corpusCompanies().length).toBe(47);expect(auditModelCatalog().length).toBe(50);
  expect(REPORTS.every(r=>FIGURES[legacyReferenceId(r.id)]||NO_STATEMENTS[r.id]||publishedSourceCompanies().some(c=>c.id===r.id)||r.id==='panasonic-2024')).toBe(true);
 });
 /* R16 — PRODUCT_MANDATE P5: every bundle company opens as an audit file. #143 closed every pending model here; the merge
    keeps its reviewed replays and opens the rest on their corpus model. Only a company with no model stays closed. */
 it('opens a reviewed replay on the replay and every other bundle company on its corpus model; a company with no model stays closed',()=>{
  for(const c of auditModelCatalog()){
   const t=companyTrialBalance(c.id);
   if(c.modelStatus==='unavailable'||c.id==='panasonic-2024'){expect(t,c.id).toBeNull();continue;}
   expect(t,c.id).not.toBeNull();const tb=parseTrialBalance(t!.csv),fs=buildStatements(tb,t!.overrides,{tax:'income'});
   if(c.modelStatus==='source-replayed'){expect(tb.sourceKind,c.id).toBe('published-statements');expect(t!.balanced).toBeNull();expect(fs.replay?.status).toBe('available');expect(fs.keys).toEqual({});}
   else if(c.id==='apple-2024'){expect(tb.sourceKind).toBe('published-statements');expect(fs.keys.assets.current).toBe(36498000);expect(fs.cf).toBeNull();}
   else{expect(c.modelStatus,c.id).toBe('pending-review');expect(tb.sourceKind,c.id).toBeUndefined();expect(t!.balanced,c.id).toBe(true);expect(fs.checks.balanced,c.id).toBe(true);}
  }
 });
 it('turns each corpus model into a balanced two-year trial balance that rebuilds the published totals',()=>{
  for(const c of corpusCompanies()){
   const t=corpusModelTrialBalance(c.id)!;expect(t.balanced,c.id).toBe(true);
   const tb=parseTrialBalance(t.csv);expect(tb.errors,c.id).toEqual([]);
   if(c.id==='apple-2024')continue; // Apple's model is its reviewed statement bridge (above)
   const fs=buildStatements(tb,t.overrides,{tax:'income'}),f=c.figures,near=(a:number,b:number)=>Math.abs(a-b*100)<=100;
   expect(near(fs.keys.assets.current,f.assets[0]),c.id+' assets').toBe(true);expect(near(fs.keys.assets.prior??0,f.assets[1]),c.id+' prior assets').toBe(true);
   expect(near(fs.keys.profit.current,f.net[0]),c.id+' net').toBe(true);expect(fs.checks.balanced,c.id).toBe(true);
  }
 });
 it('keeps source attribution separate from an engagement auditor and does not invent missing IDs',()=>{
  const t=companyTrialBalance('apple-2024')!;expect(t.ctx.auditFirm).toBe('');expect(t.ctx.periodEnd).toBe('2024-09-28');expect(t.ctx.curSym).toBe('USD million');
  const a=companyTrialBalance('aramco-2025')!;expect(a.ctx.auditFirm).toMatch(/PricewaterhouseCoopers/);expect(a.ctx.curSym).toBe('مليون ريال');expect(a.ctx.periodEnd).toBe('2025-12-31');
  expect(companyTrialBalance('reliance-2026')!.ctx.curSym).toBe('كرور روبية');expect(companyTrialBalance('nope')).toBeNull();
 });
});
describe('legitimate ordinary ledger review remains unchanged',()=>{
 it('uses income-tax or Saudi tax options without treating a public issuer name as source provenance',()=>{
  const tb=parseTrialBalance(SAMPLE_TB_CSV);expect(tb.sourceKind).toBeUndefined();
  const intl=reviewTrialBalance(tb,{tax:'income',currency:'USD'});expect(intl.materiality.benchmarkAr).toBe('الربح قبل ضريبة الدخل');
  expect(JSON.stringify([intl.requests.map(q=>q.title),intl.findings.map(f=>f.title+f.standard)])).not.toMatch(/الزكاة|زكوي|QR|ZATCA/);
  const sa=reviewTrialBalance(tb);expect(JSON.stringify(sa.requests.map(q=>q.title))).toMatch(/الزكاة|زكوي/);
 });
});
