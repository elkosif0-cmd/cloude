import { describe, expect, it } from 'vitest';
import {
  CLOSE_TASK_IDS, EMPTY_LOCK_STATE, buildChecklist, canPost, certify, isLocked, lockLog, lockPeriod, readiness, signOff, unlockPeriod,
  type CloseBooks, type ClosePeriod, type LockState,
} from './close-checklist-engine';

const SEP: ClosePeriod = { id: '2026-09', start: '2026-09-01', end: '2026-09-30', label: 'سبتمبر 2026' };
const OCT: ClosePeriod = { id: '2026-10', start: '2026-10-01', end: '2026-10-31' };
const TODAY = '2026-10-12';
const HASH = 'a'.repeat(64);
const full: CloseBooks = { bankReconciledTo: '2026-09-30', inventoryCountDate: '2026-09-29', vatSettled: true, vatDue: '2026-10-31', hasFixedAssets: true, trialBalanceBalanced: true, pendingPostings: 0 };
const by = (c: ReturnType<typeof buildChecklist>, id: string) => c.tasks.find((t) => t.id === id)!;

describe('buildChecklist — a deterministic task list from system facts and human sign-offs', () => {
  it('lists every task in close order and is identical for identical inputs', () => {
    const a = buildChecklist(SEP, full, { today: TODAY }), b = buildChecklist(SEP, full, { today: TODAY });
    expect(a.tasks.map((t) => t.id)).toEqual([...CLOSE_TASK_IDS]);
    expect(a).toEqual(b);
    expect(a.tasks.at(-1)!.id).toBe('final_lock');
  });

  it('rejects an invalid period or a missing today (timestamps are injected, never read from the clock)', () => {
    expect(() => buildChecklist({ id: 'x', start: '2026-09-30', end: '2026-09-01' }, {}, { today: TODAY })).toThrow('CLOSE_PERIOD_INVALID');
    expect(() => buildChecklist({ id: '', start: '2026-09-01', end: '2026-09-30' }, {}, { today: TODAY })).toThrow('CLOSE_PERIOD_ID_REQUIRED');
    expect(() => buildChecklist(SEP, {}, { today: 'now' })).toThrow('CLOSE_TODAY_REQUIRED');
  });

  it('bank reconciliation is a system fact that also needs a certification with evidence', () => {
    const none = by(buildChecklist(SEP, {}, { today: TODAY }), 'bank_recon');
    expect(none.status).toBe('pending'); expect(none.fact).toBe(false); expect(none.detail_ar).toContain('لم تُعتمد');
    const short = by(buildChecklist(SEP, { bankReconciledTo: '2026-09-15' }, { today: TODAY }), 'bank_recon');
    expect(short.status).toBe('pending'); expect(short.detail_ar).toContain('2026-09-15');
    const fact = by(buildChecklist(SEP, full, { today: TODAY }), 'bank_recon');
    expect(fact.fact).toBe(true); expect(fact.status).toBe('pending'); expect(fact.requiresEvidence).toBe(true); expect(fact.detail_ar).toContain('تنتظر اعتماداً');
    const done = by(buildChecklist(SEP, full, { today: TODAY, certifications: { bank_recon: { evidenceHash: HASH, who: 'سارة', ts: '2026-10-02T10:00:00Z' } } }), 'bank_recon');
    expect(done.status).toBe('done'); expect(done.certification!.who).toBe('سارة'); expect(done.detail_ar).toContain('سارة');
    /* a certification without the fact does not finish the task */
    const certOnly = by(buildChecklist(SEP, {}, { today: TODAY, certifications: { bank_recon: { evidenceHash: HASH, who: 'سارة', ts: '2026-10-02' } } }), 'bank_recon');
    expect(certOnly.status).toBe('pending');
  });

  it('human tasks are pending until signed and never satisfied by the books', () => {
    const c = buildChecklist(SEP, full, { today: TODAY });
    for (const id of ['ar_aging', 'ap_aging', 'accruals', 'depreciation', 'management_review']) {
      const t = by(c, id); expect(t.mode).toBe('human'); expect(t.status).toBe('pending'); expect(t.fact).toBeNull(); expect(t.detail_ar).toBe('يحتاج توقيع المسؤول');
    }
    const s = buildChecklist(SEP, full, { today: TODAY, signOffs: { ar_aging: { who: 'خالد', note: 'لا فروق', ts: '2026-10-03T08:00:00Z' } } });
    expect(by(s, 'ar_aging').status).toBe('done'); expect(by(s, 'ar_aging').detail_ar).toBe('وقّع خالد في 2026-10-03 — لا فروق');
    /* a sign-off without who or time is ignored */
    const bad = buildChecklist(SEP, full, { today: TODAY, signOffs: { ar_aging: { who: '', note: '', ts: 'x' } } });
    expect(by(bad, 'ar_aging').status).toBe('pending');
  });

  it('inventory, depreciation, FX and intercompany apply only when the company has them', () => {
    const c = buildChecklist(SEP, { hasInventory: false, hasFixedAssets: false }, { today: TODAY });
    expect(by(c, 'inventory_count').status).toBe('na'); expect(by(c, 'depreciation').status).toBe('na');
    expect(by(c, 'fx_revaluation').status).toBe('na'); expect(by(c, 'intercompany').status).toBe('na');
    const d = buildChecklist(SEP, { inventoryCountDate: '2026-08-30', hasForeignCurrency: true, hasIntercompany: true }, { today: TODAY });
    expect(by(d, 'inventory_count').status).toBe('pending'); expect(by(d, 'inventory_count').detail_ar).toContain('خارج الفترة');
    expect(by(d, 'fx_revaluation').status).toBe('pending'); expect(by(d, 'intercompany').status).toBe('pending');
    expect(by(buildChecklist(SEP, full, { today: TODAY }), 'inventory_count').status).toBe('done');
  });

  it('the VAT return exists only in a quarter-end period; a passed deadline blocks', () => {
    expect(by(buildChecklist(OCT, {}, { today: TODAY }), 'vat_return').status).toBe('na');
    const open = by(buildChecklist(SEP, { vatSettled: false, vatDue: '2026-10-31' }, { today: TODAY }), 'vat_return');
    expect(open.status).toBe('pending'); expect(open.due).toBe('2026-10-31'); expect(open.overdue).toBe(false);
    const late = by(buildChecklist(SEP, { vatSettled: false, vatDue: '2026-10-10' }, { today: TODAY }), 'vat_return');
    expect(late.status).toBe('blocked'); expect(late.overdue).toBe(true); expect(late.detail_ar).toContain('فات موعد');
    expect(by(buildChecklist(SEP, full, { today: TODAY }), 'vat_return').status).toBe('done');
  });

  it('owners default to roles and can be set per task; due dates are the period end plus a fixed offset', () => {
    const c = buildChecklist(SEP, full, { today: TODAY, owners: { ar_aging: 'reviewer' } });
    expect(by(c, 'bank_recon').owner).toBe('accountant'); expect(by(c, 'management_review').owner).toBe('admin'); expect(by(c, 'ar_aging').owner).toBe('reviewer');
    expect(by(c, 'bank_recon').due).toBe('2026-10-05'); expect(by(c, 'management_review').due).toBe('2026-10-10'); expect(by(c, 'final_lock').due).toBe('2026-10-12');
    expect(by(c, 'bank_recon').overdue).toBe(true); expect(by(c, 'final_lock').overdue).toBe(false);
    expect(by(buildChecklist(SEP, full, { today: '2026-10-01' }), 'bank_recon').overdue).toBe(false);
  });

  it('the final lock is blocked while work is open or the books are not ready, pending when ready, done when locked', () => {
    expect(by(buildChecklist(SEP, full, { today: TODAY }), 'final_lock').status).toBe('blocked');
    const signs = Object.fromEntries(['ar_aging', 'ap_aging', 'accruals', 'depreciation', 'management_review'].map((id) => [id, { who: 'خالد', note: '', ts: '2026-10-05' }]));
    const certs = { bank_recon: { evidenceHash: HASH, who: 'سارة', ts: '2026-10-02' } };
    const ready = buildChecklist(SEP, full, { today: TODAY, signOffs: signs, certifications: certs });
    expect(by(ready, 'final_lock').status).toBe('pending'); expect(by(ready, 'final_lock').detail_ar).toBe('جاهز للإقفال');
    const tb = buildChecklist(SEP, { ...full, trialBalanceBalanced: false, pendingPostings: 2 }, { today: TODAY, signOffs: signs, certifications: certs });
    expect(by(tb, 'final_lock').status).toBe('blocked'); expect(by(tb, 'final_lock').detail_ar).toBe('ميزان المراجعة غير متزن · 2 عملية بانتظار الترحيل');
    const lock = lockPeriod(EMPTY_LOCK_STATE, SEP, 'المدير', '2026-10-12T09:00:00Z').state;
    const locked = buildChecklist(SEP, full, { today: TODAY, signOffs: signs, certifications: certs, lock });
    expect(by(locked, 'final_lock').status).toBe('done'); expect(by(locked, 'final_lock').detail_ar).toContain('المدير');
  });
});

