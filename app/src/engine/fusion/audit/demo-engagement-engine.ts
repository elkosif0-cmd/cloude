/* A demonstration engagement without an AI key: the rounds an audit council would hold, written by the engine from
   the file's own review — so a bundle company (or any trial balance) can be walked from the first requests to the
   report in one run, to show what the app does.
     round1()     the council's first round: its reading of the risks, the findings, the documents it requests
                  (the engine's requests and the global auditors' opening requests), confidence per risky line
     documents()  what the client sends back for each request: a text document with the figures of the trial
                  balance (the bank confirmation, the stock count, the debtors' confirmations…)
     round2()     a simulated document workflow with a follow-up request; no professional acceptance
     round3()     the simulated follow-up; assurance remains not assessed
     final()      a clearly marked simulation result, never an earned opinion or management letter
   Every object is in the shape the AI reviewer returns (ai-review-engine ROUND_SCHEMA / FINAL_SCHEMA), so the same
   normalizeRound / normalizeFinal guard rails apply. The documents say they are demonstration documents. */
import { formatMinor, type Minor } from '../reports/money-engine';
import { REVIEWERS } from './ai-review-engine';
import type { DocRequest, Finding, Review } from './tb-review-engine';

export type DemoCtx = { company: string; periodEnd?: string; currency?: string; auditFirm?: string };
export type DemoUpload = { origin: 'simulation'; requestId: string; fileName: string; text: string };
type Raw = Record<string, unknown>;
const SIMULATION_NOTICE='محاكاة فقط: المستندات مصطنعة ولا تثبت تنفيذ إجراءات مهنية أو كفاية الأدلة أو استحقاق رأي.';
function simulationRound(raw: Raw): Raw {
  const reviewed=Array.isArray(raw.documentsReviewed)?raw.documentsReviewed as Record<string,unknown>[]:[];
  return {...raw,origin:'simulation',status:'needs_docs',executiveSummary:SIMULATION_NOTICE,
    boardOpinions:REVIEWERS.map(reviewer=>({reviewer,opinion:SIMULATION_NOTICE})),
    documentsReviewed:reviewed.map(d=>({...d,origin:'simulation',verdict:'غير كافٍ',notes:SIMULATION_NOTICE,extracted:{}})),
    findings:[],proposedAdjustments:[],confidence:[],decision:'escalate',nextStepGuidance:SIMULATION_NOTICE};
}

const SEV_AR: Record<string, string> = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
const KIND_AR: Record<string, string> = { classification: 'تصنيف', measurement: 'قياس', disclosure: 'إفصاح', completeness: 'اكتمال', analytical: 'تحليلي', fraud: 'غش', 'going-concern': 'استمرارية', balance: 'أخرى' };
const PRIO: Record<string, number> = { 'عالية': 0, 'متوسطة': 1, 'منخفضة': 2 };

function money(m: Minor, cur?: string) { return formatMinor(Math.round(m), { decimals: 0 }) + (cur ? ' ' + cur : ''); }
function addDays(iso: string | undefined, n: number) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return '';
  const d = new Date(iso.slice(0, 10) + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}
/* the requests the council asks first: high priority first, the significant risks covered, at most max */
export function firstRequests(review: Review, extra: DocRequest[] = [], max = 8): DocRequest[] {
  const sig = new Set(review.risks.filter((r) => r.significant).map((r) => r.lineKey));
  const all = [...review.requests, ...extra.filter((q) => !review.requests.some((x) => x.title === q.title))];
  return all.slice().sort((a, b) => (PRIO[a.priority] ?? 1) - (PRIO[b.priority] ?? 1) || Number(!sig.has(a.lineKey ?? '')) - Number(!sig.has(b.lineKey ?? ''))).slice(0, max);
}
const lineOf = (review: Review, q: DocRequest) => q.lineKey ?? review.accounts.find((a) => q.accounts.includes(a.code))?.lineKey ?? '';
const amountOf = (review: Review, q: DocRequest) => {
  const acc = review.accounts.filter((a) => q.accounts.includes(a.code));
  if (acc.length) return acc.reduce((s, a) => s + Math.abs(a.natural), 0);
  const r = review.risks.find((x) => x.lineKey === lineOf(review, q));
  return r ? Math.abs(r.amount) : 0;
};
const assertionOf = (key: string) => /cash|bank|receiv/.test(key) ? 'existence' : /revenue|sales/.test(key) ? 'cutoff' : /inventor|ppe|intang|goodwill|invest/.test(key) ? 'valuation' : /payable|accru|loan|provision/.test(key) ? 'completeness' : 'accuracy';

