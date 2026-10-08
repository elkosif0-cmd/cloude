/* Replaying the audit on the companies of the research bundle — would this app, given only a company's published
   trial balance, reach what its auditor reported?
   For every company with statements (reports/corpus-companies-engine.ts) the deterministic review runs exactly as it
   does for a client: materiality (ISA 320), the line risks, the document requests, and the key audit matters drafted
   by audit/kam-engine.ts. The result is set against the auditor's report in the bundle:
   • key audit matters: the themes the auditor reported (global-benchmarks-engine KAMS, with pages) against the
     matters the engine selected and the ones it ranked (recall and precision per company and overall);
   • materiality: the engine's figure against the one the auditor disclosed (seven UK/EU/Saudi reports do);
   • what the engine missed, counted over all companies — the gaps that tell where its judgement differs.
   The sector prior (how often auditors in the same sector reported each theme) is computed leave-one-out: the
   company being replayed never informs its own ranking. */
import { canonicalReferenceId } from '../reports/reference-index-engine';
import { KAMS, MATERIALITY, REPORTS, THEMES, type Sector, type Theme } from './global-benchmarks-engine';
import { reviewTrialBalance } from './tb-review-engine';
import { suggestKams } from './kam-engine';
import { corpusModelTrialBalance, corpusCompanies } from '../reports/corpus-companies-engine';
import { parseTrialBalance } from '../reports/tb-import-engine';
import { blueprint, reportStructure } from '../reports/global-corpus-engine';

export type ReplayKam = { key: string; title: string; selected: boolean; score: number; matched: boolean };
export type Replay = {
  id: string; company: string; sector: Sector; auditor: string; fy: string; unit: string;
  actual: { theme: Theme; ar: string; titles: string[]; pages: number[]; found: 'selected' | 'ranked' | 'missed' }[];
  ours: ReplayKam[]; recall: number | null; rankedRecall: number | null; precision: number | null;
  materiality: { ours: number; benchmark: string; disclosed: number | null; disclosedBasis: string | null; ratio: number | null; page: number | null };
  requests: number; findings: number; balanced: boolean;
  /** the shape of the report: the sections found in the company's own report that SQC's report pack also carries */
  structure: { theirs: number; covered: number; share: number | null; missing: string[] };
};

const r2 = (x: number) => Math.round(x * 100) / 100;
/** How often the auditors of a sector reported each theme (share of that sector's reports with KAMs), leaving one report out. */
export function sectorPrior(sector: Sector | '', exclude?: string): Partial<Record<Theme, number>> {
  if (!sector) return {};
  const reports = [...new Set(KAMS.map((k) => k.report))].filter((id) => id !== (exclude ? canonicalReferenceId(exclude) : undefined) && corpusSector(id) === sector);
  if (!reports.length) return {};
  const out: Partial<Record<Theme, number>> = {};
  for (const t of Object.keys(THEMES) as Theme[]) {
    const n = reports.filter((id) => KAMS.some((k) => k.report === id && k.theme === t)).length;
    if (n) out[t] = r2(n / reports.length);
  }
  return out;
}
/** How many matters (distinct themes) auditors under a standard report — the mean over the bundle's reports, leaving one out. */
export function typicalKamCount(standard: 'ISA' | 'PCAOB', exclude?: string): number {
  const ids = [...new Set(KAMS.map((k) => k.report))].filter((id) => id !== (exclude ? canonicalReferenceId(exclude) : undefined) && REPORT_STD.get(id) === standard);
  if (!ids.length) return 3;
  const mean = ids.reduce((s, id) => s + new Set(KAMS.filter((k) => k.report === id).map((k) => k.theme)).size, 0) / ids.length;
  return Math.max(1, Math.round(mean));
}
const REPORT_STD = new Map(REPORTS.map((r) => [r.id, r.standard]));
/* a report whose auditing standard is not reviewed yet (#143: 'unknown') gives the KAM count no standard */
const knownStandard = (id: string) => { const s = REPORT_STD.get(id); return s === 'unknown' ? undefined : s; };
const SECTOR_OF = new Map<string, Sector>();
function corpusSector(id: string): Sector | undefined {
  if (!SECTOR_OF.size) for (const c of corpusCompanies()) SECTOR_OF.set(c.id, c.sector);
  return SECTOR_OF.get(id);
}

/** Replay the audit of one company of the bundle. */
/* R16: main's replay restored (PRODUCT_MANDATE P5 — every bundle company reproduces its auditors' results); #143 had it
   return null for all. It runs on the corpus model; replayAll labels the whole set simulation-only (#143). */
