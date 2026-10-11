import { describe, expect, it } from 'vitest';
import { coversPeriod, externalInserts, markLegacy, sealLegacy, sealNew, sha256, verifyChain, type ChainEntry } from './journal-chain-engine';

const je = (id: string, date: string, amt: number, extra: Partial<ChainEntry> = {}): ChainEntry => ({ id, date, memo: 'قيد ' + id, source: 'يدوي',
  lines: [{ accountId: 'cash', debit: amt, credit: 0 }, { accountId: 'rev', debit: 0, credit: amt }], ...extra });

describe('journal audit trail (edit log)', () => {
  it('SHA-256 matches the standard vectors and Node for Arabic text', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    const t = 'قيد بيع — عميل ١٢٣ '.repeat(20);
    expect(sha256(t)).toBe('cee5cfcfc682ee69f9e7818b63eaea421ef5ebd6aad3ea386f1728f8bb22890b'); // node:crypto reference
  });
  it('seals new entries in order and verifies an intact chain', () => {
    const es = [je('a', '2025-01-02', 100), je('b', '2025-01-03', 200)];
    expect(sealNew(es, '2025-01-03T10:00:00Z')).toBe(2);
    es.push(je('c', '2025-01-05', 300));
    expect(sealNew(es, '2025-01-05T10:00:00Z')).toBe(1);
    const v = verifyChain(es);
    expect(v.ok).toBe(true);
    expect(es.map((e) => e.seq)).toEqual([1, 2, 3]);
    expect(es[1].prev).toBe(es[0].hash);
    expect(v.sealed).toBe(3);
  });
  it('a reversal link added later does not break the seal; an edited amount, a deletion or an unsealed insert does', () => {
    const es = [je('a', '2025-01-02', 100), je('b', '2025-01-03', 200), je('c', '2025-01-04', 300)];
    sealNew(es, 'now');
    (es[0] as ChainEntry).reversedBy = 'x';
    expect(verifyChain(es).ok).toBe(true);
    const edited = es.map((e) => ({ ...e, lines: e.lines.map((l) => ({ ...l })) }));
    edited[1].lines[0].debit = 999; edited[1].lines[1].credit = 999;
    expect(verifyChain(edited).issues.map((i) => i.kind)).toContain('edited');
    const deleted = [es[0], es[2]];
    expect(verifyChain(deleted).issues.map((i) => i.kind)).toEqual(expect.arrayContaining(['gap', 'broken-link']));
    const halala = es.map((e) => ({ ...e, lines: e.lines.map((l) => ({ ...l })) }));
    halala[2].lines[0].debit += 0.01; halala[2].lines[1].credit += 0.01;
    expect(verifyChain(halala).issues.map((i) => i.kind)).toContain('edited');
    const inserted = [...es, je('d', '2025-01-06', 50)];
    expect(verifyChain(inserted).issues.map((i) => i.kind)).toContain('unsealed');
  });
  it('legacy entries stay outside the chain until sealed once, and coverage reports the period', () => {
    const es = [je('old1', '2024-12-30', 10), je('old2', '2024-12-31', 20)];
    expect(markLegacy(es)).toBe(2);
    es.push(je('n1', '2025-01-02', 30));
    sealNew(es, 'now');
    let v = verifyChain(es);
    expect(v.ok).toBe(true); expect(v.legacy).toBe(2); expect(v.sealed).toBe(1);
    expect(coversPeriod(es, '2024-12-01', '2024-12-31').throughout).toBe(false);
    expect(sealLegacy(es, 'later')).toBe(2);
    v = verifyChain(es);
    expect(v.ok).toBe(true); expect(v.legacy).toBe(0); expect(v.sealed).toBe(3);
    expect(coversPeriod(es, '2024-12-01', '2025-01-31').throughout).toBe(true);
  });
  it('demo entries stay outside the chain, so clearing the sample company never breaks it; external inserts are detected', () => {
    const es = [je('a', '2025-01-02', 100), je('d1', '2025-01-03', 5, { demo: true }), je('b', '2025-01-04', 200)];
    sealNew(es, 'now');
    expect(es[1].hash).toBeUndefined();
    const cleared = es.filter((e) => !e.demo);
    expect(verifyChain(cleared).ok).toBe(true);
    expect(verifyChain(es).demo).toBe(1);
    const stored = [...cleared, je('x', '2025-01-05', 9)];
    expect(externalInserts(stored)).toEqual(['x']);
  });
});
