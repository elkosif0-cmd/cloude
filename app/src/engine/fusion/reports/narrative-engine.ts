/* The narrative of an integrated annual report, written by the AI reviewer (Gemini, OpenAI or Claude) or, without a key,
   by this engine — to the structure and style of the 49 reports in the research bundle (reports/global-corpus-engine.ts).
     facts(input)            the fact pack: every figure the narrative may use, already formatted, with the risks, KAMs,
                             opinion, materiality, peers and capital measures of the engagement
     buildNarrativeBody(p)   the request (Gemini shape; ui/core/ai.js translates it for the other providers): the bundle's
                             section patterns and model pages, the risk catalogue, the letter topics and KAM procedures
                             counted across the bundle, and the fact pack
     normalizeNarrative(r)   the answer made safe: types, lengths, KAM titles fixed to the engagement's, risk trends checked,
                             missing sections filled from the engine's draft, and every number checked against the pack
     verifyNumbers(text, p)  numbers in a text that are not in the fact pack (the AI may not invent figures)
     fallbackNarrative(p)    the engine's own complete draft (no AI)
     quality(n, p)           a score against what the bundle's reports contain, section by section
   The narrative is a draft for management and the engagement partner; the opinion is never the AI's (ISA 700/705). */
import { formatMinor, type Minor } from './money-engine';
import type { FinancialStatements } from './statements-engine';
import type { Review } from '../audit/tb-review-engine';
import { precedentsFor, sectorFromActivity, SECTOR_AR } from '../audit/global-benchmarks-engine';
import { EXEMPLARS, kamProcedures, letterTopics, riskCatalogue, apms, committeeTopics, CORPUS, VIABILITY } from './global-corpus-engine';

/* ---------- the fact pack ---------- */
export type Fact = { key: string; ar: string; value: number | null; prior: number | null; change: number | null; unit: 'money' | '%' | 'x' | 'days'; text: string; priorText: string };
export type NarrativeInput = {
  fs: FinancialStatements; review: Review;
  ctx: { company: string; activity?: string; period?: string; periodEnd?: string; country?: 'SA' | 'EG'; auditFirm?: string; legalForm?: string };
  framework: 'IFRS' | 'SME' | 'EAS'; currency: string;
  opinion: { ar: string; modified: boolean; basis: string[]; goingConcern: boolean };
  kams: { title: string; description: string; how: string }[];
  adjustments?: { count: number; profitEffect: Minor };
  peers?: { ar: string; you: number | null; median: number | null; unit: string }[];
  findings?: { high: number; medium: number; low: number };
};
export type FactPack = {
  company: string; activity: string; period: string; periodEnd: string; country: 'SA' | 'EG'; currency: string; framework: string; taxWord: string;
  sector: string; hasPrior: boolean; facts: Fact[]; risks: { lineKey: string; ar: string; amount: string; risk: string; score: number }[];
  kams: { title: string; description: string; how: string }[]; opinion: NarrativeInput['opinion'];
  materiality: { overall: string; performance: string; trivial: string; basis: string; rate: number };
  peers: { ar: string; you: string; median: string; position: string }[]; adjustments: { count: number; profitEffect: string };
  findings: { high: number; medium: number; low: number }; precedents: { line: string; theme: string; examples: string[] }[];
  allowed: number[];
};
const M = (m: Minor) => m / 100;
const pct = (a: number, b: number | null) => (b === null || b === 0 ? null : Math.round(((a - b) / Math.abs(b)) * 1000) / 10);
const r1 = (x: number) => Math.round(x * 10) / 10;
function money(m: Minor | null, cur: string) { return m === null ? '' : formatMinor(m, { decimals: 0 }) + ' ' + cur; }
/** 412,600,000 → «412.6 مليون» (the way the bundle's letters write large figures). */
export function compact(major: number, cur: string): string {
  /* negatives in parentheses, the accounting convention (a leading minus sign flips place in Arabic text) */
  const a = Math.abs(major), w = (t: string) => (major < 0 ? '(' + t + ')' : t);
  if (a >= 1e9) return w(r1(a / 1e9) + ' مليار ' + cur);
  if (a >= 1e6) return w(r1(a / 1e6) + ' مليون ' + cur);
  if (a >= 1e3) return w(Math.round(a / 1e3).toLocaleString('en-US') + ' ألف ' + cur);
  return w(Math.round(a).toLocaleString('en-US') + ' ' + cur);
}

