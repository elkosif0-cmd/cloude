import { describe, expect, it } from 'vitest';
import {
  BENFORD_EXPECTED, SIGNALS, bandOf, benford, duplicateKey, entryAmount, firstDigit, normalizeText, scoreEntries, summarize,
  signalDuplicate, signalEmpty, signalHoliday, signalLarge, signalManual, signalNoMemo, signalPeriodEnd, signalPostedAfter, signalRareUser,
  signalRelatedParty, signalReversal, signalRound, signalSensitive, signalSuspense, signalUnbalanced, signalUnusualSide, signalWeekend,
  type RiskAccount, type RiskEntry,
} from './journal-risk-engine';

/* a plain, balanced, system-posted weekday entry that raises nothing: the baseline every signal test perturbs */
const je = (id: string, over: Partial<RiskEntry> = {}): RiskEntry => ({
  id, date: '2025-03-12', source: 'مبيعات', memo: 'بيع نقدي', reference: 'INV-' + id,
  lines: [{ accountId: 'cash', debit: 1234.56, credit: 0 }, { accountId: 'rev', debit: 0, credit: 1234.56 }], ...over,
});
const accounts: RiskAccount[] = [
  { id: 'cash', code: '1100', name: 'النقدية والبنوك', type: 'asset' }, { id: 'rev', code: '4000', name: 'إيرادات المبيعات', type: 'revenue' },
  { id: 'exp', code: '6300', name: 'مصروفات تشغيلية أخرى', type: 'expense' }, { id: 'susp', code: '1990', name: 'حساب معلّق — تسوية', type: 'asset' },
  { id: 'partner', code: '2500', name: 'جاري الشريك', type: 'liability' },
];
const codes = (e: RiskEntry, opts = {}, all: RiskEntry[] = [e]) => scoreEntries(all, opts).find((s) => s.id === e.id)!.signals.map((s) => s.code);

describe('journal risk: the baseline', () => {
  it('a balanced system entry on a weekday with a memo raises no signal and scores 0 / low', () => {
    const [s] = scoreEntries([je('a')], { accounts });
    expect(s.signals).toEqual([]); expect(s.score).toBe(0); expect(s.band).toBe('low'); expect(s.amount).toBe(1234.56);
  });
  it('every signal has an Arabic label, a positive weight and an ISA anchor', () => {
    for (const [code, d] of Object.entries(SIGNALS)) { expect(d.label_ar, code).toMatch(/[؀-ۿ]/); expect(d.weight).toBeGreaterThan(0); expect(d.isa).toMatch(/^ISA/); }
  });
  it('folds Arabic variants', () => { expect(normalizeText('تَسْوِيَة أطراف')).toBe('تسويه اطراف'); });
});

