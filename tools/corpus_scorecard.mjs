// FOUNDATION P5 — the corpus scorecard: for each of the 47 companies of the research bundle (12,506 pages), what SQC's
// deterministic review reaches from the company's published trial balance against what its auditor reported — the key audit
// matters found, materiality against the disclosed figure, and the share of the report's sections SQC's report pack carries.
// The JSON is the regression matrix: tools/corpus_scorecard.test.mjs recomputes it and fails on any difference.
//   node tools/corpus_scorecard.mjs            → writes docs/registry/corpus/SCORECARD_ar.md + corpus-scorecard.json
//   node tools/corpus_scorecard.mjs --check    → exits 1 when the committed matrix differs from the engines
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const OUT = new URL('docs/registry/corpus/', root);
const ctx = { window: {}, structuredClone }; /* the P&G source adapter copies its model (browsers have structuredClone) */ vm.runInNewContext(fs.readFileSync(new URL('ui/core/engines.js', root), 'utf8'), ctx);
const R = ctx.window.SKEngines.audit.corpusReplay;
const MODES = { none: false, sector: true, smoothed: 'smoothed' };

export function scorecard() {
  const totals = {}, runs = {};
  for (const [k, p] of Object.entries(MODES)) {
    const a = runs[k] = R.replayAll({ prior: p });
    totals[k] = { companies: a.companies, withKams: a.withKams, kamThemes: a.kamThemes, recall: a.recall, rankedRecall: a.rankedRecall, precision: a.precision, anyMatch: a.anyMatch, structure: a.structure,
      missed: a.missed.map((m) => [m.theme, m.n]) };
  }
  const companies = runs.sector.list.map((r) => ({
    id: r.id, company: r.company, sector: r.sector, auditor: r.auditor, fy: r.fy, unit: r.unit, balanced: r.balanced,
    found: Object.fromEntries(r.actual.map((a) => [a.theme, a.found])),
    selected: r.ours.filter((o) => o.selected).map((o) => o.key),
    recall: r.recall, rankedRecall: r.rankedRecall, precision: r.precision,
    materiality: { ours: r.materiality.ours, disclosed: r.materiality.disclosed, ratio: r.materiality.ratio, page: r.materiality.page },
    structure: r.structure.share, requests: r.requests, findings: r.findings,
    recallNoPrior: runs.none.list.find((x) => x.id === r.id).recall,
  }));
  return { note: 'P5 regression matrix — regenerate with node tools/corpus_scorecard.mjs and explain any change in the PR', totals, companies };
}

