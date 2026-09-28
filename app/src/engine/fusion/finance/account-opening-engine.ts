/* Opening accounts from outside the chart-of-accounts screen (the entry simulator's posting, an import): the
   accountant's explicit decision, checked before anything is written. Every field comes from the accountant — the
   type in particular is never inferred from the account code's digits (a 6 is not always an expense, a 2 not always
   a liability). A specification is accepted only with a code new to the chart and to the list, a name, and a type
   among the chart's supported types; otherwise the reasons are returned and the caller writes nothing. */
import { createAccount, type Account, type AccountType } from './accounts-engine';

export const ACCOUNT_TYPES: readonly AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense', 'other'];
export type OpenSpec = { code: string; name?: string; type?: string; parentId?: string };
export type OpenIssue = { code: string; reason: 'CODE_REQUIRED' | 'NAME_REQUIRED' | 'TYPE_REQUIRED' | 'TYPE_INVALID' | 'CODE_EXISTS' | 'CODE_DUPLICATE' };
export const isAccountType = (t: unknown): t is AccountType => typeof t === 'string' && (ACCOUNT_TYPES as readonly string[]).includes(t);

/** The accounts to open, or every reason the specifications cannot be accepted (nothing is created in that case). */
export function planAccountOpening(chart: Pick<Account, 'code'>[], specs: OpenSpec[]): { ok: true; accounts: Account[] } | { ok: false; issues: OpenIssue[] } {
  const issues: OpenIssue[] = [], seen = new Set<string>(), accounts: Account[] = [];
  for (const s of specs) {
    const code = String(s?.code ?? '').trim(), name = String(s?.name ?? '').trim(), type = s?.type == null ? '' : String(s.type).trim();
    if (!code) { issues.push({ code: '', reason: 'CODE_REQUIRED' }); continue; }
    if (chart.some((a) => String(a.code) === code)) issues.push({ code, reason: 'CODE_EXISTS' });
    if (seen.has(code)) issues.push({ code, reason: 'CODE_DUPLICATE' });
    seen.add(code);
    if (!name) issues.push({ code, reason: 'NAME_REQUIRED' });
    if (!type) issues.push({ code, reason: 'TYPE_REQUIRED' });
    else if (!isAccountType(type)) issues.push({ code, reason: 'TYPE_INVALID' });
    if (name && isAccountType(type)) accounts.push(createAccount({ code, name, type, parentId: s.parentId }));
  }
  return issues.length ? { ok: false, issues } : { ok: true, accounts };
}
