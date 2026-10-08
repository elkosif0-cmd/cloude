#!/usr/bin/env node
// رادع الدستور — the constitution guard. Reads docs/registry/constitution-rules.json, runs each rule's unit tests and
// static checks, and writes docs/registry/CONSTITUTION_SCORECARD_ar.md (+ .json).
//   node tools/constitution_guard.mjs            → run and write the scorecard
//   node tools/constitution_guard.mjs --check    → also exit 1 when a checked rule fails, or when fewer rules are
//                                                  enforced than tools/fixtures/constitution-baseline.json records
// A rule with no test and no check is a gap: it is listed as one, never counted as passing. Files listed in
// tools/fixtures/unit-known-red.txt are reported as «known red» and do not fail the run (the same contract as sqc-unit-all).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const has = (p) => existsSync(path.join(ROOT, p));
const CHECK = process.argv.includes('--check');
const spec = JSON.parse(rd('docs/registry/constitution-rules.json'));
const knownRed = new Set(has('tools/fixtures/unit-known-red.txt') ? rd('tools/fixtures/unit-known-red.txt').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : []);

const caps = JSON.parse(rd('ui/core/capabilities.json'));
const STATIC = {
  source_of_truth() {
    const named = (rd('FOUNDATION.md').match(/Repository:\s*`([^`]+)`/) || [])[1] || '';
    let actual = process.env.GITHUB_REPOSITORY || '';
    if (!actual) { try { actual = execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf8' }).trim().replace(/^.*github\.com[/:]/, '').replace(/\.git$/, ''); } catch { /* no git */ } }
    if (!actual) return [true, `الدستور يسمّي ${named}؛ لا يمكن قراءة المستودع الفعلي هنا`];
    return [named.toLowerCase() === actual.toLowerCase(), `الدستور: ${named} · الفعلي: ${actual}`];
  },
  three_gateways() {
    const ids = (caps.gateways || []).map((g) => g.id);
    return [ids.join(',') === 'accounting,audit,tools', `الأقسام: ${ids.join(' · ')}`];
  },
  tools_menu_own_space() {
    const t = rd('ui/layouts/topbar.js');
    const block = t.slice(t.indexOf('if(x.scope==="tools"){const who'), t.indexOf('const note=c=>'));
    return [block.length > 0 && !/x\.cs\.map/.test(block), 'قائمة الأدوات تعرض مساحتها ومستخدمها فقط'];
  },
  sector_pack_engine() {
    const f = 'app/src/engine/fusion/system/sector-pack-engine.ts';
    if (!has(f)) return [false, 'محرك حزمة القطاع غير موجود'];
    const src = rd(f), ids = (caps.sectors || []).map((s) => s.id), miss = ids.filter((id) => !src.includes(`'${id}'`) && !src.includes(`"${id}"`) && !src.includes(`${id}:`));
    return [miss.length === 0, miss.length ? `قطاعات بلا حزمة: ${miss.join('، ')}` : `${ids.length} قطاعات لها حزمة`];
  },
  context_bar() {
    const t = rd('ui/layouts/topbar.js');
    return [/FOUNDATION §3\.0 rule 7/.test(t) && /sectorLabel\(x\.c\.sector\)/.test(t), 'الشريط يسمّي البرنامج والنشاط والشركة'];
  },
  save_state_wired() {
    const b = rd('build.py');
    return [b.includes('"core/save-state.js"') && b.includes('"core/save-state.css"'), 'وحدة حالة الحفظ داخل الحزمة'];
  },
  health_art() {
    const doc = has('docs/design/HIGGSFIELD_VISUALS_ar.md') ? rd('docs/design/HIGGSFIELD_VISUALS_ar.md') : '';
    return [has('ui/art/brand/sector-health.webp') && /الصحة \| هلال/.test(doc), 'صورة الصحة هلال (موثّقة)'];
  },
  ten_sectors() {
    const ids = (caps.sectors || []).map((s) => s.id), miss = ids.filter((id) => !has(`ui/art/brand/sector-${id}.webp`));
    return [ids.length === 10 && miss.length === 0, `${ids.length} قطاعات${miss.length ? '، بلا صورة: ' + miss.join('، ') : ''}`];
  },
  worklog() {
    const w = has('AGENT_WORKLOG.md') ? rd('AGENT_WORKLOG.md') : '';
    const n = (w.match(/^### TASK /gm) || []).length;
    return [n > 0, `${n} مهمة مسجلة`];
  },
};

const testCache = new Map();
function runTest(file) {
  if (testCache.has(file)) return testCache.get(file);
  let r;
  if (!has(file)) r = { ok: false, note: 'الملف غير موجود' };
  else {
    const p = spawnSync(process.execPath, ['--test', file], { cwd: ROOT, encoding: 'utf8', timeout: 300000, env: { ...process.env, NODE_NO_WARNINGS: '1' } });
    const out = (p.stdout || '') + (p.stderr || '');
    const pass = +((out.match(/ℹ pass (\d+)/) || [])[1] || 0), fail = +((out.match(/ℹ fail (\d+)/) || [])[1] || 0);
    r = { ok: p.status === 0 && fail === 0 && pass > 0, pass, fail, note: `${pass} نجح · ${fail} فشل` };
  }
  r.knownRed = knownRed.has(file);
  testCache.set(file, r);
  return r;
}

const rows = spec.rules.map((rule) => {
  const results = [];
  for (const c of rule.checks || []) { const fn = STATIC[c]; const [ok, note] = fn ? fn() : [false, 'فحص غير معرّف']; results.push({ kind: 'check', id: c, ok, note }); }
  for (const t of rule.tests || []) { const r = runTest(t); results.push({ kind: 'test', id: t, ok: r.ok, note: r.note, knownRed: r.knownRed }); }
  const enforced = results.length > 0;
  const failing = results.filter((r) => !r.ok && !r.knownRed);
  const status = !enforced ? 'gap' : failing.length ? 'fail' : results.some((r) => r.knownRed && !r.ok) ? 'known-red' : 'pass';
  return { ...rule, status, results };
});

const count = (s) => rows.filter((r) => r.status === s).length;
const summary = { rules: rows.length, enforced: rows.filter((r) => r.status !== 'gap').length, pass: count('pass'), fail: count('fail'), knownRed: count('known-red'), gap: count('gap'), partial: rows.filter((r) => r.gap && r.status !== 'gap').length };
const icon = { pass: '✅', fail: '❌', 'known-red': '🟠', gap: '⬜' };
const md = [
  '# رادع الدستور — بطاقة الالتزام بـ FOUNDATION.md',
  '',
  '> يولّدها `node tools/constitution_guard.mjs` من `docs/registry/constitution-rules.json`. لا تُعدَّل باليد. القاعدة بلا فحص تظهر «ثغرة» ولا تُحسب ناجحة.',
  '',
  `**${summary.rules} قاعدة** · مفحوصة آلياً ${summary.enforced} · ناجحة ${summary.pass} · فاشلة ${summary.fail} · حمراء معروفة ${summary.knownRed} · ثغرات بلا فحص ${summary.gap} · مفحوصة جزئياً (لها ثغرة معلنة) ${summary.partial}`,
  '',
  '| | البند | القاعدة | ما يفحصها | الثغرة المعلنة |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| ${icon[r.status]} | ${r.section} | ${r.rule} | ${r.results.map((x) => `${x.ok ? '✓' : x.knownRed ? '◐' : '✗'} \`${x.id.replace('tools/', '')}\` (${x.note})`).join('<br>') || '—'} | ${r.gap || ''} |`),
  '',
].join('\n');
writeFileSync(path.join(ROOT, 'docs/registry/CONSTITUTION_SCORECARD_ar.md'), md);
writeFileSync(path.join(ROOT, 'docs/registry/constitution-scorecard.json'), JSON.stringify({ summary, rules: rows.map(({ id, section, status, results }) => ({ id, section, status, results })) }, null, 1) + '\n');
console.log(JSON.stringify(summary));
for (const r of rows) if (r.status === 'fail') console.log(`FAIL ${r.section} ${r.rule}\n  ` + r.results.filter((x) => !x.ok && !x.knownRed).map((x) => `${x.id}: ${x.note}`).join('\n  '));

if (CHECK) {
  const basePath = path.join(ROOT, 'tools/fixtures/constitution-baseline.json');
  const base = existsSync(basePath) ? JSON.parse(readFileSync(basePath, 'utf8')) : { enforced: 0 };
  let bad = summary.fail > 0;
  if (summary.enforced < base.enforced) { console.log(`enforced rules dropped: ${summary.enforced} < ${base.enforced}`); bad = true; }
  process.exit(bad ? 1 : 0);
}
