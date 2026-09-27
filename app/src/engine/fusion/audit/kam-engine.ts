/* Key audit matters (ISA 701) — drafting this entity's matters from the engine's line risks and the global precedents.
   The knowledge (what each kind of matter is, why it needs judgement, what the world's auditors did about it, and the
   real matters with their pages) lives in global-benchmarks-engine (THEMES, precedentsFor). This engine turns it into the
   matters of this report, the way the bundle's auditor's reports write them:
   • the matter: why it needs judgement, the amount and its share of the statements;
   • the response: the line's own procedures with those performed on the same theme by the global auditors;
   • the result, from the evidence the file holds («Key observations» — bp; «Our results: acceptable» — Unilever);
   • the references (standards and notes), and whether the matter is new or continuing against last year's report
     («no longer included because…» — AstraZeneca).
   The suggestions are ranked; the partner chooses what the report carries. */
import { formatMinor, type Minor } from '../reports/money-engine';
import type { FinancialStatements } from '../reports/statements-engine';
import { precedentsFor, themePrior, THEMES, type KamRow, type Sector, type Standard, type Theme } from './global-benchmarks-engine';

export type KamRisk = { lineKey: string; ar: string; amount: Minor; score: number; significant: boolean; risk?: string; procedures?: string[]; parts?: { estimate?: number } };
export type Kam = { key: string; title: string; description: string; how: string; observation: string; refs: string[]; lineKeys: string[];
  amount: Minor; pctAssets: number; score: number; /** the ranking (risk + weight in the statements + sector practice) */ weight: number; selected: boolean; trend: 'new' | 'same' | null; examples: KamRow[] };

const clean = (x: string) => x.replace(/[.،؛]\s*$/, '');
/** The revenue theme carries the presumed risk of fraud (ISA 240.26), so it ranks above an equal line risk. */
const FRAUD_THEMES = new Set<string>(['revenue-deductions', 'revenue-recognition']);

export function suggestKams(input: { fs: FinancialStatements; risks: KamRisk[]; materiality: Minor; currency?: string; periodEnd?: string; sector?: Sector | '';
  evidence?: Record<string, 'accepted' | 'partial' | 'none'>; priorKeys?: string[]; max?: number;
  /** the auditing standard of the report (PCAOB reports carry fewer matters) */ standard?: Standard | '';
  /** leave this bundle report out of the precedents (the bundle testing itself) */ exclude?: string;
  /** how often auditors in the entity's sector reported each theme (0–1); computed from the bundle when not given */ sectorPrior?: Partial<Record<string, number>> }): Kam[] {
  const { fs, materiality } = input, cur = input.currency ?? 'ر.س', money = (m: Minor) => formatMinor(m, { decimals: 0 }) + ' ' + cur;
  const assets = Math.abs(fs.keys.assets.current) || 1;
  const byKey = new Map<string, Kam>();
  /* which theme a risky line becomes, and how much it weighs, follows what auditors of the same sector actually reported:
     receivables are a credit-loss matter for a bank and seldom for a drug maker, whose revenue is a matter of rebates */
  const prior: Partial<Record<string, number>> = input.sectorPrior ?? themePrior({ sector: input.sector, standard: input.standard, exclude: input.exclude });
  for (const r of input.risks) {
    const line = fs.lines.find((l) => l.key === r.lineKey), amount = Math.abs(line?.current ?? r.amount ?? 0);
    if (!amount) continue;
    /* the theme of the line: the one auditors of the same sector report most, else the most reported overall */
    const prs = precedentsFor(r.lineKey, { sector: input.sector, limit: 3 }).filter((p) => !input.exclude || p.examples.some((e) => e.report !== input.exclude));
    const pr = [...prs].sort((a, b) => (prior[b.theme] ?? 0) - (prior[a.theme] ?? 0))[0] ?? null;
    const key: string = pr ? pr.theme : r.lineKey, estimate = (r.parts?.estimate ?? 0) >= 15;
    const score = Math.min(100, r.score + (amount >= materiality * 3 ? 10 : 0) + (estimate ? 5 : 0) + (FRAUD_THEMES.has(key) ? 8 : 0));
    const pct = Math.round((amount / assets) * 1000) / 10;
    /* the ranking: the line's risk, then its weight in the statements and how often the sector's auditors report the theme —
       for a large entity every line's risk reaches the cap, and these decide (the replay on the bundle's companies measures it) */
    const weight = Math.round(score + Math.min(30, pct * 0.6) + (prior[key] ?? 0) * 40);
    const prev = byKey.get(key);
    if (prev && prev.weight >= weight) { if (!prev.lineKeys.includes(r.lineKey)) prev.lineKeys.push(r.lineKey); continue; }
    const description = (pr ? pr.why + ' ' : '') + 'بلغ رصيد ' + r.ar + ' ' + money(amount) + (input.periodEnd ? ' كما في ' + input.periodEnd : '') + ' (' + pct + '% من مجموع الموجودات)'
      + (r.risk ? '، وتتركز مخاطره في ' + clean(r.risk) : '') + (estimate ? '، ويتضمن تقديرات محاسبية تتطلب حكماً مهنياً مهماً (ISA 540)' : '') + '. لذلك عُدّ من الأمور ذات الأهمية القصوى في مراجعتنا.';
    const steps = [...new Set([...(r.procedures ?? []), ...(pr ? pr.procedures : [])].map(clean))].slice(0, 6);
    const ev = input.evidence?.[r.lineKey];
    const how = 'شملت إجراءاتنا: ' + steps.join('؛ ') + '.';
    const observation = ev === 'accepted' ? 'لم تسفر إجراءاتنا عن تحفظات، وحصلنا على أدلة كافية ومناسبة تؤيد ما سجلته الإدارة.'
      : ev === 'partial' ? 'ما زالت بعض الأدلة المؤيدة قيد الاستكمال؛ تُحدَّث النتيجة قبل إصدار التقرير.'
      : 'النتيجة معلقة حتى استكمال الأدلة المطلوبة من المنشأة.';
    byKey.set(key, { key, title: pr ? THEMES[pr.theme as Theme].ar : r.ar, description, how, observation,
      refs: [...(line?.standards ?? []), ...(line?.note ? ['إيضاح ' + line.note] : [])], lineKeys: [...new Set([...(prev?.lineKeys ?? []), r.lineKey])],
      amount, pctAssets: pct, score, weight, selected: false, trend: input.priorKeys ? (input.priorKeys.includes(key) ? 'same' : 'new') : null,
      examples: pr ? pr.examples.filter((e) => e.report !== input.exclude) : [] });
  }
  const out = [...byKey.values()].sort((a, b) => b.weight - a.weight || b.score - a.score);
  const max = input.max ?? (input.standard === 'PCAOB' ? 2 : 3);
  let n = 0;
  for (const k of out) if (n < max && (k.score >= 70 || (k.score >= 55 && k.amount >= materiality))) { k.selected = true; n++; }
  if (!n && out.length) out[0].selected = true;
  return out.slice(0, 6);
}
/** Matters reported last year and not this year — the report says why they no longer are. */
export const removedKams = (priorKeys: string[], current: Kam[]) =>
  priorKeys.filter((k) => !current.some((c) => c.selected && c.key === k)).map((k) => (THEMES as Record<string, { ar: string }>)[k]?.ar ?? k);