describe('journal risk: one test per signal', () => {
  it('UNBALANCED — debits differ from credits beyond half a halala', () => {
    expect(signalUnbalanced(je('a'))).toBeNull();
    const s = signalUnbalanced(je('b', { lines: [{ accountId: 'cash', debit: 100, credit: 0 }, { accountId: 'rev', debit: 0, credit: 90 }] }));
    expect(s?.code).toBe('UNBALANCED'); expect(s?.detail).toContain('10.00');
  });
  it('EMPTY_ENTRY — fewer than two lines or a zero movement', () => {
    expect(signalEmpty(je('a'))).toBeNull();
    expect(signalEmpty(je('b', { lines: [{ accountId: 'cash', debit: 5, credit: 0 }] }))?.code).toBe('EMPTY_ENTRY');
    expect(signalEmpty(je('c', { lines: [{ accountId: 'cash', debit: 0, credit: 0 }, { accountId: 'rev', debit: 0, credit: 0 }] }))?.detail).toBe('مجموع الحركة صفر');
  });
  it('MANUAL_ENTRY — «يدوي», manual, a missing source or an explicit flag; manual:false overrides the text', () => {
    expect(signalManual(je('a'))).toBeNull();
    expect(signalManual(je('b', { source: 'يدوي' }))?.code).toBe('MANUAL_ENTRY');
    expect(signalManual(je('c', { source: undefined }))?.detail).toBe('بلا مصدر مسجَّل');
    expect(signalManual(je('d', { manual: true }))?.code).toBe('MANUAL_ENTRY');
    expect(signalManual(je('e', { source: 'تسويات', manual: false }))).toBeNull();
    expect(signalManual(je('f', { source: 'تسويات' }), { manualSources: ['تسويات'] })?.code).toBe('MANUAL_ENTRY');
  });
  it('ROUND_AMOUNT — a multiple of the unit at or above the floor, in major units', () => {
    expect(signalRound(je('a'))).toBeNull();
    const round = je('b', { lines: [{ accountId: 'cash', debit: 50000, credit: 0 }, { accountId: 'rev', debit: 0, credit: 50000 }] });
    expect(signalRound(round)?.code).toBe('ROUND_AMOUNT');
    expect(signalRound(round, { roundUnit: 7000 })).toBeNull();
    expect(signalRound(je('c', { lines: [{ accountId: 'cash', debit: 1000, credit: 0 }, { accountId: 'rev', debit: 0, credit: 1000 }] }), { roundMin: 5000 })).toBeNull();
  });
  it('LARGE_AMOUNT — only when a materiality is given and the amount reaches it', () => {
    expect(signalLarge(je('a'))).toBeNull();
    expect(signalLarge(je('a'), { materiality: 1234.56 })?.code).toBe('LARGE_AMOUNT');
    expect(signalLarge(je('a'), { materiality: 1234.57 })).toBeNull();
  });
  it('SUSPENSE_ACCOUNT — by account name term or by explicit id/code', () => {
    expect(signalSuspense(je('a'), { accounts })).toBeNull();
    const s = signalSuspense(je('b', { lines: [{ accountId: 'susp', debit: 10, credit: 0 }, { accountId: 'cash', debit: 0, credit: 10 }] }), { accounts });
    expect(s?.code).toBe('SUSPENSE_ACCOUNT'); expect(s?.detail).toContain('1990');
    expect(signalSuspense(je('c'), { accounts, suspenseAccounts: ['1100'] })?.code).toBe('SUSPENSE_ACCOUNT');
    expect(signalSuspense(je('d'), { suspenseAccounts: ['cash'] })?.code).toBe('SUSPENSE_ACCOUNT');
  });
  it('RELATED_PARTY — a related-party account or a memo naming one', () => {
    expect(signalRelatedParty(je('a'), { accounts })).toBeNull();
    expect(signalRelatedParty(je('b', { lines: [{ accountId: 'partner', debit: 10, credit: 0 }, { accountId: 'cash', debit: 0, credit: 10 }] }), { accounts })?.detail).toContain('جاري الشريك');
    expect(signalRelatedParty(je('c', { memo: 'سلفة لطرف ذي علاقة' }), { accounts, relatedPartyTerms: ['طرف ذي علاقه'] })?.detail).toBe('البيان');
  });
  it('UNUSUAL_SIDE — a debit to revenue or a credit to expense, except on reversals; silent without account types', () => {
    expect(signalUnusualSide(je('a'), { accounts })).toBeNull();
    const odd = je('b', { lines: [{ accountId: 'rev', debit: 10, credit: 0 }, { accountId: 'exp', debit: 0, credit: 10 }] });
    const s = signalUnusualSide(odd, { accounts });
    expect(s?.code).toBe('UNUSUAL_SIDE'); expect(s?.detail).toContain('مدين على إيراد'); expect(s?.detail).toContain('دائن على مصروف');
    expect(signalUnusualSide({ ...odd, reversalOf: 'x' }, { accounts })).toBeNull();
    expect(signalUnusualSide(odd, {})).toBeNull();
  });
  it('WEEKEND_POSTING — Friday and Saturday by default (UTC), configurable', () => {
    expect(signalWeekend(je('a'))).toBeNull();                                       // 2025-03-12 is a Wednesday
    expect(signalWeekend(je('b', { date: '2025-03-14' }))?.detail).toContain('الجمعة');
    expect(signalWeekend(je('c', { date: '2025-03-15' }))?.code).toBe('WEEKEND_POSTING');
    expect(signalWeekend(je('d', { date: '2025-03-14' }), { weekendDays: [0, 6] })).toBeNull();
    expect(signalWeekend(je('e', { date: 'not a date' }))).toBeNull();
  });
  it('HOLIDAY_POSTING — only against the caller’s holiday list', () => {
    expect(signalHoliday(je('a'))).toBeNull();
    expect(signalHoliday(je('a'), { holidays: ['2025-03-12'] })?.code).toBe('HOLIDAY_POSTING');
    expect(signalHoliday(je('a'), { holidays: ['2025-09-23'] })).toBeNull();
  });
  it('PERIOD_END — inside the closing window up to the period end, not after it', () => {
    expect(signalPeriodEnd(je('a'))).toBeNull();
    expect(signalPeriodEnd(je('a', { date: '2025-03-31' }), { periodEnd: '2025-03-31' })?.detail).toContain('بتاريخ نهاية الفترة');
    expect(signalPeriodEnd(je('a', { date: '2025-03-27' }), { periodEnd: '2025-03-31' })?.detail).toBe('قبل نهاية الفترة بـ4 يوم');
    expect(signalPeriodEnd(je('a', { date: '2025-03-25' }), { periodEnd: '2025-03-31' })).toBeNull();
    expect(signalPeriodEnd(je('a', { date: '2025-04-01' }), { periodEnd: '2025-03-31' })).toBeNull();
    expect(signalPeriodEnd(je('a', { date: '2025-03-25' }), { periodEnd: '2025-03-31', periodEndWindowDays: 10 })?.code).toBe('PERIOD_END');
  });
  it('POSTED_AFTER_PERIOD — written after the period end for a date inside it, or more than backdateDays late', () => {
    expect(signalPostedAfter(je('a'))).toBeNull();
    expect(signalPostedAfter(je('a', { date: '2025-03-30', postedAt: '2025-04-03T10:00:00Z' }), { periodEnd: '2025-03-31' })?.detail).toContain('بعد نهاية الفترة');
    expect(signalPostedAfter(je('a', { date: '2025-03-30', postedAt: '2025-03-31' }), { periodEnd: '2025-03-31' })).toBeNull();
    expect(signalPostedAfter(je('a', { date: '2025-01-01', postedAt: '2025-02-15' }))?.detail).toBe('رُحِّل بعد تاريخه بـ45 يوماً');
    expect(signalPostedAfter(je('a', { date: '2025-01-01', postedAt: '2025-01-20' }))).toBeNull();
    expect(signalPostedAfter(je('a', { date: '2025-01-01', postedAt: '2025-01-20' }), { backdateDays: 10 })?.code).toBe('POSTED_AFTER_PERIOD');
  });
  it('DUPLICATE — same amount and account set across the population; a reversal is not a duplicate of its original', () => {
    const a = je('a'), b = je('b', { date: '2025-03-20' }), c = je('c', { lines: [{ accountId: 'cash', debit: 1234.56, credit: 0 }, { accountId: 'exp', debit: 0, credit: 1234.56 }] });
    const all = [a, b, c];
    expect(codes(a, {}, all)).toContain('DUPLICATE'); expect(codes(c, {}, all)).not.toContain('DUPLICATE');
    expect(scoreEntries(all).find((s) => s.id === 'a')!.signals.find((s) => s.code === 'DUPLICATE')!.detail).toBe('نفس المبلغ والحسابات في: b');
    const rv = je('r', { reversalOf: 'a', lines: [{ accountId: 'cash', debit: 0, credit: 1234.56 }, { accountId: 'rev', debit: 1234.56, credit: 0 }] });
    expect(codes(a, {}, [a, rv])).not.toContain('DUPLICATE'); expect(codes(rv, {}, [a, rv])).not.toContain('DUPLICATE');
    expect(signalDuplicate(a, { dupGroups: new Map() })).toBeNull();
    expect(duplicateKey(a)).toBe('1234.56|cash,rev'); expect(duplicateKey(je('z', { lines: [] }))).toBeNull();
  });
  it('RARE_USER — a preparer with ≤ rareUserMaxEntries entries in a population larger than that', () => {
    const all = [je('a', { user: 'سارة' }), je('b', { user: 'سارة' }), je('c', { user: 'سارة' }), je('d', { user: 'خالد' })];
    expect(codes(all[3], {}, all)).toContain('RARE_USER'); expect(codes(all[0], {}, all)).not.toContain('RARE_USER');
    expect(codes(all[3], { rareUserMaxEntries: 0 }, all)).not.toContain('RARE_USER');
    expect(signalRareUser(je('x'), {}, { userCounts: new Map() })).toBeNull();                 // no user recorded: silent
    expect(codes(all[3], {}, [all[3], all[0]])).not.toContain('RARE_USER');                   // two entries by two people: nobody is rare
  });
  it('SENSITIVE_TEXT — memo or line description carries an adjustment/override term', () => {
    expect(signalSensitive(je('a'))).toBeNull();
    expect(signalSensitive(je('b', { memo: 'تسوية نهاية الفترة' }))?.detail).toBe('ورد في البيان: «تسويه»');
    expect(signalSensitive(je('c', { lines: [{ accountId: 'cash', debit: 1, credit: 0, description: 'manual override' }, { accountId: 'rev', debit: 0, credit: 1 }] }))?.code).toBe('SENSITIVE_TEXT');
    expect(signalSensitive(je('d', { memo: 'تسوية' }), { sensitiveTerms: ['plug'] })).toBeNull();
  });
  it('NO_MEMO — neither memo nor reference', () => {
    expect(signalNoMemo(je('a'))).toBeNull();
    expect(signalNoMemo(je('b', { memo: ' ', reference: '' }))?.code).toBe('NO_MEMO');
    expect(signalNoMemo(je('c', { memo: '', reference: 'R1' }))).toBeNull();
  });
  it('REVERSAL — the entry reverses another', () => {
    expect(signalReversal(je('a'))).toBeNull();
    expect(signalReversal(je('b', { reversalOf: 'a' }))?.detail).toBe('يعكس القيد a');
  });
});

