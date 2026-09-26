/* The confidence model of the audit council (research «مجلس المراجعة الذكي», chapters 6, 8.5 and 9):
   the auditor's eternal question «do I have enough?» becomes a documented number per statement line and
   per management assertion, computed by code — never by the language model:
     C(b,a) = wE·E + wT·T + wA·A
       E  evidence coverage: Σ reliability × amount covered ÷ balance (capped at 1)
       T  test results: 1 − misstatements ÷ performance materiality (floored at 0)
       A  council agreement: how close the members' confidences are (1 = unanimous)
   Thresholds rise with materiality and risk (0.90 / 0.80 / 0.70; immaterial lines need analytics only).
   The rounds stop on sufficiency, on no improvement, or at the round limit — the last two escalate to
   the human reviewer. Requests are ranked by value: expected confidence gain × materiality weight ÷
   client effort. The engagement is a state machine with four mandatory human approvals; every
   transition is recorded with its time, actor and reason. Weights are illustrative defaults the office
   can change; the reviewer may raise or lower a line's threshold with a documented reason. */
import type { Minor } from '../reports/money-engine';

/* ---------- 1. management assertions (ISA 315) ---------- */
export type AssertionKey = 'existence' | 'completeness' | 'accuracy' | 'cutoff' | 'valuation' | 'presentation';
export const ASSERTIONS: { key: AssertionKey; ar: string; question: string; evidence: string }[] = [
  { key: 'existence', ar: 'الوجود أو الحدوث', question: 'هل الأصل موجود؟ هل المعاملة حدثت فعلاً؟', evidence: 'مصادقة العميل، إشعار التسليم' },
  { key: 'completeness', ar: 'الاكتمال', question: 'هل سُجلت كل المعاملات والالتزامات؟', evidence: 'فحص المدفوعات اللاحقة، تسلسل المستندات' },
  { key: 'accuracy', ar: 'الدقة', question: 'هل المبالغ محسوبة ومسجلة بشكل صحيح؟', evidence: 'إعادة الاحتساب، مطابقة الفاتورة' },
  { key: 'cutoff', ar: 'القطع', question: 'هل سُجلت المعاملات في الفترة الصحيحة؟', evidence: 'فحص المعاملات حول تاريخ الإقفال' },
  { key: 'valuation', ar: 'التقييم', question: 'هل الأرصدة مقيمة بمبالغ مناسبة؟', evidence: 'تقدير المخصصات، اختبار انخفاض القيمة' },
  { key: 'presentation', ar: 'العرض والإفصاح', question: 'هل البنود مصنفة ومفصح عنها كما تتطلب المعايير؟', evidence: 'مراجعة الإيضاحات مقابل المتطلبات' },
];
const ASSERT_WORDS: [RegExp, AssertionKey][] = [
  [/وجود|حدوث|حقوق|ملكيه|ملكية|التزامات|existence|occurrence|rights/i, 'existence'],
  [/اكتمال|completeness/i, 'completeness'], [/دقه|دقة|accuracy/i, 'accuracy'], [/قطع|cut/i, 'cutoff'],
  [/تقييم|قياس|valuation/i, 'valuation'], [/عرض|افصاح|إفصاح|تصنيف|presentation|disclosure/i, 'presentation'],
];
/** The research assertion for an Arabic (or English) assertion name used by the statement lines. */
export function assertionKey(name: string): AssertionKey | null {
  if ((ASSERTIONS as { key: string }[]).some((a) => a.key === name)) return name as AssertionKey;
  const hit = ASSERT_WORDS.find(([re]) => re.test(String(name || '')));
  return hit ? hit[1] : null;
}
export const assertionAr = (k: AssertionKey) => ASSERTIONS.find((a) => a.key === k)!.ar;

