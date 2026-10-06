// FOUNDATION P2 — the company's VAT policy decides the rate every posting uses: the company profile (country, registration,
// its own rate) → SKosifCompanyPlatform.vatPolicy() → the sale entry of the ledger and the default of a purchase order line.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');

function harness(country = 'SA') {
  const store = new Map(); let company = { id: 'co-a', name: 'شركة أ', currency: 'SAR', country }, seq = 0;
  const SK = {
    $: () => null, esc: (s) => String(s ?? ''), money: (v) => String(v), toast: () => {},
    load: (k, d) => store.has(k) ? structuredClone(store.get(k)) : structuredClone(d),
    save: (k, v) => { store.set(k, structuredClone(v)); return true; },
    company: { current: () => ({ ...company }), updateMeta: (patch) => { company = { ...company, ...patch }; return true; } },
    ui: { uid: (p) => p + '-' + (++seq), state: {} }, caps: { get: (id) => ({ id, gateway: 'accounting' }) },
    audit: { log: () => {} }, bus: { emit: () => {}, on: () => {} }, register: () => {}, view: () => {},
  };
  const context = vm.createContext({ window: {}, document: { addEventListener: () => {} }, SK, console, Blob, structuredClone, Date, Math, Number, String, Object, Array, Set, Map, JSON, TextEncoder, crypto: webcrypto, indexedDB: { open() { throw new Error('not used'); } } });
  context.window.SK = context.SK = SK;
  vm.runInContext(read('ui/core/engines.js'), context);
  context.SKEngines = context.window.SKEngines;
  vm.runInContext(read('ui/core/company-platform.js'), context, { filename: 'company-platform.js' });
  context.SKosifCompanyPlatform = context.window.SKosifCompanyPlatform;
  vm.runInContext(read('ui/features/ledger.js'), context, { filename: 'ledger.js' });
  return { CP: context.window.SKosifCompanyPlatform, L: context.window.SKosifLedger };
}

const ACCOUNTS = [['1100', 'asset'], ['1200', 'asset'], ['1300', 'asset'], ['2200', 'liability'], ['4000', 'revenue'], ['5000', 'expense']].map(([code, type]) => ({ id: 'account-' + code, code, name: code, type }));
const sale = { id: 's1', date: '2026-05-01', item: 'نعيمي', qty: 1, unitPrice: 115, customer: 'مطعم', payment: 'آجل' };
const vatOf = (r) => (r.entry.lines.find((l) => l.accountId === 'account-2200') || { credit: 0 }).credit;
const revOf = (r) => r.entry.lines.filter((l) => l.accountId === 'account-4000').reduce((s, l) => s + l.credit, 0);

test('the policy follows the country, the registration and the profile rate', () => {
  const { CP } = harness('SA');
  assert.equal(CP.vatPolicy().rate, 0.15);
  CP.setProfile({ country: 'EG', currency: 'EGP' }); assert.equal(CP.vatPolicy().rate, 0.14);
  CP.setProfile({ country: 'AE', currency: 'AED' }); assert.equal(CP.vatPolicy().rate, 0.05);
  CP.setProfile({ vatRate: '7.5' }); assert.equal(CP.vatPolicy().rate, 0.075); assert.equal(CP.profile().vatRate, 0.075);
  CP.setProfile({ vatRate: null }); assert.equal(CP.vatPolicy().source, 'country');
  CP.setProfile({ vatRegistered: false }); assert.equal(CP.vatPolicy().rate, 0);
  CP.setProfile({ vatRegistered: null }); assert.equal(CP.vatPolicy().rate, 0.05, 'back to the country rate'); assert.equal(CP.profile().vatRegistered, null);
  CP.setProfile({ activity: 'x' }); assert.equal(CP.profile().vatRegistered, null, 'an unrelated save keeps it');
  assert.throws(() => CP.setProfile({ vatRate: '250' }), /بين 0 و100/);
});

test('a sale posts its VAT at the company rate, and none when the company is not registered', () => {
  const h = harness('SA'), d = { accounts: ACCOUNTS, entries: [] };
  let r = h.L.saleEntry(d, sale); assert.equal(vatOf(r), 15); assert.equal(revOf(r), 100);
  h.CP.setProfile({ country: 'EG', currency: 'EGP' });
  r = h.L.saleEntry(d, sale); assert.equal(vatOf(r), 14.12); assert.equal(Math.round((revOf(r) + vatOf(r)) * 100), 11500);
  h.CP.setProfile({ vatRegistered: false });
  r = h.L.saleEntry(d, sale); assert.equal(vatOf(r), 0); assert.equal(revOf(r), 115);
  assert.equal(r.entry.lines.some((l) => l.accountId === 'account-2200' || l.accountId === 'no-vat'), false);
});

test('no screen on the posting path keeps a fixed 15%', () => {
  assert.doesNotMatch(read('ui/features/ledger.js'), /vatRate:0\.15/);
  assert.doesNotMatch(read('ui/features/purchasing.js'), /vat:"0\.15"/);
});
