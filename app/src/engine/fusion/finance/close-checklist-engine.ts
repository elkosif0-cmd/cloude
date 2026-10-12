/**
 * Close management (EXTERNAL_BACKLOG §2, registry gaps «period-close-locks» / «continuous-close»).
 *
 * Two things, both pure and deterministic (every timestamp is injected):
 *  1. the close checklist of a period — a fixed task list whose status comes from system facts where the books can
 *     tell (bank reconciled to the period end, inventory counted, VAT settled, …) and from a human sign-off otherwise
 *     (AR/AP aging reviewed, accruals, depreciation, management review). The two never mix: a system task cannot be
 *     signed off by hand, a human task cannot be satisfied by the books. A reconciliation is certified with an evidence
 *     hash (SHA-256 of the file) and the certifier, never by a click alone;
 *  2. period-close locks — an append-only log of who locked or unlocked which period, when and why; `canPost` is the
 *     question the ledger asks before accepting an entry date.
 */

export type ClosePeriod = { id: string; start: string; end: string; label?: string };

export type CloseTaskId =
  | 'bank_recon'
  | 'ar_aging'
  | 'ap_aging'
  | 'inventory_count'
  | 'vat_return'
  | 'accruals'
  | 'depreciation'
  | 'fx_revaluation'
  | 'intercompany'
  | 'management_review'
  | 'final_lock';

/** done = satisfied · pending = still needs the books or a person · blocked = cannot be done yet (a prerequisite or a
 *  passed deadline) · na = does not apply to this company or period */
export type CloseTaskStatus = 'done' | 'pending' | 'blocked' | 'na';
export type CloseTaskMode = 'system' | 'human';

export type SignOff = { who: string; role?: string; note: string; ts: string };
export type Certification = { evidenceHash: string; who: string; ts: string; note?: string };

export type CloseTask = {
  id: CloseTaskId;
  title_ar: string;
  why_ar: string;
  mode: CloseTaskMode;
  /** a role id (ui/core/perm.js roles: admin, accountant, …) */
  owner: string;
  due: string;
  status: CloseTaskStatus;
  detail_ar: string;
  /** the books' own verdict for a system task (null for a human task) */
  fact: boolean | null;
  requiresEvidence: boolean;
  signOff: SignOff | null;
  certification: Certification | null;
  overdue: boolean;
};

export type CloseChecklist = { period: ClosePeriod; today: string; tasks: CloseTask[] };

/** what the books can tell about the period (every field optional: unknown = not satisfied, never assumed) */
export type CloseBooks = {
  /** the end date of the last approved bank reconciliation */
  bankReconciledTo?: string | null;
  /** the date of the last posted inventory count */
  inventoryCountDate?: string | null;
  hasInventory?: boolean;
  /** the VAT return of the quarter the period ends: settled, and its filing deadline */
  vatSettled?: boolean | null;
  vatDue?: string | null;
  hasFixedAssets?: boolean;
  hasForeignCurrency?: boolean;
  hasIntercompany?: boolean;
  trialBalanceBalanced?: boolean;
  pendingPostings?: number;
};

export type CloseOptions = {
  today: string;
  owners?: Partial<Record<CloseTaskId, string>>;
  signOffs?: Partial<Record<CloseTaskId, SignOff>>;
  certifications?: Partial<Record<CloseTaskId, Certification>>;
  lock?: LockState | null;
};

/* ---------- locks ---------- */
export type LockEvent = { seq: number; kind: 'lock' | 'unlock'; periodId: string; start: string; end: string; who: string; ts: string; reason?: string };
export type PeriodLock = { periodId: string; start: string; end: string; who: string; ts: string };
export type LockState = { locks: PeriodLock[]; log: LockEvent[] };

export const EMPTY_LOCK_STATE: LockState = Object.freeze({ locks: [], log: [] }) as LockState;

const DAY = 864e5;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const day = (s: unknown) => String(s ?? '').slice(0, 10);
const isIso = (s: unknown): s is string => ISO.test(day(s));
const addDays = (iso: string, n: number) => new Date(Date.parse(iso) + n * DAY).toISOString().slice(0, 10);
const clean = (v: unknown, max = 200) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const quarterEnd = (end: string) => +end.slice(5, 7) % 3 === 0;

