// R17 — a bundle company opened on its corpus model (P5) carries its status inside the audit file: pending review,
// published figures, a simulation of the auditor's work — not professional assurance. Reviewed sources and ordinary files don't.
import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './apple-source-harness.mjs';

function render(h) {
  const node = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, dataset: {} };
  h.context.scrollTo = () => {};
  h.context.__test.setTestRoot(node);
  return node;
}
test('a pending bundle company says inside its file that it is a pending model and a simulation', async () => {
  const h = harness(), W = h.context, node = render(h);
  assert.ok(await W.SKosifTBReview.openClient('bp-2025'));
  W.SKosifTBReview.open('tb');
  assert.match(node.innerHTML, /data-model-note="bp-2025"/);
  assert.match(node.innerHTML, /بانتظار مراجعة واعتماد نموذج التطبيق/);
  assert.match(node.innerHTML, /محاكاة لعمل المراجع[^<]*لا تأكيد مهني/);
});
test('a legacy id opens the canonical company and keeps the note (cba-2025 → cba-2026)', async () => {
  const h = harness(), W = h.context, node = render(h);
  assert.ok(await W.SKosifTBReview.openClient('cba-2025'));
  W.SKosifTBReview.open('tb');
  assert.match(node.innerHTML, /data-model-note="cba-2026"/);
});
test('an ordinary imported trial balance carries no model note', async () => {
  const h = harness(), W = h.context, node = render(h);
  assert.equal(await W.SKosifTBReview.load(h.E.reports.tbImport.SAMPLE_TB_CSV, 'actual-ledger', { company: 'Synthetic ordinary company', country: 'SA' }), true);
  W.SKosifTBReview.open('tb');
  assert.doesNotMatch(node.innerHTML, /data-model-note=/);
});
