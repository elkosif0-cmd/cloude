/* The finance journey, end to end, on one fixed set of demo entries: entry → general ledger → trial balance → VAT return
   and settlement → period lock and reversal → the next period's trial balance with the carried result → the audit
   trail. One characterisation test per step, with the balances an accountant would expect after each, so a change in
   any engine that moves a number the books screen shows (ui/features/ledger.js) fails here first. */
import { describe, expect, it } from 'vitest';
import {
  buildGeneralLedger,
  buildTrialBalance,
  isPeriodLocked,
  periodTrialBalance,
  reverseJournalEntry,
  validateJournalEntry,
  type JournalEntry,
  type LedgerAccountType,
} from './ledger-engine';
import { buildVatSettlementEntry, vatReturn, type VatEntry } from './vat-return-engine';
import { GENESIS, coversPeriod, sealNew, verifyChain, type ChainEntry } from './journal-chain-engine';

/* the basic chart the books screen offers (BASIC in ui/features/ledger.js) */
const CHART: Array<[string, string, LedgerAccountType]> = [
  ['1100', 'النقدية والبنوك', 'asset'], ['1200', 'الذمم المدينة', 'asset'], ['1300', 'المخزون', 'asset'], ['1400', 'ضريبة القيمة المضافة — مدخلات', 'asset'],
  ['2100', 'الذمم الدائنة (الموردون)', 'liability'], ['2200', 'ضريبة القيمة المضافة — مخرجات', 'liability'], ['2250', 'ضريبة القيمة المضافة — مستحقة', 'liability'],
  ['3000', 'رأس المال', 'equity'], ['3100', 'الأرباح المبقاة', 'equity'], ['4000', 'إيرادات المبيعات', 'revenue'], ['5000', 'تكلفة المبيعات', 'expense'], ['6200', 'الإيجار', 'expense'],
];
const typeOf = (id: string) => CHART.find((a) => a[0] === id)?.[2];
const CASH = '1100', AR = '1200', INV = '1300', VAT_IN = '1400', AP = '2100', VAT_OUT = '2200', VAT_DUE = '2250', CAPITAL = '3000', RE = '3100', REV = '4000', COGS = '5000', RENT = '6200';
const je = (id: string, date: string, reference: string, lines: Array<[string, number, number]>): JournalEntry => ({
  id, date, reference, lines: lines.map(([accountId, debit, credit]) => ({ accountId, debit, credit })),
});

/* Q1 2026: opening capital, a purchase with input VAT, a sale with output VAT and its cost, the receipt, rent — and the
   rent posted twice by mistake, which is reversed, never deleted */
const opening = je('JE-0', '2026-01-01', 'افتتاح', [[CASH, 100000, 0], [CAPITAL, 0, 100000]]);
const purchase = je('JE-1', '2026-01-10', 'PO-1', [[INV, 20000, 0], [VAT_IN, 3000, 0], [AP, 0, 23000]]);
const sale = je('JE-2', '2026-02-05', 'INV-1', [[AR, 46000, 0], [REV, 0, 40000], [VAT_OUT, 0, 6000]]);
const cost = je('JE-3', '2026-02-05', 'INV-1', [[COGS, 15000, 0], [INV, 0, 15000]]);
const receipt = je('JE-4', '2026-02-20', 'RC-1', [[CASH, 46000, 0], [AR, 0, 46000]]);
const rent = je('JE-5', '2026-03-01', 'RENT-3', [[RENT, 5000, 0], [CASH, 0, 5000]]);
const rentAgain = je('JE-6', '2026-03-02', 'RENT-3', [[RENT, 5000, 0], [CASH, 0, 5000]]);
const reversal = reverseJournalEntry(rentAgain, { id: 'JE-7', date: '2026-03-03' });
const q1 = [opening, purchase, sale, cost, receipt, rent, rentAgain, reversal];
const balanceOf = (entries: JournalEntry[], id: string) => buildGeneralLedger(entries).find((r) => r.accountId === id);

