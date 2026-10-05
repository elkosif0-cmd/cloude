import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../ui/features/ledger.js',import.meta.url),'utf8');
const start=source.indexOf('async function reviewDraft(d){');
const end=source.indexOf('/* ---------- tabs ---------- */',start);
const review=start>=0&&end>start?source.slice(start,end):'';

test('journal draft review uses deterministic validation, standards mapping and optional AI',()=>{
  assert.ok(review,'reviewDraft must exist');
  assert.match(review,/validateJournalEntry/);
  assert.match(review,/tbImport\.fromRows/);
  assert.match(review,/tbReview\.reviewTrialBalance/);
  assert.match(review,/SKosifAI\.generate/);
  assert.match(review,/addStandardTrace/);
  assert.match(review,/approved:false/);
  assert.match(source,/data-l="review-entry"/);
});

test('journal review cannot post, save, reverse or mutate the authoritative journal',()=>{
  assert.doesNotMatch(review,/\bput\s*\(/);
  assert.doesNotMatch(review,/\.entries\.push\s*\(/);
  assert.doesNotMatch(review,/reverseJournalEntry/);
  assert.doesNotMatch(review,/\bsave\s*\(/);
  assert.match(review,/اقتراح لا يرحّل ولا يعتمد/);
});