const pc = (v) => v == null ? '—' : Math.round(v * 100) + '%';
const FOUND = { selected: '✓', ranked: '◐', missed: '✗' };
function markdown(s) {
  const t = s.totals, L = [];
  L.push('# بطاقة نتائج الحزمة المرجعية (P5)', '',
    '> مولَّدة بـ `tools/corpus_scorecard.mjs` من المحركات نفسها التي يستخدمها التطبيق. لكل شركة من الحزمة (47 شركة بقوائم منشورة): ما يصل إليه SQC من ميزانها وحده، مقابل ما كتبه مراجعها. ملف المراجعة المفتوح من باب المراجعة يصل إلى الأرقام نفسها (`tools/corpus_same_results.test.mjs`). أي تغيير في هذه الأرقام يُفشل `tools/corpus_scorecard.test.mjs` حتى تُعاد كتابة المصفوفة ويُشرح السبب.', '',
    '## الإجمالي', '',
    '| المقياس | بلا خبرة القطاع | بخبرة القطاع (الافتراضي) | الخبرة الممهّدة |', '|---|---|---|---|',
    `| شركات / فيها أمور رئيسية / مواضيع | ${t.none.companies} / ${t.none.withKams} / ${t.none.kamThemes} | ${t.sector.companies} / ${t.sector.withKams} / ${t.sector.kamThemes} | ${t.smoothed.companies} / ${t.smoothed.withKams} / ${t.smoothed.kamThemes} |`,
    `| ما وجده SQC من أمور المراجع (ضمن الثلاثة المختارة) | ${pc(t.none.recall)} | **${pc(t.sector.recall)}** | ${pc(t.smoothed.recall)} |`,
    `| ضمن المرشحين المرتبين | ${pc(t.none.rankedRecall)} | **${pc(t.sector.rankedRecall)}** | ${pc(t.smoothed.rankedRecall)} |`,
    `| دقة الاختيار | ${pc(t.none.precision)} | **${pc(t.sector.precision)}** | ${pc(t.smoothed.precision)} |`,
    `| شركات وجد SQC أمراً واحداً على الأقل من أمورها | ${t.none.anyMatch} | **${t.sector.anyMatch}** | ${t.smoothed.anyMatch} |`,
    `| أقسام تقرير الشركة التي تحملها حزمة تقارير SQC | ${pc(t.none.structure)} | ${pc(t.sector.structure)} | ${pc(t.smoothed.structure)} |`, '',
    'خبرة القطاع تُحسب دائماً مع استبعاد الشركة نفسها (leave-one-out)، فلا تُعلِّم الشركةُ ترتيبها.', '',
    '**أكثر ما يفوت SQC (بخبرة القطاع):** ' + t.sector.missed.map(([k, n]) => `\`${k}\` ${n}`).join('، '), '');
  const mats = s.companies.filter((c) => c.materiality.disclosed != null);
  L.push('## الأهمية النسبية مقابل ما أفصح عنه المراجع', '', '| الشركة | SQC | المراجع | النسبة | ضمن ±33%؟ | الصفحة |', '|---|---|---|---|---|---|');
  for (const c of mats) L.push(`| ${c.company} (${c.unit}) | ${c.materiality.ours} | ${c.materiality.disclosed} | ${c.materiality.ratio} | ${c.materiality.ratio >= 0.75 && c.materiality.ratio <= 1.33 ? 'نعم' : '**لا**'} | ${c.materiality.page ?? '—'} |`);
  L.push('', `ضمن النطاق: ${mats.filter((c) => c.materiality.ratio >= 0.75 && c.materiality.ratio <= 1.33).length} من ${mats.length}.`, '',
    '## الشركات', '', '✓ اختاره SQC · ◐ ضمن مرشحيه · ✗ فاته', '',
    '| الشركة | القطاع | المراجع | السنة | أمور المراجع | ما اختاره SQC | وجد | دقة | بلا خبرة | الأقسام | متوازن |', '|---|---|---|---|---|---|---|---|---|---|---|');
  for (const c of s.companies) L.push(`| ${c.company} | ${c.sector} | ${c.auditor} | ${c.fy} | ${Object.entries(c.found).map(([k, v]) => FOUND[v] + ' ' + k).join('<br>') || '—'} | ${c.selected.join('، ') || '—'} | ${pc(c.recall)} | ${pc(c.precision)} | ${pc(c.recallNoPrior)} | ${pc(c.structure)} | ${c.balanced ? 'نعم' : '**لا**'} |`);
  L.push('');
  return L.join('\n');
}

if (process.argv[1] && process.argv[1].endsWith('corpus_scorecard.mjs')) {
  const s = scorecard(), json = JSON.stringify(s, null, 1) + '\n', md = markdown(s) + '\n';
  const jf = new URL('corpus-scorecard.json', OUT), mf = new URL('SCORECARD_ar.md', OUT);
  if (process.argv.includes('--check')) {
    const same = fs.existsSync(jf) && fs.readFileSync(jf, 'utf8') === json && fs.existsSync(mf) && fs.readFileSync(mf, 'utf8') === md;
    console.log(same ? 'corpus scorecard: matrix matches the engines' : 'corpus scorecard: the engines no longer produce the committed matrix — run node tools/corpus_scorecard.mjs and explain the change');
    process.exit(same ? 0 : 1);
  }
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(jf, json); fs.writeFileSync(mf, md);
  const t = s.totals.sector;
  console.log(`corpus scorecard: ${t.companies} companies · recall ${pc(t.recall)} · ranked ${pc(t.rankedRecall)} · precision ${pc(t.precision)} · structure ${pc(t.structure)}`);
}
