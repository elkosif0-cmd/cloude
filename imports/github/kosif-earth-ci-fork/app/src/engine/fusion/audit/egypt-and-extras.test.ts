import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import { buildStatements } from '../reports/statements-engine';
import { IFRS_TO_EAS, inFramework, normalizeCode, relationOf, STANDARD, standardsFor } from './codex-engine';
import { applyAdjustments, DEFAULT_ECL_BUCKETS, eclAdjustment, eclMatrix, existingAllowance, reviewTrialBalance, validateAdjustment } from './tb-review-engine';
import { checkDocument, validVatNumber } from './document-check-engine';
import { auditProgramme, programmeProgress } from './programme-engine';
import { disclosureReadiness } from './disclosures-engine';
import { newSession, systemPrompt } from './ai-review-engine';

const noTax = parseTrialBalance(SAMPLE_TB_CSV.split('\n').filter((l) => !/^(2105|8101),/.test(l)).join('\n').replace('3301,أرباح مبقاة,,43000,-2000', '3301,أرباح مبقاة,,48000,-6000'));

describe('Egyptian companies (EAS)', () => {
  it('holds the issued EAS with their IFRS counterparts', () => {
    expect(STANDARD['EAS 48']).toMatchObject({ family: 'EAS', ifrs: 'IFRS 15', status: 'effective' });
    expect(STANDARD['EAS 11']).toMatchObject({ status: 'replaced', replacedBy: 'EAS 48' });
    expect(STANDARD['EAS 3']).toBeUndefined();
    expect(IFRS_TO_EAS['IAS 16']).toBe('EAS 10');
    expect(IFRS_TO_EAS['IAS 18']).toBeUndefined();
    expect(normalizeCode('eas-47')).toBe('EAS 47');
    expect(normalizeCode('معيار المحاسبة المصري رقم (49)')).toBe('EAS 49');
    expect(inFramework('لائحة الزكاة', 'EAS')).toBe('ضريبة الدخل (مصر)');
    expect(inFramework('IAS 2', 'IFRS')).toBe('IAS 2');
    expect(relationOf('EAS 10', 'ppe')).toBe(relationOf('IAS 16', 'ppe'));
    expect(standardsFor(['IAS 16', 'IAS 36'], 'ppe', 'EAS').map((s) => s.code)).toEqual(['EAS 10', 'EAS 31']);
  });
  it('reviews with income tax at 22.5%, the Egyptian pound and EAS references', () => {
    const r = reviewTrialBalance(noTax, { framework: 'EAS' });
    const f = r.findings.find((x) => x.title === 'لا يوجد مصروف ضريبة دخل رغم تحقق ربح')!;
    expect(f.standard).toBe('EAS 24');
    expect(f.basis).toContain('ج.م');
    const a = r.adjustments.find((x) => x.title.startsWith('استحقاق ضريبة الدخل'))!;
    expect(a.lines[0].debit).toBe(Math.round((r.fs.keys.pbz.current * 0.225) / 100) * 100);
    expect(validateAdjustment(a, noTax).valid).toBe(true);
    expect(r.findings.some((x) => x.title.includes('مكافأة نهاية الخدمة'))).toBe(false);
    expect(r.accounts.find((x) => x.code === '1501')!.standards.map((s) => s.code)).toEqual(['EAS 10', 'EAS 31']);
    expect(r.compliance.map((c) => c.code)).toContain('EAS 1');
    expect(r.compliance.some((c) => c.code === 'IAS 1')).toBe(false);
    expect(r.fs.pl.find((x) => x.key === 'pbz')!.ar).toBe('الربح قبل ضريبة الدخل');
    const sa = reviewTrialBalance(noTax);
    expect(sa.findings.some((x) => x.title === 'لا يوجد مصروف زكاة رغم تحقق ربح')).toBe(true);
  });
  it('checks Egyptian documents at 14% with 9-digit registration numbers', () => {
    expect(validVatNumber('123456789', 'EG')).toBe(true);
    expect(validVatNumber('310122393500003', 'EG')).toBe(false);
    expect(checkDocument({ amount: '1140', vatAmount: '140', vatNumber: '123456789', documentDate: '2025-06-01' }, { jurisdiction: 'EG', today: '2026-01-01' }).verdict).toBe('سليم');
    expect(checkDocument({ amount: '1150', vatAmount: '150' }, { jurisdiction: 'EG' }).issues[0].code).toBe('VAT_MATH');
  });
  it('tells Gemini which framework and codes apply', () => {
    const p = systemPrompt(newSession({ company: 'x', period: '2025', framework: 'EAS' }).ctx);
    expect(p).toContain('معايير المحاسبة المصرية');
    expect(p).toContain('EAS 48');
    expect(p).not.toContain('لائحة الزكاة،');
  });
});