describe('signOff and certify — pure, on one task', () => {
  const c = buildChecklist(SEP, full, { today: TODAY });
  it('signs a human task and refuses a system or na task, a missing name or a bad time', () => {
    const t = signOff(by(c, 'accruals'), ' خالد ', 'قيود المستحقات مرحّلة', '2026-10-04T12:00:00Z', 'accountant');
    expect(t.status).toBe('done'); expect(t.signOff).toEqual({ who: 'خالد', note: 'قيود المستحقات مرحّلة', ts: '2026-10-04T12:00:00Z', role: 'accountant' }); expect(t.overdue).toBe(false);
    expect(by(c, 'accruals').status).toBe('pending');
    expect(() => signOff(by(c, 'bank_recon'), 'خالد', '', '2026-10-04')).toThrow('CLOSE_SIGNOFF_HUMAN_ONLY');
    expect(() => signOff(by(buildChecklist(SEP, { hasFixedAssets: false }, { today: TODAY }), 'depreciation'), 'خالد', '', '2026-10-04')).toThrow('CLOSE_SIGNOFF_NOT_APPLICABLE');
    expect(() => signOff(by(c, 'accruals'), '  ', '', '2026-10-04')).toThrow('CLOSE_SIGNOFF_WHO_REQUIRED');
    expect(() => signOff(by(c, 'accruals'), 'خالد', '', 'today')).toThrow('CLOSE_SIGNOFF_TS_REQUIRED');
  });
  it('certifies a reconciliation with a SHA-256 hex and the certifier; the fact still decides completion', () => {
    const t = certify(by(c, 'bank_recon'), HASH.toUpperCase(), 'سارة', '2026-10-02T10:00:00Z', 'كشف سبتمبر');
    expect(t.status).toBe('done'); expect(t.certification).toEqual({ evidenceHash: HASH, who: 'سارة', ts: '2026-10-02T10:00:00Z', note: 'كشف سبتمبر' });
    const noFact = certify(by(buildChecklist(SEP, {}, { today: TODAY }), 'bank_recon'), HASH, 'سارة', '2026-10-02');
    expect(noFact.status).toBe('pending'); expect(noFact.certification!.evidenceHash).toBe(HASH); expect(noFact.detail_ar).toContain('لا تصل نهاية الفترة');
    expect(() => certify(by(c, 'ar_aging'), HASH, 'سارة', '2026-10-02')).toThrow('CLOSE_CERTIFY_NO_EVIDENCE_TASK');
    expect(() => certify(by(c, 'bank_recon'), 'abc', 'سارة', '2026-10-02')).toThrow('CLOSE_CERTIFY_HASH_INVALID');
    expect(() => certify(by(c, 'bank_recon'), HASH, '', '2026-10-02')).toThrow('CLOSE_CERTIFY_WHO_REQUIRED');
    expect(() => certify(by(c, 'bank_recon'), HASH, 'سارة', '')).toThrow('CLOSE_CERTIFY_TS_REQUIRED');
  });
});

