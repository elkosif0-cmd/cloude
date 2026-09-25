import { describe, expect, it } from 'vitest';
import { createAccount, inspectChartOfAccounts, type Account } from './accounts-engine';

describe('chart of accounts', () => {
  const baseAccounts: Account[] = [
    { id: '1100-cash', code: '1100', name: 'النقدية', type: 'asset', active: true },
    { id: '4000-sales', code: '4000', name: 'المبيعات', type: 'revenue', active: true },
  ];

  it('creates a normalized account with a deterministic id', () => {
    expect(createAccount({ code: ' 2100 ', name: ' الموردون ', type: 'liability' })).toEqual({
      id: '2100-suppliers',
      code: '2100',
      name: 'الموردون',
      type: 'liability',
      active: true,
    });
  });

  it('detects duplicate codes and missing parent references', () => {
    const issues = inspectChartOfAccounts([
      ...baseAccounts,
      { id: '1100-bank', code: '1100', name: 'البنك', type: 'asset', active: true },
      { id: '1200-ar', code: '1200', name: 'العملاء', type: 'asset', parentId: '1000-assets', active: true },
    ]);

    expect(issues).toContainEqual({ code: 'DUPLICATE_ACCOUNT_CODE', accountId: '1100-bank' });
    expect(issues).toContainEqual({ code: 'MISSING_PARENT_ACCOUNT', accountId: '1200-ar' });
  });

  it('rejects parent cycles', () => {
    const issues = inspectChartOfAccounts([
      { id: '1000-assets', code: '1000', name: 'الأصول', type: 'asset', parentId: '1100-cash', active: true },
      { id: '1100-cash', code: '1100', name: 'النقدية', type: 'asset', parentId: '1000-assets', active: true },
    ]);

    expect(issues.map((issue) => issue.code)).toContain('ACCOUNT_PARENT_CYCLE');
  });
});
