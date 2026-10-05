// Independent re-verification of everything the app took from the global financial & audit research bundle
// (global_financial_and_audit_research_bundle_extended_verified.pdf, 12,506 pages) against the bundle's own pages.
// The bundle is not in the repository: extract its pages first (PyMuPDF; one JSON line per page {p, text}) and run
//   SQC_BUNDLE_PAGES=/path/to/pages.jsonl node tools/bundle_verify.mjs [out.md] [out.json]
// Checks, every one against the cited page: the 49 report ranges, the 96 key / critical audit matters, the 7 disclosed
// materiality cases, the 8 peer statement sets, the 47 corpus figure sets, the exemplar pages and the section
// structures; then the corpus statistics (KAM procedures, principal-risk categories, auditor-report elements, letters,
// viability horizons) are derived again from the pages with an independent reading and set beside the engine's counts.
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const PAGES = process.env.SQC_BUNDLE_PAGES;
if (!PAGES || !fs.existsSync(PAGES)) { console.error('SQC_BUNDLE_PAGES must point at the extracted pages (pages.jsonl)'); process.exit(2); }
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(new URL('ui/core/engines.js', root), 'utf8'), ctx);
const E = ctx.window.SKEngines, G = E.audit.globalBenchmarks, P = E.reports.peerBenchmarks, C = E.reports.globalCorpus, CC = E.reports.corpusCompanies;

/* ---------- the pages ---------- */
const pages = ['']; // 1-based
for (const line of fs.readFileSync(PAGES, 'utf8').split('\n')) { if (!line) continue; const o = JSON.parse(line); pages[o.p] = o.text || ''; }
const N = pages.length - 1;
const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, '').replace(/\s+/g, ' ');
const pageText = (p) => norm(pages[p] || '');
const digitsOf = (s) => String(s).replace(/[^0-9.]/g, '');
/* every way a statement figure is printed: 89,490 · 89490 · 89 490 · (5,936) for a negative · 5.936 (continental) */
/* also Swiss apostrophes (56'674), thin spaces, Indian grouping (10,75,675) and a figure whose digit groups the text
   layer split across lines (42,221,\n212) */
