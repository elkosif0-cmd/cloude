// FOUNDATION §3.0 rule 8: the visible save state. ui/core/save-state.js observes the app's writes and reports
// saving → saved, and a failed write stays «failed» until that same key is written successfully again.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(new URL('../ui/core/save-state.js', import.meta.url), 'utf8');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function realm() {
  class Storage {
    constructor() { this.m = new Map(); this.limit = Infinity; }
    setItem(k, v) { if (String(v).length > this.limit) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } this.m.set(k, String(v)); }
    removeItem(k) { this.m.delete(k); }
    getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  }
  class Tx extends EventTarget {}
  class IDBDatabase { constructor(name) { this.name = name; } transaction() { return new Tx(); } }
  const localStorage = new Storage();
  const window = { localStorage };
  const ctx = {
    window, Storage, IDBDatabase, localStorage, setTimeout, clearTimeout, EventTarget, Date, String, Math, Set,
    document: { readyState: 'complete', getElementById: () => null, body: {}, addEventListener() {} },
  };
  window.window = window;
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return { ctx, ls: localStorage, SK: window.SK, IDBDatabase };
}

test('an app write reads saving, then saved once the burst is over', async () => {
  const { ls, SK } = realm();
  assert.equal(SK.saveState.status().state, 'idle');
  ls.setItem('skosif_orders_v1', '[]');
  assert.equal(SK.saveState.status().state, 'saving');
  await wait(220);
  const s = SK.saveState.status();
  assert.equal(s.state, 'saved');
  assert.equal(s.where, 'device');
  assert.ok(s.at > 0 && s.writes === 1);
});

test('keys outside the app and the app\'s own paint keys are not reported', async () => {
  const { ls, SK } = realm();
  ls.setItem('other_site_key', '1');
  ls.setItem('skosif_prefs', '{}');
  ls.setItem('sqc_gate', 'audit');
  await wait(220);
  assert.equal(SK.saveState.status().state, 'idle');
  assert.equal(SK.saveState.status().writes, 0);
});

test('a failed write stays failed until the same key saves again', async () => {
  const { ls, SK } = realm();
  ls.limit = 5;
  assert.throws(() => ls.setItem('skosif_big_v1', 'x'.repeat(50)), /quota/);
  assert.equal(SK.saveState.status().state, 'failed');
  assert.match(SK.saveState.status().error, /ممتلئة/);
  ls.limit = Infinity;
  ls.setItem('skosif_other_v1', '1');
  await wait(220);
  assert.equal(SK.saveState.status().state, 'failed', 'another key does not hide the failure');
  ls.setItem('skosif_big_v1', 'ok');
  await wait(220);
  assert.equal(SK.saveState.status().state, 'saved');
});

test('IndexedDB readwrite transactions on the app database are observed; others are not', async () => {
  const { SK, IDBDatabase } = realm();
  const app = new IDBDatabase('aghnam-app-v7');
  const t = app.transaction(['orders'], 'readwrite');
  assert.equal(SK.saveState.status().state, 'saving');
  t.dispatchEvent(new Event('complete'));
  await wait(220);
  assert.equal(SK.saveState.status().state, 'saved');
  new IDBDatabase('aghnam-app-v7').transaction(['orders'], 'readonly');
  new IDBDatabase('another-db').transaction(['x'], 'readwrite');
  assert.equal(SK.saveState.status().writes, 1);
  const bad = app.transaction(['orders'], 'readwrite');
  bad.dispatchEvent(new Event('abort'));
  assert.equal(SK.saveState.status().state, 'failed');
});

test('the chip never claims a server copy', () => {
  assert.match(src, /لا نسخة على خادم بعد/);
  assert.doesNotMatch(src, /محفوظ على الخادم|تم الرفع/);
});
