/* the accounting-cycle proof (PRODUCT_MANDATE P2 «Accounting Core Integrity», FOUNDATION §3.6): the acceptance test
   «عملية → قيد → أستاذ → ميزان → قوائم بالأرقام نفسها» run on a company's own books, step by step:
     1. operations → entries: every entry balances, posts only to accounts of the chart, and names the operation it came from
     2. entries → ledger → trial balance: the general ledger's debits equal its credits
     3. trial balance → statements: every account lands on a statement line, and the financial position balances
     4. the same numbers: profit for the year in the statements = revenue − expenses in the ledger; total assets = the
        ledger's asset balances
     5. sub-ledgers: each control account (receivables, payables, payers) equals the sum of its parties' balances
     6. close: the period is locked through its end
   Deterministic; it reads the books and changes nothing. Amounts in halalas. */

import { buildTrialBalance, type JournalEntry } from '../finance/ledger-engine';
import { fromRows, type AccountType } from './tb-import-engine';
import { buildStatements } from './statements-engine';

export type ProofAccount = { id: string; code: string; name: string; type: string };
export type ProofEntry = JournalEntry & { source?: string; sourceId?: string; party?: string };
export type ProofStep = { id: string; label: string; status: 'ok' | 'warn' | 'fail'; detail: string; figures?: Record<string, number> };

const h = (v: number) => Math.round(v * 100);
const TYPES = new Set(['asset', 'liability', 'equity', 'revenue', 'expense']);
/** control accounts reconciled to their parties, when the company has them */
export const CONTROL_CODES: readonly string[] = ['1200', '1210', '2100', '2150', '2160', '2170'];

