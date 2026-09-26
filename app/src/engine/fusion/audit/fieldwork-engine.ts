/* Fieldwork — the methodology spine of a professional audit, built on the engagement's own review:
     1. risk × assertion matrix (ISA 315): every line with a balance, its assertions, inherent risk, fraud and
        estimate flags, and the global theme the auditors in the research bundle report for that line
     2. audit strategy (ISA 300): materiality, significant risks, the approach per area, the KAM candidates
     3. the working papers (ISA 330 / ISA 230): one per area with a standard reference (A cash … T zakat), the
        procedures for its risk — for a significant risk also those the bundle's auditors performed on the same
        theme — a sample size, and a preparer → reviewer sign-off (a reviewer can never be the preparer)
     4. sample sizes by monetary-unit sampling (ISA 530): items at or above performance materiality are tested
        in full; the rest n = ⌈(population × confidence factor) ÷ (performance materiality − expected × expansion)⌉
     5. lead schedules: every account of a line — prior, unadjusted, adjustments, final — with its WP reference
     6. the completion gate (ISA 450 / 560 / 570 / 580 / 220 / 700): the report cannot be signed until every
        item is met
   Deterministic; the conclusions and sign-offs are the auditors'. */
import { type Minor } from '../reports/money-engine';
import { type TrialBalance } from '../reports/tb-import-engine';
import { buildStatements, LINE } from '../reports/statements-engine';
import { applyAdjustments, LINE_AUDIT, type Adjustment, type Review } from './tb-review-engine';
import { precedentsFor, sectorFromActivity } from './global-benchmarks-engine';

/* ---------- working-paper references (the lead-schedule lettering audit files use) ---------- */
const AREA: { ref: string; ar: string; lines: string[] }[] = [
  { ref: 'A', ar: 'النقد وما في حكمه', lines: ['cash'] },
  { ref: 'B', ar: 'الذمم المدينة والإيراد', lines: ['receivables', 'revenue', 'contractLiab'] },
  { ref: 'C', ar: 'المخزون وتكلفة الإيرادات', lines: ['inventory', 'cogs', 'biological'] },
  { ref: 'D', ar: 'الممتلكات والأصول غير الملموسة وحق الاستخدام', lines: ['ppe', 'intangibles', 'rou', 'depreciation', 'impairment'] },
  { ref: 'E', ar: 'الاستثمارات', lines: ['investments', 'investIncome'] },
  { ref: 'F', ar: 'المدفوعات المقدمة والأرصدة المدينة الأخرى', lines: ['prepayments', 'otherCa', 'otherNca', 'vatAsset'] },
  { ref: 'L', ar: 'الذمم الدائنة والمستحقات', lines: ['payables', 'accruals', 'otherCl', 'vatLiability'] },
  { ref: 'M', ar: 'القروض والإيجارات وتكاليف التمويل', lines: ['loansCl', 'loansNcl', 'leaseNcl', 'financeCost'] },
  { ref: 'N', ar: 'المخصصات ومنافع الموظفين', lines: ['provisions', 'eosb'] },
  { ref: 'Q', ar: 'حقوق الملكية والأطراف ذات العلاقة', lines: ['capital', 'reserves', 'partners', 'retained'] },
  { ref: 'S', ar: 'المصروفات التشغيلية والإيرادات الأخرى', lines: ['selling', 'admin', 'otherIncome'] },
  { ref: 'T', ar: 'الزكاة والضريبة', lines: ['zakatPayable', 'zakatExpense'] },
];
/** areas tested in full rather than sampled: a few balances each, confirmed or recomputed directly */
const FULL: Record<string, string> = { A: 'يُختبر كاملاً: مصادقة كل حساب بنكي ومطابقة تسويته (ISA 505)', M: 'يُختبر كاملاً: مصادقة كل قرض وعقد وإعادة احتساب تكلفة التمويل',
  Q: 'يُختبر كاملاً: مطابقة السجل التجاري وقرارات الشركاء وحركة كل حساب', T: 'يُختبر كاملاً: إعادة احتساب الوعاء والمخصص ومطابقة الإقرار والربوط' };
export const areaOf = (lineKey: string) => AREA.find((a) => a.lines.includes(lineKey)) ?? null;

/* ---------- 1. risk × assertion matrix ---------- */
export type MatrixRow = { lineKey: string; ar: string; ref: string; amount: Minor; assertions: string[]; score: number; level: string;
  significant: boolean; fraud: boolean; estimate: boolean; approach: string; theme: string | null };
