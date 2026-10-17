import { describe, expect, it } from 'vitest';
import { parseTrialBalance, SAMPLE_TB_CSV } from '../reports/tb-import-engine';
import {
  benford, COUNCIL, cutoffEntries, disagreements, evidenceRegister, integrityChecks, journalTests, memberBody, parseJournal, roleWeight,
  unusualEntries, verifyOpinion, weightedVote, type Journal,
} from './council-engine';

const tb = parseTrialBalance(SAMPLE_TB_CSV);
const je = (id: string, date: string, lines: [string, number, number][], extra: Partial<Journal> = {}): Journal => ({ id, ref: id.replace('JE-', ''), date, memo: 'قيد', source: 'آلي', lines: lines.map(([account, debit, credit]) => ({ account, debit, credit })), ...extra });

describe('the audit council — deterministic half (research ch. 7–8)', () => {
  it('parses a journal export into entries grouped by reference', () => {
    const csv = 'رقم القيد,التاريخ,رقم الحساب,مدين,دائن,البيان,المستخدم\n101,2025-12-31,1121,"5,000",,مبيعات آجلة,سارة\n101,2025-12-31,4101,,5000,مبيعات آجلة,سارة\n102,31/12/2025,5101,300,,تكلفة,\n102,31/12/2025,1141,,300,تكلفة,';
    const { entries, errors } = parseJournal(csv);
    expect(errors).toEqual([]);
    expect(entries.map((j) => [j.ref, j.date, j.lines.length, j.lines[0].debit])).toEqual([['101', '2025-12-31', 2, 5000], ['102', '2025-12-31', 2, 300]]);
    expect(parseJournal('a,b\n1,2').errors[0]).toContain('لم أتعرف');
  });

  it('runs the six integrity checks and turns failures into requests', () => {
    const entries = [je('JE-1', '2025-01-05', [['1101', 150000, 0], ['3101', 0, 150000]]), je('JE-3', '2026-01-02', [['5101', 10, 0], ['1101', 0, 10]])];
    const c = integrityChecks({ tb, entries, period: { start: '2025-01-01', end: '2025-12-31' } });
    expect(c.map((x) => [x.id, x.ok])).toEqual([['INT-1', true], ['INT-2', true], ['INT-3', false], ['INT-4', false], ['INT-5', true], ['INT-6', false]]);
    expect(c[2].detail).toContain('2');
    expect(c.filter((x) => x.request).map((x) => x.id)).toEqual(['INT-3', 'INT-4', 'INT-6']);
    expect(integrityChecks({ tb }).map((x) => x.ok)).toEqual([true, true, null, null, true, null]);
  });

  it('measures Benford conformity with χ² and MAD (Nigrini bands)', () => {
    // amounts drawn to follow Benford closely: 10^u for u uniform
    const nat = Array.from({ length: 900 }, (_, k) => Math.round(Math.pow(10, 2 + (k + 0.5) / 900 * 3)));
    const b = benford(nat);
    expect(b.n).toBe(900);
    expect(['close', 'acceptable']).toContain(b.conformity);
    const fake = Array.from({ length: 200 }, (_, k) => 5000 + k * 3);
    expect(benford(fake).conformity).toBe('nonconformity');
    expect(benford(fake).top.digit).toBe(5);
    expect(benford([123, 456]).conformity).toBe('insufficient');
  });

  it('finds unusual entries and the cut-off window over the whole population', () => {
    const sensitive = (a: string) => a.startsWith('4');
    const E = [
      je('JE-10', '2025-12-26', [['1121', 50000, 0], ['4101', 0, 50000]], { source: 'يدوي', memo: '' }), // Friday, round, manual on revenue, no memo
      je('JE-11', '2025-12-30', [['1121', 1234.5, 0], ['4101', 0, 1234.5]], { createdAt: '2026-01-15T10:00' }), // back-dated after close
      je('JE-12', '2025-06-10', [['5101', 800, 0], ['1101', 0, 800]]),
      je('JE-13', '2026-01-02', [['5101', 900, 0], ['1141', 0, 900]], { memo: 'مرتجع' }),
    ];
    const u = unusualEntries(E, { periodEnd: '2025-12-31', sensitive });
    // the entry with the most risk signals leads; the back-dated one is kept with its reason
    expect(u[0].ref).toBe('10');
    expect(u.find((x) => x.ref === '11')!.reasons.map((r) => r.code)).toEqual(['backdated']);
    expect(u.find((x) => x.ref === '10')!.reasons.map((r) => r.code)).toEqual(['weekend', 'round', 'manual-sensitive', 'no-memo']);
    const cut = cutoffEntries(E, '2025-12-31', (a) => /^[45]/.test(a));
    expect(cut.map((c) => [c.ref, c.side])).toEqual([['10', 'before'], ['11', 'before'], ['13', 'after']]);
    const t = journalTests(E, { periodEnd: '2025-12-31', sensitive, isResult: (a) => /^[45]/.test(a) });
    expect([t.count, t.fraudSignal]).toEqual([4, true]);
  });

  it('numbers the evidence the members must cite', () => {
    const lineOf = (c: string) => ({ '1121': 'receivables', '4101': 'revenue' } as Record<string, string>)[c] ?? null;
    const reg = evidenceRegister({ tb, lineOf, pm: 1_000_000, findings: [{ id: 'A1', severity: 'medium', kind: 'analytical', code: '4101', lineKey: 'revenue', standard: 'ISA 520', title: 'ارتفاع الإيرادات', detail: 'ارتفعت 25% إلى 500,000', basis: '', action: '', source: 'engine' }],
      checks: [{ id: 'INT-3', ar: 'تسلسل القيود', ok: false, detail: 'أرقام مفقودة: 2' }], docs: [{ requestId: 'REQ-1', fileName: 'confirm.pdf', verdict: 'مقبول', lineKey: 'receivables', amount: 80000 }] });
    const ids = reg.map((e) => e.id);
    expect(ids).toContain('TB-4101');
    expect(ids).toContain('T-ANL-001');
    expect(ids).toContain('T-INT-1');
    expect(ids).toContain('DOC-1');
    expect(reg.find((e) => e.id === 'TB-1121')!.lineKey).toBe('receivables');
    expect(reg.find((e) => e.id === 'TB-4101')!.amount).toBe(-500000);
  });

  it('rejects opinions citing evidence that does not exist and flags free numbers', () => {
    const reg = [{ id: 'TB-4101', family: 'TB' as const, title: 'المبيعات', detail: 'الرصيد -500,000.00', amount: -500000 }, { id: 'T-ANL-001', family: 'ANL' as const, title: 'ارتفاع الإيرادات', detail: 'ارتفعت 25% إلى 500,000' }];
    const good = verifyOpinion({ position: 'الإيرادات تحتاج أدلة', reasoning: 'ارتفعت الإيرادات إلى 500,000 [T-ANL-001] [TB-4101] وفق ISA 520', citations: ['T-ANL-001'],
      items: [{ lineKey: 'revenue', assertion: 'existence', sufficient: false, finding: true, confidence: 0.55, citations: ['T-ANL-001'] }], requests: [{ lineKey: 'revenue', assertion: 'existence', evidence: 'عقود أكبر ثلاثة عملاء', reason: 'T-ANL-001', citations: ['T-ANL-001'], effort: 'low' }] }, 'skeptic', reg);
    expect([good.rejected, good.unknownCitations, good.unsupportedNumbers, good.citations.sort()]).toEqual([false, [], [], ['T-ANL-001', 'TB-4101']]);
    const bad = verifyOpinion({ position: 'x', reasoning: 'المخزون 720,000 [T-ANL-009]', citations: ['T-ANL-009'], items: [], requests: [] }, 'analyst', reg);
    expect([bad.rejected, bad.unknownCitations, bad.unsupportedNumbers]).toEqual([true, ['T-ANL-009'], ['720000']]);
  });

  it('weights votes by trade and finds the disagreements for the debate', () => {
    expect([roleWeight('tax', 'zakatExpense'), roleWeight('tax', 'revenue'), roleWeight('analyst', 'revenue'), roleWeight('skeptic', 'cash', true)]).toEqual([2, 0.75, 2, 2]);
    const mk = (member: 'skeptic' | 'analyst' | 'tax', c: number, s: boolean) => verifyOpinion({ position: 'p', reasoning: 'r [TB-4101]', citations: ['TB-4101'], items: [{ lineKey: 'revenue', assertion: 'existence', sufficient: s, finding: false, confidence: c, citations: ['TB-4101'] }], requests: [] }, member, [{ id: 'TB-4101', family: 'TB', title: 't', detail: 'd' }]);
    const ops = [mk('skeptic', 0.3, false), mk('analyst', 0.9, true), mk('tax', 0.8, true)];
    const v = weightedVote(ops, 'revenue', 'existence')!;
    expect(v.confidence).toBe(0.72);
    expect(Math.round(v.sufficient * 100)).toBe(73);
    expect(disagreements(ops).map((d) => [d.lineKey, d.assertion, d.spread, d.split])).toEqual([['revenue', 'existence', 0.6, true]]);
    expect(COUNCIL[3]).toEqual(['skeptic', 'analyst']);
    const body = memberBody('skeptic', { company: 'الأفق', period: '2025', framework: 'IFRS', register: [{ id: 'TB-4101', family: 'TB', title: 't', detail: 'd' }], lines: 'revenue 0.55/0.90', outstanding: '', round: 1 });
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.systemInstruction.parts[0].text).toContain('المراجع المتشكك');
    expect(body.contents[0].parts[0].text).toContain('[TB-4101]');
  });
});