describe('journal risk: scores, bands and order', () => {
  it('adds the weights, caps at 100 and bands at 30 / 60', () => {
    expect(bandOf(0)).toBe('low'); expect(bandOf(29.9)).toBe('low'); expect(bandOf(30)).toBe('medium'); expect(bandOf(59)).toBe('medium'); expect(bandOf(60)).toBe('high');
    const bad = je('bad', { date: '2025-03-28', source: 'يدوي', memo: '', reference: '', postedAt: '2025-04-10',
      lines: [{ accountId: 'susp', debit: 100000, credit: 0 }, { accountId: 'partner', debit: 0, credit: 90000 }] });
    const [s] = scoreEntries([bad], { accounts, periodEnd: '2025-03-31', materiality: 50000 });
    const expectCodes = ['UNBALANCED', 'MANUAL_ENTRY', 'ROUND_AMOUNT', 'LARGE_AMOUNT', 'SUSPENSE_ACCOUNT', 'RELATED_PARTY', 'WEEKEND_POSTING', 'PERIOD_END', 'POSTED_AFTER_PERIOD', 'NO_MEMO'];
    expect(s.signals.map((x) => x.code)).toEqual(expectCodes);
    expect(s.signals.reduce((t, x) => t + x.weight, 0)).toBeGreaterThan(100); expect(s.score).toBe(100); expect(s.band).toBe('high');
  });
  it('is deterministic: the same ledger in any order gives the same ranking, highest first then by id', () => {
    const a = je('a', { source: 'يدوي' }), b = je('b'), c = je('c', { source: 'يدوي', memo: '', reference: '' });
    const r1 = scoreEntries([a, b, c]).map((s) => s.id), r2 = scoreEntries([c, b, a]).map((s) => s.id);
    expect(r1).toEqual(['c', 'a', 'b']); expect(r2).toEqual(r1);
  });
});

