import { describe, expect, it } from 'vitest';
import { ACCOUNT_TYPES, isAccountType, planAccountOpening } from './account-opening-engine';

const chart = [{ code: '1110' }, { code: '4000' }];

describe('opening an account on the accountant\'s explicit decision', () => {
  it('rejects a specification without a type — never inferred from the code\'s digits', () => {
    expect(planAccountOpening(chart, [{ code: '6395', name: 'اشتراكات' }])).toEqual({ ok: false, issues: [{ code: '6395', reason: 'TYPE_REQUIRED' }] });
    expect(planAccountOpening(chart, [{ code: '2100', name: 'حساب', type: '' }])).toEqual({ ok: false, issues: [{ code: '2100', reason: 'TYPE_REQUIRED' }] });
  });
  it('rejects a type outside the supported list', () => {
    expect(planAccountOpening(chart, [{ code: '6396', name: 'x', type: 'banana' }])).toEqual({ ok: false, issues: [{ code: '6396', reason: 'TYPE_INVALID' }] });
    expect(isAccountType('Expense')).toBe(false);
    expect(ACCOUNT_TYPES.every(isAccountType)).toBe(true);
  });
  it('accepts an explicit, complete specification with the chosen type', () => {
    const r = planAccountOpening(chart, [{ code: '6395', name: 'اشتراكات البرامج', type: 'asset' }]);
    expect(r).toEqual({ ok: true, accounts: [{ id: 'account-6395', code: '6395', name: 'اشتراكات البرامج', type: 'asset', active: true }] });
  });
  it('rejects a missing name, a code already in the chart, a duplicate, and opens none of a mixed list', () => {
    const r = planAccountOpening(chart, [{ code: '6395', name: 'صالح', type: 'expense' }, { code: '1110', name: 'موجود', type: 'asset' }, { code: '6395', name: 'مكرر', type: 'expense' }, { code: '7000', type: 'expense' }, { code: ' ' }]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues.map((i) => i.reason)).toEqual(['CODE_EXISTS', 'CODE_DUPLICATE', 'NAME_REQUIRED', 'CODE_REQUIRED']);
    expect('accounts' in r).toBe(false);
  });
});