export function facts(i: NarrativeInput): FactPack {
  const fs = i.fs, k = fs.keys, cur = i.currency, g = (x: string) => k[x]?.current ?? 0, gp = (x: string) => (fs.hasPrior ? k[x]?.prior ?? null : null);
  const out: Fact[] = [];
  const addMoney = (key: string, ar: string, c: Minor, p: Minor | null) => out.push({ key, ar, value: M(c), prior: p === null ? null : M(p), change: pct(c, p), unit: 'money', text: compact(M(c), cur), priorText: p === null ? '' : compact(M(p), cur) });
  const addRatio = (key: string, ar: string, c: number | null, p: number | null, unit: Fact['unit']) => out.push({ key, ar, value: c, prior: p, change: null, unit,
    text: c === null ? '—' : unit === '%' ? c + '%' : unit === 'x' ? c + ' مرة' : c + ' يوماً', priorText: p === null ? '' : unit === '%' ? p + '%' : unit === 'x' ? p + ' مرة' : p + ' يوماً' });
  addMoney('revenue', 'الإيرادات', g('revenue'), gp('revenue'));
  addMoney('gross', 'مجمل الربح', g('gross'), gp('gross'));
  addMoney('operating', 'الربح التشغيلي', g('operating'), gp('operating'));
  addMoney('pbz', i.ctx.country === 'EG' ? 'الربح قبل الضريبة' : 'الربح قبل الزكاة', g('pbz'), gp('pbz'));
  addMoney('profit', 'صافي الربح', g('profit'), gp('profit'));
  const da = g('depreciation'), daP = gp('depreciation');
  addMoney('ebitda', 'الربح قبل الفوائد والزكاة والاستهلاك (EBITDA)', g('operating') + da, gp('operating') === null || daP === null ? null : (gp('operating') as number) + daP);
  if (k.cfo) addMoney('cfo', 'صافي النقد من الأنشطة التشغيلية', g('cfo'), null);
  if (k.capex) addMoney('capex', 'الإنفاق الرأسمالي', Math.abs(g('capex')), null);
  if (k.cfo && k.capex) addMoney('fcf', 'التدفق النقدي الحر', g('cfo') - Math.abs(g('capex')), null);
  addMoney('cash', 'النقد وما في حكمه', g('cash'), gp('cash'));
  const debt = (p: boolean) => (p ? [gp('loansCl'), gp('loansNcl'), gp('leaseNcl')] : [g('loansCl'), g('loansNcl'), g('leaseNcl')]);
  const nd = debt(false).reduce<number>((a, x) => a + (x ?? 0), 0) - g('cash'), ndP = fs.hasPrior ? debt(true).reduce<number>((a, x) => a + (x ?? 0), 0) - (gp('cash') ?? 0) : null;
  addMoney('netDebt', 'صافي الدين', nd, ndP);
  addMoney('equity', 'حقوق الملكية', g('equity'), gp('equity'));
  addMoney('assets', 'مجموع الموجودات', g('assets'), gp('assets'));
  const ratio = (a: number, b: number) => (b ? r1((a / b) * 100) : null);
  const eq = g('equity'), eqP = gp('equity');
  addRatio('grossMargin', 'هامش مجمل الربح', ratio(g('gross'), g('revenue')), fs.hasPrior ? ratio(gp('gross') ?? 0, gp('revenue') ?? 0) : null, '%');
  addRatio('operatingMargin', 'هامش الربح التشغيلي', ratio(g('operating'), g('revenue')), fs.hasPrior ? ratio(gp('operating') ?? 0, gp('revenue') ?? 0) : null, '%');
  addRatio('netMargin', 'هامش صافي الربح', ratio(g('profit'), g('revenue')), fs.hasPrior ? ratio(gp('profit') ?? 0, gp('revenue') ?? 0) : null, '%');
  addRatio('gearing', 'نسبة المديونية (صافي الدين ÷ صافي الدين وحقوق الملكية)', nd + eq ? r1((nd / (nd + eq)) * 100) : null, ndP !== null && eqP !== null && ndP + eqP ? r1((ndP / (ndP + eqP)) * 100) : null, '%');
  addRatio('roe', 'العائد على حقوق الملكية', ratio(g('profit'), eq), null, '%');
  addRatio('currentRatio', 'نسبة التداول', g('cl') ? Math.round((g('ca') / g('cl')) * 100) / 100 : null, fs.hasPrior && gp('cl') ? Math.round(((gp('ca') ?? 0) / (gp('cl') as number)) * 100) / 100 : null, 'x');
  addRatio('dso', 'أيام التحصيل', g('revenue') ? Math.round((g('receivables') / g('revenue')) * 365) : null, null, 'days');
  addRatio('dio', 'أيام المخزون', g('cogs') ? Math.round((g('inventory') / Math.abs(g('cogs'))) * 365) : null, null, 'days');
  const zakat = g('zakat');
  addMoney('zakat', i.ctx.country === 'EG' ? 'ضريبة الدخل' : 'الزكاة', zakat, gp('zakat'));
  const m = i.review.materiality, sector = sectorFromActivity(i.ctx.activity ?? '');
  const sig = i.review.risks.filter((r) => r.significant);
  const precedents = sig.slice(0, 6).flatMap((r) => precedentsFor(r.lineKey, { sector, limit: 3 }).slice(0, 1).map((p) => ({ line: r.ar, theme: p.ar, examples: p.examples.map((e) => `${e.company} (${e.fy}): «${e.title}» — ص ${e.page}`) })));
  const peers = (i.peers ?? []).filter((p) => p.you !== null && p.median !== null).map((p) => ({ ar: p.ar, you: p.you + (p.unit === '%' ? '%' : p.unit === 'x' ? '×' : ' يوم'), median: p.median + (p.unit === '%' ? '%' : p.unit === 'x' ? '×' : ' يوم'),
    position: (p.you as number) >= (p.median as number) ? 'أعلى من الوسيط' : 'أدنى من الوسيط' }));
  /* every number the narrative may write: the values, their compact forms, changes, ratios, materiality, counts */
  const allowed = new Set<number>();
  const add = (x: number | null | undefined) => { if (x === null || x === undefined || !isFinite(x)) return; allowed.add(Math.abs(x)); allowed.add(Math.abs(r1(x))); allowed.add(Math.abs(Math.round(x))); };
  for (const f of out) {
    add(f.value); add(f.prior); add(f.change);
    for (const v of [f.value, f.prior]) if (f.unit === 'money' && v !== null) { add(v / 1e6); add(v / 1e9); add(v / 1e3); }
    if (f.value !== null && f.prior !== null && f.unit !== 'money') add(r1(f.value - f.prior));
  }
  for (const x of [m.overall, m.performance, m.trivial, m.base]) { add(M(x)); add(M(x) / 1e6); add(M(x) / 1e3); }
  add(m.rate * 100); add(Math.round((m.performance / Math.max(1, m.overall)) * 100)); add(Math.round((m.trivial / Math.max(1, m.overall)) * 100));
  for (const r of i.review.risks) { add(M(r.amount)); add(M(r.amount) / 1e6); add(r.score); }
  for (const p of i.peers ?? []) { add(p.you); add(p.median); }
  add(i.adjustments?.count); if (i.adjustments) { add(M(i.adjustments.profitEffect)); add(M(i.adjustments.profitEffect) / 1e6); }
  const fnd = i.findings ?? { high: i.review.summary.high, medium: i.review.summary.medium, low: i.review.summary.low };
  add(fnd.high); add(fnd.medium); add(fnd.low); add(sig.length); add(i.kams.length);
  for (const k2 of i.kams) for (const n of numbersIn(k2.description + ' ' + k2.how)) add(n);
  /* the dates and names the narrative repeats (period end day, a number in the company name) */
  for (const n of numbersIn([i.ctx.period, i.ctx.periodEnd, i.ctx.company, i.ctx.activity].join(' '))) add(n);
  for (const x of i.opinion.basis) for (const n of numbersIn(x)) add(n);
  /* the bundle's own counts the narrative may cite (49 reports, 12,506 pages, how many reports name a risk) */
  add(CORPUS.reports); add(CORPUS.pages); for (const c of riskCatalogue()) add(c.reports); for (const t of letterTopics()) { add(t.reports); add(t.share); }
  return {
    company: i.ctx.company || 'الشركة', activity: i.ctx.activity || '', period: i.ctx.period || '', periodEnd: i.ctx.periodEnd || '', country: i.ctx.country ?? 'SA', currency: cur,
    framework: { IFRS: 'المعايير الدولية للتقرير المالي المعتمدة في المملكة العربية السعودية', SME: 'المعيار الدولي للتقرير المالي للمنشآت الصغيرة والمتوسطة', EAS: 'معايير المحاسبة المصرية' }[i.framework],
    taxWord: i.ctx.country === 'EG' ? 'الضريبة' : 'الزكاة', sector: sector ? SECTOR_AR[sector] : '', hasPrior: fs.hasPrior, facts: out,
    risks: sig.map((r) => ({ lineKey: r.lineKey, ar: r.ar, amount: money(r.amount, cur), risk: r.risk, score: r.score })),
    kams: i.kams, opinion: i.opinion,
    materiality: { overall: money(m.overall, cur), performance: money(m.performance, cur), trivial: money(m.trivial, cur), basis: m.benchmarkAr, rate: Math.round(m.rate * 1000) / 10 },
    peers, adjustments: { count: i.adjustments?.count ?? 0, profitEffect: money(i.adjustments?.profitEffect ?? 0, cur) }, findings: fnd, precedents,
    allowed: [...allowed].sort((a, b) => a - b),
  };
}
const fact = (p: FactPack, key: string) => p.facts.find((f) => f.key === key);