/* ---------- 2. evidence reliability (ISA 500): illustrative weights ---------- */
export type EvidenceKind = 'confirmation' | 'external' | 'internal-strong' | 'internal-weak' | 'representation';
export const RELIABILITY: Record<EvidenceKind, { w: number; ar: string }> = {
  confirmation: { w: 1, ar: 'مصادقة مباشرة من طرف ثالث مستقل' },
  external: { w: 0.8, ar: 'مستند خارجي في حوزة العميل (فاتورة مورد، كشف بنك)' },
  'internal-strong': { w: 0.6, ar: 'مستند داخلي في بيئة رقابة داخلية جيدة' },
  'internal-weak': { w: 0.4, ar: 'مستند داخلي في بيئة رقابة ضعيفة' },
  representation: { w: 0.25, ar: 'إفادة شفهية أو كتابية من الإدارة' },
};
export type EvidenceItem = { id: string; lineKey: string; assertions: AssertionKey[]; kind: EvidenceKind; amount: Minor; accepted: boolean };

const clamp01 = (x: number) => (Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0);
const r2 = (x: number) => Math.round(x * 100) / 100;

/** E — evidence coverage for a balance: Σ r·v ÷ V, capped at 1 (only accepted evidence counts). */
export function coverage(items: Pick<EvidenceItem, 'kind' | 'amount' | 'accepted'>[], balance: Minor): number {
  const V = Math.abs(balance);
  if (!V) return items.some((i) => i.accepted) ? 1 : 0;
  return clamp01(items.filter((i) => i.accepted).reduce((s, i) => s + RELIABILITY[i.kind].w * Math.min(Math.abs(i.amount), V), 0) / V);
}
/** T — test results: starts at 1 and falls with the misstatements found relative to performance materiality. */
export function testScore(misstatement: Minor, pm: Minor): number {
  if (pm <= 0) return misstatement ? 0 : 1;
  return clamp01(1 - Math.abs(misstatement) / pm);
}
/** A — council agreement: 1 − the spread of the members' confidences (null when nobody voted). */
export function agreement(values: number[]): number | null {
  const v = values.filter((x) => Number.isFinite(x)).map(clamp01);
  if (!v.length) return null;
  if (v.length === 1) return 1;
  const mean = v.reduce((a, b) => a + b, 0) / v.length, sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
  return Math.round(clamp01(1 - 2 * sd) * 1e4) / 1e4;
}
export type Weights = { E: number; T: number; A: number };
export const DEFAULT_WEIGHTS: Weights = { E: 0.5, T: 0.3, A: 0.2 };
/** C = wE·E + wT·T + wA·A; without a council vote A's weight is shared by E and T in proportion. */
export function confidence(p: { E: number; T: number; A: number | null }, w: Weights = DEFAULT_WEIGHTS): number {
  const tot = w.E + w.T + w.A || 1, W = { E: w.E / tot, T: w.T / tot, A: w.A / tot };
  if (p.A === null) { const k = W.E + W.T || 1; return r2(clamp01((W.E / k) * p.E + (W.T / k) * p.T)); }
  return r2(clamp01(W.E * p.E + W.T * p.T + W.A * p.A));
}

/* ---------- 3. thresholds ---------- */
export type LineRiskLike = { lineKey: string; ar: string; amount: Minor; level: 'عالٍ' | 'متوسط' | 'منخفض'; significant: boolean };
/** The confidence a line needs: material & high risk 0.90, material & medium 0.80, material & low 0.70, immaterial → analytics only (null). */
export function thresholdFor(line: Pick<LineRiskLike, 'significant' | 'level'> & { material?: boolean }): number | null {
  const material = line.material ?? line.significant;
  if (!material) return null;
  return line.level === 'عالٍ' ? 0.9 : line.level === 'متوسط' ? 0.8 : 0.7;
}