export function riskMatrix(review: Review, opts: { activity?: string } = {}): MatrixRow[] {
  const sector = sectorFromActivity(opts.activity ?? '');
  return review.risks.filter((r) => r.amount !== 0).map((r) => {
    const la = LINE_AUDIT[r.lineKey], th = precedentsFor(r.lineKey, { sector, limit: 1 })[0];
    const fraud = !!la?.fraud || r.lineKey === 'revenue', estimate = !!la?.estimate;
    const approach = r.significant ? 'إجراءات أساسية تفصيلية موسعة مصممة للخطر الجوهري' + (fraud ? ' مع عنصر عدم توقع (ISA 240.30)' : '')
      : r.level === 'متوسط' ? 'إجراءات أساسية تفصيلية وتحليلية' : 'إجراءات تحليلية أساسية';
    return { lineKey: r.lineKey, ar: r.ar, ref: areaOf(r.lineKey)?.ref ?? '—', amount: r.amount, assertions: LINE[r.lineKey]?.assertions ?? [],
      score: r.score, level: r.level, significant: r.significant, fraud, estimate, approach, theme: th ? th.ar : null };
  }).sort((a, b) => b.score - a.score);
}

/* ---------- 4. sample size (monetary-unit sampling, ISA 530) ---------- */
export const CONFIDENCE = { high: { pct: 95, factor: 3.0, expansion: 1.6 }, moderate: { pct: 90, factor: 2.31, expansion: 1.5 }, low: { pct: 80, factor: 1.61, expansion: 1.3 } } as const;
export type RiskLevel = keyof typeof CONFIDENCE;
export function sampleSize(i: { population: Minor; performance: Minor; risk: RiskLevel; expected?: Minor; keyItems?: Minor }): Sample {
  const c = CONFIDENCE[i.risk], pop = Math.abs(i.population), key = Math.min(Math.abs(i.keyItems ?? 0), pop), rest = pop - key;
  const room = i.performance - (i.expected ?? 0) * c.expansion;
  if (i.performance <= 0 || room <= 0) return { n: null as number | null, confidence: c.pct, factor: c.factor, keyItems: key, interval: null as Minor | null, note: 'الخطأ المتوقع يستنفد الأهمية التنفيذية: اختبر المجتمع كله أو خفّض الخطأ المتوقع.' };
  const n = rest ? Math.ceil((rest * c.factor) / room) : 0;
  return { n, confidence: c.pct, factor: c.factor, keyItems: key, interval: n ? Math.floor(rest / n) : null,
    note: `ثقة ${c.pct}% (معامل ${c.factor})` + (key ? '؛ البنود المساوية للأهمية التنفيذية أو الأكبر منها تُختبر كلها' : '') };
}

/* ---------- 3. the working papers ---------- */
export type Sample = { n: number | null; confidence: number; factor: number; keyItems: Minor; interval: Minor | null; note: string };
export type Step = { id: string; text: string; source: 'line' | 'global' | 'fraud' | 'analytical'; theme?: string; cite?: string };
export type WorkPaper = { ref: string; area: string; lines: string[]; amount: Minor; significant: boolean; risk: RiskLevel; objective: string;
  assertions: string[]; steps: Step[]; sample: Sample; precedents: { title: string; company: string; page: number }[] };