export function replayCompany(id: string, opts: { prior?: boolean | 'smoothed'; max?: number } = {}): Replay | null {
  const t = corpusModelTrialBalance(id);
  if (!t) return null;
  const c = t.company, tb = parseTrialBalance(t.csv);
  const review = reviewTrialBalance(tb, { framework: 'IFRS', currency: t.ctx.curSym, overrides: t.overrides, tax: t.ctx.taxKind as 'zakat' | 'income', unclassified: t.ctx.unclassified });
  /* no prior at all, the sector's own share (sector-only), or the smoothed prior (sector → standard → all reports); always leave-one-out */
  const prior = opts.prior === false ? {} : opts.prior === 'smoothed' ? undefined : sectorPrior(c.sector, c.id);
  const kams = suggestKams({ fs: review.fs, risks: review.risks, materiality: review.materiality.overall, currency: t.ctx.curSym, periodEnd: c.yearEnd, sector: c.sector, max: opts.max ?? 3, sectorPrior: prior,
    exclude: c.id, standard: knownStandard(c.id) });
  const rows = KAMS.filter((k) => k.report === id);
  const themes = [...new Set(rows.map((k) => k.theme))];
  const selected = new Set(kams.filter((k) => k.selected).map((k) => k.key)), ranked = new Set(kams.map((k) => k.key));
  const actual = themes.map((th) => ({ theme: th, ar: THEMES[th].ar, titles: rows.filter((k) => k.theme === th).map((k) => k.title), pages: rows.filter((k) => k.theme === th).map((k) => k.page),
    found: (selected.has(th) ? 'selected' : ranked.has(th) ? 'ranked' : 'missed') as 'selected' | 'ranked' | 'missed' }));
  const ours = kams.map((k) => ({ key: k.key, title: k.title, selected: k.selected, score: k.score, matched: themes.includes(k.key as Theme) }));
  const hit = actual.filter((a) => a.found === 'selected').length, rankedHit = actual.filter((a) => a.found !== 'missed').length;
  const unit = c.figures.unit === 'crore' ? 1e7 : 1e6;
  const disc = MATERIALITY.find((m) => m.report === id) ?? null, oursMat = review.materiality.overall / 100;
  return {
    id, company: c.company, sector: c.sector, auditor: c.auditor, fy: c.fy, unit: c.unitAr, actual, ours,
    recall: themes.length ? r2(hit / themes.length) : null, rankedRecall: themes.length ? r2(rankedHit / themes.length) : null,
    precision: selected.size && themes.length ? r2(ours.filter((o) => o.selected && o.matched).length / selected.size) : null,
    materiality: { ours: oursMat, benchmark: review.materiality.benchmarkAr, disclosed: disc ? disc.overall / unit : null, disclosedBasis: disc ? disc.basis : null,
      ratio: disc ? r2(oursMat / (disc.overall / unit)) : null, page: disc ? disc.page : null },
    requests: review.requests.length, findings: review.findings.length, balanced: t.balanced === true, structure: structureOf(id),
  };
}

/* the sections SQC's integrated report lays out (the bundle blueprint) against the sections of the company's own report */
const SQC_SECTIONS = new Set(blueprint().flatMap((p) => p.sections.map((x) => x.key)));
function structureOf(id: string) {
  const theirs = [...new Map(reportStructure(id).map((x) => [x.key, x])).values()];
  const covered = theirs.filter((x) => SQC_SECTIONS.has(x.key));
  return { theirs: theirs.length, covered: covered.length, share: theirs.length ? r2(covered.length / theirs.length) : null, missing: theirs.filter((x) => !SQC_SECTIONS.has(x.key)).map((x) => x.ar) };
}

/** The replay over every company, with the totals and the themes the engine missed most. */
export function replayAll(opts: { prior?: boolean | 'smoothed'; max?: number } = {}) {
  const list = corpusCompanies().map((c) => replayCompany(c.id, opts)!).filter(Boolean);
  const withKams = list.filter((r) => r.actual.length);
  const actualN = withKams.reduce((s, r) => s + r.actual.length, 0);
  const sel = withKams.reduce((s, r) => s + r.actual.filter((a) => a.found === 'selected').length, 0);
  const rk = withKams.reduce((s, r) => s + r.actual.filter((a) => a.found !== 'missed').length, 0);
  const oursSel = withKams.reduce((s, r) => s + r.ours.filter((o) => o.selected).length, 0), oursHit = withKams.reduce((s, r) => s + r.ours.filter((o) => o.selected && o.matched).length, 0);
  const missed: Record<string, number> = {};
  for (const r of withKams) for (const a of r.actual) if (a.found === 'missed') missed[a.theme] = (missed[a.theme] ?? 0) + 1;
  const mat = list.filter((r) => r.materiality.ratio !== null);
  const st = list.filter((r) => r.structure.theirs), stTheirs = st.reduce((a, r) => a + r.structure.theirs, 0), stCov = st.reduce((a, r) => a + r.structure.covered, 0);
  return {
    status: list.length?'simulation-only':'unavailable', reason:'Published statement models do not establish an audit engagement or earned assurance.',
    companies: list.length, withKams: withKams.length, kamThemes: actualN,
    recall: actualN ? r2(sel / actualN) : 0, rankedRecall: actualN ? r2(rk / actualN) : 0, precision: oursSel ? r2(oursHit / oursSel) : 0,
    anyMatch: withKams.filter((r) => r.actual.some((a) => a.found === 'selected')).length,
    missed: Object.entries(missed).map(([theme, n]) => ({ theme, ar: THEMES[theme as Theme].ar, n })).sort((a, b) => b.n - a.n),
    structure: stTheirs ? r2(stCov / stTheirs) : 0,
    materiality: mat.map((r) => ({ id: r.id, company: r.company, ours: r.materiality.ours, disclosed: r.materiality.disclosed!, ratio: r.materiality.ratio!, page: r.materiality.page })),
    list,
  };
}
