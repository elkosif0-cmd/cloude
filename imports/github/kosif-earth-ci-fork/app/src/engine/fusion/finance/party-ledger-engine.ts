import type { JournalEntry } from './ledger-engine';
import { ageReceivables, type AgingBucket } from './receivables-engine';

/* customers and suppliers straight from the books: every entry that names a party moves that party's balance on a
   control account (receivables on the debit side, payables on the credit side). Settlements clear the oldest charges
   first (FIFO), and what is left is aged by its due date. */

export type PartyEntry = JournalEntry & { party?: string; memo?: string };
export type PartySide = 'debit' | 'credit';

export type PartyMovement = { entryId: string; date: string; reference?: string; memo?: string; party: string; amount: number };

export type PartyBalance = {
  party: string;
  balance: number;
  charged: number;
  settled: number;
  lastDate: string;
  oldestOpen: string | null;
  aging: Record<AgingBucket, number>;
};

export type PartyBalances = {
  rows: PartyBalance[];
  totals: Record<AgingBucket, number>;
  balance: number;
  /** movements on the account in entries that name no party (summaries, openings) */
  unassigned: number;
};

export type StatementLine = { date: string; reference?: string; memo?: string; charge: number; settlement: number; balance: number };

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function addDays(iso: string, days: number) {
  const t = Date.parse(String(iso).slice(0, 10) + 'T00:00:00Z');
  if (!Number.isFinite(t)) return String(iso).slice(0, 10);
  return new Date(t + days * 86_400_000).toISOString().slice(0, 10);
}

const emptyBuckets = (): Record<AgingBucket, number> => ({ current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 });

function netOn(entry: JournalEntry, accountId: string, side: PartySide) {
  let v = 0;
  for (const line of entry.lines) if (line.accountId === accountId) v += side === 'debit' ? Number(line.debit) - Number(line.credit) : Number(line.credit) - Number(line.debit);
  return money(v);
}

/** each entry's net effect on the control account, oldest first; positive raises the party's balance */
export function partyMovements(entries: PartyEntry[], accountId: string, side: PartySide): { movements: PartyMovement[]; unassigned: number } {
  const movements: PartyMovement[] = [];
  let unassigned = 0;
  for (const entry of entries) {
    const amount = netOn(entry, accountId, side);
    if (amount === 0) continue;
    const party = String(entry.party ?? '').trim();
    if (!party) { unassigned += amount; continue; }
    movements.push({ entryId: entry.id, date: String(entry.date).slice(0, 10), reference: entry.reference, memo: entry.memo, party, amount });
  }
  movements.sort((a, b) => a.date.localeCompare(b.date) || a.entryId.localeCompare(b.entryId));
  return { movements, unassigned: money(unassigned) };
}

export function partyBalances(entries: PartyEntry[], accountId: string, side: PartySide, asOf: string, termsDays = 0): PartyBalances {
  const { movements, unassigned } = partyMovements(entries, accountId, side);
  const byParty = new Map<string, PartyMovement[]>();
  for (const m of movements) { const list = byParty.get(m.party) ?? []; list.push(m); byParty.set(m.party, list); }
  const rows: PartyBalance[] = [];
  const totals = emptyBuckets();
  byParty.forEach((list, party) => {
    const open: { date: string; left: number }[] = [];
    let credit = 0, charged = 0, settled = 0;
    for (const m of list) {
      if (m.amount > 0) {
        charged += m.amount;
        let left = m.amount;
        if (credit > 0) { const use = Math.min(credit, left); credit -= use; left -= use; }
        if (left > 0.004) open.push({ date: m.date, left });
      } else {
        let pay = -m.amount;
        settled += pay;
        while (pay > 0.004 && open.length) { const use = Math.min(pay, open[0].left); open[0].left -= use; pay -= use; if (open[0].left <= 0.004) open.shift(); }
        credit += pay;
      }
    }
    const aged = ageReceivables(open.map((o, i) => ({ id: party + '-' + i, customerId: party, invoiceDate: o.date, dueDate: addDays(o.date, termsDays), amount: money(o.left), paid: 0 })), asOf);
    const balance = money(charged - settled);
    const aging = { ...aged.totals };
    rows.push({ party, balance, charged: money(charged), settled: money(settled), lastDate: list[list.length - 1].date, oldestOpen: open.length ? open[0].date : null, aging });
    (Object.keys(totals) as AgingBucket[]).forEach((k) => { totals[k] = money(totals[k] + aging[k]); });
  });
  rows.sort((a, b) => b.balance - a.balance || a.party.localeCompare(b.party));
  return { rows, totals, balance: money(rows.reduce((s, r) => s + r.balance, 0)), unassigned };
}

/** a party's statement of account with its running balance */
export function partyStatement(entries: PartyEntry[], accountId: string, side: PartySide, party: string): StatementLine[] {
  let running = 0;
  return partyMovements(entries, accountId, side).movements.filter((m) => m.party === party).map((m) => {
    running = money(running + m.amount);
    return { date: m.date, reference: m.reference, memo: m.memo, charge: m.amount > 0 ? m.amount : 0, settlement: m.amount < 0 ? -m.amount : 0, balance: running };
  });
}

/** a customer collection (Dr cash / Cr receivables) or a supplier payment (Dr payables / Cr cash) */
export function buildSettlementEntry(p: { id: string; date: string; kind: 'collection' | 'payment'; party: string; amount: number; cashAccountId: string; controlAccountId: string; reference?: string }): PartyEntry {
  const amount = money(Number(p.amount));
  if (!(amount > 0)) throw new Error('AMOUNT_MUST_BE_POSITIVE');
  if (!String(p.party || '').trim()) throw new Error('PARTY_REQUIRED');
  if (!p.cashAccountId || !p.controlAccountId) throw new Error('ACCOUNTS_REQUIRED');
  const collection = p.kind === 'collection';
  return {
    id: p.id,
    date: p.date,
    reference: p.reference,
    party: p.party.trim(),
    lines: collection
      ? [{ accountId: p.cashAccountId, debit: amount, credit: 0, description: 'تحصيل من ' + p.party }, { accountId: p.controlAccountId, debit: 0, credit: amount, description: 'تحصيل من ' + p.party }]
      : [{ accountId: p.controlAccountId, debit: amount, credit: 0, description: 'سداد إلى ' + p.party }, { accountId: p.cashAccountId, debit: 0, credit: amount, description: 'سداد إلى ' + p.party }],
  };
}
