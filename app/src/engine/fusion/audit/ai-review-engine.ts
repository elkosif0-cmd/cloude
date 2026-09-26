/* Gemini as the reviewer — the pure half of the review rounds (no network here; the browser client in
   ui/features/tb-review.js sends the bodies built below with the user's own API key).
   The workflow the user asked for:
     round 1  the trial balance + the engine's mapping and findings → Gemini confirms the standards per
              account, finds errors, requests documents
     round n  the uploaded documents (PDF, images, text) → Gemini reviews each against its request,
              accepts / finds insufficient / rejects, and may request more
     …until Gemini returns status «complete» (or the round limit is reached, recorded as a limitation)
     final    report, proposed adjusting entries, standards-compliance discussion
   Guard rails: every standard code is normalized against the codex; every proposed entry is parsed to
   halalas and must balance; account codes are checked against the trial balance; «complete» is refused
   while documents requested in the same round are outstanding; the opinion is derived by the engine
   (ISA 705) and Gemini's suggestion is shown beside it, never instead of it.
   Schemas and board roles from smart-trial-balance-review (js/gemini.js, js/board.js). */
import { formatMinor, parseMinor, type Minor } from '../reports/money-engine';
import { TYPE_LABELS, type TrialBalance } from '../reports/tb-import-engine';
import { normalizeCode, STANDARDS, type Framework } from './codex-engine';
import { adjustmentEffect, validateAdjustment, type Adjustment, type DocRequest, type Finding, type Review, type Severity } from './tb-review-engine';

export const REVIEWERS = ['المراجع الفني المحاسبي', 'مراجع الامتثال للمعايير والإفصاح', 'مدقق المخاطر والأدلة'] as const;
export const DEFAULT_MODEL = 'gemini-2.5-flash';
export const MAX_ROUNDS = 6;

const S = (description?: string) => ({ type: 'STRING', ...(description ? { description } : {}) });
const ARR = (items: object) => ({ type: 'ARRAY', items });
const OBJ = (properties: Record<string, object>, required: string[]) => ({ type: 'OBJECT', properties, required });
const LINES_SCHEMA = ARR(OBJ({ accountCode: S('رقم الحساب من الميزان، أو NEW-… لحساب جديد'), accountName: S(), debit: S('مبلغ بالريال أو 0'), credit: S('مبلغ بالريال أو 0') }, ['accountCode', 'accountName', 'debit', 'credit']));
const ADJ_SCHEMA = ARR(OBJ({ title: S(), reason: S(), standardCode: S(), lines: LINES_SCHEMA }, ['title', 'reason', 'standardCode', 'lines']));

export const ROUND_SCHEMA = OBJ({
  status: { type: 'STRING', enum: ['needs_docs', 'complete'], description: 'needs_docs ما دامت هناك مستندات مطلوبة أو ملاحظات جوهرية معلقة' },
  executiveSummary: S(), riskScore: { type: 'INTEGER', description: '0-100' },
  boardOpinions: ARR(OBJ({ reviewer: { type: 'STRING', enum: [...REVIEWERS] }, opinion: S() }, ['reviewer', 'opinion'])),
  accountStandards: ARR(OBJ({ accountCode: S(), standards: ARR(S()), note: S('علاقة المعيار بالحساب باختصار') }, ['accountCode', 'standards'])),
  findings: ARR(OBJ({ accountCode: S(), accountName: S(), standardCode: S(), issueType: { type: 'STRING', enum: ['تصنيف', 'قياس', 'إفصاح', 'اكتمال', 'تحليلي', 'غش', 'استمرارية', 'أخرى'] },
    severity: { type: 'STRING', enum: ['جسيمة', 'عالية', 'متوسطة', 'منخفضة'] }, amount: S('المبلغ المتأثر بالريال إن وجد'), comment: S(), recommendation: S(), citations: ARR(S('رقم دليل من السجل')) }, ['accountName', 'standardCode', 'severity', 'comment', 'recommendation'])),
  requestedDocuments: ARR(OBJ({ id: S('REQ-n متسلسل ومحفوظ بين الجولات'), title: S(), purpose: S(), relatedAccounts: ARR(S()), standardCode: S(), priority: { type: 'STRING', enum: ['عالية', 'متوسطة', 'منخفضة'] },
    lineKey: S('مفتاح البند'), assertion: { type: 'STRING', enum: ['existence', 'completeness', 'accuracy', 'cutoff', 'valuation', 'presentation'] }, effort: { type: 'STRING', enum: ['low', 'medium', 'high'] }, citations: ARR(S()) }, ['id', 'title', 'purpose', 'priority'])),
  documentsReviewed: ARR(OBJ({ fileName: S(), requestId: S(), verdict: { type: 'STRING', enum: ['مقبول', 'غير كافٍ', 'مرفوض'] }, notes: S(),
    extracted: OBJ({ documentDate: S('YYYY-MM-DD'), amount: S(), vatAmount: S(), vatNumber: S(), counterparty: S(), reference: S() }, []) }, ['fileName', 'verdict', 'notes'])),
  proposedAdjustments: ADJ_SCHEMA,
  nextStepGuidance: S(),
  /* the chair of the audit council (optional for a single reviewer) */
  decision: { type: 'STRING', enum: ['request_more_evidence', 'escalate', 'sufficient'], description: 'قرار الرئيس: طلب أدلة، أو تصعيد للمراجع البشري، أو اكتفاء' },
  confidence: ARR(OBJ({ lineKey: S(), assertion: { type: 'STRING', enum: ['existence', 'completeness', 'accuracy', 'cutoff', 'valuation', 'presentation'] }, value: { type: 'NUMBER', description: '0-1' } }, ['lineKey', 'assertion', 'value'])),
  dissent: ARR(OBJ({ member: S(), note: S(), citations: ARR(S()) }, ['member', 'note'])),
}, ['status', 'executiveSummary', 'riskScore', 'boardOpinions', 'findings', 'requestedDocuments', 'nextStepGuidance']);

