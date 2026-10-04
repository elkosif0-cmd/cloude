import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const source = readFileSync('worker-live-patched.mjs', 'utf8');
const start = source.indexOf('async function c500TextFinalize(');
const fn = source.slice(start, source.indexOf('__name(c500TextFinalize', start));
function setup(revisions, engineering = true) {
  let prompt = '';
  const context = vm.createContext({ FULL_PRO_BUDGETS: { max_stability_revisions: 7 },
    text: (v, n) => String(v || '').slice(0, n), list: (v, n) => Array.isArray(v) ? v.slice(0, n) : [],
    clamp: v => Math.max(0, Math.min(1, Number(v))), secureCanonical: JSON.stringify,
    secureSha256Hex: async s => createHash('sha256').update(s).digest('hex'),
    fpReqKey: id => id, fpPut: async () => {},
    fullProModelJson: async (_, p) => { prompt = p; return {model: 'test-model', output: {answer: 'Proposed plan: inspect source, test scoped change, verify release commit. No executor evidence yet.', evidence: [], uncertainty: ['Execution not observed'], objections: [], confidence: .7}}; }
  });
  vm.runInContext(fn, context);
  const meta = { subject: 'Assess site development', executor: 'text', write_intent: true,
    capability_packs: engineering ? ['code_release_engineering'] : [],
    text_result: {answer: 'Repeat the task', selected_candidate_id: 'G02C1', binding_receipt: {observed: true, selected_candidate_id: 'G02C1', top_candidate_ids: ['G02C1']}},
    c500_finalists: [{id: 'G02C1', proposal: 'Inspect source and verify UX'}], cross_expert_receipt: {output: {top_candidate_ids: ['G02C1']}},
    final_stability_receipts: [{choice: 'review'}, {choice: 'review'}], text_revision_count: revisions,
    candidate_digest: 'prior', gate_receipts: {verifier: {choice: 'pass'}}, gates_pass: false, final_stable: false };
  return {meta, run: () => context.c500TextFinalize({}, meta, 'same-request'), prompt: () => prompt};
}
test('text uses the published seven-revision budget and preserves binding', async () => {
  const x = setup(3); const r = await x.run();
  assert.equal(r.revision, 4); assert.equal(x.meta.text_result.selected_candidate_id, 'G02C1');
  assert.equal(x.meta.text_result.binding_receipt.selected_candidate_id, 'G02C1');
  assert.equal(x.meta.final_stability_receipts.length, 0); assert.equal(Object.keys(x.meta.gate_receipts).length, 0);
  assert.equal(x.meta.gates_pass, false); assert.equal(x.meta.final_stable, false); assert.notEqual(x.meta.candidate_digest, 'prior');
});
test('engineering instruction requires concrete criteria and observed execution evidence', async () => {
  const x = setup(3); await x.run();
  assert.match(x.prompt(), /ordered source inspection/); assert.match(x.prompt(), /observable release postcondition/);
  assert.match(x.prompt(), /without executor evidence/); assert.match(x.prompt(), /authentication and all verification gates/);
});
test('non-engineering tasks do not receive engineering instructions', async () => {
  const x = setup(1, false); await x.run(); assert.doesNotMatch(x.prompt(), /For engineering assessment tasks/);
});
test('the published budget remains bounded and fails closed at seven', async () => {
  const x = setup(7); const r = await x.run(); assert.equal(r.reenqueue, false);
  assert.equal(x.meta.status, 'blocked_stability'); assert.equal(x.meta.last_error, 'C500_TEXT_STABILITY_BLOCK');
});
test('independent stability thresholds and all four gates remain intact', () => {
  assert.match(fn, /q >= 0\.75/); assert.match(fn, /q <= 0\.25/);
  assert.match(fn, /\["deterministic", "risk", "self_critic", "verifier"\]/);
  assert.match(fn, /every\(\(x\) => x.choice === "pass"\)/);
});