type Def = { title_ar: string; why_ar: string; mode: CloseTaskMode; owner: string; dueDays: number; requiresEvidence: boolean };
/** the task list in close order; due = period end + dueDays (the VAT return keeps its statutory deadline) */
const DEFS: Record<CloseTaskId, Def> = {
  bank_recon: { title_ar: 'اعتماد مطابقة البنك', why_ar: 'كشف البنك مطابق لحساب النقدية حتى نهاية الفترة، ومعتمد بدليل', mode: 'system', owner: 'accountant', dueDays: 5, requiresEvidence: true },
  ar_aging: { title_ar: 'مراجعة أعمار الذمم المدينة', why_ar: 'كل رصيد عميل مُراجَع وتصنيفه العمري صحيح', mode: 'human', owner: 'accountant', dueDays: 5, requiresEvidence: false },
  ap_aging: { title_ar: 'مراجعة أعمار الذمم الدائنة', why_ar: 'كل رصيد مورد مُراجَع والفواتير غير المسجلة مضافة', mode: 'human', owner: 'accountant', dueDays: 5, requiresEvidence: false },
  inventory_count: { title_ar: 'جرد المخزون', why_ar: 'الكميات على الرفوف مقابل حساب المخزون في الفترة', mode: 'system', owner: 'accountant', dueDays: 3, requiresEvidence: false },
  vat_return: { title_ar: 'إعداد إقرار الضريبة', why_ar: 'الربع ينتهي بهذه الفترة: الإقرار معدّ وقيد الإقفال مرحّل', mode: 'system', owner: 'accountant', dueDays: 28, requiresEvidence: false },
  accruals: { title_ar: 'المستحقات والمصروفات المقدمة', why_ar: 'مصروفات الفترة مسجلة فيها وإن لم تصل فواتيرها', mode: 'human', owner: 'accountant', dueDays: 5, requiresEvidence: false },
  depreciation: { title_ar: 'الإهلاك', why_ar: 'قيد إهلاك الفترة مرحّل لكل أصل ثابت', mode: 'human', owner: 'accountant', dueDays: 5, requiresEvidence: false },
  fx_revaluation: { title_ar: 'إعادة تقييم العملات', why_ar: 'الأرصدة بعملة أجنبية مقيّمة بسعر نهاية الفترة', mode: 'human', owner: 'accountant', dueDays: 5, requiresEvidence: false },
  intercompany: { title_ar: 'مطابقة الشركات الشقيقة', why_ar: 'أرصدة الأطراف ذات العلاقة متطابقة من الجانبين', mode: 'human', owner: 'accountant', dueDays: 7, requiresEvidence: false },
  management_review: { title_ar: 'مراجعة الإدارة', why_ar: 'الإدارة راجعت قوائم الفترة وتغيراتها واعتمدتها', mode: 'human', owner: 'admin', dueDays: 10, requiresEvidence: false },
  final_lock: { title_ar: 'الإقفال النهائي', why_ar: 'بعد الإقفال لا يُقبل قيد بتاريخ داخل الفترة', mode: 'system', owner: 'admin', dueDays: 12, requiresEvidence: false },
};
export const CLOSE_TASK_IDS = Object.freeze(Object.keys(DEFS) as CloseTaskId[]);

function assertPeriod(period: ClosePeriod) {
  if (!period || !isIso(period.start) || !isIso(period.end) || period.start > period.end) throw new Error('CLOSE_PERIOD_INVALID');
  if (!clean(period.id)) throw new Error('CLOSE_PERIOD_ID_REQUIRED');
}