export const FINAL_SCHEMA = OBJ({
  overallOpinion: { type: 'STRING', enum: ['غير معدل', 'متحفظ', 'عكسي', 'امتناع عن إبداء الرأي'] },
  headline: S(), summary: S(),
  keyAuditMatters: ARR(OBJ({ title: S(), why: S('لماذا يعد أمراً رئيسياً'), how: S('كيف عولج في المراجعة') }, ['title', 'why', 'how'])),
  complianceDiscussion: ARR(OBJ({ standardCode: S(), status: { type: 'STRING', enum: ['ممتثل', 'ممتثل جزئياً', 'غير ممتثل', 'غير منطبق'] }, discussion: S() }, ['standardCode', 'status', 'discussion'])),
  adjustments: ADJ_SCHEMA,
  managementLetter: ARR(OBJ({ title: S(), observation: S(), effect: S(), recommendation: S(), priority: { type: 'STRING', enum: ['عالية', 'متوسطة', 'منخفضة'] } }, ['title', 'observation', 'recommendation', 'priority'])),
  limitations: ARR(S()), closingStatement: S(),
}, ['overallOpinion', 'headline', 'summary', 'keyAuditMatters', 'complianceDiscussion', 'adjustments', 'managementLetter', 'closingStatement']);

export type ReviewContext = { company: string; period: string; periodEnd?: string; framework: Framework; currency?: string; activity?: string };
export type Upload = { requestId: string; fileName: string; mimeType: string; size: number; round: number; data?: string; text?: string };
export type ReviewedDoc = { requestId: string; fileName: string; verdict: 'مقبول' | 'غير كافٍ' | 'مرفوض'; notes: string; extracted: Record<string, string> };
export type AiAdjustment = Adjustment & { valid: boolean; problems: string[]; newAccounts: string[] };
export type Round = { no: number; at: string; model: string; status: 'needs_docs' | 'complete'; summary: string; riskScore: number;
  opinions: { reviewer: string; opinion: string }[]; accountStandards: Record<string, { standards: string[]; unknown: string[]; note: string }>;
  findings: Finding[]; requests: DocRequest[]; reviewed: ReviewedDoc[]; adjustments: AiAdjustment[]; guidance: string; warnings: string[];
  /* the audit council (research «مجلس المراجعة الذكي»): the chair's decision, confidences, dissent and the members' verified opinions */
  decision?: 'request_more_evidence' | 'escalate' | 'sufficient'; confidence?: { lineKey: string; assertion: string; value: number }[];
  dissent?: { member: string; note: string; citations: string[] }[]; council?: { size: number; opinions: unknown[]; disagreements: unknown[] } };
export type Session = { id: string; ctx: ReviewContext; model: string; createdAt: string; rounds: Round[]; uploads: Upload[]; unavailable: string[]; final?: FinalReport };
export type FinalReport = { at: string; aiOpinion: string; headline: string; summary: string; kams: { title: string; why: string; how: string }[];
  compliance: { standardCode: string; status: string; discussion: string }[]; adjustments: AiAdjustment[]; letter: { title: string; observation: string; effect?: string; recommendation: string; priority: string }[];
  limitations: string[]; closing: string };

const SEV: Record<string, Severity> = { 'جسيمة': 'high', 'عالية': 'high', 'متوسطة': 'medium', 'منخفضة': 'low', high: 'high', medium: 'medium', low: 'low' };
const KIND: Record<string, Finding['kind']> = { 'تصنيف': 'classification', 'قياس': 'measurement', 'إفصاح': 'disclosure', 'اكتمال': 'completeness', 'تحليلي': 'analytical', 'غش': 'fraud', 'استمرارية': 'going-concern' };
const str = (v: unknown, max = 4000) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const arr = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export function newSession(ctx: ReviewContext, model = DEFAULT_MODEL, now = new Date()): Session {
  return { id: 'rv-' + now.getTime().toString(36), ctx, model, createdAt: now.toISOString(), rounds: [], uploads: [], unavailable: [] };
}