describe('expected credit losses', () => {
  const tb = parseTrialBalance(SAMPLE_TB_CSV);
  it('computes the matrix and brings the allowance to it', () => {
    const buckets = DEFAULT_ECL_BUCKETS.map((b, i) => ({ ...b, exposure: [5000000, 2000000, 800000, 200000, 0, 0][i] }));
    const m = eclMatrix(buckets);
    expect(m).toMatchObject({ exposure: 8000000, loss: 50000 + 60000 + 64000 + 40000 });
    expect(m.weightedBps).toBe(268);
    const a = eclAdjustment(tb, m)!;
    expect(a.lines[0]).toMatchObject({ debit: 214000, type: 'expense' });
    expect(validateAdjustment(a, tb).balanced).toBe(true);
    const after = applyAdjustments(tb, [a]);
    expect(existingAllowance(after)).toBe(214000);
    expect(eclAdjustment(after, m)).toBeNull();
    const lower = eclAdjustment(after, eclMatrix(buckets.map((b) => ({ ...b, exposure: b.exposure / 2 }))))!;
    expect(lower.title).toContain('رد');
    expect(buildStatements(after).lines.find((l) => l.key === 'receivables')!.current).toBe(8000000 - 214000);
  });
});

describe('audit programme and disclosures', () => {
  const tb = parseTrialBalance(SAMPLE_TB_CSV), r = reviewTrialBalance(tb);
  it('derives each stage from the data, never by assumption', () => {
    const s0 = auditProgramme({ review: r, framework: 'IFRS', evidence: {} });
    expect(s0.map((s) => s.id)).toEqual(['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10']);
    expect(s0[0].status).toBe('لم يبدأ');
    expect(s0[4].status).toBe('لم يبدأ');
    const s1 = auditProgramme({ review: r, framework: 'EAS', evidence: { revenue: 'accepted', receivables: 'accepted' }, company: 'x', period: '2025', activity: 'تجارة', independenceConfirmed: true, rounds: 1 });
    expect(s1[0].status).toBe('منجز');
    expect(s1[4]).toMatchObject({ status: 'منجز', standards: ['EAS 48', 'EAS 47', 'ISA 505'] });
    expect(s1[5].status).toBe('قيد التنفيذ');
    expect(programmeProgress(s1)).toBeGreaterThan(programmeProgress(s0));
  });
  it('keeps the compliance statement failing until a person approves it', () => {
    const d0 = disclosureReadiness({ fs: r.fs, entity: { legalName: 'x' }, framework: 'SME', periodEnd: '2025-12-31' });
    expect(d0.valid).toBe(false);
    expect(d0.checks.find((c) => c.id === 'compliance.humanApproved')).toMatchObject({ status: 'fail', human: true });
    expect(d0.uncertainties.map((u) => u.line)).toEqual(expect.arrayContaining(['receivables', 'inventory', 'ppe', 'eosb']));
    expect(d0.sections.find((s) => s.section === '28')!.status).toBe('applicable');
    const d1 = disclosureReadiness({ fs: r.fs, framework: 'IFRS', periodEnd: '2025-12-31', confirm: { editionReviewed: true, complianceApproved: true, unrecognizedReviewed: true },
      entity: { legalName: 'x', legalForm: 'ذات مسؤولية محدودة', country: 'السعودية', registeredOffice: 'الرياض', principalPlace: 'الرياض', activities: 'تجارة' } });
    expect(d1.valid).toBe(true);
    expect(d1.sections).toEqual([]);
  });
});