describe('readiness — percent and blockers, the lock excluded from the work', () => {
  it('counts only applicable work, names blockers blocked-first, and is ready only when nothing is open', () => {
    const r0 = readiness(buildChecklist(SEP, { vatSettled: false, vatDue: '2026-10-10', hasFixedAssets: false }, { today: TODAY }));
    expect(r0.of).toBe(7); expect(r0.done).toBe(0); expect(r0.pct).toBe(0); expect(r0.ready).toBe(false); expect(r0.locked).toBe(false);
    expect(r0.blockers[0].id).toBe('vat_return'); expect(r0.blockers[0].status).toBe('blocked'); expect(r0.blockers.length).toBe(7);
    expect(r0.blockers.every((b) => b.owner && b.due)).toBe(true);
    const signs = Object.fromEntries(['ar_aging', 'ap_aging', 'accruals', 'depreciation', 'management_review'].map((id) => [id, { who: 'خالد', note: '', ts: '2026-10-05' }]));
    const half = readiness(buildChecklist(SEP, full, { today: TODAY, signOffs: signs }));
    expect(half.of).toBe(8); expect(half.done).toBe(7); expect(half.pct).toBe(88); expect(half.ready).toBe(false); expect(half.blockers.map((b) => b.id)).toEqual(['bank_recon']);
    expect(half.overdue).toBe(1);
    const all = readiness(buildChecklist(SEP, full, { today: TODAY, signOffs: signs, certifications: { bank_recon: { evidenceHash: HASH, who: 'سارة', ts: '2026-10-02' } } }));
    expect(all).toMatchObject({ pct: 100, done: 8, of: 8, ready: true, locked: false, blockers: [] });
    /* the books not ready: the lock's prerequisite is the only blocker */
    const tb = readiness(buildChecklist(SEP, { ...full, trialBalanceBalanced: false }, { today: TODAY, signOffs: signs, certifications: { bank_recon: { evidenceHash: HASH, who: 'سارة', ts: '2026-10-02' } } }));
    expect(tb.pct).toBe(100); expect(tb.ready).toBe(false); expect(tb.blockers.map((b) => b.id)).toEqual(['final_lock']);
    const lock = lockPeriod(EMPTY_LOCK_STATE, SEP, 'المدير', '2026-10-12').state;
    const done = readiness(buildChecklist(SEP, full, { today: TODAY, signOffs: signs, certifications: { bank_recon: { evidenceHash: HASH, who: 'سارة', ts: '2026-10-02' } }, lock }));
    expect(done.locked).toBe(true); expect(done.ready).toBe(false);
  });
});