/* ---------- prompts ---------- */
export function systemPrompt(ctx: ReviewContext): string {
  const egypt = ctx.framework === 'EAS';
  const fw = egypt ? 'معايير المحاسبة المصرية الصادرة بقرارات وزير الاستثمار وتعديلاتها، وقانون الضريبة على الدخل 91 لسنة 2005 (22.5%)، وقانون الضريبة على القيمة المضافة 67 لسنة 2016 (14%)، وقانون الشركات 159 لسنة 1981؛ والمراجعة وفق معايير المراجعة المصرية المتسقة مع ISA'
    : ctx.framework === 'SME' ? 'المعيار الدولي للتقرير المالي للمنشآت الصغيرة ومتوسطة الحجم المعتمد في المملكة (SOCPA)' : 'المعايير الدولية للتقرير المالي المعتمدة في المملكة العربية السعودية والمعايير والإصدارات الأخرى المعتمدة من الهيئة السعودية للمراجعين والمحاسبين (SOCPA)';
  const codes = STANDARDS.filter((s) => (egypt ? s.family !== 'SAUDI' && s.family !== 'IFRS' && s.family !== 'IAS' : s.family !== 'EAS' && s.family !== 'EGYPT') && s.status !== 'replaced').map((s) => s.code).join('، ');
  return [
    'أنت «مجلس المراجعة» في تطبيق SQC: ثلاثة مراجعين مستقلين بصوت موحد:',
    '- المراجع الفني المحاسبي: التبويب والقياس والعرض.',
    '- مراجع الامتثال للمعايير والإفصاح: ملاءمة المعيار لكل حساب وكفاية الإفصاح والمستندات النظامية.',
    '- مدقق المخاطر والأدلة: المخاطر الجوهرية (ISA 315/330) وكفاية الأدلة (ISA 500) ومؤشرات الغش (ISA 240) والاستمرارية (ISA 570).',
    `المنشأة: ${ctx.company || 'غير مسماة'} — النشاط: ${ctx.activity || 'غير محدد'} — الفترة: ${ctx.period || 'غير محددة'} — العملة: ${ctx.currency || (egypt ? 'الجنيه المصري' : 'الريال السعودي')}.`,
    `الإطار: ${fw}.`,
    'قواعد ملزمة:',
    `1) استخدم رموز المعايير كما هي من هذه القائمة فقط: ${codes}. لا تخترع معايير أو فقرات.`,
    '2) في accountStandards أكّد أو صحّح المعايير المقترحة لكل حساب مؤثر، واذكر في note علاقة المعيار بالحساب في جملة.',
    '3) الأرقام في الميزان ومخرجات المحرك الآلي صحيحة حسابياً؛ لا تُعد جمعها، وركز على الحكم المهني: التبويب والقياس والاكتمال والإفصاح.',
    '4) اطلب المستندات بعناوين عملية قابلة للتوريد (مثل «كشف حساب بنكي في 31/12 مع التسوية البنكية»)، وأرقام الطلبات REQ-n متسلسلة ومحفوظة بين الجولات؛ لا تكرر طلباً قائماً.',
    '5) عند مراجعة المستندات المرفوعة: اربط كل ملف بطلبه، وحكمك «مقبول» أو «غير كافٍ» (مع ما ينقص) أو «مرفوض» (مع السبب)، واستخرج التاريخ والمبلغ والضريبة والرقم الضريبي والطرف المقابل إن وجدت.',
    '6) قيود التسوية المقترحة: متوازنة، مبالغها بالريال، وأرقام حساباتها من الميزان (أو NEW-… لحساب جديد مع اسمه)، ولكل قيد معياره وسببه. لا تقترح قيداً بلا أساس رقمي.',
    '7) status = complete فقط إذا لم تبق مستندات مطلوبة ولا ملاحظات جوهرية معلقة؛ وإلا needs_docs.',
    '8) اكتب بالعربية الفصحى المهنية الموجزة. لا تضع أي بيانات خارج مخطط JSON.',
  ].join('\n');
}

const sar = (m: Minor) => formatMinor(m, { decimals: 0 });