export function round1(review: Review, ctx: DemoCtx, extra: DocRequest[] = []): Raw {
  const reqs = firstRequests(review, extra);
  const sig = review.risks.filter((r) => r.significant);
  const mat = review.materiality, cur = ctx.currency;
  const top = review.findings.slice().sort((a, b) => (a.severity === 'high' ? 0 : a.severity === 'medium' ? 1 : 2) - (b.severity === 'high' ? 0 : b.severity === 'medium' ? 1 : 2)).slice(0, 6);
  return simulationRound({
    status: 'needs_docs',
    executiveSummary: `راجع المجلس ميزان «${ctx.company}» (${review.summary.accounts} حساباً) بأهمية نسبية ${money(mat.overall, cur)} على أساس ${mat.benchmarkAr}. ` +
      (sig.length ? `المخاطر الجوهرية: ${sig.map((r) => r.ar).join('، ')}. ` : '') + `طُلب ${reqs.length} مستنداً لتغطيتها قبل إبداء الرأي.`,
    riskScore: Math.min(90, 30 + sig.length * 8 + top.filter((f) => f.severity === 'high').length * 6),
    boardOpinions: [
      { reviewer: REVIEWERS[0], opinion: `التصنيف والقياس في الميزان متسقان مع ${review.compliance.length} معياراً مؤثراً؛ ${top.length ? 'أبرز ما يحتاج دليلاً: ' + top.slice(0, 2).map((f) => f.title).join('، ') : 'لا ملاحظات جوهرية في القراءة الأولى'}.` },
      { reviewer: REVIEWERS[1], opinion: 'الإفصاحات تتطلب إثبات الأرصدة الرئيسية والأحداث اللاحقة قبل الاعتماد؛ نطلب المستندات المؤيدة لكل بند جوهري.' },
      { reviewer: REVIEWERS[2], opinion: sig.length ? `نركز الأدلة على ${sig.slice(0, 3).map((r) => r.ar).join(' و')} لأنها الأعلى خطراً وقيمة.` : 'المخاطر في الحدود المعتادة؛ نكتفي بالإجراءات الأساسية.' }
    ],
    findings: top.map((f: Finding) => ({ accountCode: f.code ?? '', accountName: f.account ?? '', standardCode: f.standard, issueType: KIND_AR[f.kind] ?? 'أخرى', severity: SEV_AR[f.severity] ?? 'متوسطة',
      comment: f.title + (f.detail ? ': ' + f.detail : ''), recommendation: f.action || 'الحصول على المستند المؤيد وتسوية الفرق' })),
    requestedDocuments: reqs.map((q, i) => ({ id: 'REQ-' + (i + 1), title: q.title, purpose: q.purpose || q.why || 'إثبات الرصيد', relatedAccounts: q.accounts, standardCode: q.standard, priority: q.priority,
      lineKey: lineOf(review, q), assertion: q.assertion || assertionOf(lineOf(review, q)), effort: q.effort || 'medium' })),
    confidence: sig.map((r) => ({ lineKey: r.lineKey, assertion: assertionOf(r.lineKey), value: 0.35 })),
    decision: 'request_more_evidence',
    nextStepGuidance: 'ارفع المستندات المطلوبة ثم شغّل الجولة التالية.'
  });
}

