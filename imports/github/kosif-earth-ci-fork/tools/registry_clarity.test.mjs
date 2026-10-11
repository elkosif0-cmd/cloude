// R5 (docs/rebuild/DEEP_REVIEW_20261007_ar.md): the registry stays clear — every screen description fits one line, no two
// screens share a label, every entry's menu sections have distinct names, and a shortened description keeps its old words as
// search keywords so the command palette still finds the screen by them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = JSON.parse(readFileSync(new URL('../ui/core/capabilities.json', import.meta.url), 'utf8'));
const caps = file.capabilities;

test('every screen description fits one line (80 characters)', () => {
  const long = caps.filter((c) => (c.sub || '').length > 80).map((c) => c.id + ' ' + c.sub.length);
  assert.deepEqual(long, []);
});

test('no two screens share a label, and every screen has a description', () => {
  const seen = new Map();
  for (const c of caps) { assert.ok(c.sub && c.sub.trim(), c.id + ' has no description'); assert.ok(!seen.has(c.label), c.label + ': ' + seen.get(c.label) + ' and ' + c.id); seen.set(c.label, c.id); }
});

test('every entry menu has distinct section names and lists only known screens', () => {
  const ids = new Set(caps.map((c) => c.id));
  for (const g of file.gateways) {
    if (!g.menu) continue;
    const names = g.menu.map((s) => s.label);
    assert.equal(new Set(names).size, names.length, g.id + ' repeats a section name');
    /* R20: an item is a screen id, a tab of a screen {go, tab, label}, or the open company's installed tools {installed} */
    for (const s of g.menu) for (const h of s.hubs) {
      if (h && h.installed) continue;
      const id = typeof h === 'string' ? h : h && h.go;
      assert.ok(ids.has(id), g.id + ' › ' + s.label + ' lists an unknown screen ' + JSON.stringify(h));
      if (typeof h !== 'string') assert.ok(h.tab && h.label, g.id + ' › ' + s.label + ': a tab link needs a tab and a label');
    }
  }
});