/** The trial balance and the engine's review, compact enough for one prompt. */
export function describeReview(tb: TrialBalance, review: Review): string {
  const rows = review.accounts.map((a) => [a.code, a.name, TYPE_LABELS[a.type], a.lineAr, sar(a.natural), a.prior === null ? '' : sar(a.prior), a.standards.map((s) => s.code).join('+')].join(' | '));
  const m = review.materiality, k = review.fs.keys;
  return [
    'ميزان المراجعة (رقم | اسم | نوع | بند القوائم | الرصيد بطبيعته | السابق | المعايير المقترحة):',
    ...rows,
    `التوازن: ${tb.balanced ? 'متوازن' : 'غير متوازن بفرق ' + sar(tb.difference)}.`,
    `الأهمية النسبية: ${sar(m.overall)} (${m.benchmarkAr} × ${m.rate * 100}%) — التنفيذية ${sar(m.performance)} — حد التفاهة ${sar(m.trivial)}.`,
    `الإيرادات ${sar(k.revenue.current)} · الربح التشغيلي ${sar(k.operating.current)} · صافي الربح ${sar(k.profit.current)} · الموجودات ${sar(k.assets.current)} · حقوق الملكية ${sar(k.equity.current)}.`,
    'ملاحظات المحرك الآلي (أكدها أو فندها):',
    ...review.findings.map((f) => `${f.id} [${f.severity}] ${f.title} — ${f.basis} — ${f.standard}`),
    'قيود المحرك المقترحة:', ...review.adjustments.map((a) => `${a.id} ${a.title}: ` + a.lines.map((l) => `${l.code} ${l.name} م${sar(l.debit)} د${sar(l.credit)}`).join('؛ ')),
  ].join('\n');
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

/** Outstanding requests: asked in any round, not yet accepted, not marked unavailable. */
export function outstanding(s: Session): DocRequest[] {
  const all = new Map<string, DocRequest>();
  for (const r of s.rounds) for (const q of r.requests) all.set(q.id, q);
  const accepted = new Set(s.rounds.flatMap((r) => r.reviewed.filter((d) => d.verdict === 'مقبول').map((d) => d.requestId)));
  return [...all.values()].filter((q) => !accepted.has(q.id) && !s.unavailable.includes(q.id));
}
/** Uploaded since the last round and therefore not reviewed yet. */
export function pendingUploads(s: Session): Upload[] {
  const next = s.rounds.length + 1;
  return s.uploads.filter((u) => u.round === next);
}

export function buildRoundBody(s: Session, tb: TrialBalance, review: Review, opts: { temperature?: number; council?: string } = {}) {
  const no = s.rounds.length + 1, parts: Part[] = [];
  parts.push({ text: `الجولة رقم ${no}.` });
  parts.push({ text: describeReview(tb, review) });
  if (s.rounds.length) {
    const last = s.rounds[s.rounds.length - 1];
    parts.push({ text: ['ملخص الجولات السابقة:', ...s.rounds.map((r) => `الجولة ${r.no}: ${r.status} — ${r.summary.slice(0, 600)}`),
      'الطلبات القائمة: ' + (outstanding(s).map((q) => `${q.id} ${q.title}`).join('؛ ') || 'لا شيء'),
      'الطلبات التي أفادت الإدارة بعدم توفرها: ' + (s.unavailable.join('، ') || 'لا شيء'),
      'ملاحظاتك السابقة: ' + last.findings.map((f) => `${f.title} (${f.standard})`).join('؛ ')].join('\n') });
  }
  const up = pendingUploads(s);
  if (up.length) {
    parts.push({ text: `المستندات المرفوعة في هذه الجولة (${up.length}):` });
    for (const u of up) {
      parts.push({ text: `— المستند «${u.fileName}» استجابة للطلب ${u.requestId} (${u.mimeType}, ${Math.round(u.size / 1024)} ك.ب):` });
      if (u.data) parts.push({ inlineData: { mimeType: u.mimeType, data: u.data } }); else if (u.text) parts.push({ text: u.text.slice(0, 60000) });
    }
  }
  if (opts.council) parts.push({ text: 'أنت رئيس المجلس في هذه الجولة. آراء الأعضاء بعد التحقق الآلي من استشهاداتهم وسجل الأدلة المرقمة:\n' + opts.council +
    '\nاستشهد في كل ملاحظة وطلب بأرقام الأدلة من السجل فقط، وحدد لكل طلب البند والتأكيد والعبء على العميل، واملأ decision وconfidence وdissent (الآراء المخالفة غير المحسومة).' });
  parts.push({ text: no === 1 ? 'راجع الميزان وأكد المعايير لكل حساب واكتشف الأخطاء واطلب المستندات اللازمة.' : 'راجع المستندات المرفوعة مقابل طلباتها، وحدّث الملاحظات، واطلب ما يلزم، أو أعلن اكتمال المراجعة.' });
  return { systemInstruction: { parts: [{ text: systemPrompt(s.ctx) }] }, contents: [{ role: 'user', parts }],
    generationConfig: { temperature: opts.temperature ?? 0.2, responseMimeType: 'application/json', responseSchema: ROUND_SCHEMA } };
}

/* ---------- responses ---------- */
export function extractText(api: unknown): { text: string; finishReason: string | null; blocked: boolean } {
  const a = api as { candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]; promptFeedback?: { blockReason?: string } };
  const c = a?.candidates?.[0];
  const text = (c?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  return { text, finishReason: c?.finishReason ?? null, blocked: !!a?.promptFeedback?.blockReason || c?.finishReason === 'SAFETY' };
}
export function parseJsonLoose(text: string): unknown {
  const t = String(text || '').replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(t); } catch { /* fall through */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch { return null; } }
  return null;
}

function adjFrom(raw: unknown, i: number, round: number, tb: TrialBalance, prefix: string): AiAdjustment {
  const r = (raw ?? {}) as Record<string, unknown>;
  const lines = arr<Record<string, unknown>>(r.lines).map((l) => ({ code: str(l.accountCode, 40) || 'NEW', name: str(l.accountName, 200), debit: Math.abs(parseMinor(l.debit) ?? 0), credit: Math.abs(parseMinor(l.credit) ?? 0) }));
  const a: Adjustment = { id: `${prefix}${round}-${i + 1}`, title: str(r.title, 200) || 'قيد تسوية', reason: str(r.reason, 1000), standard: normalizeCode(str(r.standardCode, 60)) ?? str(r.standardCode, 60), lines, estimate: false, source: 'gemini', round };
  const v = validateAdjustment(a, tb);
  const problems = [...v.problems, ...(v.balanced ? [] : [`القيد غير متوازن: مدين ${sar(v.debit)} ودائن ${sar(v.credit)}`])];
  return { ...a, valid: v.valid, problems, newAccounts: v.newAccounts };
}

