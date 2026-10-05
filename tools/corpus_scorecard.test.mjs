// FOUNDATION P5 — the corpus scorecard is a regression matrix: the engines must keep producing the committed figures.
// A deliberate change regenerates it (node tools/corpus_scorecard.mjs) and is explained in the PR.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scorecard } from './corpus_scorecard.mjs';

const pinned = JSON.parse(readFileSync(new URL('../docs/registry/corpus/corpus-scorecard.json', import.meta.url), 'utf8'));
const now = JSON.parse(JSON.stringify(scorecard())); // plain objects: the engines run in their own vm realm

test('every company of the bundle keeps its committed scorecard row', () => {
  assert.equal(now.companies.length, 47);
  assert.deepEqual(now.companies.map((c) => c.id), pinned.companies.map((c) => c.id));
  for (const c of now.companies) assert.deepEqual(c, pinned.companies.find((p) => p.id === c.id), c.id);
});

test('the totals match the matrix, and every published trial balance stays balanced', () => {
  assert.deepEqual(now.totals, pinned.totals);
  assert.deepEqual(now.companies.filter((c) => !c.balanced).map((c) => c.id), []);
});
