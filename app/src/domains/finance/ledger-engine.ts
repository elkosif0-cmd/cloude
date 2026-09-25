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

export function validateJournalEntry(_entry: JournalEntry): ValidationResult {
  return { valid: false, issues: [] };
}

export function buildGeneralLedger(_entries: JournalEntry[]): LedgerRow[] {
  return [];
}

export function buildTrialBalance(_entries: JournalEntry[]): TrialBalance {
  return { rows: [], totals: { debit: 0, credit: 0 }, balanced: true };
}