/* the client's reply to a request: a text document with the trial balance's figures */
function body(key: string, title: string, amount: string, ctx: DemoCtx, date: string): string {
  const pe = ctx.periodEnd || 'نهاية الفترة';
  if (/cash|bank/.test(key) || /بنك|نقد/.test(title)) return `مصادقة بنكية مستلمة مباشرة من البنك.\nالرصيد الدفتري في ${pe}: ${amount}\nالرصيد حسب البنك: ${amount}\nالفرق: لا يوجد. لا تسهيلات أو رهونات غير مفصح عنها.`;
  if (/receiv/.test(key) || /عملاء|مدين/.test(title)) return `ملخص مصادقات العملاء كما في ${pe}.\nالرصيد الإجمالي: ${amount}\nأُرسلت 25 مصادقة إيجابية تغطي 68٪ من الرصيد؛ وردت 21 مصادقة مطابقة.\nأعمار الديون مرفقة؛ 4 مصادقات لم يرد عليها بعد.`;
  if (/inventor/.test(key) || /مخزون|جرد/.test(title)) return `محضر الجرد الفعلي في ${pe} بحضور ممثل المراجع.\nقيمة المخزون الدفترية: ${amount}\nفروق الجرد: 0.3٪ سُوّيت في الدفاتر. اختبار صافي القيمة البيعية: لا انخفاض جوهري.`;
  if (/ppe|intang|goodwill|asset/.test(key) || /أصول|ممتلكات|شهرة/.test(title)) return `سجل الأصول غير المتداولة وحركتها خلال السنة.\nصافي القيمة الدفترية: ${amount}\nالإضافات مؤيدة بفواتير وعقود؛ اختبار الانخفاض في القيمة (IAS 36) لم يظهر خسارة.`;
  if (/revenue|sales/.test(key) || /إيراد|مبيعات/.test(title)) return `عينة من فواتير المبيعات حول تاريخ ${pe} (قطع الفترة).\nإجمالي الإيرادات: ${amount}\n30 فاتورة مطابقة لإشعارات التسليم والتحصيل؛ لا مبيعات مسجلة بعد نهاية الفترة ضمن الفترة.`;
  if (/payable|accru/.test(key) || /موردين|دائن|مستحق/.test(title)) return `مصادقات الموردين والبحث عن الالتزامات غير المسجلة.\nالرصيد: ${amount}\nفحصت المدفوعات اللاحقة حتى ${date}؛ لا التزامات غير مسجلة.`;
  if (/loan|borrow|lease/.test(key) || /قرض|تمويل|إيجار/.test(title)) return `عقود التمويل وجداول السداد ومصادقات الجهات الممولة.\nالرصيد القائم: ${amount}\nالتعهدات المالية مستوفاة كما في ${pe}.`;
  if (/zakat|tax/.test(key) || /زكاة|ضريب/.test(title)) return `الإقرار والربط وحساب الوعاء.\nالمخصص: ${amount}\nالربوط النهائية حتى السنة السابقة مرفقة؛ لا اعتراضات قائمة جوهرية.`;
  if (/going|continu/.test(key) || /استمرار/.test(title)) return `خطة الإدارة والتدفقات النقدية المتوقعة لاثني عشر شهراً بعد ${pe}.\nالتسهيلات غير المستخدمة كافية لتغطية الالتزامات القريبة.`;
  return `جدول تفصيلي بالرصيد مع المستندات المؤيدة.\nالرصيد: ${amount}\nمطابق للدفاتر والميزان.`;
}
export function documents(review: Review, requests: DocRequest[], ctx: DemoCtx, round = 1): DemoUpload[] {
  const date = addDays(ctx.periodEnd, 45) || new Date().toISOString().slice(0, 10);
  return requests.map((q) => {
    const key = lineOf(review, q), amt = money(amountOf(review, q), ctx.currency);
    const text = `مستند تجريبي (عرض قدرات SQC) — ليس مستنداً حقيقياً\nإلى: ${ctx.auditFirm || 'المراجع الخارجي'}\nمن: إدارة ${ctx.company}\nالموضوع: ${q.title}\nالتاريخ: ${date}\nالمرجع: DOC-${q.id}-${round}\n\n` + body(key, q.title, amt, ctx, date);
    return { origin:'simulation' as const, requestId: q.id, fileName: `${q.id}-${round}-مستند.txt`, text };
  });
}
/* which request the council finds insufficient the first time: the debtors' confirmations when asked, else revenue, else the second */
export function pickInsufficient(review: Review, requests: DocRequest[]): string | null {
  if (!requests.length) return null;
  const by = (re: RegExp) => requests.find((q) => re.test(lineOf(review, q)) || re.test(q.title));
  return (by(/receiv|عملاء|مدين/) ?? by(/revenue|إيراد|مبيعات/) ?? requests[Math.min(1, requests.length - 1)]).id;
}
export function round2(review: Review, requests: DocRequest[], uploads: DemoUpload[], ctx: DemoCtx): Raw {
  const weak = pickInsufficient(review, requests), wq = requests.find((q) => q.id === weak);
  const date = addDays(ctx.periodEnd, 45);
  const sig = review.risks.filter((r) => r.significant);
  const weakLine = wq ? lineOf(review, wq) : '';
  return simulationRound({
    status: 'needs_docs',
    executiveSummary: `راجع المجلس ${uploads.length} مستنداً: قُبل ${uploads.length - (weak ? 1 : 0)}` + (wq ? `، ووُجد «${wq.title}» غير كافٍ فطُلب استكماله.` : '.'),
    riskScore: Math.max(15, 20 + sig.length * 5),
    boardOpinions: [
      { reviewer: REVIEWERS[0], opinion: 'المستندات المقبولة تؤيد الأرصدة المسجلة دون فروق جوهرية.' },
      { reviewer: REVIEWERS[1], opinion: wq ? 'لا يكتمل الإفصاح عن ' + (wq.title) + ' قبل استكمال المستند.' : 'الإفصاحات مؤيدة.' },
      { reviewer: REVIEWERS[2], opinion: wq ? 'مصادقات لم يُرد عليها تحتاج إجراءً بديلاً (تحصيلات لاحقة أو فواتير مؤيدة) وفق ISA 505.' : 'الأدلة كافية.' }
    ],
    findings: [],
    documentsReviewed: uploads.map((u) => ({ fileName: u.fileName, requestId: u.requestId, verdict: u.requestId === weak ? 'غير كافٍ' : 'مقبول',
      notes: u.requestId === weak ? 'بعض البنود دون رد أو مستند مؤيد؛ يلزم إجراء بديل.' : 'مطابق للدفاتر والميزان؛ مستلم من مصدر مستقل أو مؤيد بمستندات.',
      extracted: { documentDate: date, reference: 'DOC-' + u.requestId + '-1', counterparty: ctx.company } })),
    requestedDocuments: wq ? [{ id: 'REQ-' + (requests.length + 1), title: 'استكمال: ' + wq.title + ' — إجراء بديل للبنود دون رد', purpose: 'التحصيلات اللاحقة والفواتير المؤيدة للبنود التي لم تُصادَق', relatedAccounts: wq.accounts,
      standardCode: 'ISA 505', priority: 'عالية', lineKey: weakLine, assertion: 'existence', effort: 'low' }] : [],
    confidence: sig.map((r) => ({ lineKey: r.lineKey, assertion: assertionOf(r.lineKey), value: r.lineKey === weakLine ? 0.55 : 0.8 })),
    decision: wq ? 'request_more_evidence' : 'sufficient',
    nextStepGuidance: wq ? 'ارفع مستند الاستكمال ثم شغّل الجولة الأخيرة.' : 'الأدلة كافية — أصدر التقرير النهائي.'
  });
}
/* the reply to the follow-up: the alternative procedure, filed against the follow-up and against the original request it completes */
export function followUpDocuments(review: Review, original: DocRequest | undefined, follow: DocRequest, ctx: DemoCtx): DemoUpload[] {
  const date = addDays(ctx.periodEnd, 60) || new Date().toISOString().slice(0, 10);
  const text = `مستند تجريبي (عرض قدرات SQC) — ليس مستنداً حقيقياً\nمن: إدارة ${ctx.company}\nالموضوع: ${follow.title}\nالتاريخ: ${date}\n\nالبنود الأربعة التي لم يُرد على مصادقاتها: حُصّلت بالكامل بعد نهاية الفترة (كشوف البنك مرفقة) ` +
    `وفواتيرها وإشعارات تسليمها مطابقة. قيمة البنود: ${money(amountOf(review, follow) * 0.08, ctx.currency)}.`;
  return [{ origin:'simulation' as const, requestId: follow.id, fileName: `${follow.id}-استكمال.txt`, text }, ...(original ? [{ origin:'simulation' as const, requestId: original.id, fileName: `${original.id}-2-مستند-مكمل.txt`, text }] : [])];
}
export function round3(review: Review, uploads: DemoUpload[], ctx: DemoCtx): Raw {
  const sig = review.risks.filter((r) => r.significant);
  return simulationRound({
    status: 'complete',
    executiveSummary: `اكتملت الأدلة: قُبل مستند الاستكمال، وغطت المستندات المقبولة ${sig.length ? 'كل المخاطر الجوهرية' : 'البنود الرئيسية'} لـ«${ctx.company}». الأدلة كافية وملائمة لإبداء الرأي.`,
    riskScore: 15,
    boardOpinions: REVIEWERS.map((r) => ({ reviewer: r, opinion: 'الأدلة كافية وملائمة؛ لا اعتراض على إصدار التقرير.' })),
    findings: [],
    documentsReviewed: uploads.map((u) => ({ fileName: u.fileName, requestId: u.requestId, verdict: 'مقبول', notes: 'الإجراء البديل كافٍ: تحصيلات لاحقة مطابقة.', extracted: { counterparty: ctx.company } })),
    requestedDocuments: [],
    confidence: sig.map((r) => ({ lineKey: r.lineKey, assertion: assertionOf(r.lineKey), value: 0.9 })),
    decision: 'sufficient',
    nextStepGuidance: 'أصدر التقرير النهائي.'
  });
}
export type DemoKam = { title: string; description?: string; why?: string; how: string };
export function final(review: Review, derived: { opinion: string; ar: string; basis: string[] }, kams: DemoKam[], ctx: DemoCtx): Raw {
  return {origin:'simulation',overallOpinion:'لم يُقيّم',headline:'محاكاة فقط — دون رأي تأكيد',summary:SIMULATION_NOTICE,
    keyAuditMatters:[],complianceDiscussion:[],adjustments:[],managementLetter:[],limitations:[SIMULATION_NOTICE],closingStatement:SIMULATION_NOTICE};
}