const numberOnPage = (txt, v) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return null;
  const a = Math.abs(Math.round(v)), s = String(a), g = (sep) => s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const forms = new Set([s, g(','), g(' '), g('.'), g("'")]);
  if (s.length > 3) { const last3 = s.slice(-3); let rest = s.slice(0, -3); const parts = []; while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); } if (rest) parts.unshift(rest); forms.add(parts.join(',') + ',' + last3); }
  const flat = txt.replace(/[       ]/g, ' ').replace(/(\d[,.'])\s*\n\s*(?=\d{3})/g, '$1').replace(/(\d)\s*\n\s*(?=\d{3}\b)/g, '$1,');
  if ([...forms].some((f) => new RegExp("(^|[^0-9.,'])" + f.replace(/[.']/g, (c) => '\\' + c) + '(?![0-9])').test(flat))) return true;
  /* a statement printed in thousands while the engine keeps millions: the figure is the leading digits of a longer number */
  return s.length >= 4 && [g(','), g(' '), g("'")].some((f) => new RegExp("(^|[^0-9.,'])" + f.replace(/[.']/g, (c) => '\\' + c) + "[,' ]\\d{3}(?![0-9])").test(flat));
};
const STOP = new Set(['the', 'and', 'of', 'for', 'to', 'in', 'on', 'with', 'from', 'its', 'a', 'an', 'at', 'by', 'or', 'as', 'related', 'other', 'certain', 'our', 'their']);
const tokens = (s) => norm(s).replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w));
const share = (title, p, spread = 1) => {
  const ws = [...new Set(tokens(title))]; if (!ws.length) return { share: 1, missing: [] };
  const txt = [p - spread, p, p + spread].filter((x) => x >= 1 && x <= N).map(pageText).join(' ').replace(/ization/g, 'isation').replace(/ize\b/g, 'ise');
  const stem = (w) => (w.length > 6 ? w.slice(0, w.length - 1) : w).replace(/ization/g, 'isation'); // plural/singular, British/American spelling
  const missing = ws.filter((w) => !txt.includes(stem(w)));
  return { share: 1 - missing.length / ws.length, missing };
};
const firstName = (company) => norm(company).replace(/\b(inc|corp|corporation|co|plc|ltd|limited|ag|se|sa|nv|group|holdings?|company|the)\b\.?/g, '').split(/[\s,.]+/).filter(Boolean)[0] || norm(company);

const out = { checked: new Date().toISOString().slice(0, 10), pages: N, sections: [] };
const section = (name, rows, note) => { out.sections.push({ name, rows, note }); return rows; };

/* ---------- 1. the 49 reports: their page ranges hold their company ---------- */
section('reports', G.REPORTS.map((r) => {
  const name = firstName(r.company), [a, b] = r.pages, inside = [], outside = [];
  for (let p = Math.max(1, a - 3); p <= Math.min(N, b + 3); p++) if (pageText(p).includes(name)) (p >= a && p <= b ? inside : outside).push(p);
  const head = [a, a + 1, a + 2].filter((p) => p <= b).some((p) => pageText(p).includes(name));
  return { id: r.id, company: r.company, range: r.pages, name, pagesWithName: inside.length, head, ok: inside.length > 0 && (head || inside.length >= 3) };
}), 'company name found inside the range (and on its first pages)');

/* ---------- 2. the 96 KAMs / CAMs: the title on the cited page ---------- */
section('kams', G.KAMS.map((k) => {
  const s0 = share(k.title, k.page, 0), s1 = share(k.title, k.page, 1);
  return { report: k.report, page: k.page, title: k.title, onPage: Math.round(s0.share * 100), nearPage: Math.round(s1.share * 100), missing: s1.missing, ok: s1.share >= 0.6 };
}), 'share of the title\'s words on the cited page (page ±1 allowed)');

/* ---------- 3. the 7 materiality cases: amount and percentage on the cited page ---------- */
section('materiality', G.MATERIALITY.map((m) => {
  const txt = pageText(m.page), m1 = m.overall / 1e6, variants = [m1, m.overall / 1e9, m.overall / 1e3].map((x) => Math.round(x * 100) / 100);
  const amount = variants.some((v) => { const s = String(v); return txt.includes(s) || numberOnPage(txt, v); });
  const pct = m.pct ? [Math.round(m.pct * 1000) / 10, Math.round(m.pct * 100)].some((x) => txt.includes(x + '%') || txt.includes(x + ' %') || txt.includes(x + ' per cent')) : null;
  const word = /materiality|material/i.test(txt);
  return { report: m.report, page: m.page, overall: m.overall, amountOnPage: amount, pctOnPage: pct, materialityWord: word, ok: word && (amount || pct === true) };
}), 'the amount (in millions / billions) or the percentage, with the word «materiality», on the cited page');

/* ---------- 4. the 8 peers: statement figures on the income statement, balance sheet and cash-flow pages ---------- */
const PEER_FIELDS = { is: ['revenue', 'cogs', 'operating', 'net'], bs: ['assets', 'equity', 'ca', 'cl', 'inventory', 'receivables', 'payables'], cf: ['cfo', 'capex', 'cash'] };
section('peers', P.PEERS.map((pr) => {
  const res = {}; let hit = 0, tot = 0;
  for (const [st, fields] of Object.entries(PEER_FIELDS)) {
    const ps = [pr.pages[st], st === 'bs' ? pr.pages.bsTo : null].filter(Boolean), txt = ps.map(pageText).join(' ');
    for (const f of fields) { const v = pr[f]; if (v === null || v === undefined) continue; tot++; const ok = numberOnPage(txt, v); if (ok) hit++; res[f] = ok; }
  }
  return { id: pr.id, company: pr.company, pages: pr.pages, matched: hit, of: tot, fields: res, ok: hit >= Math.ceil(tot * 0.8) };
}), 'figures found as printed on the cited statement pages (≥ 80 % per peer)');

/* ---------- 5. the 47 corpus figure sets (two years each) ---------- */
const FIG_FIELDS = { is: ['rev', 'cogs', 'op', 'pbt', 'tax', 'net'], bs: ['cash', 'recv', 'inv', 'ppe', 'intang', 'ca', 'assets', 'pay', 'cl', 'debt', 'equity'] };
const figs = Array.isArray(CC.FIGURES) ? CC.FIGURES : Object.entries(CC.FIGURES);
section('figures', figs.map(([id, f]) => {
  let hit = 0, tot = 0; const miss = [];
  for (const [st, fields] of Object.entries(FIG_FIELDS)) {
    const pg = f.pages && f.pages[st]; if (!pg) continue; const txt = [pg, pg + 1].map(pageText).join(' ');
    for (const k of fields) { const arr = f[k]; if (!Array.isArray(arr)) continue; for (const v of arr) { if (v === null || v === undefined) continue; tot++; if (numberOnPage(txt, v)) hit++; else miss.push(k + ':' + v); } }
  }
  return { id, pages: f.pages, matched: hit, of: tot, missing: miss.slice(0, 6), ok: tot === 0 ? null : hit >= Math.ceil(tot * 0.8) };
}), 'every figure of both years found on the cited statement page (or the next)');

/* ---------- 6. the exemplar pages and the section structures ---------- */
const CUES = { chair_letter: ['chair', 'dear', 'shareholders'], ceo_letter: ['chief executive', 'ceo', 'dear'], highlights: ['highlights', 'at a glance', 'overview'], mdna: ['management', 'discussion', 'results of operations', 'financial review'],
  principal_risks: ['risk'], viability: ['viability', 'going concern'], governance: ['governance', 'board'], audit_committee: ['audit committee'], auditor_report: ['independent auditor', 'report of independent', 'opinion'], kams: ['key audit matter', 'critical audit matter'],
  statements: ['statement', 'consolidated'], notes: ['note'], remuneration: ['remuneration', 'compensation'], sustainability: ['sustainab', 'esg', 'climate'], strategy: ['strateg'], icfr: ['internal control'], ceo_review: ['chief executive', 'ceo', 'dear', 'review'], chair_review: ['chair', 'dear'] };
const cueHit = (key, p) => { const cues = CUES[key] || [key.replace(/_/g, ' ')]; const txt = pageText(p); return cues.some((c) => txt.includes(c)); };
section('exemplars', C.EXEMPLARS.flatMap((ex) => (ex.sources || []).map((s) => ({ section: ex.section, report: s.report, page: s.page, note: s.note, ok: cueHit(ex.section.replace(/([A-Z])/g, '_$1').toLowerCase(), s.page) }))), 'the exemplar page carries the section\'s cue words');
section('structures', C.reportIds().map((id) => {
  const st = C.reportStructure(id), r = C.reportList().find((x) => x.id === id);
  const checked = st.filter((s) => CUES[s.key]), hits = checked.filter((s) => cueHit(s.key, s.page) || cueHit(s.key, s.page + 1));
  const inRange = st.every((s) => s.page >= r.from && s.page <= r.to);
  return { id, sections: st.length, cued: checked.length, cueHits: hits.length, inRange, ok: inRange && (checked.length === 0 || hits.length >= Math.ceil(checked.length * 0.7)) };
}), 'section first pages inside the report range; cue words on the page (±1) for the sections with cues');

/* ---------- 7. the corpus statistics, derived again from the pages ---------- */
const reports = C.reportList();
const auditorPages = (r) => { const ps = []; for (let p = r.from; p <= r.to; p++) { const t = pageText(p); if (/key audit matter|critical audit matter/.test(t) && /(how our audit addressed|how the matter was addressed|our response|our audit approach|procedures|we performed|our audit procedures|how we addressed)/.test(t)) ps.push(p); } return ps; };
const PROC = { forecasts: /forecast|business plan|cash flow projection|budget/, test_controls: /test(ed|ing)? (of )?(the )?(design and )?(operating effectiveness of )?(key |relevant |internal |it )?controls|controls? testing|tested controls/, discount_rates: /discount rate/, experts: /our (valuation |actuarial |tax |it )?(specialists|experts)|specialists|experts/, sample: /sample|sampling/, recalculat: /recalculat/, third_party: /third[- ]party|external (confirmation|data)|confirmation/, sensitivity: /sensitivit/, disclosures: /disclosure/ };
const procStat = {}; for (const [k, re] of Object.entries(PROC)) procStat[k] = { mentions: 0, reports: 0 };
let kamPagesTotal = 0, reportsWithKams = 0;
for (const r of reports) {
  const ps = auditorPages(r); kamPagesTotal += ps.length; if (ps.length) reportsWithKams++;
  const txt = ps.map(pageText).join('\n');
  for (const [k, re] of Object.entries(PROC)) { const n = (txt.match(new RegExp(re.source, 'g')) || []).length; procStat[k].mentions += n; if (n) procStat[k].reports++; }
}
const engineProc = Object.fromEntries(C.kamProcedures().map((x) => [x.key, { mentions: x.mentions, reports: x.reports }]));
section('kam-procedures', Object.keys(PROC).map((k) => ({ key: k, mine: procStat[k], engine: engineProc[k] || null, ok: !engineProc[k] || Math.abs(engineProc[k].reports - procStat[k].reports) <= Math.max(4, Math.round(engineProc[k].reports * 0.3)) })),
  'reports whose auditor-report pages mention the procedure — my regex reading beside the engine (±30 % or 4 reports)');
const RISK = { cyber: /cyber|data breach|information security/, competition: /competit/, fraud_conduct: /fraud|misconduct|bribery|corruption/, reputation: /reputation/, macroeconomic: /macroeconomic|inflation|interest rate|recession|economic conditions/, supply_chain: /supply chain|supplier/, legal: /litigation|legal proceedings|regulatory/, climate: /climate/, talent: /talent|key personnel|employees|workforce/, geopolitical: /geopolitic|war|sanction/ };
const riskStat = {}; for (const k of Object.keys(RISK)) riskStat[k] = 0;
for (const r of reports) { const txt = []; for (let p = r.from; p <= r.to; p++) { const t = pageText(p); if (/principal risks|risk factors|key risks|material risks/.test(t)) txt.push(t); } const joined = txt.join('\n'); for (const [k, re] of Object.entries(RISK)) if (re.test(joined)) riskStat[k]++; }
const engineRisk = Object.fromEntries(C.riskCatalogue().map((x) => [x.key, x.reports]));
section('risk-categories', Object.keys(RISK).map((k) => ({ key: k, mine: riskStat[k], engine: engineRisk[k] ?? null, ok: engineRisk[k] == null || Math.abs(engineRisk[k] - riskStat[k]) <= 6 })), 'reports whose risk pages mention the category (±6 reports)');
const elements = { kams: 0, fraud: 0, other_information: 0, going_concern: 0, materiality: 0 };
for (const r of reports) { let ap = ''; for (let p = r.from; p <= r.to; p++) { const t = pageText(p); if (/independent auditor|report of independent registered|auditor.s report/.test(t)) ap += t + '\n'; } if (!ap) continue; if (/key audit matter|critical audit matter/.test(ap)) elements.kams++; if (/fraud/.test(ap)) elements.fraud++; if (/other information/.test(ap)) elements.other_information++; if (/going concern/.test(ap)) elements.going_concern++; if (/materiality/.test(ap)) elements.materiality++; }
const engineEl = (() => { try { return C.auditorElements(); } catch { return null; } })();
section('auditor-elements', Object.entries(elements).map(([k, v]) => ({ key: k, mine: v, engine: engineEl ? (Array.isArray(engineEl) ? (engineEl.find((x) => x.key === k) || {}).reports ?? null : engineEl[k] ?? null) : null, ok: true })), 'reports whose auditor-report pages carry the element (engine value when its key matches)');
out.summary = { reportsWithAuditorKamPages: reportsWithKams, kamPagesFound: kamPagesTotal, engineAuditorReportsFound: C.AUDITOR_REPORTS_FOUND };

/* ---------- the verdict ---------- */
const lines = [`# Bundle re-verification — ${out.checked}`, '', `Pages read: ${N}. Engine: REPORTS ${G.REPORTS.length} · KAMS ${G.KAMS.length} · MATERIALITY ${G.MATERIALITY.length} · PEERS ${P.PEERS.length} · corpus figures ${figs.length} · sections ${C.SECTIONS.length}.`, ''];
for (const s of out.sections) {
  const rows = s.rows, okN = rows.filter((r) => r.ok === true).length, bad = rows.filter((r) => r.ok === false);
  lines.push(`## ${s.name} — ${okN}/${rows.filter((r) => r.ok !== null).length} ok`, `_${s.note}_`, '');
  if (bad.length) { lines.push('| item | detail |', '|---|---|'); for (const b of bad.slice(0, 40)) lines.push(`| ${b.id || b.report || b.key || b.section} ${b.page ? 'p.' + b.page : ''} | ${JSON.stringify(Object.fromEntries(Object.entries(b).filter(([k]) => !['ok', 'id', 'report', 'key', 'page', 'title', 'company', 'fields'].includes(k)))).slice(0, 220)} |`); lines.push(''); }
  if (['kam-procedures', 'risk-categories', 'auditor-elements'].includes(s.name)) { lines.push('| key | mine | engine |', '|---|---|---|'); for (const r of rows) lines.push(`| ${r.key} | ${JSON.stringify(r.mine)} | ${JSON.stringify(r.engine)} |`); lines.push(''); }
}
lines.push(`Auditor-report KAM pages found by this reading: ${kamPagesTotal} in ${reportsWithKams} reports (engine: ${C.AUDITOR_REPORTS_FOUND} auditor reports).`);
const md = lines.join('\n');
if (process.argv[2]) fs.writeFileSync(process.argv[2], md); else console.log(md);
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
const failed = out.sections.filter((s) => ['reports', 'kams', 'materiality', 'peers', 'figures'].includes(s.name)).reduce((n, s) => n + s.rows.filter((r) => r.ok === false).length, 0);
console.error(`bundle_verify: ${failed} page-cited claims did not verify`);
