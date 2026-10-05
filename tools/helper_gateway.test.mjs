import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

// Pure rendering/registry regression: no browser, server, network, or storage access.
// GATEWAY_SOURCE_ROOT permits replay against an untouched source snapshot.
const root = process.env.GATEWAY_SOURCE_ROOT || fileURLToPath(new URL('../', import.meta.url));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const raw = JSON.parse(read('ui/core/capabilities.json'));
const positions = { product: [50, 12], customer: [84, 32], decision: [78, 76] };
const sectionTargets = {
  product: ['blending', 'carcass', 'ptree', 'productflow', 'labels'],
  customer: ['salesmap', 'customers', 'offers', 'operations', 'salesintel'],
  decision: ['jev', 'council', 'decision', 'sensitivity', 'risks'],
};
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function app({ allowed, role = 'admin' } = {}) {
  const fixture = structuredClone(raw);
  if (allowed) {
    fixture.roles.testcase = { caps: allowed, actions: ['view'] };
    role = 'testcase';
  }
  const storage = new Map([['skosif_role_mode', role]]);
  const views = {}, navigation = [], listeners = [];
  const context = vm.createContext({
    SK: {
      esc, icons: {},
      load: (key, fallback) => storage.has(key) ? storage.get(key) : fallback,
      save: (key, value) => storage.set(key, value),
      view: (id, view) => { views[id] = view; },
    },
  });
  context.window = context;
  context.__SK_CAPS__ = fixture;
  context.SKosifCore = { go: id => navigation.push(id) };
  for (const name of ['ui/core/registry.js', 'ui/core/perm.js', 'ui/features/helper-center.js']) {
    vm.runInContext(read(name), context, { filename: name });
  }
  const element = { innerHTML: '', dataset: {}, addEventListener: (name, fn) => listeners.push({ name, fn }) };
  const render = () => views.helperdesk.render(element);
  render();
  return { context, element, listeners, navigation, render };
}

const attr = (tag, name) => tag.match(new RegExp('(?:^|\\s)' + name + '="([^"]*)"'))?.[1];
function topology(element) {
  const tags = [...element.innerHTML.matchAll(/<(button|line)\b[^>]*>/g)].map(match => match[0]);
  const nodes = tags.filter(tag => attr(tag, 'class') === 'hd-node').map(tag => ({
    section: attr(tag, 'data-hd-section'), target: attr(tag, 'data-hd-go'),
    position: attr(tag, 'style')?.match(/left:([\d.]+)%;top:([\d.]+)%/)?.slice(1).map(Number),
  }));
  const edges = tags.filter(tag => tag.startsWith('<line ')).map(tag => ({
    section: attr(tag, 'data-hd-section'),
    from: [Number(attr(tag, 'x1')), Number(attr(tag, 'y1'))],
    position: [Number(attr(tag, 'x2')), Number(attr(tag, 'y2'))],
  }));
  return { nodes, edges, buttons: tags.filter(tag => attr(tag, 'data-hd-go')).map(tag => attr(tag, 'data-hd-go')) };
}

function assertTopology(instance, expected) {
  const { nodes, edges, buttons } = topology(instance.element);
  assert.equal(nodes.length, expected.length, 'permitted helper nodes');
  assert.equal(edges.length, nodes.length, 'one edge per rendered node; no dangling edges');
  assert.deepEqual(nodes.map(node => node.section), expected);
  assert.deepEqual(edges.map(edge => edge.section), expected);
  for (const [index, node] of nodes.entries()) {
    assert.deepEqual(node.position, positions[node.section], 'existing layout position is preserved');
    assert.deepEqual(edges[index].position, node.position, 'edge ends at its node');
    assert.deepEqual(edges[index].from, [50, 50]);
    const firstPermitted = sectionTargets[node.section].find(id => instance.context.SK.perm.can(id));
    assert.equal(node.target, firstPermitted, 'node opens its first permitted existing deep link');
  }
  for (const id of buttons) {
    assert.ok(instance.context.SK.caps.get(id), `registered target ${id}`);
    assert.ok(instance.context.SK.perm.can(id), `permitted target ${id}`);
  }
}

