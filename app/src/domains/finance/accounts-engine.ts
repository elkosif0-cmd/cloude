export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'other';

export type Account = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  active: boolean;
};

export type AccountInput = {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
};

export type ChartIssue = {
  code: 'DUPLICATE_ACCOUNT_CODE' | 'MISSING_PARENT_ACCOUNT' | 'ACCOUNT_PARENT_CYCLE';
  accountId: string;
};

function normalizeCode(value: string) {
  return value.trim().replace(/\s+/g, '-');
}

export function createAccount(input: AccountInput): Account {
  const code = normalizeCode(input.code);
  const name = input.name.trim();
  const parentId = input.parentId?.trim() || undefined;

  return {
    id: `account-${code}`,
    code,
    name,
    type: input.type,
    ...(parentId ? { parentId } : {}),
    active: true,
  };
}

export function inspectChartOfAccounts(accounts: Account[]): ChartIssue[] {
  const issues: ChartIssue[] = [];
  const ids = new Set(accounts.map((account) => account.id));
  const codeOwner = new Map<string, string>();

  for (const account of accounts) {
    const normalized = normalizeCode(account.code);
    if (codeOwner.has(normalized)) {
      issues.push({ code: 'DUPLICATE_ACCOUNT_CODE', accountId: account.id });
    } else {
      codeOwner.set(normalized, account.id);
    }

    if (account.parentId && !ids.has(account.parentId)) {
      issues.push({ code: 'MISSING_PARENT_ACCOUNT', accountId: account.id });
    }
  }

  const byId = new Map(accounts.map((account) => [account.id, account]));
  const globallyVisited = new Set<string>();
  const reportedCycles = new Set<string>();

  for (const account of accounts) {
    if (globallyVisited.has(account.id)) continue;

    const path: string[] = [];
    const positions = new Map<string, number>();
    let current: Account | undefined = account;

    while (current) {
      if (positions.has(current.id)) {
        const start = positions.get(current.id) ?? 0;
        const cycleIds = path.slice(start);
        const cycleKey = [...cycleIds].sort().join('|');
        if (!reportedCycles.has(cycleKey)) {
          reportedCycles.add(cycleKey);
          for (const accountId of cycleIds) {
            issues.push({ code: 'ACCOUNT_PARENT_CYCLE', accountId });
          }
        }
        break;
      }

      if (globallyVisited.has(current.id)) break;
      positions.set(current.id, path.length);
      path.push(current.id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }

    for (const accountId of path) globallyVisited.add(accountId);
  }

  return issues;
}
