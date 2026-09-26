import { describe, expect, it } from 'vitest';
import { netOfVat, reconcileRevenue, type RevEntry } from './revenue-recon-engine';

const sale = (id: string, date: string, gross: number): RevEntry => ({ id: 'je-' + id, date, source: 'مبيعات', sourceId: 'sale:' + id,
  lines: [{ accountId: 'ar', debit: gross, credit: 0 }, { accountId: 'rev', debit: 0, credit: netOfVat(gross) }, { accountId: 'vat', debit: 0, credit: gross - netOfVat(gross) }] });

describe('revenue reconciliation: sales register vs ledger', () => {
  it('reconciles month by month and finds nothing when every sale is posted', () => {
    const sales = [{ id: 's1', date: '2025-01-10', gross: 115_00 }, { id: 's2', date: '2025-02-10', gross: 230_00 }];
    const r = reconcileRevenue({ sales, entries: [sale('s1', '2025-01-10', 115_00), sale('s2', '2025-02-10', 230_00)], revenueAccounts: ['rev'], start: '2025-01-01', end: '2025-12-31' });
    expect(netOfVat(115_00)).toBe(100_00);
    expect(r.rows.map((x) => x.diff)).toEqual([0, 0]);
    expect(r.reconciled).toBe(true);
  });
  it('lists unposted sales, manual revenue entries and sales reversed after the year end', () => {
    const sales = [{ id: 's1', date: '2025-12-30', gross: 115_00 }, { id: 's2', date: '2025-06-01', gross: 230_00 }];
    const posted = sale('s1', '2025-12-30', 115_00);
    const manual: RevEntry = { id: 'm1', date: '2025-12-31', source: 'يدوي', memo: 'تسوية إيراد', lines: [{ accountId: 'ar', debit: 50_00, credit: 0 }, { accountId: 'rev', debit: 0, credit: 50_00 }] };
    const rv: RevEntry = { id: 'r1', date: '2026-01-05', source: 'عكس', reversalOf: posted.id, lines: posted.lines.map((l) => ({ ...l, debit: l.credit, credit: l.debit })) };
    posted.reversedBy = 'r1';
    const r = reconcileRevenue({ sales, entries: [posted, manual, rv], revenueAccounts: ['rev'], start: '2025-01-01', end: '2025-12-31' });
    expect(r.unposted.map((x) => x.id)).toEqual(expect.arrayContaining(['s2', 's1']));
    expect(r.manual.map((x) => x.id)).toEqual(['m1']);
    expect(r.reversedAfter).toEqual([{ id: posted.id, date: '2025-12-30', reversedOn: '2026-01-05', amount: 100_00 }]);
    expect(r.cutoff.count).toBe(1);
    expect(r.reconciled).toBe(false);
  });
});
