// SQC — Gate-aware mobile tabs and context boundary contract (FOUNDATION §3, §3.0)
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const caps = JSON.parse(fs.readFileSync(path.join(root, 'ui/core/capabilities.json'), 'utf8'));

test('every tab in TABS_BY_GATE belongs to its respective gateway or is shared with it', () => {
  const shellSrc = fs.readFileSync(path.join(root, 'ui/layouts/shell.js'), 'utf8');
  const match = shellSrc.match(/const TABS_BY_GATE\s*=\s*(\{[\s\S]*?\});/);
  assert.ok(match, 'TABS_BY_GATE must be defined in shell.js');
  const tabsByGate = eval('(' + match[1] + ')');

  assert.deepEqual(Object.keys(tabsByGate).sort(), ['accounting', 'audit', 'tools']);

  const capById = Object.fromEntries(caps.capabilities.map(c => [c.id, c]));

  for (const [gate, tabs] of Object.entries(tabsByGate)) {
    assert.ok(tabs.length === 4, `Gateway ${gate} must have exactly 4 default tabs`);
    for (const tabId of tabs) {
      const cap = capById[tabId];
      assert.ok(cap, `Tab ${tabId} in ${gate} must exist in capabilities.json`);
      const belongs = cap.gateway === gate || (cap.also && cap.also.includes(gate));
      assert.ok(belongs, `Tab ${tabId} must belong to or be shared with gateway ${gate}`);
    }
  }
});

test('shell tabIds() resolves dynamically based on active gate', () => {
  const shellSrc = fs.readFileSync(path.join(root, 'ui/layouts/shell.js'), 'utf8');
  const capById = Object.fromEntries(caps.capabilities.map(c => [c.id, c]));

  let currentGate = 'accounting';
  const customPrefs = {};

  const SK = {
    load: (k, d) => customPrefs[k] ?? d,
    save: (k, v) => { customPrefs[k] = v; },
    gate: {
      current: () => currentGate
    },
    caps: {
      get: id => capById[id] || null,
      inGatewayOf: (cap, g) => cap && (cap.gateway === g || (cap.also && cap.also.includes(g)))
    },
    perm: { can: () => true },
    bus: { on: () => {}, emit: () => {} },
    $: (s, r) => (r ? r.querySelector(s) : null),
    $$: (s, r) => (r ? r.querySelectorAll(s) : []),
    esc: String,
    icons: {},
    org: () => ({ biz: 'SQC' }),
    _flush: () => {}
  };

  const node = (id = '') => {
    const attrs = {}, classes = new Set();
    return {
      id, attrs, dataset: {}, style: { setProperty() {}, removeProperty() {} }, children: [], isConnected: true,
      classList: { add(...v) { v.forEach(x => classes.add(x)); }, remove(...v) { v.forEach(x => classes.delete(x)); }, contains: v => classes.has(v), toggle(v, on) { const next = on ?? !classes.has(v); next ? classes.add(v) : classes.delete(v); return next; } },
      setAttribute(k, v) { attrs[k] = String(v); }, getAttribute: k => attrs[k] ?? null, hasAttribute: k => Object.hasOwn(attrs, k), removeAttribute: k => delete attrs[k], toggleAttribute(k, on) { if (on) attrs[k] = ''; else delete attrs[k]; },
      appendChild(n) { this.children.push(n); }, append(n) { this.children.push(n); }, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, remove() {}, after() {}, before() {}, focus() {}, getBoundingClientRect: () => ({ width: 50, height: 40 }), getClientRects: () => [{}]
    };
  };

  const de = node('html'); de.dir = 'rtl';
  const body = node('body');
  const head = node('head');

  const context = vm.createContext({
    window: { SK },
    SK,
    document: {
      documentElement: de,
      head,
      body,
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => node(),
      addEventListener: () => {},
      readyState: 'complete'
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    getComputedStyle: () => ({ getPropertyValue: () => '', visibility: 'visible' }),
    addEventListener: () => {},
    navigator: { onLine: true },
    innerWidth: 390
  });

  vm.runInContext(shellSrc, context, { filename: 'shell.js' });

  const shell = context.window.SKosifShell;
  assert.ok(shell, 'SKosifShell must be exported');

  // 1. Accounting default
  currentGate = 'accounting';
  assert.deepEqual([...shell.tabs()], ['dash', 'ledger', 'commerce', 'execreports']); // R19: Home first (KOSIF organisation)

  // 2. Audit default
  currentGate = 'audit';
  assert.deepEqual([...shell.tabs()], ['tbreview', 'auditdesk', 'auditbench', 'auditcouncil']);

  // 3. Tools default
  currentGate = 'tools';
  assert.deepEqual([...shell.tabs()], ['dash', 'helperdesk', 'costs', 'salesintel']); // R19: Home first (KOSIF organisation)

  // 4. Custom tabs filtering per gateway
  customPrefs.skosif_prefs = {
    tabs: ['tbreview', 'ledger', 'costs', 'auditdesk']
  };

  // In Audit, only tbreview and auditdesk should show from custom tabs
  currentGate = 'audit';
  assert.deepEqual([...shell.tabs()], ['tbreview', 'auditdesk']);

  // In Accounting, only ledger should show
  currentGate = 'accounting';
  assert.deepEqual([...shell.tabs()], ['ledger']);

  // In Tools, only costs should show
  currentGate = 'tools';
  assert.deepEqual([...shell.tabs()], ['costs']);
});

test('scratch tool space intent never registers as an accounting company in skosif_companies_v1', () => {
  const helperSrc = fs.readFileSync(path.join(root, 'ui/core/helper-space.js'), 'utf8');

  // Verify that helper-space.js explicitly guards against scratch tool workspaces leaking into accounting companies
  assert.match(
    helperSrc,
    /if\s*\(\s*it\.create\s*&&\s*!rec\s*&&\s*!it\.scratch\s*&&\s*gate\s*!==\s*["']tools["']\s*\)/,
    'helper-space.js must guard company registration with !it.scratch and gate!=="tools" (FOUNDATION §3.0 Zero Context Leakage)'
  );
});
