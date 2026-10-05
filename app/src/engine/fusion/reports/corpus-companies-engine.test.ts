import {describe,expect,it} from 'vitest';
import {companyTrialBalance,corpusCompanies,publishedSourceCompanies,auditModelCatalog,FIGURES,NO_STATEMENTS} from './corpus-companies-engine';
import {parseTrialBalance,SAMPLE_TB_CSV} from './tb-import-engine';
import {buildStatements} from './statements-engine';
import {REPORTS} from '../audit/global-benchmarks-engine';
import {reviewTrialBalance} from '../audit/tb-review-engine';
describe('published-company model eligibility',()=>{
 it('keeps all source-reference metadata but distinguishes actual reviewed model availability',()=>{
  expect(corpusCompanies().length).toBe(47);expect(auditModelCatalog().length).toBe(49);
  expect(REPORTS.every(r=>FIGURES[r.id]||NO_STATEMENTS[r.id]||publishedSourceCompanies().some(c=>c.id===r.id))).toBe(true);
 });
 it('never synthesizes an operational trial balance from a pending or unavailable named model',()=>{
  for(const c of auditModelCatalog()){
   const t=companyTrialBalance(c.id);if(!c.openable){expect(t,c.id).toBeNull();continue;}
   expect(t,c.id).not.toBeNull();const tb=parseTrialBalance(t!.csv),fs=buildStatements(tb,t!.overrides,{tax:'income'});expect(tb.sourceKind,c.id).toBe('published-statements');
   if(c.modelStatus==='source-replayed'){expect(t!.balanced).toBeNull();expect(fs.replay?.status).toBe('available');expect(fs.keys).toEqual({});}
   else{expect(c.id).toBe('apple-2024');expect(fs.keys.assets.current).toBe(36498000);expect(fs.cf).toBeNull();}
  }
 });
 it('keeps source attribution separate from an engagement auditor and does not invent missing IDs',()=>{
  const t=companyTrialBalance('apple-2024')!;expect(t.ctx.auditFirm).toBe('');expect(t.ctx.periodEnd).toBe('2024-09-28');expect(t.ctx.curSym).toBe('USD million');
  expect(companyTrialBalance('aramco-2025')).toBeNull();expect(companyTrialBalance('reliance-2026')).toBeNull();expect(companyTrialBalance('nope')).toBeNull();
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
