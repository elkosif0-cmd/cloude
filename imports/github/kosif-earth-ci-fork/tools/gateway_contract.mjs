// The three-entry capability contract (FOUNDATION §3): exactly accounting | audit | tools, every screen in one of them,
// a hub's pages in their hub's entry, the cross-cutting screens shared through "also" (never a fourth gateway), every
// baseline id present, each entry's home screen registered, and the sectors of the accounting entry (§3.7).
// Run from the repo root: node tools/gateway_contract.mjs
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const file = JSON.parse(fs.readFileSync(new URL('ui/core/capabilities.json', root), 'utf8'));
const baseline = fs.readFileSync(new URL('docs/rebuild/CAPABILITY_BASELINE.txt', root), 'utf8')
  .split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('\t')[0]);

const expectedGateways = ['accounting', 'audit', 'tools'];
const expectedGroups = ['home', 'audit', 'product', 'customer', 'supply', 'books', 'reports', 'jev'];
const expectedSectors = ['health', 'hospitality', 'construction', 'meat', 'digital', 'education', 'manufacturing', 'bakery', 'agriculture', 'trade'];
const failures = [];
const caps = file.capabilities || [];
const gateways = file.gateways || [];
const sectors = file.sectors || [];
const ids = new Set(caps.map(c => c.id));
const byId = Object.fromEntries(caps.map(c => [c.id, c]));

if (gateways.map(g => g.id).join('|') !== expectedGateways.join('|')) {
  failures.push('gateways must be exactly: ' + expectedGateways.join('|') + ' (FOUNDATION §3 — reporting is a shared layer, not a gateway)');
}
if ((file.groups || []).map(g => g.id).join('|') !== expectedGroups.join('|')) {
  failures.push('compatibility groups changed unexpectedly');
}
for (const g of gateways) {
  if (!g.home || !byId[g.home]) failures.push(`gateway ${g.id}: home screen missing or unregistered (${g.home})`);
  else if (byId[g.home].gateway !== g.id) failures.push(`gateway ${g.id}: home ${g.home} belongs to ${byId[g.home].gateway}`);
}
if (caps.length !== baseline.length) failures.push(`capability count ${caps.length} != baseline ${baseline.length}`);
for (const id of baseline) if (!ids.has(id)) failures.push('baseline capability missing: ' + id);

for (const c of caps) {
  if (!expectedGateways.includes(c.gateway)) failures.push(`${c.id}: invalid/missing gateway ${c.gateway}`);
  for (const a of c.also || []) {
    if (!expectedGateways.includes(a)) failures.push(`${c.id}: shared with an unknown gateway ${a}`);
    if (a === c.gateway) failures.push(`${c.id}: "also" repeats its own gateway`);
  }
  if (c.hub) {
    const parent = byId[c.hub];
    if (!parent) failures.push(`${c.id}: missing hub parent ${c.hub}`);
    else if (parent.gateway !== c.gateway) failures.push(`${c.id}: gateway ${c.gateway} differs from hub ${parent.id} (${parent.gateway})`);
  }
}
for (const gateway of expectedGateways) {
  if (!caps.some(c => c.gateway === gateway)) failures.push('gateway has no capabilities: ' + gateway);
}

const required = { ledger: 'accounting', execreports: 'accounting', reportingintake: 'accounting', tbreview: 'audit', helperdesk: 'tools' };
for (const [id, gateway] of Object.entries(required)) {
  if (byId[id]?.gateway !== gateway) failures.push(`${id}: expected ${gateway}, got ${byId[id]?.gateway}`);
}
/* FOUNDATION §3.3 / §4: reports, analysis, suppliers and inventory are offered by the tools entry as well */
for (const id of ['execreports', 'reportingintake', 'benchmarks', 'suppliers', 'inventory']) {
  if (!(byId[id]?.also || []).includes('tools')) failures.push(`${id}: must be shared with the tools entry`);
}
for (const id of expectedSectors) if (!sectors.some(s => s.id === id)) failures.push('sector missing: ' + id);
for (const s of sectors) if (!s.label) failures.push(`sector ${s.id}: no label`);

if (failures.length) {
  console.error('Three-entry contract failed:\n' + failures.map(x => '- ' + x).join('\n'));
  process.exit(1);
}
const counts = Object.fromEntries(expectedGateways.map(g => [g, { own: caps.filter(c => c.gateway === g).length, shared: caps.filter(c => (c.also || []).includes(g)).length }]));
console.log(JSON.stringify({ ok: true, total: caps.length, counts, sectors: sectors.length }, null, 2));
