// R20 (FOUNDATION §3.11.1–2): one identity from the first screen to the printed page. «دفتر KOSIF» (data-brand="ledger", the
// default) is worn by the door, the brand art, the install icons, the crystal world, the in-app bands and every printed or
// presented document; «كوبالت وجليد» stays a choice in the appearance menu and keeps its own colours when chosen.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const COBALT = /#(?:2340c4|0b1030|19c3d9|2a46d6|070a1e|9beef7|b6f3fa)(?![0-9a-f])/gi;

function brandCSS(brand) {
  const src = read('ui/core/sk.js');
  const body = src.slice(src.indexOf('const LEDGER_HEX'), src.indexOf('function brandPrint'));
  const document = { documentElement: { dataset: { brand } } };
  return new Function('document', body + ';return brandCSS;')(document);
}

test('printed documents: the cobalt palette maps to ink, paper and saffron by role under «دفتر KOSIF»', () => {
  const f = brandCSS('ledger');
  assert.equal(f('h2{color:#2340c4}'), 'h2{color:#a53e07}', 'text → readable saffron');
  assert.equal(f('th{background:#2340c4}'), 'th{background:#1d1814}', 'a filled background → ink');
  assert.equal(f('hr{border-top:3px solid #2340C4}'), 'hr{border-top:3px solid #d9530e}', 'a rule → saffron');
  assert.equal(f('b{color:#0b1030}i{box-shadow:0 0 0 4px rgba(35,64,196,.14)}'), 'b{color:#1d1814}i{box-shadow:0 0 0 4px rgba(217,83,14,.14)}');
  assert.equal(f('x{border-color:#2340c4ff}'), 'x{border-color:#d9530eff}', 'a colour with alpha keeps its alpha');
  assert.equal(brandCSS('')('h2{color:#2340c4}'), 'h2{color:#2340c4}', '«كوبالت وجليد» chosen: the styles stay as written');
});

test('every print and presentation path goes through brandCSS', () => {
  const sk = read('ui/core/sk.js');
  assert.match(sk, /st\.textContent=brandCSS\(PRINT_CSS\+\(kosifLook\(\)\?PRINT_KOSIF:""\)\)/);
  assert.match(sk, /brandCSS\(letterhead\(/);
  assert.match(sk, /bs\.textContent=brandCSS\(BAR_CSS\)/);
  assert.equal((sk.match(/cs\.textContent=SKCharts\.printCSS/g) || []).length, 0, 'charts print styles are branded');
  assert.match(sk, /css:o=>brandCSS\(optCSS\(o\)\)/);
  for (const [f, re] of [['ui/features/tb-review.js', /SK\.brandCSS:String\)\(SKosifReportDocs\.CSS/g], ['ui/features/report-pack.js', /SK\.brandCSS:String\)\(PACK_CSS/],
    ['ui/features/channel-profit.js', /SK\.brandCSS:String\)\(PRINT\)/], ['ui/core/output.js', /SK\.brandCSS:String\)\(PRES_CSS\)/]])
    assert.match(read(f), re, f + ' brands its printed styles');
  assert.equal((read('ui/features/tb-review.js').match(/SK\.brandCSS:String\)\(SKosifReportDocs\.CSS/g) || []).length, 2, 'both report-doc paths (screen and print)');
});

test('the brand art, the door, the manifest and the topbar mark carry no cobalt', () => {
  for (const f of ['ui/art/sqc-icon.svg', 'ui/art/sqc-logo.svg', 'ui/art/sqc-mark.svg', 'ui/art/sqc-mark-dark.svg', 'ui/art/kosif-icon.svg', 'ui/art/kosif-cloud.svg', 'ui/art/kosif-sky.svg', 'manifest.webmanifest'])
    assert.deepEqual(read(f).match(COBALT), null, f);
  const door = read('unlock.html');
  assert.deepEqual(door.slice(0, door.indexOf('<!--SQC:AUTH:START-->')).match(COBALT), null, 'the door styles');
  assert.match(door, /<meta name="theme-color" content="#1d1814">/);
  const tb = read('ui/layouts/topbar.js').split('\n').filter((l) => /^\s*(sqc|cloud):'<svg/.test(l)).join('\n');
  assert.ok(tb.length > 100);
  assert.deepEqual(tb.match(COBALT), null, 'the topbar SQC mark');
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.equal(m.theme_color, '#1d1814');
  assert.equal(m.background_color, '#1d1814');
});

test('the crystal world wears the identity on screen; the door asks for «دفتر KOSIF»', () => {
  const src = read('ui/art/crystal-world.js');
  assert.match(src, /ledger:\{iceA:\[0\.114,0\.094,0\.078\],iceB:\[0\.85,0\.33,0\.055\]/);
  assert.match(src, /dataset\.brand==="ledger"\?"ledger":"cobalt"/);
  assert.ok(!/vec3\(0\.043,0\.063,0\.19\)/.test(src.slice(src.indexOf('const FS='), src.indexOf('const SVS='))), 'no colour is fixed in the shader');
  assert.match(read('unlock.html'), /SQCCrystal\.mount\(c,\{[^}]*palette:"ledger"\}\)/);
});

test('«كوبالت وجليد» stays a choice: its tokens and its theme entry are kept', () => {
  assert.match(read('ui/ds/tokens.css'), /--sk-brand:#2340c4/);
  assert.match(read('ui/layouts/shell.js'), /\["cobalt",/);
});