describe('the finance journey: one fixed company, every step with its balances', () => {
  it('1 · entries: every posted entry balances; the duplicate rent is undone by a mirror entry, not a deletion', () => {
    for (const e of q1) expect(validateJournalEntry(e), e.id).toEqual({ valid: true, issues: [] });
    expect(validateJournalEntry(je('bad', '2026-01-02', '', [[CASH, 10, 0], [REV, 0, 9]])).issues.map((i) => i.code)).toEqual(['JOURNAL_UNBALANCED']);
    expect(reversal.reference).toBe('عكس RENT-3');
    expect(reversal.lines).toEqual([{ accountId: RENT, debit: 0, credit: 5000 }, { accountId: CASH, debit: 5000, credit: 0 }]);
    expect(q1).toHaveLength(8);
  });

  it('2 · general ledger: the balances after Q1 are what the books screen shows', () => {
    const gl = buildGeneralLedger(q1), row = (id: string) => gl.find((r) => r.accountId === id)!;
    expect(row(CASH)).toMatchObject({ debit: 151000, credit: 10000 });
    expect(Math.abs(row(CASH).balance)).toBe(141000);
    expect(Math.abs(row(AR).balance)).toBe(0);
    expect(Math.abs(row(INV).balance)).toBe(5000);
    expect(Math.abs(row(VAT_IN).balance)).toBe(3000);
    expect(Math.abs(row(VAT_OUT).balance)).toBe(6000);
    expect(Math.abs(row(AP).balance)).toBe(23000);
    expect(row(REV)).toMatchObject({ debit: 0, credit: 40000 });
    expect(row(COGS)).toMatchObject({ debit: 15000, credit: 0 });
    expect(row(RENT)).toMatchObject({ debit: 10000, credit: 5000 });
    expect(Math.abs(row(RENT).balance)).toBe(5000);
  });

  it('3 · trial balance: balanced, debits = credits, nothing lost in the reversal', () => {
    const tb = buildTrialBalance(q1);
    expect(tb.balanced).toBe(true);
    expect(tb.totals.debit).toBe(tb.totals.credit);
    expect(tb.totals.debit).toBe(100000 + 23000 + 46000 + 15000 + 46000 + 5000 + 5000 + 5000);
  });

  it('4 · VAT return for Q1 from the same entries, then its settlement entry closes both VAT accounts', () => {
    const r = vatReturn({ entries: q1, start: '2026-01-01', end: '2026-03-31', outputVatAccountId: VAT_OUT, inputVatAccountId: VAT_IN, typeOf, controlAccountIds: [AR, AP, CASH] });
    expect(r).toMatchObject({ salesBase: 40000, outputVat: 6000, purchasesBase: 20000, inputVat: 3000, net: 3000, salesEntries: 1, purchaseEntries: 1, offRate: [] });
    const settle = buildVatSettlementEntry({ id: 'JE-8', date: '2026-03-31', reference: 'VAT-Q1', outputVat: r.outputVat, inputVat: r.inputVat, outputVatAccountId: VAT_OUT, inputVatAccountId: VAT_IN, netAccountId: VAT_DUE });
    expect(settle.vatSettlement).toBe(true);
    expect(validateJournalEntry(settle).valid).toBe(true);
    const after = [...q1, settle];
    expect(Math.abs(balanceOf(after, VAT_OUT)!.balance)).toBe(0);
    expect(Math.abs(balanceOf(after, VAT_IN)!.balance)).toBe(0);
    expect(Math.abs(balanceOf(after, VAT_DUE)!.balance)).toBe(3000);
    /* the settlement is not a sale or a purchase: the return of the quarter does not change */
    expect(vatReturn({ entries: after as VatEntry[], start: '2026-01-01', end: '2026-03-31', outputVatAccountId: VAT_OUT, inputVatAccountId: VAT_IN, typeOf, controlAccountIds: [AR, AP, CASH] })).toMatchObject({ net: 3000, salesEntries: 1, purchaseEntries: 1 });
  });

  it('5 · period lock: nothing posts on or before the lock date; the next period is open', () => {
    const lock = '2026-03-31';
    expect(isPeriodLocked('2026-03-15', lock)).toBe(true);
    expect(isPeriodLocked('2026-03-31', lock)).toBe(true);
    expect(isPeriodLocked('2026-04-01', lock)).toBe(false);
    expect(isPeriodLocked('2026-04-01', '')).toBe(false);
  });

  it("6 · the next period's trial balance: April's result alone, Q1's profit carried into retained earnings, still balanced", () => {
    const settle = buildVatSettlementEntry({ id: 'JE-8', date: '2026-03-31', reference: 'VAT-Q1', outputVat: 6000, inputVat: 3000, outputVatAccountId: VAT_OUT, inputVatAccountId: VAT_IN, netAccountId: VAT_DUE });
    const aprilSale = je('JE-9', '2026-04-10', 'INV-2', [[AR, 11500, 0], [REV, 0, 10000], [VAT_OUT, 0, 1500]]);
    const all = [...q1, settle, aprilSale];
    const tb = periodTrialBalance(all, typeOf, { start: '2026-04-01', end: '2026-04-30' }, RE);
    expect(tb.balanced).toBe(true);
    const row = (id: string) => tb.rows.find((r) => r.accountId === id);
    expect(row(REV)).toMatchObject({ debit: 0, credit: 10000 });
    expect(row(COGS)).toBeUndefined();
    expect(row(RENT)).toBeUndefined();
    /* Q1: revenue 40,000 − cost 15,000 − rent 5,000 = 20,000 profit, carried */
    expect(Math.abs(tb.carried)).toBe(20000);
    expect(row(RE)).toMatchObject({ credit: 20000, debit: 0 });
    expect(Math.abs(row(CASH)!.balance)).toBe(141000);
    expect(Math.abs(row(AR)!.balance)).toBe(11500);
    expect(tb.totals.debit).toBe(tb.totals.credit);
  });

  it('7 · the audit trail: the posted entries seal into a chain that covers the quarter; an edit after posting shows', () => {
    /* the books screen tags a reversal with the id it undoes before sealing (ledger.js: reversalOf) */
    const chain: ChainEntry[] = q1.map((e) => ({ ...e, lines: e.lines.map((l) => ({ ...l })), ...(e.id === 'JE-7' ? { reversalOf: 'JE-6' } : {}) }));
    expect(sealNew(chain, '2026-03-31T18:00:00Z')).toBe(8);
    const v = verifyChain(chain);
    expect(v).toMatchObject({ ok: true, sealed: 8, reversals: 1, total: 8 });
    expect(v.head).not.toBe(GENESIS);
    expect(coversPeriod(chain, '2026-01-01', '2026-03-31')).toEqual({ entries: 8, uncovered: 0, throughout: true });
    /* sealing again seals nothing; a new entry seals after the head */
    expect(sealNew(chain, '2026-04-01T08:00:00Z')).toBe(0);
    chain.push({ id: 'JE-9', date: '2026-04-10', reference: 'INV-2', lines: [{ accountId: AR, debit: 11500, credit: 0 }, { accountId: REV, debit: 0, credit: 10000 }, { accountId: VAT_OUT, debit: 0, credit: 1500 }] });
    expect(verifyChain(chain).issues.map((i) => i.kind)).toEqual(['unsealed']);
    expect(sealNew(chain, '2026-04-10T08:00:00Z')).toBe(1);
    expect(verifyChain(chain).ok).toBe(true);
    /* a 0.01 change to a sealed line is an edit */
    chain[4].lines[0].debit += 0.01;
    expect(verifyChain(chain).issues.map((i) => [i.id, i.kind])).toEqual([['JE-4', 'edited']]);
  });
});
