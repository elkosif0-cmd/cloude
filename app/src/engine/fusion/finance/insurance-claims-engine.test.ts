import { describe, expect, it } from 'vitest';
import { caseCostJournal, caseCosts, doctorFee, encounterJournal, healthSalesBoxes, healthVatTreatment, payerStats, remittanceJournal, splitEncounter } from './insurance-claims-engine';
import { validateJournalEntry } from './ledger-engine';

const A = { cashAccountId: 'a1100', payerReceivableAccountId: 'a1210', rejectionsAccountId: 'a5110', revenueAccountId: (c: string) => 'a' + c };
const visit = { id: 'v1', date: '2026-06-01', caseRef: 'C-1001', department: 'outpatient' as const, grossHalalas: 50_000, payer: 'تأمين الصحة', coveragePct: 80 };
const by = (lines: { accountId: string; debit: number; credit: number }[], id: string) => lines.filter((l) => l.accountId === id).reduce((s, l) => s + l.debit - l.credit, 0);

describe('the health pack claim cycle', () => {
  it('splits a visit between the patient and the payer, capped by the co-payment', () => {
    expect(splitEncounter(visit)).toEqual({ payer: 'تأمين الصحة', payerShare: 40_000, patientShare: 10_000 });
    expect(splitEncounter({ ...visit, copayCapHalalas: 5_000 })).toEqual({ payer: 'تأمين الصحة', payerShare: 45_000, patientShare: 5_000 });
    expect(splitEncounter({ ...visit, payer: '' })).toEqual({ payer: '', payerShare: 0, patientShare: 50_000 });
    expect(splitEncounter({ ...visit, coveragePct: 150 }).patientShare).toBe(0);
  });
  it('posts the visit: patient share to cash, payer share to 1210 named to the payer, revenue by department', () => {
    const { journal } = encounterJournal(visit, A);
    expect(validateJournalEntry(journal).valid).toBe(true);
    expect(journal.party).toBe('تأمين الصحة');
    expect(by(journal.lines, 'a1100')).toBe(100); expect(by(journal.lines, 'a1210')).toBe(400); expect(by(journal.lines, 'a4010')).toBe(-500);
    const lab = encounterJournal({ ...visit, department: 'lab', payer: '' }, A).journal;
    expect(by(lab.lines, 'a4030')).toBe(-500); expect(lab.lines.some((l) => l.accountId === 'a1210')).toBe(false);
  });
  it('settles a remittance: paid to cash, rejected to 5110 with its reason, the receivable reduced by both', () => {
    const { journal, claim } = remittanceJournal({ id: 'r1', date: '2026-07-01', payer: 'تأمين الصحة', paidHalalas: 35_000, rejectedHalalas: 5_000, reason: 'خارج التغطية' }, 40_000, A);
    expect(validateJournalEntry(journal).valid).toBe(true);
    expect(by(journal.lines, 'a1100')).toBe(350); expect(by(journal.lines, 'a5110')).toBe(50); expect(by(journal.lines, 'a1210')).toBe(-400);
    expect(claim).toEqual({ payer: 'تأمين الصحة', paid: 35_000, rejected: 5_000, reason: 'خارج التغطية' });
  });
  it('refuses a remittance above the open claims, without a reason for a rejection, or empty', () => {
    const r = { id: 'r', date: '2026-07-01', payer: 'تأمين الصحة', paidHalalas: 30_000, rejectedHalalas: 0 };
    expect(() => remittanceJournal(r, 20_000, A)).toThrow(/تتجاوز/);
    expect(() => remittanceJournal({ ...r, rejectedHalalas: 1_000 }, 40_000, A)).toThrow(/سبب/);
    expect(() => remittanceJournal({ ...r, paidHalalas: 0 }, 40_000, A)).toThrow();
    expect(() => remittanceJournal({ ...r, payer: ' ' }, 40_000, A)).toThrow();
    expect(() => remittanceJournal({ ...r, paidHalalas: 10.5 }, 40_000, A)).toThrow();
  });
  it('reports billed, paid, rejected, open and the rejection rate per payer', () => {
    const s = payerStats([
      { payer: 'أ', kind: 'claim', billed: 40_000 }, { payer: 'أ', kind: 'remittance', paid: 35_000, rejected: 5_000 },
      { payer: 'ب', kind: 'claim', billed: 10_000 },
    ]);
    expect(s).toEqual([
      { payer: 'ب', billed: 10_000, paid: 0, rejected: 0, open: 10_000, rejectionRate: null },
      { payer: 'أ', billed: 40_000, paid: 35_000, rejected: 5_000, open: 0, rejectionRate: 12.5 },
    ]);
  });
  it("accrues the doctor's fee to the doctor and takes the supplies out of the pharmacy stock", () => {
    const C = { doctorFeesAccountId: 'a5210', doctorPayableAccountId: 'a2150', suppliesCostAccountId: 'a5220', pharmacyStockAccountId: 'a1360' };
    const r = caseCostJournal({ id: 'k1', date: '2026-06-01', caseRef: 'C-1001', doctor: 'د. سارة', feePct: 30, suppliesHalalas: 4_500 }, 50_000, C)!;
    expect(validateJournalEntry(r.journal).valid).toBe(true);
    expect(r.journal.party).toBe('د. سارة');
    expect(by(r.journal.lines, 'a5210')).toBe(150); expect(by(r.journal.lines, 'a2150')).toBe(-150);
    expect(by(r.journal.lines, 'a5220')).toBe(45); expect(by(r.journal.lines, 'a1360')).toBe(-45);
    expect(doctorFee(50_000, { feeFixedHalalas: 20_000 })).toBe(20_000);
    expect(doctorFee(10_000, { feeFixedHalalas: 20_000 })).toBe(10_000);
    expect(caseCostJournal({ id: 'k2', date: '2026-06-01', caseRef: 'C-1002' }, 50_000, C)).toBeNull();
    const supOnly = caseCostJournal({ id: 'k3', date: '2026-06-01', caseRef: 'C-1003', suppliesHalalas: 1_000 }, 50_000, C)!;
    expect(supOnly.fee).toBe(0); expect(supOnly.journal.party).toBeUndefined();
  });
  it('reports revenue, cost and margin per case', () => {
    expect(caseCosts([{ caseRef: 'C-1', revenue: 50_000 }, { caseRef: 'C-1', fee: 15_000, supplies: 4_500 }, { caseRef: 'C-2', revenue: 30_000 }])).toEqual([
      { caseRef: 'C-1', revenue: 50_000, fee: 15_000, supplies: 4_500, cost: 19_500, margin: 30_500, marginPct: 61 },
      { caseRef: 'C-2', revenue: 30_000, fee: 0, supplies: 0, cost: 0, margin: 30_000, marginPct: 100 },
    ]);
  });
  it('decides the VAT treatment of a visit by country, registration and patient category', () => {
    expect(healthVatTreatment({ country: 'SA', policyRate: 0.15, category: 'non-citizen' })).toEqual({ treatment: 'standard', rate: 0.15 });
    expect(healthVatTreatment({ country: 'SA', policyRate: 0.15, category: 'citizen' })).toEqual({ treatment: 'state-borne', rate: 0 });
    expect(healthVatTreatment({ country: 'SA', policyRate: 0.15, category: 'qualifying-goods' })).toEqual({ treatment: 'zero', rate: 0 });
    expect(healthVatTreatment({ country: 'SA', policyRate: 0.15, category: 'government' })).toEqual({ treatment: 'out-of-scope', rate: 0 });
    expect(healthVatTreatment({ country: 'EG', policyRate: 0.14, category: 'non-citizen' })).toEqual({ treatment: 'exempt', rate: 0 });
    expect(healthVatTreatment({ country: 'SA', policyRate: 0, category: 'non-citizen' })).toEqual({ treatment: 'none', rate: 0 });
    expect(healthVatTreatment({ country: 'AE', policyRate: 0.05 })).toEqual({ treatment: 'standard', rate: 0.05 });
  });
  it('a standard-rated visit posts output VAT and shares the VAT-inclusive bill between patient and payer', () => {
    const r = encounterJournal({ ...visit, vat: { treatment: 'standard', rate: 0.15 } }, { ...A, outputVatAccountId: 'a2200' });
    expect(validateJournalEntry(r.journal).valid).toBe(true);
    // 500 + 75 VAT = 575; payer 80% = 460, patient 115
    expect(by(r.journal.lines, 'a4010')).toBe(-500); expect(by(r.journal.lines, 'a2200')).toBe(-75);
    expect(by(r.journal.lines, 'a1210')).toBe(460); expect(by(r.journal.lines, 'a1100')).toBe(115);
    expect(r.vat).toEqual({ treatment: 'standard', rate: 0.15, amount: 7_500 });
    const citizen = encounterJournal({ ...visit, vat: { treatment: 'state-borne', rate: 0 } }, A);
    expect(citizen.journal.lines.some((l) => l.accountId === 'a2200')).toBe(false); expect(by(citizen.journal.lines, 'a1210')).toBe(400);
    expect(() => encounterJournal({ ...visit, vat: { treatment: 'standard', rate: 0.15 } }, A)).toThrow(/ضريبة المخرجات/);
  });
  it('lays the visits out on the VAT return boxes by treatment, inside the period, without reversals', () => {
    const v = (date: string, gross: number, vatTreatment: string, extra = {}) => ({ date, visit: { gross, vatTreatment: vatTreatment as never }, ...extra });
    expect(healthSalesBoxes([
      v('2026-07-02', 50_000, 'state-borne'), v('2026-07-03', 30_000, 'state-borne'), v('2026-07-04', 12_000, 'zero'), v('2026-07-05', 8_000, 'exempt'),
      v('2026-07-06', 9_000, 'out-of-scope'), v('2026-07-07', 20_000, 'standard'), v('2026-06-30', 99_000, 'state-borne'), v('2026-07-08', 40_000, 'state-borne', { reversedBy: 'x' }),
      { date: '2026-07-09' },
    ], '2026-07-01', '2026-09-30')).toEqual({ citizens: 800, zeroRated: 120, exempt: 80, outOfScope: 90 });
  });
  it('rejects a visit without a value or with an unknown department', () => {
    expect(() => splitEncounter({ ...visit, grossHalalas: 0 })).toThrow();
    expect(() => splitEncounter({ ...visit, department: 'x' as never })).toThrow();
  });
});
