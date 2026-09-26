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
import { precedentsFor, THEMES, type KamRow, type Sector, type Theme } from './global-benchmarks-engine';

export type KamRisk = { lineKey: string; ar: string; amount: Minor; score: number; significant: boolean; risk?: string; procedures?: string[]; parts?: { estimate?: number } };
export type Kam = { key: string; title: string; description: string; how: string; observation: string; refs: string[]; lineKeys: string[];
  amount: Minor; pctAssets: number; score: number; selected: boolean; trend: 'new' | 'same' | null; examples: KamRow[] };

const clean = (x: string) => x.replace(/[.،؛]\s*$/, '');
/** The revenue theme carries the presumed risk of fraud (ISA 240.26), so it ranks above an equal line risk. */
const FRAUD_THEMES = new Set<string>(['revenue-deductions', 'revenue-recognition']);

export function suggestKams(input: { fs: FinancialStatements; risks: KamRisk[]; materiality: Minor; currency?: string; periodEnd?: string; sector?: Sector | '';
  evidence?: Record<string, 'accepted' | 'partial' | 'none'>; priorKeys?: string[]; max?: number }): Kam[] {
  const { fs, materiality } = input, cur = input.currency ?? 'ر.س', money = (m: Minor) => formatMinor(m, { decimals: 0 }) + ' ' + cur;
  const assets = Math.abs(fs.keys.assets.current) || 1;
  const byKey = new Map<string, Kam>();
  for (const r of input.risks) {
    const line = fs.lines.find((l) => l.key === r.lineKey), amount = Math.abs(line?.current ?? r.amount ?? 0);
    if (!amount) continue;
    const pr = precedentsFor(r.lineKey, { sector: input.sector, limit: 3 })[0] ?? null;
    const key: string = pr ? pr.theme : r.lineKey, estimate = (r.parts?.estimate ?? 0) >= 15;
    const score = Math.min(100, r.score + (amount >= materiality * 3 ? 10 : 0) + (estimate ? 5 : 0) + (FRAUD_THEMES.has(key) ? 8 : 0));
    const prev = byKey.get(key);
    if (prev && prev.score >= score) { if (!prev.lineKeys.includes(r.lineKey)) prev.lineKeys.push(r.lineKey); continue; }
    const pct = Math.round((amount / assets) * 1000) / 10;
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
      amount, pctAssets: pct, score, selected: false, trend: input.priorKeys ? (input.priorKeys.includes(key) ? 'same' : 'new') : null, examples: pr ? pr.examples : [] });
  }
  const out = [...byKey.values()].sort((a, b) => b.score - a.score);
  const max = input.max ?? 3;
  let n = 0;
  for (const k of out) if (n < max && (k.score >= 70 || (k.score >= 55 && k.amount >= materiality))) { k.selected = true; n++; }
  if (!n && out.length) out[0].selected = true;
  return out.slice(0, 6);
}
/** Matters reported last year and not this year — the report says why they no longer are. */
export const removedKams = (priorKeys: string[], current: Kam[]) =>
  priorKeys.filter((k) => !current.some((c) => c.selected && c.key === k)).map((k) => (THEMES as Record<string, { ar: string }>)[k]?.ar ?? k);