/** Normalize one Gemini round into the app's types; never trusts the model's arithmetic or codes. */
export function normalizeRound(raw: unknown, s: Session, tb: TrialBalance, model: string, now = new Date(), evidenceIds?: Set<string>): Round {
  const r = (raw ?? {}) as Record<string, unknown>, no = s.rounds.length + 1, warnings: string[] = [];
  /* mandatory citation: only numbered evidence that exists is kept; the rest is reported */
  const cite = (v: unknown, where: string) => { const list = arr<string>(v).map((c) => str(c, 40)).filter(Boolean); if (!evidenceIds) return list;
    const bad = list.filter((c) => !evidenceIds.has(c)); if (bad.length) warnings.push(`استشهاد بدليل غير موجود في ${where}: ${bad.join('، ')} — حُذف.`); return list.filter((c) => evidenceIds.has(c)); };
  const codes = new Set(tb.rows.map((x) => x.code));
  const accountStandards: Round['accountStandards'] = {};
  for (const x of arr<Record<string, unknown>>(r.accountStandards)) {
    const code = str(x.accountCode, 40); if (!code) continue;
    if (!codes.has(code)) { warnings.push(`تجاهل معايير لحساب غير موجود في الميزان: ${code}`); continue; }
    const list = arr<string>(x.standards).map((c) => str(c, 60)).filter(Boolean);
    accountStandards[code] = { standards: list.map((c) => normalizeCode(c)).filter((c): c is string => !!c).filter((c, i, a) => a.indexOf(c) === i), unknown: list.filter((c) => !normalizeCode(c)), note: str(x.note, 600) };
  }
  let fseq = 0;
  const findings: Finding[] = arr<Record<string, unknown>>(r.findings).slice(0, 30).map((f) => {
    const code = str(f.accountCode, 40), std = str(f.standardCode, 60), amount = parseMinor(f.amount);
    return { id: `G${no}-${++fseq}`, severity: SEV[str(f.severity, 20)] ?? 'medium', kind: KIND[str(f.issueType, 20)] ?? 'measurement',
      code: codes.has(code) ? code : undefined, account: str(f.accountName, 200), standard: normalizeCode(std) ?? (std || 'IAS 1'),
      title: str(f.comment, 160).split(/[.،؛]/)[0] || 'ملاحظة', detail: str(f.comment, 2000), basis: amount ? 'المبلغ المتأثر ' + sar(amount) + (s.ctx.framework === 'EAS' ? ' ج.م' : ' ر.س') : 'حكم مهني',
      action: str(f.recommendation, 1000), source: 'gemini' as const, round: no, citations: cite(f.citations, 'ملاحظة') };
  });
  const existing = new Map<string, DocRequest>(); s.rounds.forEach((x) => x.requests.forEach((q) => existing.set(q.id, q)));
  let next = existing.size + 1;
  const requests: DocRequest[] = [];
  for (const q of arr<Record<string, unknown>>(r.requestedDocuments).slice(0, 20)) {
    const title = str(q.title, 300); if (!title) continue;
    let id = str(q.id, 20).toUpperCase().replace(/\s+/g, '');
    const same = [...existing.values()].find((e) => e.title === title);
    if (same) { if (!requests.some((x) => x.id === same.id)) requests.push(same); continue; }
    if (!/^REQ-\d+$/.test(id) || existing.has(id) || requests.some((x) => x.id === id)) id = 'REQ-' + next;
    next = Math.max(next, Number(id.slice(4)) + 1);
    const assertion = str(q.assertion, 20), effort = str(q.effort, 10), lineKey = str(q.lineKey, 40);
    requests.push({ id, title, purpose: str(q.purpose, 600), accounts: arr<string>(q.relatedAccounts).map((c) => str(c, 40)).filter(Boolean), standard: normalizeCode(str(q.standardCode, 60)) ?? 'ISA 500',
      priority: (['عالية', 'متوسطة', 'منخفضة'] as const).find((p) => p === str(q.priority, 20)) ?? 'متوسطة', source: 'gemini', round: no,
      ...(lineKey ? { lineKey } : {}), ...(assertion ? { assertion } : {}), ...(['low', 'medium', 'high'].includes(effort) ? { effort: effort as 'low' | 'medium' | 'high' } : {}), ...(q.citations ? { citations: cite(q.citations, 'طلب') } : {}) });
  }
  const up = pendingUploads(s);
  const reviewed: ReviewedDoc[] = arr<Record<string, unknown>>(r.documentsReviewed).map((d) => {
    const fileName = str(d.fileName, 300), match = up.find((u) => u.fileName === fileName) ?? up.find((u) => fileName && (u.fileName.includes(fileName) || fileName.includes(u.fileName)));
    const verdict = (['مقبول', 'غير كافٍ', 'مرفوض'] as const).find((v) => v === str(d.verdict, 20)) ?? 'غير كافٍ';
    const ex = (d.extracted ?? {}) as Record<string, unknown>;
    return { requestId: match?.requestId ?? str(d.requestId, 20), fileName: match?.fileName ?? fileName, verdict, notes: str(d.notes, 2000), extracted: Object.fromEntries(Object.entries(ex).map(([k, v]) => [k, str(v, 200)]).filter(([, v]) => v)) };
  });
  for (const u of up) if (!reviewed.some((d) => d.fileName === u.fileName)) warnings.push(`لم يعلّق المجلس على المستند «${u.fileName}»؛ سيبقى الطلب ${u.requestId} قائماً.`);
  const adjustments = arr(r.proposedAdjustments).slice(0, 15).map((a, i) => adjFrom(a, i, no, tb, 'G'));
  for (const a of adjustments) if (!a.valid) warnings.push(`القيد «${a.title}» لم يُقبل آلياً: ${a.problems.join('، ') || 'بيانات ناقصة'}.`);
  let status: Round['status'] = str(r.status, 20) === 'complete' ? 'complete' : 'needs_docs';
  const newAsks = requests.filter((q) => q.round === no);
  if (status === 'complete' && newAsks.length) { status = 'needs_docs'; warnings.push('أعلن المجلس الاكتمال مع طلب مستندات جديدة؛ اعتُبرت الجولة غير مكتملة.'); }
  if (status === 'needs_docs' && !requests.length && !outstanding({ ...s, rounds: [...s.rounds] }).length) warnings.push('لا توجد طلبات قائمة؛ يمكن إصدار التقرير النهائي.');
  const score = Number(r.riskScore);
  return { no, at: now.toISOString(), model, status, summary: str(r.executiveSummary, 4000), riskScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 50,
    opinions: arr<Record<string, unknown>>(r.boardOpinions).map((o) => ({ reviewer: str(o.reviewer, 80), opinion: str(o.opinion, 2000) })).filter((o) => o.opinion),
    accountStandards, findings, requests, reviewed, adjustments, guidance: str(r.nextStepGuidance, 2000), warnings,
    ...(r.decision ? { decision: (['request_more_evidence', 'escalate', 'sufficient'] as const).find((d) => d === str(r.decision, 30)) ?? 'request_more_evidence' } : {}),
    ...(r.confidence ? { confidence: arr<Record<string, unknown>>(r.confidence).map((c) => ({ lineKey: str(c.lineKey, 40), assertion: str(c.assertion, 20), value: Math.max(0, Math.min(1, Number(c.value) || 0)) })).filter((c) => c.lineKey) } : {}),
    ...(r.dissent ? { dissent: arr<Record<string, unknown>>(r.dissent).map((x) => ({ member: str(x.member, 80), note: str(x.note, 800), citations: cite(x.citations, 'رأي مخالف') })).filter((x) => x.note) } : {}) };
}