test('all three current helper sections have matching edges', () => {
  assertTopology(app(), ['product', 'customer', 'decision']);
});
test('no permitted targets renders no nodes and no edges', () => {
  assertTopology(app({ allowed: [] }), []);
});
for (const [section, id] of [['product', 'productflow'], ['customer', 'operations'], ['decision', 'risks']]) {
  test(`only ${section} retains its original position and one edge`, () => {
    assertTopology(app({ allowed: [id] }), [section]);
  });
}
test('denied decision targets remove both the node and its edge', () => {
  assertTopology(app({ allowed: [...sectionTargets.product, ...sectionTargets.customer] }), ['product', 'customer']);
});
test('existing cross-gateway decision shortcut remains permission-gated', () => {
  assertTopology(app({ allowed: ['sensitivity'] }), ['decision']);
});
for (const role of Object.keys(raw.roles)) {
  test(`existing ${role} role renders only its permitted sections and links`, () => {
    const instance = app({ role });
    const expected = Object.entries(sectionTargets).filter(([, ids]) => ids.some(id => instance.context.SK.perm.can(id))).map(([id]) => id);
    assertTopology(instance, expected);
  });
}
test('repeat render and role change recompute topology without duplicate click handlers', () => {
  const instance = app();
  instance.render();
  instance.context.SK.perm.setRole('viewer');
  instance.render();
  assertTopology(instance, ['product', 'customer', 'decision']);
  assert.equal(instance.listeners.length, 1);
  instance.listeners[0].fn({ target: { closest: () => ({ dataset: { hdGo: 'productflow' } }) } });
  assert.deepEqual(instance.navigation, ['productflow']);
});
test('four gateways and all 78 unique registered capabilities remain navigable by their IDs', () => {
  const { SK } = app().context;
  assert.deepEqual(Array.from(SK.caps.gateways(), g => g.id), ['accounting', 'reporting', 'audit', 'tools']);
  assert.equal(SK.caps.all().length, 78);
  assert.equal(new Set(SK.caps.all().map(c => c.id)).size, 78);
  for (const cap of raw.capabilities) {
    const actual = SK.caps.get(cap.id);
    assert.ok(actual, `preserved ID ${cap.id}`);
    assert.ok(SK.caps.gateway(actual.gateway), `valid gateway ${cap.id}`);
    assert.ok(SK.caps.get(actual.hub), `preserved hub/deep-link parent ${cap.id}`);
    for (const key of ['id', 'group', 'gateway', 'module', 'label']) assert.equal(actual[key], cap[key], `${cap.id}.${key}`);
    assert.equal(actual.hub, cap.hub || cap.id);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(SK.caps.roles())), raw.roles, 'permission definitions are unchanged');
});
test('architecture table counts and membership agree with all visible registry entries', () => {
  const doc = read('docs/rebuild/FOUR_GATEWAYS_FINANCE_ARCHITECTURE.md');
  for (const gateway of raw.gateways) {
    const row = doc.split('\n').find(line => line.startsWith('| ' + gateway.label + ' |'));
    assert.ok(row, `documented gateway ${gateway.id}`);
    const cells = row.split('|');
    const ids = [...cells[3].matchAll(/`([^`]+)`/g)].map(match => match[1]);
    const actual = raw.capabilities.filter(c => c.gateway === gateway.id && !c.hidden).map(c => c.id);
    assert.equal(Number(cells[2].trim()), actual.length, `${gateway.id} count`);
    assert.deepEqual(ids.sort(), actual.sort(), `${gateway.id} membership`);
  }
});
test('document-helper repositories retain pinned reuse evidence without claiming financial implementation', () => {
  const sources = JSON.parse(read('docs/product/capability-source-registry.json'));
  const pins = {
    'mafateeh-al-tharwa': 'a182735f5523f0b99a046c96416416e6d7760e41',
    'mafateeh-al-tharwa2': 'fc8518662be5511cc7b09d5317875a7677a343b1',
  };
  for (const [repo, pin] of Object.entries(pins)) {
    const item = sources.repositories.find(item => item.repo === repo);
    assert.equal(item.class, 'nonfinancial-current-scope');
    assert.equal(item.status, 'out-of-scope');
    assert.deepEqual(item.target, []);
    assert.equal(item.reference_history[0].source_commit, '113f9ff9dab16058e9760dfd05435c576ad06d16');
    assert.equal(item.reference_history[0].classification, 'shared-document-reference-reuse-candidate');
    assert.deepEqual(item.reference_history[0].candidate_targets, ['tools','reporting']);
    assert.equal(item.source_commit, pin);
    assert.ok(item.evidence.length >= 3);
    assert.ok(item.evidence.every(url => url.startsWith(`https://github.com/kosif199022-jpg/${repo}/blob/${pin}/`)));
    assert.match(item.caveats, /not financial engines/i);
    assert.match(item.caveats, /runtime.*unverified/i);
    assert.match(item.caveats, /tenant.*rights/i);
  }
});

test('helper tool installation controls preserve company-scoped toggling',async()=>{
  const instance=app(),installed=new Set(),changes=[];
  instance.context.SKosifCompanyPlatform={installed:id=>installed.has(id),setTool:(id,on)=>{on?installed.add(id):installed.delete(id);changes.push([id,on]);}};
  instance.context.SK.toast=()=>{};instance.render();
  assert.match(instance.element.innerHTML,/data-hd-toggle="productflow" aria-pressed="false"/);
  await instance.listeners[0].fn({target:{closest:s=>s==='[data-hd-toggle]'?{dataset:{hdToggle:'productflow'}}:null}});
  assert.deepEqual(changes,[['productflow',true]]);assert.match(instance.element.innerHTML,/data-hd-toggle="productflow" aria-pressed="true"/);
  assert.equal(instance.listeners.length,1);
});
test('opening an uninstalled helper still permits use without installing it',async()=>{
  const instance=app(),changes=[];instance.context.SKosifCompanyPlatform={installed:()=>false,setTool:(...v)=>changes.push(v)};
  instance.context.SK.confirm=async()=>false;
  await instance.listeners[0].fn({target:{closest:s=>s==='[data-hd-go]'?{dataset:{hdGo:'productflow'}}:null}});
  assert.deepEqual(instance.navigation,['productflow']);assert.deepEqual(changes,[]);
});
test('production workflow executes permission-aware helper topology regressions',()=>{
  assert.match(read('.github/workflows/S.kosif.yml'),/node --test [^\n]*tools\/helper_gateway\.test\.mjs/);
});
