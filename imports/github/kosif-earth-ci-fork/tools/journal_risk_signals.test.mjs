// Journal-entry risk signals recovered from the grand-fusion branches (integration/grand-fusion-knowledge-20261007):
// an unbalanced entry, an amount just below materiality and a large amount. Expected values are worked by hand.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as main from '../ui/audit/engine.js';
import * as classic from '../ui/audit/classic/engine.js';
import * as lab from '../ui/audit/lab/engine.js';

const flagsOf = (review, id) => review.entries.find((e) => e.id === id).flags.map((f) => f.rule);

for (const [name, E] of Object.entries({ main, classic, lab })) {
  test(`${name}: an entry whose debits and credits differ is flagged once (not once per row)`, () => {
    // JE-1 in two rows: debit 1,000.00 against credit 900.00 → unbalanced by 100.00
    const rows = [
      { id: 'JE-1', date: '2026-03-02', debit: '1000.00', credit: '0' },
      { id: 'JE-1', date: '2026-03-02', debit: '0', credit: '900.00' },
      { id: 'JE-2', date: '2026-03-02', lines: [{ debit: '500', credit: '0' }, { debit: '0', credit: '500' }] }
    ];
    const r = E.analyzeJournalEntries(rows);
    const je1 = r.entries.filter((e) => e.id === 'JE-1').map((e) => e.flags.map((f) => f.rule));
    assert.equal(je1.length, 2);
    assert.equal(je1.filter((f) => f.includes('UNBALANCED')).length, 1);
    assert.ok(!flagsOf(r, 'JE-2').includes('UNBALANCED'));
  });

  test(`${name}: just below materiality is the band [90%, 100%) of overall materiality`, () => {
    // materiality 10,000.00 = 1,000,000 minor units; 9,000.00 is exactly 90% (in), 8,999.99 is out, 10,000.00 is not «below»
    const rows = [
      { id: 'A', date: '2026-03-03', amount: '9000.00' },
      { id: 'B', date: '2026-03-03', amount: '8999.99' },
      { id: 'C', date: '2026-03-03', amount: '9999.99' },
      { id: 'D', date: '2026-03-03', amount: '10000.00' }
    ];
    const r = E.analyzeJournalEntries(rows, { materialityMinor: 1000000n });
    assert.ok(flagsOf(r, 'A').includes('JUST_BELOW_MATERIALITY'));
    assert.ok(!flagsOf(r, 'B').includes('JUST_BELOW_MATERIALITY'));
    assert.ok(flagsOf(r, 'C').includes('JUST_BELOW_MATERIALITY'));
    assert.ok(!flagsOf(r, 'D').includes('JUST_BELOW_MATERIALITY'));
    // the large-amount threshold defaults to materiality: only D (10,000.00) reaches it
    assert.deepEqual(['A', 'B', 'C', 'D'].map((id) => flagsOf(r, id).includes('LARGE_AMOUNT')), [false, false, false, true]);
    assert.equal(r.parameters.materialityMinor, '1000000');
  });

  test(`${name}: without a materiality only the balance check runs, and string parameters from a saved review work`, () => {
    const rows = [{ id: 'X', date: '2026-03-03', amount: '9500.00' }];
    assert.deepEqual(flagsOf(E.analyzeJournalEntries(rows), 'X').filter((f) => /MATERIALITY|LARGE/.test(f)), []);
    const saved = E.analyzeJournalEntries(rows, { materialityMinor: '1000000' });
    assert.ok(flagsOf(saved, 'X').includes('JUST_BELOW_MATERIALITY'));
  });
}
