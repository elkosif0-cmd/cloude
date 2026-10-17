// R10 (docs/rebuild/HARSH_REVIEW_20261008_ar.md): what the harsh review fixed stays fixed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const caps = JSON.parse(read('ui/core/capabilities.json'));
const features = fs.readdirSync(new URL('../ui/features/', import.meta.url)).filter((f) => f.endsWith('.js'));

function registry(sector) {
  const ctx = {SK: {company: {current: () => ({sector: sector()})}}, __SK_CAPS__: caps};
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(read('ui/core/registry.js'), ctx, {filename: 'ui/core/registry.js'});
  return ctx.SK.caps;
}

test('screens made for a sector are offered only to companies of that sector', () => {
  let now = 'meat';
  const R = registry(() => now);
  const meat = caps.capabilities.filter((c) => (c.sectors || []).includes('meat')).map((c) => c.id);
  assert.ok(meat.includes('carcass') && meat.includes('blending') && meat.includes('culinary'), 'the meat tools carry their sector');
  const menuIds = () => R.menu('tools').flatMap((s) => s.hubs.map((h) => h.id));
  assert.ok(menuIds().includes('carcass'), 'a meat company sees the carcass lab');
  now = 'bakery';
  assert.ok(!menuIds().includes('carcass') && !menuIds().includes('blending'), 'a bakery does not');
  assert.deepEqual([...R.members('carcass')].map((c) => c.id), [], 'nor its pages');
  assert.equal(R.fits('nrv'), false);
  assert.equal(R.fits('ledger'), true, 'a screen without sectors fits every company');
  now = '';
  assert.equal(R.fits('nrv'), true, 'no open company hides nothing');
});

test('no module draws a second tab bar of its own', () => {
  for (const f of features) {
    const src = read('ui/features/' + f);
    assert.doesNotMatch(src, /function (?:pos|butchery|storage|finance)HubNav\(/, f);
    assert.doesNotMatch(src, /\((?:F2|F3|F4|F8|F9)\)/, f + ': F-key codes in labels');
  }
});

test("no company's outputs carry a fixed business name", () => {
  for (const f of features) assert.doesNotMatch(read('ui/features/' + f), /أغنام الوادي/, f);
  assert.doesNotMatch(read('ui/core/sk.js'), /أغنام الوادي/, 'print headers name the open company');
});

test('section labels are Arabic', () => {
  for (const f of features) {
    const hits = [...read('ui/features/' + f).matchAll(/class="eyebrow">([^<]*)</g)].map((m) => m[1]).filter((t) => /^[A-Z][A-Z '&/·]{3,}$/.test(t.trim()));
    assert.deepEqual(hits, [], f);
  }
});