/* ---------- number verification ---------- */
const DIGITS: Record<string, string> = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '٫': '.', '٬': ',' };
/** Numbers written in a text, skipping standard references (IFRS 15, IAS 37, ISA 700 …), years and small counts. */
export function numbersIn(text: string): number[] {
  const t = String(text || '').replace(/[٠-٩٫٬]/g, (c) => DIGITS[c]);
  const out: number[] = [];
  const rx = /(IFRS|IAS|ISA|ISQM|IFRIC|SOCPA|AS|COSO|ISRE|SIC|ESRS|ص|صفحة|البند|الإيضاح|إيضاح|الجدول|المادة|رقم)?\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(t))) {
    if (m[1]) continue;
    const n = Number(m[2].replace(/,/g, ''));
    if (!isFinite(n)) continue;
    if (Number.isInteger(n) && n >= 1900 && n <= 2100) continue; /* years */
    if (Number.isInteger(n) && n <= 12) continue;                /* counts, months, list numbers */
    out.push(n);
  }
  return out;
}
/** Numbers in the text that the fact pack does not contain (tolerance: the rounding of the written form). */
export function verifyNumbers(text: string, p: FactPack): number[] {
  const tol = (n: number) => (Number.isInteger(n) ? Math.max(0.5, n * 0.0005) : 0.051);
  return numbersIn(text).filter((n) => !p.allowed.some((a) => Math.abs(a - n) <= tol(n)));
}

/* ---------- the narrative ---------- */
export type Trend = 'ارتفاع' | 'ثبات' | 'انخفاض';
export type Narrative = {
  chairLetter: { title: string; paragraphs: string[] };
  ceoReview: { title: string; paragraphs: string[]; kpiCommentary: { kpi: string; comment: string }[] };
  strategy: { pillars: { title: string; text: string }[] };
  performanceReview: { paragraphs: string[] };
  liquidity: { paragraphs: string[] };
  principalRisks: { intro: string; risks: { category: string; title: string; description: string; management: string; trend: Trend }[] };
  viability: { period: string; assessment: string[]; scenarios: { scenario: string; risks: string; impact: string }[]; conclusion: string };
  kams: { title: string; matter: string; procedures: string[]; disclosure: string }[];
  auditCommittee: { paragraphs: string[]; matters: { area: string; matter: string; conclusion: string }[] };
  sustainability: { paragraphs: string[] };
  outlook: { paragraphs: string[] };
  directorsResponsibilities: { paragraphs: string[] };
};
export type NarrativeResult = { narrative: Narrative; source: Record<keyof Narrative, 'ai' | 'engine'>; unverified: { section: string; numbers: number[] }[]; model?: string; at?: string };