/* ---------- 4. the matrix: every material line × its assertions ---------- */
export type Cell = { assertion: AssertionKey; E: number; T: number; A: number | null; C: number; met: boolean | null };
export type MatrixRow = LineRiskLike & { threshold: number | null; override?: { threshold: number; reason: string }; cells: Cell[]; min: number; met: boolean | null };
export type MatrixInput = {
  lines: (LineRiskLike & { material?: boolean })[];
  assertions: Record<string, AssertionKey[]>;
  evidence: EvidenceItem[];
  /** misstatements per line, or per `line|assertion` for a finding tied to one assertion */
  misstatements: Record<string, Minor>;
  /** council confidences per `line|assertion` (member values of the latest round) */
  council?: Record<string, number[]>;
  pm: Minor;
  overrides?: Record<string, { threshold: number; reason: string }>;
  weights?: Weights;
};
const DEFAULT_ASSERT: AssertionKey[] = ['existence', 'completeness', 'valuation'];
export function confidenceMatrix(i: MatrixInput) {
  const rows: MatrixRow[] = i.lines.map((l) => {
    const keys = [...new Set((i.assertions[l.lineKey] ?? DEFAULT_ASSERT).filter(Boolean))];
    const ov = i.overrides?.[l.lineKey], threshold = ov ? ov.threshold : thresholdFor(l);
    const cells = keys.map((a): Cell => {
      const ev = i.evidence.filter((e) => e.lineKey === l.lineKey && (!e.assertions.length || e.assertions.includes(a)));
      const E = coverage(ev, l.amount), T = testScore(i.misstatements[l.lineKey + '|' + a] ?? i.misstatements[l.lineKey] ?? 0, i.pm);
      const A = agreement(i.council?.[l.lineKey + '|' + a] ?? []), C = confidence({ E, T, A }, i.weights);
      return { assertion: a, E: r2(E), T: r2(T), A: A === null ? null : r2(A), C, met: threshold === null ? null : C >= threshold };
    });
    const min = cells.length ? Math.min(...cells.map((c) => c.C)) : 0;
    return { ...l, threshold, ...(ov ? { override: ov } : {}), cells, min: r2(min), met: threshold === null ? null : cells.every((c) => c.met) };
  });
  const open = rows.filter((r) => r.met === false), material = rows.filter((r) => r.threshold !== null);
  const avgOpen = open.length ? r2(open.reduce((s, r) => s + r.min, 0) / open.length) : 1;
  const avgAll = material.length ? r2(material.reduce((s, r) => s + r.min, 0) / material.length) : 1;
  return { rows, open, allMet: open.length === 0, avgOpen, avgAll };
}

/* ---------- 5. the stopping rule (9.5) and escalation (8.5) ---------- */
export type StopDecision = { decision: 'sufficient' | 'escalate' | 'continue'; code: 'sufficient' | 'stalled' | 'max-rounds' | 'fraud' | 'disagreement' | 'continue'; reason: string };
export function stopRule(h: { avgOpen: number[]; allMet: boolean; round: number; maxRounds: number; minGain?: number; fraud?: boolean; disagreement?: boolean }): StopDecision {
  if (h.fraud) return { decision: 'escalate', code: 'fraud', reason: 'مؤشر قوي على غش محتمل — يُصعد فوراً للمراجع لأن التعامل معه يحتاج حكماً بشرياً وإجراءات خاصة (ISA 240)' };
  if (h.allMet && h.round > 0) return { decision: 'sufficient', code: 'sufficient', reason: 'بلغت كل البنود الجوهرية عتباتها لكل التأكيدات ذات الصلة — تُعد مسودة التقرير للاعتماد' };
  if (h.disagreement) return { decision: 'escalate', code: 'disagreement', reason: 'خلاف حاد بين أعضاء المجلس على بند جوهري لم يحسمه النقاش — يُصعد البند للمراجع' };
  if (h.round >= h.maxRounds) return { decision: 'escalate', code: 'max-rounds', reason: 'بلغ الملف الحد الأقصى للجولات (' + h.maxRounds + ') — يُصعد للمراجع مع ملخص البنود غير المحسومة' };
  const n = h.avgOpen.length, gain = h.minGain ?? 0.02;
  if (n >= 2 && h.avgOpen[n - 1] - h.avgOpen[n - 2] < gain) return { decision: 'escalate', code: 'stalled', reason: 'لم يرتفع متوسط الثقة في البنود المفتوحة بين جولتين بأكثر من ' + Math.round(gain * 100) + '٪ — طلب المزيد لم يعد مجدياً' };
  return { decision: 'continue', code: 'continue', reason: 'الأدلة غير كافية بعد — تصدر طلبات محددة وينتقل الملف إلى انتظار العميل' };
}

