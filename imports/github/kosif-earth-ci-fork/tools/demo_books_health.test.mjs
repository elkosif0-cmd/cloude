// R10 (docs/rebuild/HARSH_REVIEW_20261008_ar.md): the demo company is the app's showcase; its books must describe a
// believable, profitable shop. Its fixed costs once ran at about twice its sales, so the books showed a loss of ~211,000
// and every ratio, cash figure and benchmark built on them was absurd. This seeds the complete demo in memory and reads
// the books it wrote: a profit, an operating margin in a sane range, positive cash, purchase orders with values.
import test from 'node:test';
import assert from 'node:assert/strict';
import {assistantHarness} from './assistant_scope_fixture.mjs';
import {seedCompleteDemo} from './bootstrap_demo_fixture.mjs';

test('the seeded demo books show a profitable shop with positive cash', async () => {
  const h = assistantHarness({seed: {}, engines: true});
  const {errors} = await seedCompleteDemo(h);
  assert.deepEqual(errors, [], 'the demo seeds without errors');
  const books = h.get('skosif_ledger_v1');
  assert.ok(books && books.accounts.length && books.entries.length, 'the demo wrote its books');
  const type = Object.fromEntries(books.accounts.map((a) => [a.id, a.type])), code = Object.fromEntries(books.accounts.map((a) => [a.id, a.code]));
  let revenue = 0, expense = 0, cash = 0;
  for (const e of books.entries) for (const l of e.lines) {
    const t = type[l.accountId], dr = Number(l.debit) || 0, cr = Number(l.credit) || 0;
    if (t === 'revenue') revenue += cr - dr;
    if (t === 'expense') expense += dr - cr;
    if (code[l.accountId] === '1100') cash += dr - cr;
  }
  const profit = revenue - expense, margin = profit / revenue;
  assert.ok(revenue > 0, 'the demo has sales in its books');
  assert.ok(profit > 0, `the demo books show a profit (revenue ${revenue.toFixed(2)}, expenses ${expense.toFixed(2)})`);
  assert.ok(margin > 0.03 && margin < 0.3, `net margin ${(margin * 100).toFixed(1)}% is a believable shop's`);
  assert.ok(cash > 0, `cash ${cash.toFixed(2)} stays positive`);
  const po = h.get('skosif_purchasing_v1');
  assert.ok(po.orders.length && po.orders.every((o) => o.value > 0), 'every demo purchase order carries its value');
});
