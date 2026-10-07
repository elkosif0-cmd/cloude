// The Higgsfield visuals (docs/design/HIGGSFIELD_VISUALS_ar.md): every sector has its picture, every picture the door and
// the screens ask for exists, the clips stay light, and the service worker never caches a video stream.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, root), 'utf8');
const art = (f) => new URL('ui/art/brand/' + f, root);
const caps = JSON.parse(read('ui/core/capabilities.json'));

test('every sector of the accounting entry has its picture', () => {
  assert.ok(caps.sectors.length >= 10);
  for (const s of caps.sectors) assert.ok(existsSync(art('sector-' + s.id + '.webp')), 'sector-' + s.id + '.webp');
});

test('every brand file the door and the screens name exists, and stays light', () => {
  const sources = ['unlock.html', 'ui/features/command-center.js', 'ui/features/luxe-screens.css', 'ui/features/tbreview.css', 'ui/features/ledger.js'].map(read).join('\n');
  const named = new Set([...sources.matchAll(/art\/brand\/([a-z0-9-]+\.(?:webp|mp4))/g)].map((m) => m[1]));
  const gates = read('unlock.html').match(/const GATE_ART=\{([^}]*)\}/)[1];
  for (const m of gates.matchAll(/\["([a-z0-9-]+)"/g)) named.add(m[1] + '.webp');
  assert.ok(named.size >= 6, [...named].join(','));
  for (const f of named) {
    assert.ok(existsSync(art(f)), f);
    assert.ok(statSync(art(f)).size < (f.endsWith('.mp4') ? 1.5e6 : 160e3), f + ' is too heavy for the door');
  }
});

test('the door film only plays where it should, and the poster is the still', () => {
  const door = read('unlock.html');
  assert.match(door, /<video class="visual-film" id="door-film" muted loop playsinline preload="none" poster="\.\/art\/brand\/door-hero\.webp" data-src="\.\/art\/brand\/door\.mp4">/);
  assert.match(door, /prefers-reduced-motion: reduce\)"\)\|\|mq\("\(max-width: 820px\)"\)\|\|\(navigator\.connection&&navigator\.connection\.saveData\)\)return;/);
  /* the art map is declared before the first paint of the gates (show("gates") runs before the world code) */
  assert.ok(door.indexOf('const GATE_ART=') < door.indexOf('if(!resume())show("gates")'));
});

test('the service worker lets video and range requests through to the network', () => {
  assert.ok(read('sw.js').includes("if(r.headers.has('range')||/\\.(mp4|webm)(\\?|$)/.test(r.url))return;"));
});
