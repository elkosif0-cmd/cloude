export type JournalLine = {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  reference?: string;
  lines: JournalLine[];
};

export type JournalIssueCode =
  | 'JOURNAL_UNBALANCED'
  | 'LINE_BOTH_SIDES'
  | 'LINE_NEGATIVE_AMOUNT'
  | 'LINE_ZERO_AMOUNT'
  | 'LINE_NON_FINITE_AMOUNT'
  | 'JOURNAL_TOO_FEW_LINES'
  | 'JOURNAL_EMPTY_TOTAL';

export type JournalIssue = {
  code: JournalIssueCode;
  lineIndex?: number;
};

export type ValidationResult = {
  valid: boolean;
  issues: JournalIssue[];
};

export type LedgerRow = {
  accountId: string;
  debit: number;
  credit: number;
  balance: number;
};

export type TrialBalance = {
  rows: LedgerRow[];
  totals: { debit: number; credit: number };
  balanced: boolean;
};

const MONEY_TOLERANCE = 0.005;

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function validateJournalEntry(entry: JournalEntry): ValidationResult {
  const issues: JournalIssue[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  // A posting must contain at least two distinct lines and a positive monetary movement.
  // These are the same baseline controls required by the source posting engine audited in
  // kosif199022-jpg/- (codex/altareeq-foundation), adapted without its DB dependencies.
  if (!Array.isArray(entry.lines) || entry.lines.length < 2) {
    issues.push({ code: 'JOURNAL_TOO_FEW_LINES' });
  }

  (Array.isArray(entry.lines) ? entry.lines : []).forEach((line, lineIndex) => {
    const debit = Number(line.debit);
    const credit = Number(line.credit);

    if (!Number.isFinite(debit) || !Number.isFinite(credit)) {
      issues.push({ code: 'LINE_NON_FINITE_AMOUNT', lineIndex });
      return;
    }

    if (debit < 0 || credit < 0) {
      issues.push({ code: 'LINE_NEGATIVE_AMOUNT', lineIndex });
    }

    if (debit > 0 && credit > 0) {
      issues.push({ code: 'LINE_BOTH_SIDES', lineIndex });
    }

    if (debit === 0 && credit === 0) {
      issues.push({ code: 'LINE_ZERO_AMOUNT', lineIndex });
    }

    if (Number.isFinite(debit)) totalDebit += debit;
    if (Number.isFinite(credit)) totalCredit += credit;
  });

  if (totalDebit <= 0 || totalCredit <= 0) {
    issues.push({ code: 'JOURNAL_EMPTY_TOTAL' });
  }

  if (Math.abs(totalDebit - totalCredit) > MONEY_TOLERANCE) {
    issues.push({ code: 'JOURNAL_UNBALANCED' });
  }

  return { valid: issues.length === 0, issues };
}

export function buildGeneralLedger(entries: JournalEntry[]): LedgerRow[] {
  const byAccount = new Map<string, LedgerRow>();

  for (const entry of entries) {
    for (const line of entry.lines) {
      const current = byAccount.get(line.accountId) ?? {
        accountId: line.accountId,
        debit: 0,
        credit: 0,
        balance: 0,
      };

      current.debit = money(current.debit + line.debit);
      current.credit = money(current.credit + line.credit);
      current.balance = money(current.debit - current.credit);
      byAccount.set(line.accountId, current);
    }
  }

  return [...byAccount.values()].sort((a, b) => a.accountId.localeCompare(b.accountId));
}

export function buildTrialBalance(entries: JournalEntry[]): TrialBalance {
  const rows = buildGeneralLedger(entries);
  const totals = rows.reduce(
    (sum, row) => ({
      debit: money(sum.debit + row.debit),
      credit: money(sum.credit + row.credit),
    }),
    { debit: 0, credit: 0 },
  );

  return {
    rows,
    totals,
    balanced: Math.abs(totals.debit - totals.credit) <= MONEY_TOLERANCE,
  };
}

export type LedgerAccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'other';
export type PeriodTrialBalance = TrialBalance & {
  /** result of the periods before the start, carried into retained earnings (positive = accumulated loss) */
  carried: number;
};

const isResult = (t: LedgerAccountType | undefined) => t === 'revenue' || t === 'expense';

/**
 * The trial balance of a reporting period as an auditor reads it: balance-sheet accounts cumulative to the
 * period end (opening balances included), revenue and expense accounts for the period only, and the net
 * result of the earlier periods carried into retained earnings — so the balance stays balanced.
 */
export function periodTrialBalance(
  entries: JournalEntry[],
  typeOf: (accountId: string) => LedgerAccountType | undefined,
  period: { start: string; end: string },
  retainedEarningsId: string,
): PeriodTrialBalance {
  const upToEnd = entries.filter((e) => e.date <= period.end);
  const before = upToEnd.filter((e) => e.date < period.start);
  const rows = buildGeneralLedger(upToEnd)
    .map((row) => {
      if (!isResult(typeOf(row.accountId))) return row;
      const inPeriod = buildGeneralLedger(upToEnd.filter((e) => e.date >= period.start)).find((r) => r.accountId === row.accountId);
      return inPeriod ?? { accountId: row.accountId, debit: 0, credit: 0, balance: 0 };
    })
    .filter((row) => row.debit || row.credit);
  const carried = money(
    buildGeneralLedger(before)
      .filter((r) => isResult(typeOf(r.accountId)))
      .reduce((sum, r) => sum + r.balance, 0),
  );
  if (Math.abs(carried) > MONEY_TOLERANCE) {
    const re = rows.find((r) => r.accountId === retainedEarningsId);
    const add = carried > 0 ? { debit: carried, credit: 0 } : { debit: 0, credit: -carried };
    if (re) Object.assign(re, { debit: money(re.debit + add.debit), credit: money(re.credit + add.credit), balance: money(re.balance + carried) });
    else rows.push({ accountId: retainedEarningsId, ...add, balance: carried });
  }
  rows.sort((a, b) => a.accountId.localeCompare(b.accountId));
  const totals = rows.reduce((sum, row) => ({ debit: money(sum.debit + row.debit), credit: money(sum.credit + row.credit) }), { debit: 0, credit: 0 });
  return { rows, totals, balanced: Math.abs(totals.debit - totals.credit) <= MONEY_TOLERANCE, carried };
}

/* ---------- controls: a posted entry is never deleted, it is reversed; nothing posts on or before the lock date ---------- */
export function reverseJournalEntry(entry: JournalEntry, params: { id: string; date: string; reference?: string }): JournalEntry {
  if (!entry.lines.length) throw new Error('NOTHING_TO_REVERSE');
  return {
    id: params.id,
    date: params.date,
    reference: params.reference ?? 'عكس ' + (entry.reference || entry.id),
    lines: entry.lines.map((line) => ({
      accountId: line.accountId,
      debit: money(Number(line.credit) || 0),
      credit: money(Number(line.debit) || 0),
      ...(line.description ? { description: 'عكس: ' + line.description } : {}),
    })),
  };
}

export function isPeriodLocked(date: string, lockDate?: string | null): boolean {
  if (!lockDate || !/^\d{4}-\d{2}-\d{2}/.test(lockDate)) return false;
  return String(date || '').slice(0, 10) <= lockDate.slice(0, 10);
}
