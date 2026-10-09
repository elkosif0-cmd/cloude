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
  const sources = ['unlock.html', 'ui/features/command-center.js', 'ui/features/luxe-screens.css', 'ui/features/tbreview.css', 'ui/layouts/topbar.js'].map(read).join('\n');
  const named = new Set([...sources.matchAll(/art\/brand\/([a-z0-9-]+\.(?:webp|mp4))/g)].map((m) => m[1]));
  const gates = read('unlock.html').match(/const GATE_ART=\{([^}]*)\}/)[1];
  for (const m of gates.matchAll(/\["([a-z0-9-]+)"/g)) named.add(m[1] + '.webp');
  assert.ok(named.size >= 6, [...named].join(','));
  for (const f of named) {
    assert.ok(existsSync(art(f)), f);
    // A single 5-second 4K desktop-only cinematic is intentionally allowed a larger media budget.
    // All previous brand assets retain the original tight limits.
    const budget = f === 'earth-intro-20261009-4k.mp4' ? 8e6 : (f.endsWith('.mp4') ? 1.5e6 : 160e3);
    assert.ok(statSync(art(f)).size < budget, f + ' exceeds its explicit media budget');
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

test('KOSIF EARTH presents one optional media intro with adaptive 4K desktop and safe mobile fallback', () => {
  const door = read('unlock.html');
  const script = read('ui/art/brand/earth-intro-20261009.js');
  assert.match(door, /id="kosif-earth-intro"/);
  assert.match(door, /data-src4k="\.\/art\/brand\/earth-intro-20261009-4k\.mp4"/);
  assert.match(door, /data-src="\.\/art\/brand\/earth-intro-20261009\.mp4"/);
  assert.match(door, /id="kosif-earth-skip"/);
  assert.match(door, /id="kosif-earth-enter"/);
  assert.match(door, /id="kosif-earth-sound"/);
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /connection\.saveData/);
  assert.match(script, /sessionStorage\.setItem\('kosif-earth-intro-seen-v1'/);
  assert.match(script, /usingHigh && mobileSrc/);
  assert.match(script, /shell\.inert/);
  assert.ok(statSync(art('earth-intro-20261009.mp4')).size < 1.5e6);
  assert.ok(statSync(art('earth-intro-20261009-4k.mp4')).size < 8e6);
  assert.ok(!existsSync(art('owner-source-hq.jpg')), 'the private portrait must not be published');
});