export function workingPapers(review: Review, opts: { activity?: string } = {}): WorkPaper[] {
  const m = review.materiality, sector = sectorFromActivity(opts.activity ?? '');
  const out: WorkPaper[] = [];
  for (const a of AREA) {
    const risks = review.risks.filter((r) => a.lines.includes(r.lineKey) && r.amount !== 0);
    if (!risks.length) continue;
    const amount = risks.reduce((t, r) => t + Math.abs(r.amount), 0);
    const significant = risks.some((r) => r.significant), level: RiskLevel = significant ? 'high' : risks.some((r) => r.level === 'متوسط') ? 'moderate' : 'low';
    if (!significant && amount < m.trivial) continue;
    const steps: Step[] = [], seen = new Set<string>();
    const add = (s: Step) => { if (seen.has(s.text)) return; seen.add(s.text); steps.push({ ...s, id: `${a.ref}-${steps.length + 1}` }); };
    add({ id: '', text: 'مطابقة جدول الحساب الرئيسي (Lead) مع ميزان المراجعة والقوائم ورصيد السنة السابقة المراجع', source: 'analytical' });
    for (const r of risks) for (const p of LINE_AUDIT[r.lineKey]?.procedures ?? r.procedures) add({ id: '', text: p, source: 'line' });
    if (level !== 'low') add({ id: '', text: 'إجراءات تحليلية أساسية: توقع مستقل للرصيد ومقارنته بالفعلي والتحقيق في الفروق فوق الأهمية التنفيذية (ISA 520)', source: 'analytical' });
    const precedents: WorkPaper['precedents'] = [];
    if (significant) for (const r of risks.filter((x) => x.significant)) for (const p of precedentsFor(r.lineKey, { sector, limit: 2 })) {
      for (const text of p.procedures) add({ id: '', text, source: 'global', theme: p.ar, cite: p.examples.map((e) => `${e.company} ص ${e.page}`).join('، ') });
      for (const e of p.examples) if (!precedents.some((x) => x.title === e.title)) precedents.push({ title: e.title, company: `${e.company} · ${e.auditor}`, page: e.page });
    }
    if (risks.some((r) => LINE_AUDIT[r.lineKey]?.fraud || r.lineKey === 'revenue')) add({ id: '', text: 'اختبار القيود اليومية ذات الخصائص غير المعتادة المرحّلة على حسابات هذا المجال، وعنصر عدم توقع في الإجراءات (ISA 240)', source: 'fraud' });
    /* the population is the area's balance; key items are individual transactions ≥ performance materiality, which the
       auditor identifies in the ledger (the trial balance holds balances, not transactions), so none are assumed here */
    out.push({ ref: a.ref, area: a.ar, lines: risks.map((r) => r.lineKey), amount, significant, risk: level,
      objective: `الحصول على أدلة كافية ومناسبة بأن أرصدة ${a.ar} خالية من التحريف الجوهري في تأكيداتها: ${[...new Set(risks.flatMap((r) => LINE[r.lineKey]?.assertions ?? []))].join('، ')}.`,
      assertions: [...new Set(risks.flatMap((r) => LINE[r.lineKey]?.assertions ?? []))], steps,
      sample: FULL[a.ref] ? { n: null, confidence: 100, factor: 0, keyItems: amount, interval: null, note: FULL[a.ref] } : sampleSize({ population: amount, performance: m.performance, risk: level }), precedents: precedents.slice(0, 4) });
  }
  return out;
}

/* ---------- working-paper sign-off (preparer → reviewer, segregation of duties) ---------- */
export type SignOff = { preparer?: string; preparedAt?: string; reviewer?: string; reviewedAt?: string; conclusion?: string; done?: string[] };
export function wpStatus(wp: WorkPaper, s: SignOff = {}) {
  const done = (s.done ?? []).filter((id) => wp.steps.some((x) => x.id === id)).length, total = wp.steps.length;
  const status = s.reviewer && s.preparer ? 'reviewed' : s.preparer ? 'prepared' : done ? 'in-progress' : 'not-started';
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0, status: status as 'not-started' | 'in-progress' | 'prepared' | 'reviewed' };
}
/** Evidence per line from the signed papers (ISA 330 / 500): reviewed → accepted, prepared → partial. Feeds the opinion and the programme. */
export function evidenceFromFieldwork(papers: WorkPaper[], signoffs: Record<string, SignOff> = {}): Record<string, 'accepted' | 'partial'> {
  const out: Record<string, 'accepted' | 'partial'> = {};
  for (const w of papers) {
    const st = wpStatus(w, signoffs[w.ref]).status;
    if (st === 'reviewed') for (const k of w.lines) out[k] = 'accepted';
    else if (st === 'prepared') for (const k of w.lines) if (!out[k]) out[k] = 'partial';
  }
  return out;
}
/** Returns the new sign-off or an error in Arabic: prepare needs every step and a conclusion; review needs a different person. */
export function signOff(wp: WorkPaper, s: SignOff, role: 'preparer' | 'reviewer', name: string, now = new Date()): { ok: true; value: SignOff } | { ok: false; error: string } {
  const who = name.trim();
  if (!who) return { ok: false, error: 'اكتب اسم الموقّع.' };
  if (role === 'preparer') {
    const st = wpStatus(wp, s);
    if (st.done < st.total) return { ok: false, error: `أكمل الإجراءات أولاً (${st.done} من ${st.total}).` };
    if (!(s.conclusion ?? '').trim()) return { ok: false, error: 'اكتب استنتاج ورقة العمل قبل التوقيع (ISA 230).' };
    return { ok: true, value: { ...s, preparer: who, preparedAt: now.toISOString(), reviewer: undefined, reviewedAt: undefined } };
  }
  if (!s.preparer) return { ok: false, error: 'لا تُراجع ورقة لم يوقعها المُعد.' };
  if (s.preparer.trim() === who) return { ok: false, error: 'المراجِع يجب أن يكون غير المُعد (فصل المهام — ISA 220).' };
  return { ok: true, value: { ...s, reviewer: who, reviewedAt: now.toISOString() } };
}