describe('journal risk: Benford', () => {
  it('expected proportions follow log10(1 + 1/d) and the first digit ignores amounts under 10', () => {
    expect(BENFORD_EXPECTED[0]).toBeCloseTo(0.30103, 4); expect(BENFORD_EXPECTED.reduce((s, p) => s + p, 0)).toBeCloseTo(1, 9);
    expect(firstDigit(1234.56)).toBe(1); expect(firstDigit(0.9)).toBe(0); expect(firstDigit(9.99)).toBe(0); expect(firstDigit(95)).toBe(9); expect(firstDigit(-250)).toBe(2);
  });
  it('a Benford-shaped population conforms closely; a uniform one does not; a small one is insufficient', () => {
    const shaped: number[] = []; for (let d = 1; d <= 9; d++) for (let k = 0; k < Math.round(BENFORD_EXPECTED[d - 1] * 1000); k++) shaped.push(d * 100 + (k % 7));
    const good = benford(shaped); expect(good.sufficient).toBe(true); expect(good.conformity).toBe('close'); expect(good.digits[0].count).toBe(301);
    const flat: number[] = []; for (let d = 1; d <= 9; d++) for (let k = 0; k < 100; k++) flat.push(d * 10 + k / 100);
    const bad = benford(flat); expect(bad.conformity).toBe('nonconforming'); expect(bad.mad).toBeGreaterThan(0.015);
    const small = benford([100, 200, 300]); expect(small.conformity).toBe('insufficient'); expect(small.n).toBe(3);
    expect(benford([]).mad).toBe(0);
  });
});