/* ---------- 6. requests ranked by value (9.6) ---------- */
export type Effort = 'low' | 'medium' | 'high';
export const EFFORT: Record<Effort, { v: number; ar: string }> = { low: { v: 1, ar: 'منخفض' }, medium: { v: 2, ar: 'متوسط' }, high: { v: 4, ar: 'مرتفع' } };
/** ΔC if a piece of evidence of this kind, covering `amount`, were accepted for the line's assertion. */
export function expectedGain(row: MatrixRow, assertion: AssertionKey, kind: EvidenceKind, amount: Minor, i: Pick<MatrixInput, 'evidence' | 'weights'>): number {
  const cell = row.cells.find((c) => c.assertion === assertion);
  if (!cell) return 0;
  const ev = i.evidence.filter((e) => e.lineKey === row.lineKey && (!e.assertions.length || e.assertions.includes(assertion)));
  const E2 = coverage([...ev, { kind, amount, accepted: true }], row.amount);
  return r2(Math.max(0, confidence({ E: E2, T: cell.T, A: cell.A }, i.weights) - cell.C));
}
export type RankedRequest<T> = T & { score: number };
/** Priority = ΔC expected × materiality weight ÷ client effort — the largest customer's confirmation before twenty small invoices. */
export function rankRequests<T extends { expectedGain: number; materialityWeight: number; effort: Effort }>(list: T[]): RankedRequest<T>[] {
  return list.map((q) => ({ ...q, score: r2((q.expectedGain * q.materialityWeight) / EFFORT[q.effort].v * 100) / 100 }))
    .sort((a, b) => b.score - a.score || b.materialityWeight - a.materialityWeight);
}
/** Materiality weight of a line: its balance relative to overall materiality (≥ 1 means material on its own). */
export const materialityWeight = (amount: Minor, overall: Minor) => (overall > 0 ? r2(Math.min(10, Math.abs(amount) / overall)) : 1);