export function addRound(s: Session, round: Round): Session { return { ...s, rounds: [...s.rounds, round] }; }
export function addUpload(s: Session, u: Omit<Upload, 'round'>): Session { return { ...s, uploads: [...s.uploads, { ...u, round: s.rounds.length + 1 }] }; }
export function markUnavailable(s: Session, requestId: string): Session { return s.unavailable.includes(requestId) ? s : { ...s, unavailable: [...s.unavailable, requestId] }; }

export function sessionState(s: Session, maxRounds = MAX_ROUNDS): { state: 'start' | 'awaiting-docs' | 'ready' | 'complete' | 'limit' | 'final'; label: string } {
  if (s.final) return { state: 'final', label: 'صدر التقرير النهائي' };
  if (!s.rounds.length) return { state: 'start', label: 'جاهز للجولة الأولى' };
  const last = s.rounds[s.rounds.length - 1];
  if (last.status === 'complete' && !outstanding(s).length) return { state: 'complete', label: 'اكتملت المراجعة — أصدر التقرير' };
  if (s.rounds.length >= maxRounds) return { state: 'limit', label: `بلغت ${maxRounds} جولات — يصدر التقرير مع تسجيل القيود على النطاق` };
  if (pendingUploads(s).length) return { state: 'ready', label: `${pendingUploads(s).length} مستند جاهز لجولة المراجعة ${s.rounds.length + 1}` };
  return { state: 'awaiting-docs', label: `بانتظار ${outstanding(s).length} مستند` };
}