/** the deterministic checklist of a period: the same inputs always give the same tasks, statuses and details */
export function buildChecklist(period: ClosePeriod, books: CloseBooks = {}, opts: CloseOptions): CloseChecklist {
  assertPeriod(period);
  if (!isIso(opts?.today)) throw new Error('CLOSE_TODAY_REQUIRED');
  const today = day(opts.today);
  const owners = opts.owners || {}, signs = opts.signOffs || {}, certs = opts.certifications || {};
  const lockState = opts.lock || EMPTY_LOCK_STATE;
  const tasks: CloseTask[] = [];

  const push = (id: CloseTaskId, fact: boolean | null, status: CloseTaskStatus, detail_ar: string, dueOverride?: string | null) => {
    const def = DEFS[id];
    const due = dueOverride && isIso(dueOverride) ? day(dueOverride) : addDays(period.end, def.dueDays);
    const signOff = def.mode === 'human' && signs[id] ? signs[id]! : null;
    const certification = def.requiresEvidence && certs[id] ? certs[id]! : null;
    tasks.push({
      id, title_ar: def.title_ar, why_ar: def.why_ar, mode: def.mode, owner: clean(owners[id]) || def.owner, due, status, detail_ar, fact,
      requiresEvidence: def.requiresEvidence, signOff, certification, overdue: status !== 'done' && status !== 'na' && today > due,
    });
  };
  const human = (id: CloseTaskId, applies: boolean, naDetail: string) => {
    if (!applies) return push(id, null, 'na', naDetail);
    const s = signs[id];
    if (s && clean(s.who) && isIso(s.ts)) return push(id, null, 'done', 'وقّع ' + clean(s.who) + ' في ' + day(s.ts) + (clean(s.note) ? ' — ' + clean(s.note) : ''));
    push(id, null, 'pending', 'يحتاج توقيع المسؤول');
  };

  /* bank reconciliation: the books say it reaches the period end, and a person certifies it with the statement's hash */
  const recTo = isIso(books.bankReconciledTo) ? day(books.bankReconciledTo) : '';
  const recOk = !!recTo && recTo >= period.end, cert = certs.bank_recon;
  const certified = !!(cert && clean(cert.evidenceHash) && clean(cert.who) && isIso(cert.ts));
  push('bank_recon', recOk, recOk && certified ? 'done' : 'pending',
    !recOk ? (recTo ? 'آخر مطابقة معتمدة حتى ' + recTo + ' — قبل نهاية الفترة' : 'لم تُعتمد مطابقة بنكية بعد')
      : certified ? 'مطابقة حتى ' + recTo + ' · اعتمدها ' + clean(cert!.who) + ' بدليل ' + clean(cert!.evidenceHash).slice(0, 12) + '…'
      : 'المطابقة تصل نهاية الفترة وتنتظر اعتماداً بدليل (كشف البنك)');

  human('ar_aging', true, '');
  human('ap_aging', true, '');

  /* inventory: a count posted inside the period */
  if (books.hasInventory === false) push('inventory_count', null, 'na', 'لا مخزون لدى الشركة');
  else {
    const c = isIso(books.inventoryCountDate) ? day(books.inventoryCountDate) : '';
    const ok = !!c && c >= period.start && c <= period.end;
    push('inventory_count', ok, ok ? 'done' : 'pending', ok ? 'جُرد في ' + c : c ? 'آخر جرد في ' + c + ' — خارج الفترة' : 'لم يُرحّل جرد لهذه الفترة');
  }

  /* VAT: only when the period ends a quarter; a passed deadline without settlement blocks the close */
  if (!quarterEnd(period.end)) push('vat_return', null, 'na', 'الإقرار ربع سنوي — لا إقرار في هذه الفترة');
  else {
    const due = isIso(books.vatDue) ? day(books.vatDue) : null, settled = books.vatSettled === true;
    push('vat_return', settled, settled ? 'done' : due && today > due ? 'blocked' : 'pending',
      settled ? 'أُقفلت ضريبة الربع' : due ? (today > due ? 'فات موعد الإقرار ' + due + ' ولم يُقفل' : 'الإقرار غير معدّ · آخر موعد ' + due) : 'الإقرار غير معدّ', due);
  }

  human('accruals', true, '');
  human('depreciation', books.hasFixedAssets !== false, 'لا أصول ثابتة في الدليل');
  human('fx_revaluation', books.hasForeignCurrency === true, 'لا أرصدة بعملة أجنبية');
  human('intercompany', books.hasIntercompany === true, 'لا أطراف ذات علاقة في الدفاتر');
  human('management_review', true, '');

  /* the lock is the outcome: done when the period is locked, blocked while anything before it is open */
  const locked = isLocked(lockState, period);
  const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'na');
  const tbBad = books.trialBalanceBalanced === false, pend = Number(books.pendingPostings) || 0;
  const pre = [tbBad ? 'ميزان المراجعة غير متزن' : '', pend ? pend + ' عملية بانتظار الترحيل' : ''].filter(Boolean);
  push('final_lock', locked, locked ? 'done' : open.length || pre.length ? 'blocked' : 'pending',
    locked ? 'مقفلة — ' + describeLock(lockState, period) : pre.length ? pre.join(' · ') : open.length ? open.length + ' مهمة مفتوحة قبل الإقفال' : 'جاهز للإقفال');

  return { period: { ...period }, today, tasks };
}

