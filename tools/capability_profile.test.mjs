// FOUNDATION §3.0‑10 — the company's Capability Profile (owner 2026-10-09: opt-in, existing companies keep all).
// A company from before the ownership stamp keeps every tool and AI; a company created since (its record carries ownerScope)
// starts with the everyday tools (tier CORE) and its own sector's tools, enables the rest per company, and starts without AI.
// Home, administration and the tools library are never switched off; screens outside the tools entry are not gated.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../ui/core/company-platform.js', import.meta.url), 'utf8');
const reg = JSON.parse(fs.readFileSync(new URL('../ui/core/capabilities.json', import.meta.url), 'utf8'));
const caps = reg.capabilities;
const inTools = (c) => c.gateway === 'tools' || (c.also || []).includes('tools');

function harness({ ownerScope, sector = 'trade', aiReady = true } = {}) {
  const store = new Map();
  store.set('skosif_companies_v1', { companies: [{ id: 'co-a', name: 'شركة أ', sector, ...(ownerScope ? { ownerScope } : {}) }] });
  const SK = {
    load: (k, d) => (store.has(k) ? structuredClone(store.get(k)) : structuredClone(d)),
    save: (k, v) => { store.set(k, structuredClone(v)); return true; },
    company: { current: () => ({ id: 'co-a', name: 'شركة أ', sector, country: 'SA', currency: 'SAR' }) },
    caps: { get: (id) => caps.find((c) => c.id === id) || null, all: () => caps, inGatewayOf: (c, g) => c.gateway === g || (c.also || []).includes(g) },
    audit: { log() {} }, bus: { emit() {} }, ui: { uid: (p) => p + '-1' },
  };
  const ctx = vm.createContext({ window: { SKosifAI: { ready: () => aiReady } }, SK, console, structuredClone, Date, Math, Number, String, Object, Array, Set, JSON, indexedDB: { open() { throw new Error('not used'); } } });
  ctx.window.SK = SK;
  vm.runInContext(source, ctx, { filename: 'company-platform.js' });
  return { api: ctx.window.SKosifCompanyPlatform, store };
}
const tool = (pred) => caps.find((c) => inTools(c) && pred(c)).id;
const core = tool((c) => c.tier === 'CORE' && c.group !== 'home' && !c.sectors);
const extra = tool((c) => c.tier === 'INTELLIGENCE' && c.group !== 'home');
const meat = tool((c) => Array.isArray(c.sectors) && c.sectors.includes('meat'));
const books = caps.find((c) => !inTools(c)).id;

test('a company from before the stamp keeps every tool and AI — nothing disappears', () => {
  const { api } = harness();
  assert.equal(api.capMode(), 'all');
  for (const c of caps.filter(inTools)) assert.equal(api.capEnabled(c.id), true, c.id);
  assert.equal(api.aiEnabled(), true);
});

test('a new company starts with the everyday tools and its sector, the rest opt-in, AI off', () => {
  const { api } = harness({ ownerScope: 'TOOLS_ONLY', sector: 'meat' });
  assert.equal(api.capMode(), 'opt-in');
  assert.equal(api.capEnabled(core), true, 'CORE tier');
  assert.equal(api.capEnabled(meat), true, 'the company sector\'s tools');
  assert.equal(api.capEnabled(extra), false, 'analysis tools are opt-in');
  assert.equal(api.capEnabled('helperdesk'), true, 'the tools library itself');
  assert.equal(api.capEnabled('settings'), true, 'administration');
  assert.equal(api.capEnabled(books), true, 'screens outside the tools entry are not gated');
  assert.equal(api.aiEnabled(), false);
  assert.equal(harness({ ownerScope: 'FULL_ACCOUNTING', sector: 'trade' }).api.capEnabled(meat), false, 'another sector\'s tools are not given');
});

test('enabling one tool keeps everything the company had, and survives as its own list', () => {
  const { api, store } = harness({ ownerScope: 'FULL_ACCOUNTING' });
  api.setTool(extra, true);
  assert.equal(api.capEnabled(extra), true);
  assert.equal(api.capEnabled(core), true, 'the core tools are written out, not lost');
  api.setTool(core, false);
  assert.equal(api.capEnabled(core), false, 'a core tool can be switched off once the list is the company\'s own');
  const saved = store.get(api.storageKey('co-a'));
  assert.equal(store.has('skosif_company_platform_v1'),false,'new company must never write to old global key');
  assert.equal(saved.capabilityProfile.custom, true);
  assert.equal(saved.companyId, 'co-a');
});

test('AI is enabled per company, and the profile says whether a provider is connected', () => {
  const { api } = harness({ ownerScope: 'TOOLS_ONLY', aiReady: false });
  assert.equal(api.capabilityProfile().ai, false);
  api.setAI(true);
  const p = api.capabilityProfile();
  assert.equal(p.ai, true);
  assert.equal(p.aiConfigured, false, 'enabled but not connected is reported, never guessed');
  assert.ok(p.enabled.length < p.tools.length);
});

test('the AI request path refuses a company that has not enabled AI, outside the audit entry', () => {
  const ai = fs.readFileSync(new URL('../ui/core/ai.js', import.meta.url), 'utf8');
  assert.match(ai, /gate!=="audit"&&cp&&cp\.aiEnabled&&!cp\.aiEnabled\(\)/);
  assert.match(ai, /e\.code="ai-disabled"/);
});