/* ---------- 5. lead schedules ---------- */
export type LeadRow = { code: string; name: string; prior: Minor | null; unadjusted: Minor; adjustments: Minor; final: Minor };
export function leadSchedules(tb: TrialBalance, accepted: Adjustment[], overrides: Record<string, string> = {}) {
  const before = buildStatements(tb, overrides), after = buildStatements(accepted.length ? applyAdjustments(tb, accepted) : tb, overrides);
  return AREA.map((a) => {
    const rows: LeadRow[] = [];
    for (const k of a.lines) {
      const lb = before.lines.find((l) => l.key === k), la = after.lines.find((l) => l.key === k);
      const codes = [...new Set([...(lb?.accounts ?? []), ...(la?.accounts ?? [])].map((x) => x.code))];
      for (const code of codes) {
        const x = lb?.accounts.find((y) => y.code === code), y = la?.accounts.find((z) => z.code === code);
        const un = x?.current ?? 0, fin = y?.current ?? 0;
        rows.push({ code, name: (x ?? y)!.name, prior: x?.prior ?? y?.prior ?? null, unadjusted: un, adjustments: fin - un, final: fin });
      }
    }
    const sum = (f: (r: LeadRow) => Minor) => rows.reduce((t, r) => t + f(r), 0);
    return { ref: a.ref, area: a.ar, rows, totals: { prior: before.hasPrior ? sum((r) => r.prior ?? 0) : null, unadjusted: sum((r) => r.unadjusted), adjustments: sum((r) => r.adjustments), final: sum((r) => r.final) } };
  }).filter((x) => x.rows.length);
}

/* ---------- 6. completion ---------- */
export type CompletionInput = { papers: WorkPaper[]; signoffs: Record<string, SignOff>; uncorrected: Minor; materiality: Minor; goingConcernIssue: boolean;
  confirmations: Record<string, boolean>; kamsDrafted: boolean; highOpenRequests: number };
export const HUMAN_CHECKS: { id: string; ar: string; isa: string }[] = [
  { id: 'subsequent', ar: 'فُحصت الأحداث اللاحقة حتى تاريخ التقرير (محاضر، حسابات بعد الإقفال، استفسارات)', isa: 'ISA 560' },
  { id: 'goingConcern', ar: 'قُيّم تقييم الإدارة للاستمرارية لاثني عشر شهراً على الأقل', isa: 'ISA 570' },
  { id: 'representations', ar: 'استُلم خطاب الإقرارات موقعاً ومؤرخاً بتاريخ التقرير', isa: 'ISA 580' },
  { id: 'relatedParties', ar: 'حُصرت الأطراف ذات العلاقة ومعاملاتها وأُفصح عنها', isa: 'ISA 550' },
  { id: 'lawsRegs', ar: 'استُلمت ردود المستشارين القانونيين وقُيّم الالتزام بالأنظمة', isa: 'ISA 250 / 501' },
  { id: 'eqcr', ar: 'اكتملت مراجعة جودة الارتباط (إن كانت مطلوبة)', isa: 'ISQM 2 / ISA 220' },
];
export function completion(i: CompletionInput) {
  const wp = i.papers.map((p) => ({ ref: p.ref, status: wpStatus(p, i.signoffs[p.ref]).status }));
  const items = [
    { id: 'papers', ar: `أوراق العمل موقعة من المُعد والمراجِع (${wp.filter((w) => w.status === 'reviewed').length} من ${wp.length})`, isa: 'ISA 230 / 220', ok: wp.length > 0 && wp.every((w) => w.status === 'reviewed'), auto: true },
    { id: 'misstatements', ar: 'التحريفات غير المصححة دون الأهمية النسبية أو معالجة أثرها في الرأي', isa: 'ISA 450', ok: Math.abs(i.uncorrected) <= i.materiality, auto: true },
    { id: 'requests', ar: 'لا طلبات أدلة عالية الأولوية مفتوحة', isa: 'ISA 500', ok: i.highOpenRequests === 0, auto: true },
    { id: 'kams', ar: 'صيغت الأمور الرئيسية للمراجعة', isa: 'ISA 701', ok: i.kamsDrafted, auto: true },
    ...HUMAN_CHECKS.map((h) => ({ ...h, ok: !!i.confirmations[h.id] && !(h.id === 'goingConcern' && i.goingConcernIssue && !i.confirmations.goingConcernDisclosed), auto: false })),
  ];
  const open = items.filter((x) => !x.ok);
  return { items, open: open.length, ready: open.length === 0, pct: Math.round(((items.length - open.length) / items.length) * 100) };
}