/** a human sign-off on a task: who, a note and the injected time; a system task is never signed by hand */
export function signOff(task: CloseTask, who: string, note: string, ts: string, role?: string): CloseTask {
  if (!task || task.mode !== 'human') throw new Error('CLOSE_SIGNOFF_HUMAN_ONLY');
  if (task.status === 'na') throw new Error('CLOSE_SIGNOFF_NOT_APPLICABLE');
  if (!clean(who)) throw new Error('CLOSE_SIGNOFF_WHO_REQUIRED');
  if (!isIso(ts)) throw new Error('CLOSE_SIGNOFF_TS_REQUIRED');
  const s: SignOff = { who: clean(who, 80), note: clean(note, 500), ts: String(ts), ...(clean(role) ? { role: clean(role, 40) } : {}) };
  return { ...task, signOff: s, status: 'done', detail_ar: 'وقّع ' + s.who + ' في ' + day(s.ts) + (s.note ? ' — ' + s.note : ''), overdue: false };
}

/** a reconciliation certified with its evidence (a SHA-256 hex of the statement or working paper) and the certifier */
export function certify(reconciliation: CloseTask, evidenceHash: string, who: string, ts: string, note?: string): CloseTask {
  if (!reconciliation || !reconciliation.requiresEvidence) throw new Error('CLOSE_CERTIFY_NO_EVIDENCE_TASK');
  const h = clean(evidenceHash, 128).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(h)) throw new Error('CLOSE_CERTIFY_HASH_INVALID');
  if (!clean(who)) throw new Error('CLOSE_CERTIFY_WHO_REQUIRED');
  if (!isIso(ts)) throw new Error('CLOSE_CERTIFY_TS_REQUIRED');
  const c: Certification = { evidenceHash: h, who: clean(who, 80), ts: String(ts), ...(clean(note) ? { note: clean(note, 500) } : {}) };
  const done = reconciliation.fact === true;
  return { ...reconciliation, certification: c, status: done ? 'done' : reconciliation.status, overdue: done ? false : reconciliation.overdue,
    detail_ar: done ? 'اعتمدها ' + c.who + ' بدليل ' + h.slice(0, 12) + '…' : 'اعتُمدت بدليل لكن المطابقة في الدفاتر لا تصل نهاية الفترة' };
}

export type Readiness = { pct: number; done: number; of: number; ready: boolean; locked: boolean; overdue: number;
  blockers: { id: CloseTaskId; title_ar: string; detail_ar: string; status: CloseTaskStatus; owner: string; due: string }[] };

/** percent and blockers: the lock is the outcome and is not counted among the work; na tasks are not counted */
export function readiness(checklist: CloseChecklist): Readiness {
  const work = checklist.tasks.filter((t) => t.id !== 'final_lock' && t.status !== 'na');
  const done = work.filter((t) => t.status === 'done');
  const open = work.filter((t) => t.status !== 'done');
  const lock = checklist.tasks.find((t) => t.id === 'final_lock');
  const locked = !!lock && lock.status === 'done';
  const lockPre = lock && lock.status === 'blocked' && !open.length ? [lock] : [];
  const blockers = [...open.filter((t) => t.status === 'blocked'), ...open.filter((t) => t.status === 'pending'), ...lockPre]
    .map((t) => ({ id: t.id, title_ar: t.title_ar, detail_ar: t.detail_ar, status: t.status, owner: t.owner, due: t.due }));
  return { pct: work.length ? Math.round((done.length / work.length) * 100) : 0, done: done.length, of: work.length,
    ready: !locked && !open.length && !lockPre.length, locked, overdue: work.filter((t) => t.overdue).length, blockers };
}

