/* Revenue completeness and cut-off — the procedures behind the revenue key audit matters of e& («reconciliation of
   transaction data recorded in the billing systems to the revenue reported in the general ledger… data analytic
   techniques to identify manual revenue-related journal entries»), Deutsche Telekom («reconciliation of transaction
   data recorded in the upstream systems to the revenue reported in the general ledger… manual adjustment postings for
   revenue cut-off») and Unilever/Nestlé (transactions after the reporting date tested for the correct period).
   Here the upstream system is the app's own sales register (prices include VAT) and the ledger is its double-entry
   books. Amounts in minor units. */
export type SaleRecord = { id: string; date: string; gross: number; vatRate?: number };
export type RevEntry = { id: string; date: string; source?: string; sourceId?: string; memo?: string; reversalOf?: string; reversedBy?: string;
  lines: { accountId: string; debit: number; credit: number }[] };

export const netOfVat = (gross: number, rate = 0.15) => gross - Math.round((gross * rate) / (1 + rate));
const month = (d: string) => String(d || '').slice(0, 7);

export function reconcileRevenue(input: { sales: SaleRecord[]; entries: RevEntry[]; revenueAccounts: string[]; start: string; end: string; cutoffDays?: number }) {
  const rev = new Set(input.revenueAccounts), { start, end } = input, days = input.cutoffDays ?? 7;
  const revOf = (e: RevEntry) => e.lines.reduce((s, l) => s + (rev.has(l.accountId) ? l.credit - l.debit : 0), 0);
  const inP = (d: string) => d >= start && d <= end;
  const sales = input.sales.filter((s) => s && s.id && inP(String(s.date).slice(0, 10)));
  const bySource = new Map<string, RevEntry>();
  for (const e of input.entries) if (e.sourceId && !e.reversedBy) bySource.set(e.sourceId, e);
  const months = new Map<string, { month: string; source: number; ledger: number; fromSales: number; other: number }>();
  const row = (m: string) => { if (!months.has(m)) months.set(m, { month: m, source: 0, ledger: 0, fromSales: 0, other: 0 }); return months.get(m)!; };
  for (const s of sales) row(month(s.date)).source += netOfVat(s.gross, s.vatRate ?? 0.15);
  const manual: { id: string; date: string; source: string; memo: string; amount: number }[] = [];
  const byId = new Map(input.entries.map((e) => [e.id, e]));
  for (const e of input.entries) {
    const a = revOf(e); if (!a || !inP(e.date)) continue;
    const r = row(month(e.date)); r.ledger += a;
    const orig = e.reversalOf ? byId.get(e.reversalOf) : undefined;
    const fromSale = String(e.sourceId || '').startsWith('sale:') || String(orig?.sourceId || '').startsWith('sale:');
    if (fromSale) r.fromSales += a; else { r.other += a; manual.push({ id: e.id, date: e.date, source: e.source || 'يدوي', memo: e.memo || '', amount: a }); }
  }
  const unposted = sales.filter((s) => !bySource.has('sale:' + s.id)).map((s) => ({ id: s.id, date: String(s.date).slice(0, 10), amount: netOfVat(s.gross, s.vatRate ?? 0.15) }));
  /* reversals dated after the period end of revenue recorded inside it: sales that may not have happened in the period */
  const reversedAfter = input.entries.filter((e) => e.reversalOf && e.date > end).map((e) => ({ e, o: byId.get(e.reversalOf as string) }))
    .filter(({ o }) => o && inP(o.date) && revOf(o) !== 0).map(({ e, o }) => ({ id: o!.id, date: o!.date, reversedOn: e.date, amount: revOf(o!) }));
  const edge = new Date(end + 'T00:00:00Z'); edge.setUTCDate(edge.getUTCDate() - days + 1);
  const windowStart = edge.toISOString().slice(0, 10);
  const lastDays = sales.filter((s) => String(s.date).slice(0, 10) >= windowStart);
  const rows = [...months.values()].sort((a, b) => a.month.localeCompare(b.month)).map((r) => ({ ...r, diff: r.ledger - r.source }));
  const tot = rows.reduce((t, r) => ({ source: t.source + r.source, ledger: t.ledger + r.ledger, other: t.other + r.other }), { source: 0, ledger: 0, other: 0 });
  const tolerance = Math.max(100, sales.length);
  return { rows, source: tot.source, ledger: tot.ledger, diff: tot.ledger - tot.source, otherRevenue: tot.other, unposted, manual, reversedAfter,
    cutoff: { from: windowStart, to: end, count: lastDays.length, amount: lastDays.reduce((s, x) => s + netOfVat(x.gross, x.vatRate ?? 0.15), 0) },
    reconciled: Math.abs(tot.ledger - tot.other - tot.source) <= tolerance && unposted.length === 0, tolerance };
}
