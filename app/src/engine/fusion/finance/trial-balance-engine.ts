export type TrialBalanceRow = {
  accountId: string;
  accountName?: string;
  openingDebit?: number;
  openingCredit?: number;
  debit: number;
  credit: number;
  priorDebit?: number;
  priorCredit?: number;
};

export type TrialBalanceIssueCode =
  | 'DUPLICATE_ACCOUNT'
  | 'MISSING_ACCOUNT'
  | 'NEGATIVE_AMOUNT'
  | 'UNBALANCED_TOTALS'
  | 'ABNORMAL_BOTH_SIDES';

export type TrialBalanceIssue = {
  code: TrialBalanceIssueCode;
  accountId?: string;
  rowIndex?: number;
};

export type TrialBalanceValidation = {
  valid: boolean;
  issues: TrialBalanceIssue[];
  totals: { debit: number; credit: number; difference: number };
};

const TOLERANCE = 0.005;

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function validateTrialBalance(rows: TrialBalanceRow[]): TrialBalanceValidation {
  const issues: TrialBalanceIssue[] = [];
  const seen = new Set<string>();
  let debit = 0;
  let credit = 0;

  rows.forEach((row, rowIndex) => {
    const accountId = row.accountId.trim();
    if (!accountId) issues.push({code:'MISSING_ACCOUNT', rowIndex});
    if (accountId && seen.has(accountId)) issues.push({code:'DUPLICATE_ACCOUNT', accountId, rowIndex});
    if (accountId) seen.add(accountId);

    const numeric = [row.debit, row.credit, row.openingDebit ?? 0, row.openingCredit ?? 0, row.priorDebit ?? 0, row.priorCredit ?? 0];
    if (numeric.some((value) => value < 0)) issues.push({code:'NEGATIVE_AMOUNT', accountId: accountId || undefined, rowIndex});
    if (row.debit > 0 && row.credit > 0) issues.push({code:'ABNORMAL_BOTH_SIDES', accountId: accountId || undefined, rowIndex});

    debit += Number.isFinite(row.debit) ? row.debit : 0;
    credit += Number.isFinite(row.credit) ? row.credit : 0;
  });

  debit = money(debit);
  credit = money(credit);
  const difference = money(debit - credit);

  if (Math.abs(difference) > TOLERANCE) issues.push({code:'UNBALANCED_TOTALS'});

  return {
    valid: issues.length === 0,
    issues,
    totals: {debit, credit, difference},
  };
}

export function accountMovement(row: TrialBalanceRow) {
  const current = money(row.debit - row.credit);
  const prior = money((row.priorDebit ?? 0) - (row.priorCredit ?? 0));
  return {
    current,
    prior,
    absoluteChange: money(current - prior),
    newAccount: prior === 0 && current !== 0,
    vanishedAccount: prior !== 0 && current === 0,
  };
}
