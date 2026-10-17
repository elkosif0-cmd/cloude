import { describe, expect, it } from 'vitest';
import { createAccount, inspectChartOfAccounts, type Account } from './accounts-engine';

describe('chart of accounts', () => {
  const baseAccounts: Account[] = [
    { id: 'account-1100', code: '1100', name: 'النقدية', type: 'asset', active: true },
    { id: 'account-4000', code: '4000', name: 'المبيعات', type: 'revenue', active: true },
  ];

  it('creates a normalized account with a deterministic id', () => {
    expect(createAccount({ code: ' 2100 ', name: ' الموردون ', type: 'liability' })).toEqual({
      id: 'account-2100',
      code: '2100',
      name: 'الموردون',
      type: 'liability',
      active: true,
    });
  });

  it('detects duplicate codes and missing parent references', () => {
    const issues = inspectChartOfAccounts([
      ...baseAccounts,
      { id: 'account-1100-bank', code: '1100', name: 'البنك', type: 'asset', active: true },
      { id: 'account-1200', code: '1200', name: 'العملاء', type: 'asset', parentId: 'account-1000', active: true },
    ]);

    expect(issues).toContainEqual({ code: 'DUPLICATE_ACCOUNT_CODE', accountId: 'account-1100-bank' });
    expect(issues).toContainEqual({ code: 'MISSING_PARENT_ACCOUNT', accountId: 'account-1200' });
  });

  it('rejects parent cycles', () => {
    const issues = inspectChartOfAccounts([
      { id: 'account-1000', code: '1000', name: 'الأصول', type: 'asset', parentId: 'account-1100', active: true },
      { id: 'account-1100', code: '1100', name: 'النقدية', type: 'asset', parentId: 'account-1000', active: true },
    ]);

    expect(issues.map((issue) => issue.code)).toContain('ACCOUNT_PARENT_CYCLE');
  });
});