/** Latest view: engine findings, then Gemini's by round, de-duplicated by account + standard + title. */
export function mergedFindings(review: Review, s: Session): Finding[] {
  const out: Finding[] = [], key = (f: Finding) => (f.code ?? f.lineKey ?? '') + '|' + f.standard + '|' + f.title;
  const seen = new Set<string>();
  for (const f of [...review.findings, ...s.rounds.flatMap((r) => r.findings)]) { const k = key(f); if (seen.has(k)) continue; seen.add(k); out.push(f); }
  return out;
}
/** Standards per account after Gemini: its confirmed list replaces the engine's when present. */
export function accountStandards(review: Review, s: Session): Record<string, string[]> {
  const out: Record<string, string[]> = Object.fromEntries(review.accounts.map((a) => [a.code, a.standards.map((x) => x.code)]));
  for (const r of s.rounds) for (const [code, v] of Object.entries(r.accountStandards)) if (v.standards.length) out[code] = v.standards;
  return out;
}

/* ---------- opinion (ISA 450 / 705), derived — never taken from the model ---------- */
/** Evidence per statement line from the reviewed documents: accepted → 'accepted', insufficient → 'partial'. */
export function evidenceFromSession(review: Review, s: Session): Record<string, 'accepted' | 'partial'> {
  const reqs = new Map<string, DocRequest>(); s.rounds.forEach((r) => r.requests.forEach((q) => reqs.set(q.id, q)));
  review.requests.forEach((q) => reqs.set(q.id, q));
  const out: Record<string, 'accepted' | 'partial'> = {};
  for (const d of s.rounds.flatMap((r) => r.reviewed)) {
    const q = reqs.get(d.requestId); if (!q || d.verdict === 'مرفوض') continue;
    const lines = new Set([q.lineKey, ...review.accounts.filter((a) => q.accounts.includes(a.code)).map((a) => a.lineKey)].filter((k): k is string => !!k));
    for (const k of lines) if (d.verdict === 'مقبول') out[k] = 'accepted'; else if (!out[k]) out[k] = 'partial';
  }
  return out;
}

/* evidence per line: the council's accepted documents plus, when given, the working papers signed in the fieldwork tab */
export function mergeEvidence(...maps: Record<string, 'accepted' | 'partial'>[]): Record<string, 'accepted' | 'partial'> {
  const out: Record<string, 'accepted' | 'partial'> = {};
  for (const m of maps) for (const [k, v] of Object.entries(m)) if (v === 'accepted' || !out[k]) out[k] = v;
  return out;
}
export function deriveOpinion(tb: TrialBalance, review: Review, s: Session, accepted: Adjustment[], fieldEvidence: Record<string, 'accepted' | 'partial'> = {}) {
  const mat = review.materiality, proposed = [...review.adjustments, ...s.rounds.flatMap((r) => r.adjustments.filter((a) => a.valid))];
  const uncorrected = proposed.filter((p) => !accepted.some((a) => a.id === p.id));
  const eff = uncorrected.length ? adjustmentEffect(tb, uncorrected) : { profit: 0, assets: 0, equity: 0 };
  const misstatement = Math.max(Math.abs(eff.profit), Math.abs(eff.assets), Math.abs(eff.equity));
  const highOpen = outstanding(s).filter((q) => q.priority === 'عالية');
  const unavailHigh = s.rounds.flatMap((r) => r.requests).filter((q, i, a) => a.findIndex((x) => x.id === q.id) === i && s.unavailable.includes(q.id) && q.priority === 'عالية');
  const ev = mergeEvidence(evidenceFromSession(review, s), fieldEvidence);
  const sigUnevidenced = review.risks.filter((r) => r.significant && !ev[r.lineKey]).length;
  const lineOf = (q: DocRequest) => q.lineKey ?? review.accounts.find((a) => q.accounts.includes(a.code))?.lineKey ?? null;
  const blockedSig = new Set(unavailHigh.map(lineOf).filter((k) => k && review.risks.some((r) => r.lineKey === k && r.significant)));
  const basis: string[] = [], material = misstatement > mat.overall, pervasive = misstatement > mat.overall * 5, cs = s.ctx.framework === 'EAS' ? 'ج.م' : 'ر.س';
  if (uncorrected.length) basis.push(`تحريفات غير مصححة (${uncorrected.length} قيد) أثرها ${sar(misstatement)} ${cs} مقابل أهمية نسبية ${sar(mat.overall)} ${cs} (ISA 450).`);
  if (unavailHigh.length) basis.push(`تعذر الحصول على ${unavailHigh.length} مستند عالي الأولوية: ` + unavailHigh.map((q) => q.title).join('، ') + '.');
  const scopePervasive = unavailHigh.length >= 3 || blockedSig.size >= 3;
  if (sigUnevidenced) basis.push(`${sigUnevidenced} خطر جوهري دون دليل مقبول بعد؛ يستكمل قبل التوقيع (ISA 330).`);
  const goingConcern = review.findings.some((f) => f.kind === 'going-concern' && f.severity === 'high');
  let opinion: 'unmodified' | 'qualified' | 'adverse' | 'disclaimer' = 'unmodified', isa = 'ISA 700';
  if (scopePervasive) { opinion = 'disclaimer'; isa = 'ISA 705.9'; }
  else if (material && pervasive) { opinion = 'adverse'; isa = 'ISA 705.8'; }
  else if (material || unavailHigh.length) { opinion = 'qualified'; isa = 'ISA 705.7'; }
  const ar = { unmodified: 'رأي غير معدل', qualified: 'رأي متحفظ', adverse: 'رأي عكسي', disclaimer: 'امتناع عن إبداء الرأي' }[opinion];
  if (!basis.length) basis.push('لا توجد تحريفات جوهرية غير مصححة ولا قيود على النطاق في حدود الأدلة المستلمة.');
  if (highOpen.length && opinion === 'unmodified') basis.push(`تنبيه: ${highOpen.length} طلب عالي الأولوية لم يُستوفَ بعد؛ الرأي مشروط باستيفائه قبل التوقيع.`);
  return { opinion, ar, isa, basis, misstatement, goingConcern, requiresPartner: true };
}

