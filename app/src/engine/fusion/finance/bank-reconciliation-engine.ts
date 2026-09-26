import type { JournalEntry } from './ledger-engine';

/* bank reconciliation of the books' cash account against the bank statement: lines are matched on the exact amount
   within a few days (a shared reference wins), then the classic statement is drawn up: the bank balance adjusted for
   deposits in transit and outstanding payments must equal the book balance adjusted for items only the bank knows. */

export type BankLine = { id: string; date: string; amount: number; description?: string; reference?: string };
export type BookLine = { id: string; date: string; amount: number; reference?: string; memo?: string };
export type BankPair = { bankId: string; bookId: string };
export type BankMatch = BankPair & { days: number; manual: boolean };

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function days(a: string, b: string) {
  const x = Date.parse(String(a).slice(0, 10) + 'T00:00:00Z'), y = Date.parse(String(b).slice(0, 10) + 'T00:00:00Z');
  return Number.isFinite(x) && Number.isFinite(y) ? Math.round(Math.abs(x - y) / 86_400_000) : Number.POSITIVE_INFINITY;
}

/** the cash account's movements, one line per entry: positive = money in */
export function bookCashLines(entries: (JournalEntry & { memo?: string })[], cashAccountId: string): BookLine[] {
  const out: BookLine[] = [];
  for (const e of entries) {
    let v = 0;
    for (const l of e.lines) if (l.accountId === cashAccountId) v += (Number(l.debit) || 0) - (Number(l.credit) || 0);
    v = money(v);
    if (v !== 0) out.push({ id: e.id, date: String(e.date).slice(0, 10), amount: v, reference: e.reference, memo: e.memo });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function matchBankLines(bank: BankLine[], book: BookLine[], opts: { days?: number; manual?: BankPair[] } = {}) {
  const windowDays = opts.days ?? 5;
  const usedBank = new Set<string>(), usedBook = new Set<string>(), matches: BankMatch[] = [];
  for (const m of opts.manual ?? []) {
    const b = bank.find((x) => x.id === m.bankId), k = book.find((x) => x.id === m.bookId);
    if (!b || !k || usedBank.has(b.id) || usedBook.has(k.id)) continue;
    usedBank.add(b.id); usedBook.add(k.id); matches.push({ bankId: b.id, bookId: k.id, days: days(b.date, k.date), manual: true });
  }
  const norm = (s?: string) => String(s ?? '').trim().toLowerCase();
  for (const b of [...bank].sort((x, y) => x.date.localeCompare(y.date))) {
    if (usedBank.has(b.id)) continue;
    let best: BookLine | null = null, bestScore = Number.POSITIVE_INFINITY;
    for (const k of book) {
      if (usedBook.has(k.id) || money(k.amount) !== money(b.amount)) continue;
      const d = days(b.date, k.date);
      if (d > windowDays) continue;
      const score = d - (b.reference && norm(b.reference) === norm(k.reference) ? 100 : 0);
      if (score < bestScore) { best = k; bestScore = score; }
    }
    if (best) { usedBank.add(b.id); usedBook.add(best.id); matches.push({ bankId: b.id, bookId: best.id, days: days(b.date, best.date), manual: false }); }
  }
  return { matches, unmatchedBank: bank.filter((b) => !usedBank.has(b.id)), unmatchedBook: book.filter((k) => !usedBook.has(k.id)) };
}

export function bankReconciliationStatement(p: { statementBalance: number; bookBalance: number; unmatchedBank: BankLine[]; unmatchedBook: BookLine[] }) {
  const sum = (xs: { amount: number }[]) => money(xs.reduce((s, x) => s + x.amount, 0));
  const depositsInTransit = sum(p.unmatchedBook.filter((x) => x.amount > 0));
  const outstandingPayments = money(-sum(p.unmatchedBook.filter((x) => x.amount < 0)));
  const bankOnlyIn = sum(p.unmatchedBank.filter((x) => x.amount > 0));
  const bankOnlyOut = money(-sum(p.unmatchedBank.filter((x) => x.amount < 0)));
  const adjustedBank = money(p.statementBalance + depositsInTransit - outstandingPayments);
  const adjustedBook = money(p.bookBalance + bankOnlyIn - bankOnlyOut);
  const difference = money(adjustedBank - adjustedBook);
  return { statementBalance: money(p.statementBalance), bookBalance: money(p.bookBalance), depositsInTransit, outstandingPayments, bankOnlyIn, bankOnlyOut, adjustedBank, adjustedBook, difference, reconciled: Math.abs(difference) < 0.005 };
}
