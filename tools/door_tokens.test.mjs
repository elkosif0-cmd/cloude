// FOUNDATION §3.11.2: the entry door is part of the one S.KOSIF identity. Its colours are tokens that
// mirror the «دفتر KOSIF» look in ui/ds/tokens.css, and the door's own rules use no literal colours.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../unlock.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../ui/ds/tokens.css', import.meta.url), 'utf8');
const vars = (block) => Object.fromEntries([...block.matchAll(/(--sk-[a-z0-9-]+):([^;}]+)/g)].map((m) => [m[1], m[2].trim()]));
/* R20: the door wears the default identity «دفتر KOSIF» (data-brand="ledger", the default look since R19) */
const luxe = vars(css.match(/:root\[data-look="kosif"\]\[data-brand="ledger"\]\{\n([\s\S]*?)\n\}/)[1]);
const door = vars(html.match(/\/\* door tokens[\s\S]*?\*\/\s*:root\{([^}]*)\}/)[1]);
const rules = html.slice(html.indexOf('.gate-list{'), html.indexOf('@media (max-width:820px){.sector-list'));

test('every door token equals the «دفتر KOSIF» token of the same name', () => {
  assert.ok(Object.keys(door).length >= 10);
  for (const [k, v] of Object.entries(door)) assert.equal(v, luxe[k], k);
});

test('the door rules (sections, sectors, bundle companies) use tokens, not literal colours', () => {
  assert.ok(rules.includes('.gate{') && rules.includes('.sector{') && rules.includes('.corpus{'));
  assert.deepEqual(rules.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g), null);
  for (const t of rules.match(/var\(--sk-[a-z0-9-]+/g)) assert.ok(t.slice(4) in door, `${t.slice(4)} is defined on the door`);
});