/* ---------- ISA 580: the written representations letter ---------- */
export function representationLetter(i: { company: string; auditFirm?: string; periodEnd: string; framework: 'IFRS' | 'SME' | 'EAS'; uncorrected: { title: string; amount: Minor }[]; currency: string }) {
  const fw = i.framework === 'EAS' ? 'معايير المحاسبة المصرية' : i.framework === 'SME' ? 'المعيار الدولي للتقرير المالي للمنشآت الصغيرة ومتوسطة الحجم المعتمد في المملكة العربية السعودية' : 'المعايير الدولية للتقرير المالي المعتمدة في المملكة العربية السعودية';
  const m = (v: Minor) => `${Math.round(v / 100).toLocaleString('en')} ${i.currency}`;
  return { title: 'خطاب الإقرارات', to: `السادة/ ${i.auditFirm || '[مكتب المراجعة]'}`, paragraphs: [
    `نقدم هذا الخطاب فيما يتعلق بمراجعتكم للقوائم المالية لـ${i.company || '[المنشأة]'} عن السنة المنتهية في ${i.periodEnd || '[التاريخ]'} لغرض إبداء رأي بشأن ما إذا كانت تعرض بعدل وفق ${fw}. ونؤكد، حسب علمنا واعتقادنا، ما يلي:`,
    'القوائم المالية: وفينا بمسؤوليتنا عن إعداد القوائم المالية وعرضها بعدل وفق الإطار المنطبق كما نص عليه خطاب التكليف (ISA 580.10).',
    'التقديرات: الطرق والبيانات والافتراضات المهمة المستخدمة في التقديرات المحاسبية معقولة (ISA 540).',
    'الأطراف ذات العلاقة: أفصحنا لكم عن هوية الأطراف ذات العلاقة وجميع العلاقات والمعاملات التي نعلمها، وعالجناها وأفصحنا عنها بشكل مناسب (ISA 550).',
    'الأحداث اللاحقة: عُدلت القوائم أو أُفصح فيها عن جميع الأحداث اللاحقة لتاريخ القوائم التي يتطلب الإطار تعديلها أو الإفصاح عنها (ISA 560).',
    i.uncorrected.length ? `التحريفات غير المصححة: نرى أن أثر التحريفات غير المصححة التالية، منفردة ومجتمعة، غير جوهري للقوائم ككل: ${i.uncorrected.map((u) => `${u.title} (${m(u.amount)})`).join('؛ ')} (ISA 450.14).`
      : 'التحريفات غير المصححة: لا توجد تحريفات غير مصححة أبلغتمونا بها.',
    'المعلومات المقدمة: أتحنا لكم جميع المعلومات والسجلات والمستندات ذات الصلة، ووصولاً غير مقيد إلى الأشخاص الذين رأيتم ضرورة الحصول على أدلة منهم، وسُجلت جميع المعاملات في السجلات المحاسبية (ISA 580.11).',
    'الغش والالتزام بالأنظمة: أفصحنا لكم عن نتائج تقييمنا لخطر الغش وعن أي غش أو اشتباه فيه نعلمه، وعن جميع حالات عدم الالتزام بالأنظمة المعروفة أو المشتبه بها (ISA 240 / ISA 250).',
    'القضايا والمطالبات: أفصحنا عن جميع القضايا والمطالبات القائمة أو المحتملة التي يجب مراعاة أثرها عند إعداد القوائم المالية.',
  ], signatures: ['الرئيس التنفيذي', 'المدير المالي'] };
}