const S = (description?: string) => ({ type: 'STRING', ...(description ? { description } : {}) });
const A = (items: object, description?: string) => ({ type: 'ARRAY', items, ...(description ? { description } : {}) });
const O = (properties: Record<string, object>, required: string[]) => ({ type: 'OBJECT', properties, required });
const PARAS = (d: string) => A(S(), d);
export const NARRATIVE_SCHEMA = O({
  chairLetter: O({ title: S(), paragraphs: PARAS('6–8 فقرات') }, ['title', 'paragraphs']),
  ceoReview: O({ title: S(), paragraphs: PARAS('5–7 فقرات'), kpiCommentary: A(O({ kpi: S(), comment: S() }, ['kpi', 'comment']), 'تعليق على 4–6 مؤشرات') }, ['title', 'paragraphs', 'kpiCommentary']),
  strategy: O({ pillars: A(O({ title: S(), text: S() }, ['title', 'text']), '3–4 محاور') }, ['pillars']),
  performanceReview: O({ paragraphs: PARAS('4–6 فقرات تحليل') }, ['paragraphs']),
  liquidity: O({ paragraphs: PARAS('2–3 فقرات') }, ['paragraphs']),
  principalRisks: O({ intro: S('شهية المخاطر وإطار إدارتها'), risks: A(O({ category: S(), title: S(), description: S(), management: S(), trend: { type: 'STRING', enum: ['ارتفاع', 'ثبات', 'انخفاض'] } }, ['category', 'title', 'description', 'management', 'trend']), '6–8 مخاطر') }, ['intro', 'risks']),
  viability: O({ period: S(), assessment: PARAS('3 أجزاء'), scenarios: A(O({ scenario: S(), risks: S(), impact: S() }, ['scenario', 'risks', 'impact']), '2–3 سيناريوهات'), conclusion: S() }, ['period', 'assessment', 'scenarios', 'conclusion']),
  kams: A(O({ title: S('نفس العنوان المعطى'), matter: S(), procedures: A(S(), '4–7 إجراءات تبدأ بفعل'), disclosure: S() }, ['title', 'matter', 'procedures', 'disclosure'])),
  auditCommittee: O({ paragraphs: PARAS('3–4 فقرات'), matters: A(O({ area: S(), matter: S(), conclusion: S() }, ['area', 'matter', 'conclusion'])) }, ['paragraphs', 'matters']),
  sustainability: O({ paragraphs: PARAS('2–3 فقرات') }, ['paragraphs']),
  outlook: O({ paragraphs: PARAS('2–3 فقرات') }, ['paragraphs']),
  directorsResponsibilities: O({ paragraphs: PARAS('4–5 فقرات') }, ['paragraphs']),
}, ['chairLetter', 'ceoReview', 'strategy', 'performanceReview', 'liquidity', 'principalRisks', 'viability', 'kams', 'auditCommittee', 'sustainability', 'outlook', 'directorsResponsibilities']);

export function packText(p: FactPack): string {
  const f = p.facts.map((x) => `- ${x.ar}: ${x.text}${x.priorText ? ` (السنة السابقة ${x.priorText}${x.change !== null ? `، التغير ${x.change > 0 ? '+' : ''}${x.change}%` : ''})` : ''}`);
  return [
    `المنشأة: ${p.company}${p.activity ? ' — ' + p.activity : ''}${p.sector ? ' (قطاع ' + p.sector + ')' : ''}. الفترة: ${p.period}. الإطار: ${p.framework}. العملة: ${p.currency}.`,
    'الأرقام (استخدمها كما هي فقط):', ...f,
    `الأهمية النسبية: ${p.materiality.overall} (${p.materiality.rate}% من ${p.materiality.basis})، التنفيذية ${p.materiality.performance}، حد الإبلاغ ${p.materiality.trivial}.`,
    `الرأي المشتق من المحرك: ${p.opinion.ar}. ${p.opinion.basis.join(' ')}${p.opinion.goingConcern ? ' توجد مؤشرات استمرارية.' : ''}`,
    `الملاحظات: ${p.findings.high} عالية، ${p.findings.medium} متوسطة، ${p.findings.low} منخفضة. قيود التسوية المعتمدة: ${p.adjustments.count} (أثرها على الربح ${p.adjustments.profitEffect}).`,
    'المخاطر الجوهرية (ISA 315):', ...p.risks.map((r) => `- ${r.ar}: ${r.amount} — ${r.risk} (درجة ${r.score})`),
    'الأمور الرئيسية للمراجعة (العناوين ثابتة):', ...p.kams.map((k, i) => `${i + 1}. ${k.title} — ${k.description} الإجراءات: ${k.how}`),
    ...(p.peers.length ? ['المقارنة بالنظراء العالميين (نسب):', ...p.peers.map((x) => `- ${x.ar}: ${x.you} مقابل وسيط ${x.median} — ${x.position}`)] : []),
    ...(p.precedents.length ? ['سوابق أمور رئيسية من تقارير عالمية للبنود نفسها (للأسلوب لا للنسخ):', ...p.precedents.map((x) => `- ${x.line} ← ${x.theme}: ${x.examples.join('؛ ')}`)] : []),
  ].join('\n');
}

export function systemInstruction(): string {
  const ex = EXEMPLARS.map((e) => `«${e.ar}»: ${e.pattern.join(' ← ')} (نماذج: ${e.sources.map((s) => `${s.report} ص ${s.page}`).join('، ')})`).join('\n');
  const lt = letterTopics().slice(0, 9).map((t) => `${t.ar} (${t.share}%)`).join('، ');
  const kp = kamProcedures().slice(0, 12).map((x) => x.text).join('؛ ');
  const rc = riskCatalogue().slice(0, 16).map((x) => x.ar).join('، ');
  const ap = apms().slice(0, 8).map((x) => x.name).join('، ');
  const ac = committeeTopics().slice(0, 8).map((x) => x.ar).join('، ');
  return [
    `أنت كاتب تقارير سنوية ومراجع قانوني أول في شركة SQC — Smart Quality Control. تكتب بالعربية الفصحى الرصينة سرد تقرير سنوي متكامل وأقسام تقرير المراجع بمستوى التقارير المنشورة عالمياً.`,
    `قرأنا حزمة البحث كاملة (${CORPUS.pages} صفحة، ${CORPUS.reports} تقريراً سنوياً من أكثر من 30 دولة) وصنّفنا كل صفحة. اتبع البنية والأسلوب المستخلصين منها:`,
    ex,
    `تغطي رسائل رؤساء المجالس والرؤساء التنفيذيين في الحزمة: ${lt}.`,
    `إجراءات المراجعة التي يكتبها المراجعون تحت الأمور الرئيسية مرتبة بعدد التقارير: ${kp}.`,
    `فئات المخاطر الرئيسية الأكثر تكراراً: ${rc}. اختر منها ما يناسب نشاط المنشأة وأرقامها فقط.`,
    `مقاييس الأداء البديلة الشائعة: ${ap}. موضوعات لجان المراجعة: ${ac}. أفق الجدوى الشائع: ثلاث سنوات (${Object.keys(VIABILITY.horizons).slice(0, 3).join('، ')}).`,
    'قواعد صارمة:',
    '1) لا تكتب أي رقم غير موجود في «الأرقام» أو في بيانات الأهمية النسبية والمخاطر والنظراء، واكتبه بالصيغة نفسها (مثل 412.6 مليون ر.س أو +17.3%). لا تحسب أرقاماً جديدة.',
    '2) لا تخترع أحداثاً أو مشاريع أو أسماء أشخاص أو عملاء أو أسواقاً أو توزيعات لم ترد. عند الحاجة اكتب بصيغة عامة («تواصل الإدارة…»).',
    '3) عناوين الأمور الرئيسية للمراجعة هي المعطاة حرفياً وبالترتيب نفسه؛ الوصف يذكر متطلب المعيار والمبلغ ولماذا يتطلب حكماً، والإجراءات 4–7 نقاط تبدأ بفعل وتنتهي بتقييم الإفصاحات.',
    '4) العبارات المستقبلية مشروطة («تتوقع الإدارة»، «تعتزم»)، ولا تعد بنتائج.',
    '5) لا تبدِ رأياً مراجعاً؛ الرأي هو المشتق من المحرك ويعتمده الشريك.',
    '6) أسلوب التقارير العالمية: جمل واضحة، أرقام مقارنة بالسنة السابقة، ربط كل خطر بإدارته واتجاهه، وربط الأداء بالاستراتيجية.',
    'أجب بكائن JSON واحد مطابق للمخطط.',
  ].join('\n');
}