describe('journal risk: summary', () => {
  it('distribution, top list, per-signal counts, duplicate groups and Benford from the scores alone', () => {
    const all = [
      je('a'), je('b', { date: '2025-03-20' }),                                                      // duplicates of each other
      je('c', { source: 'يدوي', date: '2025-03-14', lines: [{ accountId: 'susp', debit: 20000, credit: 0 }, { accountId: 'cash', debit: 0, credit: 20000 }] }),
      je('d', { source: 'يدوي', memo: 'تسوية فروق', lines: [{ accountId: 'cash', debit: 77.5, credit: 0 }, { accountId: 'rev', debit: 0, credit: 77.5 }] }),
    ];
    const scores = scoreEntries(all, { accounts });
    const sum = summarize(scores, { top: 2 });
    expect(sum.total).toBe(4); expect(sum.scored).toBe(4);
    expect(sum.distribution).toEqual({ low: 2, medium: 1, high: 1 });
    expect(sum.top.map((s) => s.id)).toEqual(['c', 'd']);
    expect(sum.counts).toMatchObject({ suspense: 1, round: 1, weekend: 1, manual: 2, duplicates: 2, unbalanced: 0, afterPeriod: 0, relatedParty: 0 });
    expect(sum.duplicateGroups).toEqual([{ key: '1234.56|cash,rev', ids: ['a', 'b'], amount: 1234.56, count: 2 }]);
    const dup = sum.bySignal.find((x) => x.code === 'DUPLICATE')!; expect(dup.count).toBe(2); expect(dup.amount).toBe(2469.12); expect(dup.label_ar).toBe(SIGNALS.DUPLICATE.label_ar);
    expect(sum.bySignal[0].count).toBeGreaterThanOrEqual(sum.bySignal[sum.bySignal.length - 1].count);
    expect(sum.benford.n).toBe(4); expect(sum.benford.conformity).toBe('insufficient');
    expect(sum.averageScore).toBe(Math.round((scores.reduce((t, s) => t + s.score, 0) / 4) * 10) / 10);
  });
});

describe('journal risk: edge cases', () => {
  it('an empty ledger scores nothing and summarizes to zeros', () => {
    expect(scoreEntries([])).toEqual([]);
    const sum = summarize([]);
    expect(sum).toMatchObject({ total: 0, scored: 0, averageScore: 0, distribution: { low: 0, medium: 0, high: 0 }, top: [], bySignal: [], duplicateGroups: [] });
    expect(sum.benford.conformity).toBe('insufficient');
    expect(scoreEntries(null as unknown as RiskEntry[])).toEqual([]);
  });
  it('a single entry is never a duplicate nor a rare user, and the summary holds one row', () => {
    const [s] = scoreEntries([je('only', { user: 'خالد' })]);
    expect(s.signals.map((x) => x.code)).toEqual([]);
    expect(summarize([s]).distribution.low).toBe(1);
  });
  it('an unbalanced entry carries UNBALANCED, still gets an amount (the larger side) and ranks above balanced ones', () => {
    const u = je('u', { lines: [{ accountId: 'cash', debit: 300, credit: 0 }, { accountId: 'rev', debit: 0, credit: 250 }] });
    const scores = scoreEntries([je('ok'), u]);
    expect(scores[0].id).toBe('u'); expect(scores[0].amount).toBe(300); expect(scores[0].signals[0].code).toBe('UNBALANCED'); expect(scores[0].band).toBe('medium');
    expect(entryAmount({ lines: [{ accountId: 'x', debit: NaN, credit: 0 }] })).toBe(0);
  });
  it('tolerates missing or malformed fields without throwing', () => {
    const weird = [{ id: 'w1', date: '', lines: undefined } as unknown as RiskEntry, { id: 'w2', date: '2025-13-45', lines: [{ accountId: '', debit: '5' as unknown as number, credit: 0 }] }];
    const scores = scoreEntries(weird);
    expect(scores).toHaveLength(2); expect(scores.every((s) => s.signals.some((x) => x.code === 'EMPTY_ENTRY'))).toBe(true);
  });
});
