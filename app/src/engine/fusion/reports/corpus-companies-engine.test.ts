import { describe, expect, it } from 'vitest';
import { companyTrialBalance, corpusCompanies, FIGURES, NO_STATEMENTS } from './corpus-companies-engine';
import { parseTrialBalance } from './tb-import-engine';
import { buildStatements } from './statements-engine';
import { REPORTS } from '../audit/global-benchmarks-engine';

describe('the bundle companies as audit clients', () => {
  it('covers every report of the bundle that carries statements', () => {
    expect(corpusCompanies().length).toBe(47);
    expect(REPORTS.every((r) => FIGURES[r.id] || NO_STATEMENTS[r.id])).toBe(true);
  });
  it('turns each company into a balanced two-year trial balance that rebuilds the published totals', () => {
    for (const c of corpusCompanies()) {
      const t = companyTrialBalance(c.id)!;
      expect(t.balanced, c.id).toBe(true);
      const tb = parseTrialBalance(t.csv);
      expect(tb.errors, c.id).toEqual([]);
      const fs = buildStatements(tb, t.overrides, { tax: 'income' });
      const f = c.figures, near = (a: number, b: number) => Math.abs(a - b * 100) <= 100;
      expect(near(fs.keys.assets.current, f.assets[0]), c.id + ' assets').toBe(true);
      expect(near(fs.keys.assets.prior ?? 0, f.assets[1]), c.id + ' prior assets').toBe(true);
      expect(near(fs.keys.profit.current, f.net[0]), c.id + ' net').toBe(true);
      expect(near(fs.keys.pbz.current, f.pbt[0] + (f.net[0] - (f.pbt[0] - f.tax[0]))), c.id + ' pbt').toBe(true);
      expect(fs.checks.balanced, c.id).toBe(true);
    }
  });
  it('carries the context of the audit: the auditor, the currency unit and the year end', () => {
    const t = companyTrialBalance('aramco-2025')!;
    expect(t.ctx.auditFirm).toMatch(/PricewaterhouseCoopers/);
    expect(t.ctx.curSym).toBe('مليون ريال');
    expect(t.ctx.periodEnd).toBe('2025-12-31');
    expect(companyTrialBalance('reliance-2026')!.ctx.curSym).toBe('كرور روبية');
    expect(companyTrialBalance('nope')).toBeNull();
  });
});

import { reviewTrialBalance } from '../audit/tb-review-engine';
describe('an international company is reviewed as one', () => {
  it('asks for income-tax documents, not zakat or Saudi e-invoices, and raises no zakat or ZATCA findings', () => {
    const t = companyTrialBalance('apple-2024')!, tb = parseTrialBalance(t.csv);
    const r = reviewTrialBalance(tb, { overrides: t.overrides, tax: 'income', currency: t.ctx.curSym });
    const text = JSON.stringify([r.requests.map((q) => q.title), r.findings.map((f) => f.title + f.standard)]);
    expect(text).not.toMatch(/الزكاة|زكوي|QR|ZATCA/);
    expect(r.materiality.benchmarkAr).toBe('الربح قبل ضريبة الدخل');
    const sa = reviewTrialBalance(parseTrialBalance(companyTrialBalance('aramco-2025')!.csv), { overrides: companyTrialBalance('aramco-2025')!.overrides });
    expect(JSON.stringify(sa.requests.map((q) => q.title))).toMatch(/الزكاة|زكوي/);
  });
});