/* ---------- 7. the engagement: a state machine with human approvals (6.2, 5.4) ---------- */
export type State = 'new' | 'setup' | 'analysis' | 'council' | 'awaiting-client' | 'human-review' | 'draft-report' | 'approved';
export const STATES: { key: State; ar: string }[] = [
  { key: 'new', ar: 'جديد' }, { key: 'setup', ar: 'قيد الإعداد' }, { key: 'analysis', ar: 'قيد التحليل' }, { key: 'council', ar: 'نقاش المجلس' },
  { key: 'awaiting-client', ar: 'بانتظار العميل' }, { key: 'human-review', ar: 'مراجعة بشرية' }, { key: 'draft-report', ar: 'مسودة التقرير' }, { key: 'approved', ar: 'معتمد ومغلق' },
];
export const TRANSITIONS: Record<State, State[]> = {
  new: ['setup'], setup: ['analysis'], analysis: ['council', 'setup'], council: ['awaiting-client', 'human-review', 'draft-report'],
  'awaiting-client': ['analysis'], 'human-review': ['council', 'awaiting-client', 'draft-report'], 'draft-report': ['approved', 'council', 'human-review'], approved: [],
};
export type ApprovalKey = 'plan' | 'requests' | 'escalation' | 'report';
export const APPROVALS: { key: ApprovalKey; ar: string; isa: string; why: string }[] = [
  { key: 'plan', ar: 'اعتماد الأهمية النسبية وخطة المراجعة', isa: 'ISA 300 · ISA 320', why: 'الأساس والنسبة حكم مهني؛ النظام يقترح ويبرر والمراجع يعتمد' },
  { key: 'requests', ar: 'اعتماد إرسال الطلبات للعميل', isa: 'ISA 500 · ISA 240', why: 'لا يُرسل طلب للعميل قبل مراجعته — ولا طلب ينبّه طرفاً مشتبهاً به' },
  { key: 'escalation', ar: 'قرار المراجع في التصعيد', isa: 'ISA 220', why: 'الخلاف الحاد ومؤشرات الغش وتوقف التحسن يحسمها إنسان' },
  { key: 'report', ar: 'اعتماد مسودة التقرير والرأي', isa: 'ISA 700 · ISA 705', why: 'لا يصدر تقرير دون موافقة المراجع وتوقيعه' },
];
export type Approval = { by: string; at: string; note?: string; round?: number };
export type Engagement = { state: State; history: { from: State; to: State; at: string; actor: string; reason: string }[]; approvals: Partial<Record<ApprovalKey, Approval>>; requestsApproved: number[] };
export const newEngagement = (): Engagement => ({ state: 'new', history: [], approvals: {}, requestsApproved: [] });
/** Move the file to a new state: only the allowed transitions, and the guards of the human approvals. */
export function transition(e: Engagement, to: State, actor: string, reason: string, now = new Date()): Engagement {
  if (e.state === to) return e;
  if (!TRANSITIONS[e.state].includes(to)) throw new Error('انتقال غير مسموح: من «' + STATES.find((s) => s.key === e.state)!.ar + '» إلى «' + STATES.find((s) => s.key === to)!.ar + '»');
  if (to === 'analysis' && e.state === 'setup' && !e.approvals.plan) throw new Error('اعتمد الأهمية النسبية وخطة المراجعة أولاً');
  if (to === 'approved' && (!e.approvals.report || !e.approvals.plan)) throw new Error('اعتماد التقرير وخطة المراجعة شرط للإغلاق');
  return { ...e, state: to, history: [...e.history, { from: e.state, to, at: now.toISOString(), actor: actor || '—', reason: reason || '' }] };
}
export function approve(e: Engagement, key: ApprovalKey, by: string, note = '', now = new Date(), round?: number): Engagement {
  if (!String(by || '').trim()) throw new Error('اكتب اسم المراجع المعتمد');
  const a: Approval = { by: String(by).trim(), at: now.toISOString(), ...(note ? { note } : {}), ...(round ? { round } : {}) };
  return { ...e, approvals: { ...e.approvals, [key]: a }, requestsApproved: key === 'requests' && round ? [...new Set([...e.requestsApproved, round])] : e.requestsApproved };
}
/** Where the file should be now, from the facts of the review (used to keep the state honest). */
export function derivedState(f: { hasTb: boolean; planApproved: boolean; rounds: number; lastDecision?: 'sufficient' | 'escalate' | 'continue' | null; reportApproved: boolean }): State {
  if (!f.hasTb) return 'new';
  if (!f.planApproved) return 'setup';
  if (f.reportApproved) return 'approved';
  if (!f.rounds) return 'analysis';
  if (f.lastDecision === 'sufficient') return 'draft-report';
  if (f.lastDecision === 'escalate') return 'human-review';
  return 'awaiting-client';
}

