// R20: the demo company can be confirmed in the company chooser after the price list wrote its master-list defaults
// (core v15MasterDefaults: one SAR currency, the suppliers named on the demo's raw materials). Before, the admission check
// refused the unknown key, «لم يُثبت سياق الشركة» showed and the chooser could not be closed. User-added lists still refuse.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../ui/core/helper-space.js', import.meta.url), 'utf8');
const start = src.indexOf('function demoSnapshotEligible(');
const body = src.slice(start, src.indexOf('\n}\n', start) + 2);
const eligible = new Function(body + '\nreturn demoSnapshotEligible;')();

const demo = { sections: { company: 'x', catalog: 'x' } };
const co = { id: 'demo-co', name: 'شركة الوادي التجريبية للحوم', demo: true };
const SAR = { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 1, active: true };
const snap = (lists, raws = []) => ({ ls: {
  'aghnam-v15-master-lists': JSON.stringify(lists),
  ...(raws.length ? { 'aghnam-pricing-v3': JSON.stringify({ raws }) } : {}),
}, app: null });

test('the master lists the core writes on first use keep the demo admissible', () => {
  assert.equal(eligible(snap({ currencies: [SAR], suppliers: [] }), demo, co), true);
  const raws = [{ name: 'لحم', supplier: 'مورد تجريبي', demo: true }];
  assert.equal(eligible(snap({ currencies: [SAR], suppliers: ['مورد تجريبي'] }, raws), demo, co), true, 'suppliers named on demo raws');
});

test('a currency, a supplier or a field the user added is the user\'s, so the demo is not admitted', () => {
  assert.equal(eligible(snap({ currencies: [SAR, { code: 'USD', name: 'دولار', symbol: '$', rate: 3.75, active: true }], suppliers: [] }), demo, co), false);
  assert.equal(eligible(snap({ currencies: [{ ...SAR, rate: 2 }], suppliers: [] }), demo, co), false);
  assert.equal(eligible(snap({ currencies: [SAR], suppliers: ['مورد حقيقي'] }), demo, co), false);
  assert.equal(eligible(snap({ currencies: [SAR], suppliers: [{ name: 'مورد' }] }), demo, co), false);
  assert.equal(eligible(snap({ currencies: [SAR], suppliers: [], banks: ['x'] }), demo, co), false);
});

test('an unknown helper key still fails closed', () => {
  assert.equal(eligible({ ls: { 'aghnam-v99-something': JSON.stringify({ a: 1 }) }, app: null }, demo, co), false);
});

// The core snapshots the price list on its own («لقطة تأسيس v7», no actor) and keeps the last hash in meta.
const pricing = { raws: [{ id: 'r1', name: 'لحم', demo: true }], boxes: [{ id: 'b1', name: 'بوكس', demo: true }], exps: [] };
const withApp = (app) => ({ ls: { 'aghnam-pricing-v3': JSON.stringify(pricing) }, app });
const autoSnap = (over = {}) => ({ id: 'ps:1', effectiveFrom: '2026-10-09T06:20:34Z', hash: 'h', reason: 'لقطة تأسيس v7', actor: '',
  payload: { schemaVersion: 8, settings: {}, raws: [{ id: 'r1', price: 10 }], boxes: [{ id: 'b1' }], exps: [] }, ...over });
const metaDataset = { key: 'dataset', value: { demo: true } };

test('the core\'s own price-list snapshots of the demo rows keep the demo admissible', () => {
  assert.equal(eligible(withApp({ pricing_snapshots: { vals: [autoSnap(), autoSnap({ payload: { raws: [], boxes: [], exps: [] } })] },
    meta: { vals: [metaDataset, { key: 'pricing_snapshot_meta', value: { lastHash: 'h', lastAt: '2026-10-09' } }] } }), demo, co), true);
});

test('a snapshot a user made, or one holding another row, is the user\'s', () => {
  assert.equal(eligible(withApp({ pricing_snapshots: { vals: [autoSnap({ actor: 'محاسب' })] } }), demo, co), false);
  assert.equal(eligible(withApp({ pricing_snapshots: { vals: [autoSnap({ payload: { raws: [{ id: 'mine' }] } })] } }), demo, co), false);
  assert.equal(eligible(withApp({ pricing_snapshots: { vals: [autoSnap({ note: 'x' })] } }), demo, co), false);
  assert.equal(eligible(withApp({ meta: { vals: [metaDataset, { key: 'pricing_snapshot_meta', value: { lastHash: 'h', extra: 1 } }] } }), demo, co), false);
  assert.equal(eligible(withApp({ meta: { vals: [{ key: 'something', value: {} }] } }), demo, co), false);
});