/* ---------- locks: append-only ---------- */
const norm = (s: LockState | null | undefined): LockState => ({ locks: Array.isArray(s?.locks) ? s!.locks : [], log: Array.isArray(s?.log) ? s!.log : [] });
const overlaps = (l: { start: string; end: string }, p: { start: string; end: string }) => l.start <= p.end && p.start <= l.end;

export function isLocked(state: LockState | null | undefined, period: ClosePeriod): boolean {
  const s = norm(state);
  return s.locks.some((l) => l.periodId === period.id || overlaps(l, period));
}
function describeLock(state: LockState, period: ClosePeriod) {
  const l = norm(state).locks.find((x) => x.periodId === period.id || overlaps(x, period));
  return l ? 'أقفلها ' + l.who + ' في ' + day(l.ts) : '';
}

export type LockResult = { ok: boolean; state: LockState; reason_ar?: string; event?: LockEvent };

export function lockPeriod(state: LockState | null | undefined, period: ClosePeriod, who: string, ts: string): LockResult {
  assertPeriod(period);
  const s = norm(state);
  if (!clean(who)) return { ok: false, state: s, reason_ar: 'اسم من يُقفل الفترة مطلوب' };
  if (!isIso(ts)) return { ok: false, state: s, reason_ar: 'وقت الإقفال مطلوب' };
  if (isLocked(s, period)) return { ok: false, state: s, reason_ar: 'الفترة مقفلة من قبل — ' + describeLock(s, period) };
  const event: LockEvent = { seq: s.log.length + 1, kind: 'lock', periodId: period.id, start: period.start, end: period.end, who: clean(who, 80), ts: String(ts) };
  const lock: PeriodLock = { periodId: period.id, start: period.start, end: period.end, who: event.who, ts: event.ts };
  return { ok: true, event, state: { locks: [...s.locks, lock], log: [...s.log, event] } };
}

/** an unlock needs a reason: it is written to the log with who and when, and the lock itself is removed */
export function unlockPeriod(state: LockState | null | undefined, period: ClosePeriod, who: string, reason: string, ts: string): LockResult {
  assertPeriod(period);
  const s = norm(state);
  if (!clean(who)) return { ok: false, state: s, reason_ar: 'اسم من يفتح الإقفال مطلوب' };
  if (clean(reason).length < 3) return { ok: false, state: s, reason_ar: 'سبب فتح الإقفال مطلوب' };
  if (!isIso(ts)) return { ok: false, state: s, reason_ar: 'وقت فتح الإقفال مطلوب' };
  const hit = s.locks.filter((l) => l.periodId === period.id || overlaps(l, period));
  if (!hit.length) return { ok: false, state: s, reason_ar: 'الفترة غير مقفلة' };
  const event: LockEvent = { seq: s.log.length + 1, kind: 'unlock', periodId: period.id, start: period.start, end: period.end, who: clean(who, 80), reason: clean(reason, 500), ts: String(ts) };
  return { ok: true, event, state: { locks: s.locks.filter((l) => !hit.includes(l)), log: [...s.log, event] } };
}

export type CanPost = { ok: boolean; reason_ar?: string; lock?: PeriodLock };

/** the ledger's question: may an entry carry this date? No state (or no locks) → yes, unchanged behaviour */
export function canPost(state: LockState | null | undefined, entryDate: string): CanPost {
  const s = norm(state), d = day(entryDate);
  if (!s.locks.length) return { ok: true };
  if (!isIso(d)) return { ok: false, reason_ar: 'تاريخ القيد غير صالح' };
  const lock = s.locks.find((l) => d >= l.start && d <= l.end);
  if (!lock) return { ok: true };
  return { ok: false, lock, reason_ar: 'الفترة ' + lock.start + ' → ' + lock.end + ' مقفلة (أقفلها ' + lock.who + ' في ' + day(lock.ts) + ') — اختر تاريخاً خارجها أو افتح الإقفال بسبب مسجَّل' };
}

/** the log in order, newest last, exactly as written */
export function lockLog(state: LockState | null | undefined): LockEvent[] { return [...norm(state).log].sort((a, b) => a.seq - b.seq); }
