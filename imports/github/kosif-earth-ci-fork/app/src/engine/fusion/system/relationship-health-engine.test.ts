import { describe, expect, it } from 'vitest';
import { relationshipHealth } from './relationship-health-engine';
import { MODEL_COMPANIES, modelBooks } from './model-books-engine';
import { sectorPack } from './sector-pack-engine';

const acc = [{ id: 'a1100', code: '1100', name: 'النقدية' }, { id: 'a1200', code: '1200', name: 'العملاء' }, { id: 'a4000', code: '4000', name: 'المبيعات' }];
const sale = (id: string, party?: string, extra: Record<string, unknown> = {}) => ({ id, date: '2026-07-01', sourceId: 'sale:' + id, ...(party ? { party } : {}), lines: [{ accountId: 'a1200', debit: 100, credit: 0 }, { accountId: 'a4000', debit: 0, credit: 100 }], ...extra });

describe('relationship health', () => {
  it.each(MODEL_COMPANIES.map((c) => [c.id]))('%s: every link healthy', (id) => {
    const b = modelBooks(id), ledger = b.ledger as Record<string, unknown[]>;
    const ids = (k: string, f = 'id') => (Array.isArray(ledger[k]) ? (ledger[k] as Record<string, string>[]).map((o) => o[f]) : undefined);
    const r = relationshipHealth({ accounts: b.accounts.map(([code, name]) => ({ id: code, code, name })), entries: b.entries, packCodes: sectorPack(b.sector).accounts.map((a) => a[0]),
      objects: { term: ids('terms'), order: ids('orders'), product: ids('products'), cycle: ids('cycles'), branch: ledger.branches as string[] | undefined }, pending: { total: 0, oldest: null }, asOf: b.lockDate });
    expect(r.findings).toEqual([]); expect(r.status).toBe('ok');
  });
  it('names each broken link with its source and a repair', () => {
    const r = relationshipHealth({
      accounts: acc,
      entries: [sale('1', 'مؤسسة الريان'), sale('1', 'مؤسسة الريان'), sale('2'), sale('3', 'x', { trade: { kind: 'sale', branch: 'فرع محذوف' } }),
        { id: '4', date: '2026-07-02', lines: [{ accountId: 'gone', debit: 5, credit: 0 }, { accountId: 'a1100', debit: 0, credit: 5 }] },
        { id: '5', date: '2026-07-03', lines: [{ accountId: 'a1100', debit: 5, credit: 0 }, { accountId: 'a4000', debit: 0, credit: 4 }] }],
      definitions: { costCenters: [{ id: 'c1', name: 'الفرع الشمالي', accountCode: '7777' }, { id: 'c2', name: 'المستودع', accountCode: '1100' }] },
      packCodes: ['1100', '4100'], pending: { total: 3, oldest: '2026-05-01' }, objects: { branch: ['الرياض'] }, asOf: '2026-07-31', staleDays: 30,
    });
    const by = (title: RegExp) => r.findings.find((f) => title.test(f.title))!;
    expect(r.status).toBe('fail');
    expect(by(/تعريفات/)).toMatchObject({ link: 'mapping', severity: 'fail', count: 1, sample: ['الفرع الشمالي → 7777 (costCenters)'] });
    expect(by(/حزمة القطاع/)).toMatchObject({ link: 'mapping', severity: 'warn', count: 1, sample: ['4100'] });
    expect(by(/لم تُرحّل/)).toMatchObject({ link: 'posting', severity: 'fail', count: 3 });
    expect(by(/فرع غير موجود/)).toMatchObject({ link: 'reference', count: 1 });
    expect(by(/خارج الدليل/)).toMatchObject({ link: 'sync', count: 1 });
    expect(by(/أكثر من مرة/)).toMatchObject({ link: 'sync', count: 1, sample: ['sale:1 ×2'] });
    expect(by(/غير متزنة/)).toMatchObject({ count: 1 });
    expect(by(/بلا طرف/)).toMatchObject({ link: 'party', severity: 'warn', count: 1 });
    for (const f of r.findings) { expect(f.source).toBeTruthy(); expect(f.repair).toBeTruthy(); }
  });
  it('recent unposted operations are a warning, not a failure; a reversed entry is not a broken reference', () => {
    const r = relationshipHealth({ accounts: acc, entries: [sale('9', 'x', { trade: { branch: 'قديم' }, reversedBy: 'r9' })], pending: { total: 1, oldest: '2026-07-25' }, objects: { branch: [] }, asOf: '2026-07-31' });
    expect(r.status).toBe('warn'); expect(r.findings.map((f) => f.link)).toEqual(['posting']);
  });
});
