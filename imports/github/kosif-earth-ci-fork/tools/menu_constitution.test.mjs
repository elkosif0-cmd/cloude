// R20: each entry's menu follows FOUNDATION §3.12 (the product structure tree) — accounting's sections inside a company,
// the audit file's stages, and the eight helper-tool families of §3.3.1 — and no screen is left without a section.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const raw = JSON.parse(read('ui/core/capabilities.json'));

function registry({ installed = [], sector = '' } = {}) {
  const ctx = vm.createContext({ SK: { company: { current: () => ({ sector }) } } });
  ctx.window = ctx;
  ctx.__SK_CAPS__ = raw;
  ctx.SKosifCompanyPlatform = { state: () => ({ installedTools: installed }) };
  vm.runInContext(read('ui/core/registry.js'), ctx, { filename: 'registry.js' });
  return ctx.SK.caps;
}
const labels = (caps, g) => caps.menu(g).map((s) => s.label);
const has = (list, word) => list.some((l) => l.includes(word));

test('accounting: the sections of §3.12 «داخل الشركة», in order', () => {
  const L = labels(registry(), 'accounting');
  const order = ['التعريفات وشجرة الحسابات', 'القيود والترحيل والأستاذ', 'المبيعات', 'المشتريات', 'مراكز التكلفة والتكاليف القطاعية',
    'الضرائب', 'التسويات والإقفال', 'القوائم المالية', 'التحليل والتنبؤ', 'أدوات هذه الشركة'];
  const at = order.map((w) => L.findIndex((l) => l.includes(w)));
  assert.ok(at.every((i) => i >= 0), 'missing: ' + order.filter((w, k) => at[k] < 0).join(', '));
  assert.deepEqual(at, [...at].sort((a, b) => a - b), 'sections out of the constitution order: ' + L.join(' | '));
});

test('audit: the audit file stages of §3.12', () => {
  const L = labels(registry(), 'audit');
  for (const w of ['ملفات المراجعة', 'الإجراءات والاختبارات', 'المستندات والأدلة', 'مجلس المراجعين', 'التقرير النهائي', 'المعايير'])
    assert.ok(has(L, w), 'audit menu lacks «' + w + '»: ' + L.join(' | '));
});

test('tools: the eight families of §3.3.1', () => {
  const L = labels(registry(), 'tools');
  for (const w of ['البيانات والملفات', 'المطابقات والتسويات', 'التكاليف والتسعير', 'التحليل والتنبؤ', 'الرقابة والجودة',
    'الضرائب والامتثال', 'الإنتاجية والأتمتة', 'المطور والتكامل'])
    assert.ok(has(L, w), 'tools menu lacks the family «' + w + '»: ' + L.join(' | '));
});

test('still exactly three entries, and every screen of an entry has a section (no «أخرى»)', () => {
  const caps = registry();
  assert.deepEqual(caps.gateways().map((g) => g.id), ['accounting', 'audit', 'tools']);
  for (const g of ['accounting', 'audit', 'tools'])
    assert.ok(!caps.menu(g).some((s) => s.id.endsWith('-more')), g + ' leaves screens in «أخرى»: ' +
      (caps.menu(g).find((s) => s.id.endsWith('-more')) || { hubs: [] }).hubs.map((h) => h.id).join(', '));
});

test('every tab link names a real tab of its screen', () => {
  const ledger = read('ui/features/ledger.js');
  /* the ledger's families: ["close","الإقفال",[…]] — a family's third element is its list of tabs */
  const families = [...ledger.matchAll(/\["(\w+)","[^"]+",\[/g)].map((m) => m[1]);
  /* the audit file's stages: const TABS=[["tb","…"],…] in tb-review.js */
  const review = read('ui/features/tb-review.js');
  const stages = [...review.match(/const TABS=\[(.*?)\];/)[1].matchAll(/\["(\w+)"/g)].map((m) => m[1]);
  const shell = read('ui/layouts/shell.js');
  const caps = registry();
  let audit = 0;
  for (const g of ['accounting', 'audit', 'tools']) for (const s of caps.menu(g)) for (const h of s.hubs.filter((x) => x.link)) {
    assert.ok(['ledger', 'tbreview'].includes(h.view), 'a tab link needs an opener in shell.js TAB_LINKS: ' + h.view);
    assert.ok(new RegExp('[{\\s]' + h.view + ':\\{').test(shell.slice(shell.indexOf('const TAB_LINKS'))), 'TAB_LINKS has no opener for ' + h.view);
    if (h.view === 'tbreview') { audit++; assert.ok(stages.includes(h.tab), 'unknown audit file stage ' + h.tab); continue; }
    if (h.tab[0] === '@') assert.ok(families.includes(h.tab.slice(1)), 'unknown ledger family ' + h.tab);
    else assert.ok(ledger.includes('["' + h.tab + '","'), 'unknown ledger tab ' + h.tab);
  }
  assert.ok(audit >= 7, 'the audit menu reaches the file\'s stages (got ' + audit + ')');
});

test('a tool installed in the company joins «أدوات هذه الشركة» once, and stays in the accounting entry', () => {
  const caps = registry({ installed: ['customers', 'smartmatch', 'nope'] });
  const sec = caps.menu('accounting').find((s) => s.id === 'acc-tools');
  assert.deepEqual(sec.hubs.map((h) => h.id), ['customers', 'helperdesk'], 'smartmatch is already under «التسويات والإقفال»; unknown ids drop');
  assert.ok(caps.inMenu('customers', 'accounting'));
  assert.ok(!caps.inMenu('offers', 'accounting'), 'a tool the company did not add is not in its accounting menu');
});

test('sector screens follow the company sector inside the cost section', () => {
  const ids = (sector) => registry({ sector }).menu('accounting').find((s) => s.id === 'acc-costs').hubs.map((h) => h.id);
  assert.ok(ids('meat').includes('carcass'), 'a meat company costs its carcasses');
  assert.ok(!ids('bakery').includes('carcass'), 'a bakery does not see the carcass lab');
});

test('a page is not listed beside its own hub (the hub already shows it as a tab)', () => {
  const caps = registry();
  for (const g of ['accounting', 'audit', 'tools']) for (const s of caps.menu(g)) {
    const hubs = new Set(s.hubs.filter((h) => !h.page && !h.link).map((h) => h.id));
    for (const h of s.hubs.filter((x) => x.page)) assert.ok(!hubs.has(h.hub), g + ' › ' + s.label + ' lists ' + h.id + ' next to its hub ' + h.hub);
  }
});