export function buildFinalBody(s: Session, tb: TrialBalance, review: Review, derived: ReturnType<typeof deriveOpinion>) {
  const parts: Part[] = [
    { text: describeReview(tb, review) },
    { text: ['سجل الجولات:', ...s.rounds.map((r) => `الجولة ${r.no} (${r.status}): ${r.summary.slice(0, 800)}`),
      'المستندات المقبولة: ' + (s.rounds.flatMap((r) => r.reviewed.filter((d) => d.verdict === 'مقبول').map((d) => d.requestId + ' ' + d.fileName)).join('؛ ') || 'لا شيء'),
      'غير المتوفرة: ' + (s.unavailable.join('، ') || 'لا شيء'),
      'ملاحظات المجلس: ' + s.rounds.flatMap((r) => r.findings).map((f) => `${f.title} (${f.standard}, ${f.severity})`).join('؛ '),
      `الرأي المشتق آلياً وفق ISA 705: ${derived.ar} — ${derived.basis.join(' ')}`].join('\n') },
    { text: 'أصدر التقرير النهائي: الملخص، الأمور الرئيسية للمراجعة (ISA 701)، مناقشة الامتثال لكل معيار مؤثر، قيود التسوية النهائية المقترحة، خطاب الإدارة (لكل ملاحظة: الملاحظة، الأثر المالي أو الرقابي، التوصية)، والقيود على النطاق. اتسق مع الرأي المشتق ما لم تذكر سبباً مهنياً للاختلاف.' },
  ];
  return { systemInstruction: { parts: [{ text: systemPrompt(s.ctx) }] }, contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema: FINAL_SCHEMA } };
}

export function normalizeFinal(raw: unknown, s: Session, tb: TrialBalance, now = new Date()): FinalReport {
  const r = (raw ?? {}) as Record<string, unknown>;
  return { at: now.toISOString(), aiOpinion: str(r.overallOpinion, 40), headline: str(r.headline, 300), summary: str(r.summary, 6000),
    kams: arr<Record<string, unknown>>(r.keyAuditMatters).map((k) => ({ title: str(k.title, 200), why: str(k.why, 2000), how: str(k.how, 2000) })).filter((k) => k.title),
    compliance: arr<Record<string, unknown>>(r.complianceDiscussion).map((c) => ({ standardCode: normalizeCode(str(c.standardCode, 60)) ?? str(c.standardCode, 60), status: str(c.status, 30), discussion: str(c.discussion, 3000) })).filter((c) => c.standardCode),
    adjustments: arr(r.adjustments).slice(0, 20).map((a, i) => adjFrom(a, i, s.rounds.length + 1, tb, 'F')),
    letter: arr<Record<string, unknown>>(r.managementLetter).map((m) => ({ title: str(m.title, 200), observation: str(m.observation, 2000), effect: str(m.effect, 2000) || undefined, recommendation: str(m.recommendation, 2000), priority: str(m.priority, 20) })).filter((m) => m.title),
    limitations: arr(r.limitations).map((x) => str(x, 600)).filter(Boolean), closing: str(r.closingStatement, 2000) };
}

/** Test call body for the key check. */
export const PING_BODY = { contents: [{ role: 'user', parts: [{ text: 'أجب بكلمة واحدة فقط: جاهز' }] }], generationConfig: { temperature: 0 } };

export function friendlyError(status: number, message = ''): string {
  if (status === 400 && /api key not valid|API_KEY_INVALID/i.test(message)) return 'مفتاح API غير صالح — تحقق منه.';
  if (status === 400) return 'رفض الطلب (400): ' + (message || 'صيغة غير مقبولة') + '.';
  if (status === 403) return 'المفتاح مرفوض أو غير مصرح له بهذا النموذج (403).';
  if (status === 404) return 'النموذج غير متاح لهذا المفتاح (404) — اختر نموذجاً آخر من القائمة.';
  if (status === 413) return 'حجم المستندات أكبر من المسموح في طلب واحد — ارفعها على جولات.';
  if (status === 429) return 'تجاوزت حصة الاستخدام (429) — انتظر قليلاً أو اختر نموذجاً أخف.';
  if (status >= 500) return 'خطأ مؤقت من خدمات Google (' + status + ') — أعد المحاولة.';
  if (status === 0) return 'تعذر الاتصال — تحقق من الشبكة أو من مانع يحجب generativelanguage.googleapis.com.';
  return 'خطأ ' + status + (message ? ': ' + message : '');
}