export function buildNarrativeBody(p: FactPack) {
  return { systemInstruction: { parts: [{ text: systemInstruction() }] },
    contents: [{ role: 'user', parts: [{ text: packText(p) }, { text: 'اكتب السرد الكامل للتقرير السنوي المتكامل وأقسام المراجع المطلوبة في المخطط، لهذه المنشأة وبهذه الأرقام فقط.' }] }],
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json', responseSchema: NARRATIVE_SCHEMA, maxOutputTokens: 24000 } };
}

/* ---------- the engine's own draft (no AI) ---------- */
export function fallbackNarrative(p: FactPack): Narrative {
  const v = (k: string) => fact(p, k);
  const chg = (k: string) => { const f = v(k); return f && f.change !== null ? `${f.change > 0 ? 'ارتفاعاً' : 'انخفاضاً'} بنسبة ${Math.abs(f.change)}% عن ${f.priorText}` : ''; };
  const rev = v('revenue'), prof = v('profit'), op = v('operating'), fcf = v('fcf'), nd = v('netDebt'), gear = v('gearing'), gm = v('grossMargin'), cr = v('currentRatio');
  const cat0 = riskCatalogue();
  const riskRows0 = p.risks.slice(0, 7).map((r) => {
    const cat = riskCatalogue().find((c) => (r.lineKey === 'receivables' && c.key === 'credit') || (r.lineKey === 'inventory' && c.key === 'supply_chain') || ((r.lineKey === 'zakatPayable' || r.lineKey === 'zakatExpense') && c.key === 'tax') ||
      (r.lineKey === 'revenue' && c.key === 'competition') || ((r.lineKey === 'loansNcl' || r.lineKey === 'loansCl') && c.key === 'liquidity_funding') || (r.lineKey === 'eosb' && c.key === 'pension') || (r.lineKey === 'provisions' && c.key === 'legal'));
    return { key: cat?.key ?? r.lineKey, category: cat?.ar ?? 'مخاطر التقرير المالي', title: r.ar, description: `${r.risk}؛ الرصيد ${r.amount}.`, management: cat?.mitigation ?? 'ضوابط الإعداد والمراجعة الشهرية والتسويات المستقلة', trend: 'ثبات' as Trend };
  });
  /* principal risks are the business's, not only the audit's: complete them from the categories the bundle's reports name
     most often (cyber 39/49, macroeconomic 37/49, supply chain 37/49 …), with food safety for a food business */
  const food = /لحوم|اغذي|أغذي|غذائ|مواشي|دواجن|food/i.test(p.activity);
  const wanted = [...(food ? ['product_quality', 'supply_chain', 'commodity'] : ['supply_chain', 'commodity']), 'macroeconomic', 'cyber', 'regulatory', 'talent', 'business_continuity'];
  /* an audit risk becomes a principal risk only when it maps to a business-risk category */
  const riskRows = [...new Map(riskRows0.filter((r) => cat0.some((c) => c.key === r.key)).map((r) => [r.key, r])).values()];
  for (const k2 of wanted) {
    if (riskRows.length >= 7) break;
    if (riskRows.some((r) => r.key === k2)) continue;
    const c = cat0.find((x) => x.key === k2); if (!c) continue;
    riskRows.push({ key: c.key, category: c.ar, title: c.ar, description: c.description || c.ar, management: c.mitigation, trend: 'ثبات' as Trend });
  }
  return {
    chairLetter: { title: 'رسالة رئيس مجلس الإدارة', paragraphs: [
      'السادة المساهمين الكرام،',
      `يسرني أن أقدم لكم التقرير السنوي لشركتكم «${p.company}» عن ${p.period}.${rev ? ` بلغت الإيرادات ${rev.text}${chg('revenue') ? '، ' + chg('revenue') : ''}` : ''}${prof ? `، وبلغ صافي الربح ${prof.text}${chg('profit') ? '، ' + chg('profit') : ''}` : ''}.`,
      fcf ? `وولّدت أنشطتنا التشغيلية ${v('cfo')?.text ?? ''}، وبلغ التدفق النقدي الحر ${fcf.text} بعد إنفاق رأسمالي ${v('capex')?.text ?? ''} يعكس استمرار الاستثمار في الطاقة الإنتاجية.` : 'وتواصل الشركة الاستثمار في طاقتها الإنتاجية وفق خطتها المعتمدة.',
      `ويحرص المجلس على متانة المركز المالي؛ فقد بلغ صافي الدين ${nd?.text ?? '—'} ونسبة المديونية ${gear?.text ?? '—'}${gear?.priorText ? ` مقابل ${gear.priorText}` : ''}.`,
      'وأشرف المجلس ولجانه على إطار إدارة المخاطر والرقابة الداخلية، وتابعت لجنة المراجعة أعمال المراجع الخارجي واستقلاله.',
      'أتقدم بالشكر لزملائي أعضاء المجلس وللإدارة التنفيذية ولجميع العاملين على جهودهم، ولمساهمينا وعملائنا على ثقتهم.',
    ] },
    ceoReview: { title: 'مراجعة الرئيس التنفيذي', paragraphs: [
      `حققت ${p.company} خلال السنة ${rev ? `إيرادات قدرها ${rev.text}` : 'نتائج'}${op ? ` وربحاً تشغيلياً ${op.text}` : ''}${gm ? `، بهامش مجمل ربح ${gm.text}${gm.priorText ? ` مقابل ${gm.priorText}` : ''}` : ''}.`,
      'ركزنا في تنفيذ استراتيجيتنا على تنمية المبيعات مع ضبط تكاليف التشغيل وتحسين دورة رأس المال العامل.',
      v('dso')?.value ? `بلغت أيام التحصيل ${v('dso')!.text} وأيام المخزون ${v('dio')?.text ?? '—'}، ونعمل على تحسينهما ضمن أولويات السنة القادمة.` : '',
    ].filter(Boolean), kpiCommentary: ['revenue', 'operatingMargin', 'profit', 'fcf', 'gearing'].map((k) => v(k)).filter((f): f is Fact => !!f && f.value !== null).map((f) => ({ kpi: f.ar, comment: f.text + (f.priorText ? ` (السابقة ${f.priorText})` : '') })) },
    strategy: { pillars: [
      { title: 'نمو مربح', text: `تنمية الإيرادات${rev?.change ? ` (+${rev.change}% هذا العام)` : ''} مع حماية الهوامش.` },
      { title: 'كفاءة التشغيل ورأس المال العامل', text: 'خفض دورة التحصيل وتحسين دوران المخزون وضبط التكاليف.' },
      { title: 'متانة مالية', text: `الحفاظ على نسبة مديونية ${gear?.text ?? 'مناسبة'} وسيولة كافية لخطط الاستثمار.` },
      { title: 'الحوكمة والجودة والامتثال', text: 'رقابة داخلية فعالة وتقارير مالية موثوقة وفق المعايير.' }] },
    performanceReview: { paragraphs: [
      rev ? `بلغت الإيرادات ${rev.text}${chg('revenue') ? '، ' + chg('revenue') : ''}.` : '',
      gm ? `بلغ هامش مجمل الربح ${gm.text}${gm.priorText ? ` مقابل ${gm.priorText} في السنة السابقة` : ''}.` : '',
      op ? `بلغ الربح التشغيلي ${op.text}${chg('operating') ? '، ' + chg('operating') : ''}، وبلغ هامش الربح التشغيلي ${v('operatingMargin')?.text ?? '—'}.` : '',
      prof ? `بلغ صافي الربح ${prof.text} بعد ${p.taxWord} بمبلغ ${v('zakat')?.text ?? '—'}.` : '',
    ].filter(Boolean) },
    liquidity: { paragraphs: [
      `بلغ النقد وما في حكمه ${v('cash')?.text ?? '—'}، وصافي الدين ${nd?.text ?? '—'}، ونسبة التداول ${cr?.text ?? '—'}.`,
      fcf ? `بلغ صافي النقد من الأنشطة التشغيلية ${v('cfo')!.text} والتدفق النقدي الحر ${fcf.text}.` : '',
    ].filter(Boolean) },
    principalRisks: { intro: 'يتحمل مجلس الإدارة المسؤولية النهائية عن إدارة المخاطر، ويحدد شهية المخاطر التي تقبلها الشركة لتحقيق أهدافها. تُحدَّد المخاطر وتُقيَّم وتُتابع دورياً، ويُبين الجدول التالي المخاطر الرئيسية وكيفية إدارتها واتجاهها.', risks: riskRows.map(({ key: _k, ...r }) => r) },
    viability: { period: 'ثلاث سنوات', assessment: [
      'قيّم المجلس آفاق الشركة على مدى ثلاث سنوات، وهي فترة خطة الأعمال المعتمدة.',
      `شمل التقييم التمويل المتاح وآجال استحقاق القروض (صافي الدين ${nd?.text ?? '—'}) والتدفقات النقدية المتوقعة.`,
      'واختُبرت سيناريوهات شديدة ولكن معقولة مرتبطة بالمخاطر الرئيسية.'],
      scenarios: [{ scenario: 'انخفاض الطلب وضغط الأسعار', risks: 'المنافسة؛ الظروف الاقتصادية', impact: 'انخفاض الإيرادات والهوامش' }, { scenario: 'تأخر التحصيل وارتفاع تكلفة التمويل', risks: 'الائتمان؛ السيولة والتمويل؛ أسعار العمولة', impact: 'ضغط على النقد ورأس المال العامل' }],
      conclusion: p.opinion.goingConcern ? 'توجد مؤشرات تتطلب تقييماً وإفصاحاً عن عدم التأكد الجوهري المتعلق بالاستمرارية (ISA 570).' : 'بناءً على هذا التقييم، لدى المجلس توقع معقول بأن الشركة ستتمكن من الاستمرار في عملياتها والوفاء بالتزاماتها خلال فترة التقييم.' },
    kams: p.kams.map((k) => ({ title: k.title, matter: k.description, procedures: k.how.split(/؛|;/).map((x) => x.replace(/^\s*شملت إجراءاتنا:\s*/, '').trim()).filter(Boolean), disclosure: 'قيّمنا كفاية الإفصاحات ذات الصلة في القوائم المالية.' })),
    auditCommittee: { paragraphs: [
      `ناقشت اللجنة مع الإدارة والمراجع الخارجي القوائم المالية عن ${p.period} والأحكام والتقديرات المحاسبية الهامة.`,
      `اطلعت اللجنة على خطة المراجعة والأهمية النسبية المحددة بمبلغ ${p.materiality.overall}، وتحققت من استقلال المراجع الخارجي.`,
      `وتابعت اللجنة ملاحظات الرقابة الداخلية (${p.findings.high} عالية، ${p.findings.medium} متوسطة) وخطط معالجتها.`],
      matters: p.kams.map((k) => ({ area: k.title, matter: k.description, conclusion: 'اطمأنت اللجنة إلى معقولية معالجة الإدارة وكفاية الإفصاح.' })) },
    sustainability: { paragraphs: ['تلتزم الشركة بممارسات أعمال مسؤولة تشمل سلامة الغذاء وجودته، وصحة العاملين وسلامتهم، وترشيد استهلاك الطاقة والمياه.'] },
    outlook: { paragraphs: ['تتوقع الإدارة استمرار الطلب على منتجات الشركة، وتعتزم مواصلة تحسين الكفاءة ورأس المال العامل. تخضع هذه التوقعات لمخاطر وعدم تأكد قد يجعل النتائج الفعلية مختلفة.'] },
    directorsResponsibilities: { paragraphs: [
      `مجلس الإدارة مسؤول عن إعداد القوائم المالية وعرضها بعدل وفقاً لـ${p.framework}.`,
      'ويشمل ذلك اختيار السياسات المحاسبية المناسبة وتطبيقها باتساق، وإجراء تقديرات معقولة وحصيفة.',
      'وتقييم قدرة الشركة على الاستمرار كمنشأة مستمرة واستخدام أساس الاستمرارية ما لم تنوِ الإدارة التصفية.',
      'والمحافظة على رقابة داخلية كافية لإعداد قوائم خالية من التحريف الجوهري سواء بسبب غش أو خطأ.',
      'ويؤكد المجلس أن التقرير السنوي ككل عادل ومتوازن ومفهوم.'] },
  };
}

/* ---------- the AI answer made safe ---------- */
const str = (x: unknown, max = 2400) => String(x ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);
const paras = (x: unknown, max = 10) => arr<unknown>(x).map((y) => str(y)).filter(Boolean).slice(0, max);
const TRENDS: Trend[] = ['ارتفاع', 'ثبات', 'انخفاض'];

export function normalizeNarrative(raw: unknown, p: FactPack, meta: { model?: string; at?: string; origin?: 'ai' | 'engine' } = {}): NarrativeResult {
  const r = (raw ?? {}) as Record<string, Record<string, unknown>>, fb = fallbackNarrative(p);
  const n: Narrative = {
    chairLetter: { title: str(r.chairLetter?.title, 120) || fb.chairLetter.title, paragraphs: paras(r.chairLetter?.paragraphs) },
    ceoReview: { title: str(r.ceoReview?.title, 120) || fb.ceoReview.title, paragraphs: paras(r.ceoReview?.paragraphs),
      kpiCommentary: arr<Record<string, unknown>>(r.ceoReview?.kpiCommentary).map((x) => ({ kpi: str(x.kpi, 120), comment: str(x.comment, 600) })).filter((x) => x.kpi && x.comment).slice(0, 8) },
    strategy: { pillars: arr<Record<string, unknown>>(r.strategy?.pillars).map((x) => ({ title: str(x.title, 120), text: str(x.text, 800) })).filter((x) => x.title && x.text).slice(0, 6) },
    performanceReview: { paragraphs: paras(r.performanceReview?.paragraphs) },
    liquidity: { paragraphs: paras(r.liquidity?.paragraphs, 5) },
    principalRisks: { intro: str(r.principalRisks?.intro, 1500), risks: arr<Record<string, unknown>>(r.principalRisks?.risks).map((x) => ({ category: str(x.category, 120), title: str(x.title, 160), description: str(x.description, 900),
      management: str(x.management, 900), trend: (TRENDS.includes(x.trend as Trend) ? x.trend : 'ثبات') as Trend })).filter((x) => x.title && x.description && x.management).slice(0, 10) },
    viability: { period: str(r.viability?.period, 80), assessment: paras(r.viability?.assessment, 5),
      scenarios: arr<Record<string, unknown>>(r.viability?.scenarios).map((x) => ({ scenario: str(x.scenario, 400), risks: str(x.risks, 300), impact: str(x.impact, 400) })).filter((x) => x.scenario).slice(0, 4), conclusion: str(r.viability?.conclusion, 900) },
    /* KAM titles and order are the engagement's: the AI only rewrites what it says about each one */
    kams: p.kams.map((k, i) => { const x = (arr<Record<string, unknown>>(r.kams).find((y) => str(y.title, 300) === k.title) ?? arr<Record<string, unknown>>(r.kams)[i] ?? {}) as Record<string, unknown>;
      return { title: k.title, matter: str(x.matter, 1600), procedures: arr<unknown>(x.procedures).map((y) => str(y, 500)).filter(Boolean).slice(0, 9), disclosure: str(x.disclosure, 600) }; }),
    auditCommittee: { paragraphs: paras(r.auditCommittee?.paragraphs, 6), matters: arr<Record<string, unknown>>(r.auditCommittee?.matters).map((x) => ({ area: str(x.area, 160), matter: str(x.matter, 900), conclusion: str(x.conclusion, 700) })).filter((x) => x.area && x.conclusion).slice(0, 8) },
    sustainability: { paragraphs: paras(r.sustainability?.paragraphs, 5) },
    outlook: { paragraphs: paras(r.outlook?.paragraphs, 5) },
    directorsResponsibilities: { paragraphs: paras(r.directorsResponsibilities?.paragraphs, 7) },
  };
  /* a section the AI left empty is the engine's */
  const source = {} as NarrativeResult['source'];
  const empty: Record<keyof Narrative, (x: Narrative) => boolean> = {
    chairLetter: (x) => x.chairLetter.paragraphs.length < 2, ceoReview: (x) => x.ceoReview.paragraphs.length < 2, strategy: (x) => x.strategy.pillars.length < 2,
    performanceReview: (x) => !x.performanceReview.paragraphs.length, liquidity: (x) => !x.liquidity.paragraphs.length, principalRisks: (x) => x.principalRisks.risks.length < 3,
    viability: (x) => !x.viability.conclusion, kams: (x) => x.kams.some((k) => !k.matter || k.procedures.length < 2), auditCommittee: (x) => !x.auditCommittee.paragraphs.length,
    sustainability: (x) => !x.sustainability.paragraphs.length, outlook: (x) => !x.outlook.paragraphs.length, directorsResponsibilities: (x) => x.directorsResponsibilities.paragraphs.length < 3 };
  for (const k of Object.keys(empty) as (keyof Narrative)[]) {
    if (empty[k](n)) { (n as Record<string, unknown>)[k] = fb[k]; source[k] = 'engine'; } else source[k] = meta.origin ?? 'ai';
  }
  const unverified = (Object.keys(n) as (keyof Narrative)[]).map((k) => ({ section: k, numbers: verifyNumbers(JSON.stringify(n[k]), p) })).filter((x) => x.numbers.length);
  return { narrative: n, source, unverified, model: meta.model, at: meta.at };
}

/* ---------- quality against the bundle ---------- */
export type QualityItem = { key: string; ar: string; ok: boolean; detail: string; basis: string };
const has = (t: string, rx: RegExp) => rx.test(t);
export function quality(res: NarrativeResult, p: FactPack): { score: number; items: QualityItem[] } {
  const n = res.narrative, letter = n.chairLetter.paragraphs.join(' ') + ' ' + n.ceoReview.paragraphs.join(' ');
  const lt = letterTopics(), share = (k: string) => lt.find((x) => x.key === k)?.share ?? 0;
  const items: QualityItem[] = [
    { key: 'letter-results', ar: 'الرسائل تذكر النتائج الرئيسية بالأرقام مقارنة بالسنة السابقة', ok: has(letter, /السابقة|مقارنة|ارتفاع|انخفاض/) && numbersIn(letter).length >= 2, detail: numbersIn(letter).length + ' رقماً في الرسائل', basis: 'أرامكو ص 10008 · HSBC ص 5957' },
    { key: 'letter-strategy', ar: 'الرسائل تربط الأداء بالاستراتيجية', ok: has(letter, /استراتيج/), detail: '', basis: `${share('strategy')}% من رسائل الحزمة` },
    { key: 'letter-people', ar: 'الرسائل تشكر الموظفين والفريق', ok: has(letter, /شكر|الموظف|العاملين|فريق/), detail: '', basis: `${share('people_thanks')}% من رسائل الحزمة` },
    { key: 'letter-outlook', ar: 'الرسائل تتضمن نظرة مستقبلية مشروطة', ok: has(letter + ' ' + n.outlook.paragraphs.join(' '), /تتوقع|نتوقع|المستقبل|القادمة|تعتزم/), detail: '', basis: `${share('outlook')}% من رسائل الحزمة` },
    { key: 'kpi', ar: 'تعليق على مؤشرات الأداء الرئيسية (4 على الأقل)', ok: n.ceoReview.kpiCommentary.length >= 4, detail: n.ceoReview.kpiCommentary.length + ' مؤشرات', basis: 'شريط المؤشرات في HSBC ص 5957' },
    { key: 'strategy', ar: 'محاور استراتيجية واضحة (3 على الأقل)', ok: n.strategy.pillars.length >= 3, detail: n.strategy.pillars.length + ' محاور', basis: '26 تقريراً من 49 فيها قسم استراتيجية' },
    { key: 'mdna', ar: 'تحليل الأداء يغطي الإيراد والهامش والربح', ok: has(n.performanceReview.paragraphs.join(' '), /الإيراد/) && has(n.performanceReview.paragraphs.join(' '), /هامش/), detail: '', basis: '39 تقريراً من 49 فيها تقرير إدارة' },
    { key: 'liquidity', ar: 'السيولة والتدفقات النقدية وصافي الدين', ok: has(n.liquidity.paragraphs.join(' '), /النقد|التدفق/), detail: '', basis: 'أرامكو ص 10041' },
    { key: 'risks-count', ar: 'المخاطر الرئيسية: 5 على الأقل', ok: n.principalRisks.risks.length >= 5, detail: n.principalRisks.risks.length + ' مخاطر', basis: '35 تقريراً من 49 فيها مخاطر رئيسية' },
    { key: 'risks-table', ar: 'لكل خطر وصف وإدارة واتجاه', ok: n.principalRisks.risks.every((r) => r.description && r.management && r.trend), detail: '', basis: 'جدول يونيليفر ص 5136' },
    { key: 'risk-appetite', ar: 'فقرة شهية المخاطر وإطار إدارتها', ok: n.principalRisks.intro.length > 60, detail: '', basis: 'يونيليفر ص 5134' },
    { key: 'viability', ar: 'بيان الجدوى: الفترة والسيناريوهات والاستنتاج', ok: !!n.viability.period && n.viability.scenarios.length >= 2 && !!n.viability.conclusion, detail: n.viability.scenarios.length + ' سيناريوهات', basis: 'يونيليفر ص 5141' },
    { key: 'kam-structure', ar: 'كل أمر رئيسي: الوصف و4 إجراءات على الأقل وتقييم الإفصاح', ok: n.kams.length > 0 && n.kams.every((k) => k.matter && k.procedures.length >= 4 && k.disclosure), detail: n.kams.map((k) => k.procedures.length).join('، ') + ' إجراءات', basis: 'أرامكو ص 10164' },
    { key: 'committee', ar: 'تقرير اللجنة: جدول الأمور الهامة والاستنتاجات', ok: n.auditCommittee.matters.length >= 2, detail: n.auditCommittee.matters.length + ' أمور', basis: 'HSBC ص 6153' },
    { key: 'directors', ar: 'إقرار مسؤوليات المجلس كامل', ok: n.directorsResponsibilities.paragraphs.length >= 4, detail: '', basis: 'نستله ص 2319 · يونيليفر ص 5213' },
    { key: 'numbers', ar: 'كل رقم في السرد موجود في أرقام المنشأة', ok: !res.unverified.length, detail: res.unverified.length ? res.unverified.map((u) => u.section + ': ' + u.numbers.join('، ')).join(' | ') : 'تحقق آلي', basis: 'قاعدة SQC: لا أرقام مخترعة' },
  ];
  const score = Math.round((items.filter((x) => x.ok).length / items.length) * 100);
  return { score, items };
}