describe('period locks — append-only log, auditable unlock, canPost', () => {
  it('locks once, refuses a second lock, and writes who and when', () => {
    const a = lockPeriod(undefined, SEP, 'المدير', '2026-10-12T09:00:00Z');
    expect(a.ok).toBe(true); expect(a.state.locks).toEqual([{ periodId: '2026-09', start: '2026-09-01', end: '2026-09-30', who: 'المدير', ts: '2026-10-12T09:00:00Z' }]);
    expect(a.event).toEqual({ seq: 1, kind: 'lock', periodId: '2026-09', start: '2026-09-01', end: '2026-09-30', who: 'المدير', ts: '2026-10-12T09:00:00Z' });
    expect(isLocked(a.state, SEP)).toBe(true); expect(isLocked(a.state, OCT)).toBe(false);
    const again = lockPeriod(a.state, SEP, 'آخر', '2026-10-13');
    expect(again.ok).toBe(false); expect(again.reason_ar).toContain('مقفلة من قبل'); expect(again.state).toEqual(a.state);
    /* an overlapping period counts as locked */
    const overlap = lockPeriod(a.state, { id: 'q3', start: '2026-07-01', end: '2026-09-30' }, 'آخر', '2026-10-13');
    expect(overlap.ok).toBe(false);
    expect(lockPeriod(a.state, OCT, '', '2026-11-05').reason_ar).toBe('اسم من يُقفل الفترة مطلوب');
    expect(lockPeriod(a.state, OCT, 'المدير', '').reason_ar).toBe('وقت الإقفال مطلوب');
    expect(() => lockPeriod(a.state, { id: 'bad', start: 'x', end: 'y' }, 'المدير', '2026-11-05')).toThrow('CLOSE_PERIOD_INVALID');
  });

  it('unlocks only with a reason, removes the lock and appends to the log; the log is never rewritten', () => {
    const locked = lockPeriod(undefined, SEP, 'المدير', '2026-10-12T09:00:00Z').state;
    expect(unlockPeriod(locked, SEP, 'المدير', '', '2026-10-13').ok).toBe(false);
    expect(unlockPeriod(locked, SEP, 'المدير', 'ok', '2026-10-13').reason_ar).toBe('سبب فتح الإقفال مطلوب');
    expect(unlockPeriod(locked, SEP, '', 'فاتورة متأخرة', '2026-10-13').reason_ar).toBe('اسم من يفتح الإقفال مطلوب');
    expect(unlockPeriod(locked, SEP, 'المدير', 'فاتورة متأخرة', 'x').reason_ar).toBe('وقت فتح الإقفال مطلوب');
    expect(unlockPeriod(locked, OCT, 'المدير', 'فاتورة متأخرة', '2026-10-13').reason_ar).toBe('الفترة غير مقفلة');
    const u = unlockPeriod(locked, SEP, 'المدير', 'فاتورة مورد وصلت متأخرة', '2026-10-13T08:00:00Z');
    expect(u.ok).toBe(true); expect(u.state.locks).toEqual([]); expect(isLocked(u.state, SEP)).toBe(false);
    expect(lockLog(u.state).map((e) => [e.seq, e.kind, e.who, e.reason])).toEqual([[1, 'lock', 'المدير', undefined], [2, 'unlock', 'المدير', 'فاتورة مورد وصلت متأخرة']]);
    const re = lockPeriod(u.state, SEP, 'المدير', '2026-10-14');
    expect(re.ok).toBe(true); expect(lockLog(re.state).length).toBe(3); expect(lockLog(re.state)[2].seq).toBe(3);
    /* inputs were not mutated */
    expect(locked.locks.length).toBe(1); expect(locked.log.length).toBe(1);
  });

  it('canPost: no state or no locks → ok; a date inside a locked period → an Arabic refusal naming the lock', () => {
    expect(canPost(undefined, '2026-09-15')).toEqual({ ok: true });
    expect(canPost(null, 'garbage')).toEqual({ ok: true });
    expect(canPost(EMPTY_LOCK_STATE, '2026-09-15')).toEqual({ ok: true });
    const s: LockState = lockPeriod(undefined, SEP, 'المدير', '2026-10-12T09:00:00Z').state;
    expect(canPost(s, '2026-08-31').ok).toBe(true); expect(canPost(s, '2026-10-01').ok).toBe(true);
    const r = canPost(s, '2026-09-15T10:00:00Z');
    expect(r.ok).toBe(false); expect(r.lock!.periodId).toBe('2026-09');
    expect(r.reason_ar).toBe('الفترة 2026-09-01 → 2026-09-30 مقفلة (أقفلها المدير في 2026-10-12) — اختر تاريخاً خارجها أو افتح الإقفال بسبب مسجَّل');
    expect(canPost(s, '').ok).toBe(false); expect(canPost(s, '').reason_ar).toBe('تاريخ القيد غير صالح');
    const u = unlockPeriod(s, SEP, 'المدير', 'تصحيح قيد', '2026-10-13').state;
    expect(canPost(u, '2026-09-15')).toEqual({ ok: true });
  });

  it('tolerates a malformed stored state', () => {
    const s = { locks: 'x', log: null } as unknown as LockState;
    expect(canPost(s, '2026-09-15')).toEqual({ ok: true });
    expect(lockPeriod(s, SEP, 'المدير', '2026-10-12').ok).toBe(true);
    expect(lockLog(s)).toEqual([]);
  });
});