/* ---------- 8. where each stage stands in the standards (10.1) ---------- */
export const ISA_MAP: { stage: string; isa: string; what: string; key: string }[] = [
  { key: 'plan', stage: 'التخطيط والأهمية النسبية', isa: 'ISA 320', what: 'الأهمية الكلية وأهمية الأداء وحد التوافه مع توثيق الأساس' },
  { key: 'risk', stage: 'فهم المنشأة وتقييم المخاطر', isa: 'ISA 315', what: 'مناطق الخطر من طبيعة النشاط والأرصدة والتغيرات' },
  { key: 'response', stage: 'الاستجابة للمخاطر', isa: 'ISA 330', what: 'ربط الإجراءات بالمخاطر المقيمة لكل تأكيد' },
  { key: 'evidence', stage: 'أدلة المراجعة', isa: 'ISA 500', what: 'كل استنتاج بدليل مرقم مع تقدير موثوقيته' },
  { key: 'analytics', stage: 'الإجراءات التحليلية', isa: 'ISA 520', what: 'مقارنة النسب والاتجاهات وكشف الانحرافات' },
  { key: 'sampling', stage: 'المعاينة', isa: 'ISA 530', what: 'العينات الموجهة بالمخاطر واستقراء النتائج' },
  { key: 'confirm', stage: 'المصادقات الخارجية', isa: 'ISA 505', what: 'تحديد الأرصدة المناسبة للمصادقة وتتبع الردود' },
  { key: 'fraud', stage: 'مخاطر الغش', isa: 'ISA 240', what: 'القيود غير المعتادة وتحليل بنفورد والتصعيد الفوري' },
  { key: 'estimates', stage: 'التقديرات المحاسبية', isa: 'ISA 540', what: 'المخصصات والتقديرات وافتراضاتها' },
  { key: 'docs', stage: 'التوثيق', isa: 'ISA 230', what: 'أوراق عمل تلقائية لكل جولة وقرار' },
  { key: 'misstatements', stage: 'تقييم الأخطاء المكتشفة', isa: 'ISA 450', what: 'تجميع الأخطاء ومقارنتها بالأهمية النسبية' },
  { key: 'deficiencies', stage: 'إبلاغ أوجه القصور', isa: 'ISA 265', what: 'خطاب الإدارة بنقاط الضعف في الرقابة الداخلية' },
  { key: 'opinion', stage: 'تكوين الرأي', isa: 'ISA 700', what: 'مسودة الرأي للاعتماد من المراجع' },
];

/* ---------- 9. checklists from the research appendices ---------- */
export const ROUND_CHECKLIST = [
  'راجعت الملاحظات المبدئية وتأكدت أن كل ملاحظة مرتبطة بدليل صحيح',
  'قرأت الآراء المخالفة غير المحسومة، وقررت هل تستحق متابعة إضافية',
  'راجعت الطلبات قبل إرسالها للعميل، وحذفت أو عدلت ما لا يلزم',
  'تحققت من أن الطلبات لا تنبه طرفاً مشتبهاً به في حال وجود مؤشرات غش',
  'راجعت درجات الثقة للبنود عالية الخطر، وعدلت العتبة عند الحاجة مع توثيق السبب',
  'سجلت أي حالة تجاوزت فيها قرار النظام، مع السبب',
];
export const OFFICE_READINESS = [
  'اعتماد سياسة داخلية لاستخدام النظام ونقاط الاعتماد الإلزامية',
  'تحديد المهام والعملاء المناسبين للمرحلة الأولى (يُفضل الملفات منخفضة الخطر)',
  'تدريب المراجعين على قراءة نقاش المجلس ومخرجاته بعين ناقدة',
  'مراجعة اتفاقية الخدمة من حيث الأمان والاحتفاظ بالبيانات وعدم التدريب عليها',
  'إبلاغ العملاء عند الحاجة باستخدام أدوات تقنية في المراجعة، وفق متطلبات حماية البيانات',
  'إعداد مجموعة ملفات سابقة داخلية لاختبار النظام قبل الاعتماد عليه',
  'تحديد مؤشرات قياس الأثر: الساعات الموفرة، والملاحظات الإضافية، ورضا الفريق',
];
