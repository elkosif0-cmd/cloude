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
  | 'LINE_ZERO_AMOUNT';

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

  entry.lines.forEach((line, lineIndex) => {
    const debit = Number(line.debit);
    const credit = Number(line.credit);

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