export function cycleProof(input: { accounts: ProofAccount[]; entries: ProofEntry[]; end: string; lockDate?: string | null; controls?: readonly string[] }): { ok: boolean; steps: ProofStep[]; profitHalalas: number; statements: ReturnType<typeof buildStatements> } {
  const acc = new Map(input.accounts.map((a) => [a.id, a])), entries = input.entries.filter((e) => String(e.date).slice(0, 10) <= input.end);
  const steps: ProofStep[] = [];
  /* 1. operations → entries */
  let unbalanced = 0, orphan = 0, traced = 0;
  for (const e of entries) {
    const d = e.lines.reduce((s, l) => s + h(l.debit), 0), c = e.lines.reduce((s, l) => s + h(l.credit), 0);
    if (d !== c || !d) unbalanced++;
    if (e.lines.some((l) => !acc.has(l.accountId))) orphan++;
    if (String(e.sourceId || '').trim() || String(e.source || '').trim()) traced++;
  }
  steps.push({ id: 'entries', label: 'العمليات ← القيود', status: unbalanced || orphan ? 'fail' : traced === entries.length ? 'ok' : 'warn',
    detail: unbalanced || orphan ? unbalanced + ' قيد غير متزن و' + orphan + ' قيد على حساب خارج الدليل' : traced + ' من ' + entries.length + ' قيداً تحمل مصدر العملية',
    figures: { entries: entries.length, traced, unbalanced, orphan } });
  /* 2. entries → ledger → trial balance */
  const tb = buildTrialBalance(entries), dr = h(tb.totals.debit), cr = h(tb.totals.credit);
  steps.push({ id: 'ledger', label: 'القيود ← الأستاذ ← ميزان المراجعة', status: dr === cr ? 'ok' : 'fail', detail: dr === cr ? 'الميزان متزن' : 'فرق الميزان ' + (dr - cr) / 100, figures: { debit: dr, credit: cr } });
  /* 3. trial balance → statements, with the chart's own types (no guessing from names) */
  const rows = tb.rows.map((r) => { const a = acc.get(r.accountId); return { code: a ? a.code : r.accountId, name: a ? a.name : r.accountId, debit: r.debit, credit: r.credit }; });
  const overrides: Record<string, AccountType> = {};
  for (const r of tb.rows) { const a = acc.get(r.accountId); if (a && TYPES.has(a.type)) overrides[a.code] = a.type as AccountType; }
  const fs = buildStatements(fromRows(rows, { overrides }));
  const unmapped = fs.unmapped.filter((u) => u.balance !== 0);
  steps.push({ id: 'statements', label: 'ميزان المراجعة ← القوائم المالية', status: !fs.checks.balanced ? 'fail' : unmapped.length ? 'warn' : 'ok',
    detail: !fs.checks.balanced ? 'قائمة المركز المالي غير متوازنة بفرق ' + fs.checks.difference / 100 : unmapped.length ? 'حسابات بلا بند في القوائم: ' + unmapped.map((u) => u.code + ' ' + u.name).join('، ') : 'كل حساب له بند، والمركز المالي متوازن',
    figures: { mappedPct: fs.checks.mappedPct, difference: fs.checks.difference } });
  /* 4. the same numbers in the statements and in the ledger */
  let rev = 0, exp = 0, assets = 0;
  for (const r of tb.rows) { const t = acc.get(r.accountId)?.type, b = h(r.balance); if (t === 'revenue') rev -= b; if (t === 'expense') exp += b; if (t === 'asset') assets += b; }
  const plProfit = fs.pl.find((r) => r.key === 'profit')?.current ?? 0, sfpAssets = fs.sfp.find((r) => r.key === 'assets')?.current ?? 0;
  const same = plProfit === rev - exp && sfpAssets === assets;
  steps.push({ id: 'same', label: 'الأرقام نفسها في القوائم والدفاتر', status: same ? 'ok' : 'fail',
    detail: same ? 'صافي الربح ' + plProfit / 100 + ' ومجموع الموجودات ' + sfpAssets / 100 + ' كما في الدفاتر' : 'القوائم: ربح ' + plProfit / 100 + ' وموجودات ' + sfpAssets / 100 + ' — الدفاتر: ربح ' + (rev - exp) / 100 + ' وموجودات ' + assets / 100,
    figures: { profit: plProfit, ledgerProfit: rev - exp, assets: sfpAssets, ledgerAssets: assets } });
  /* 5. sub-ledgers: control account = the sum of its parties; lines with no party are named */
  const codes = new Set(input.controls ?? CONTROL_CODES), byCode = new Map(input.accounts.map((a) => [a.code, a.id]));
  const ctl: string[] = []; let unassigned = 0, gap = 0;
  for (const code of codes) {
    const id = byCode.get(code); if (!id) continue;
    let total = 0, parties = 0, none = 0;
    for (const e of entries) for (const l of e.lines) if (l.accountId === id) { const v = h(l.debit) - h(l.credit); total += v; if (String(e.party || '').trim()) parties += v; else none += v; }
    if (!total && !none) continue;
    if (none) unassigned++;
    if (parties + none !== total) gap++;
    ctl.push(code + ': ' + total / 100 + (none ? ' (منها ' + none / 100 + ' بلا طرف)' : ''));
  }
  steps.push({ id: 'subledgers', label: 'الذمم والأطراف ← حسابات المراقبة', status: gap ? 'fail' : unassigned ? 'warn' : 'ok',
    detail: ctl.length ? ctl.join(' · ') : 'لا حسابات مراقبة بأرصدة', figures: { controls: ctl.length, unassigned } });
  /* 6. close */
  const closed = !!input.lockDate && input.lockDate >= input.end;
  steps.push({ id: 'close', label: 'الإقفال', status: closed ? 'ok' : 'warn', detail: closed ? 'الفترة مقفلة حتى ' + input.lockDate : input.lockDate ? 'مقفلة حتى ' + input.lockDate + ' فقط' : 'الفترة غير مقفلة' });
  return { ok: steps.every((s) => s.status !== 'fail'), steps, profitHalalas: plProfit, statements: fs };
}
