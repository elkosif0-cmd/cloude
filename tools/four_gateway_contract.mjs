import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const file = JSON.parse(fs.readFileSync(new URL('ui/core/capabilities.json', root), 'utf8'));
const baseline = fs.readFileSync(new URL('docs/rebuild/CAPABILITY_BASELINE.txt', root), 'utf8')
  .split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('\t')[0]);

const expectedGateways = ['accounting','reporting','audit','tools'];
const expectedGroups = ['home','audit','product','customer','supply','books','reports','jev'];
const failures = [];
const caps = file.capabilities || [];
const gateways = file.gateways || [];
const ids = new Set(caps.map(c => c.id));
const byId = Object.fromEntries(caps.map(c => [c.id,c]));

if (gateways.map(g => g.id).join('|') !== expectedGateways.join('|')) {
  failures.push('gateways must be exactly: ' + expectedGateways.join('|'));
}
if ((file.groups || []).map(g => g.id).join('|') !== expectedGroups.join('|')) {
  failures.push('compatibility groups changed unexpectedly');
}
if (caps.length !== baseline.length) failures.push(`capability count ${caps.length} != baseline ${baseline.length}`);
for (const id of baseline) if (!ids.has(id)) failures.push('baseline capability missing: ' + id);

for (const c of caps) {
  if (!expectedGateways.includes(c.gateway)) failures.push(`${c.id}: invalid/missing gateway ${c.gateway}`);
  if (c.hub) {
    const parent = byId[c.hub];
    if (!parent) failures.push(`${c.id}: missing hub parent ${c.hub}`);
    else if (parent.gateway !== c.gateway) failures.push(`${c.id}: gateway ${c.gateway} differs from hub ${parent.id} (${parent.gateway})`);
  }
}
for (const gateway of expectedGateways) {
  if (!caps.some(c => c.gateway === gateway)) failures.push('gateway has no capabilities: ' + gateway);
}

const required = {ledger:'accounting', execreports:'reporting', tbreview:'audit', helperdesk:'tools'};
for (const [id,gateway] of Object.entries(required)) {
  if (byId[id]?.gateway !== gateway) failures.push(`${id}: expected ${gateway}, got ${byId[id]?.gateway}`);
}

if (failures.length) {
  console.error('Four-gateway contract failed:\n' + failures.map(x => '- ' + x).join('\n'));
  process.exit(1);
}
const counts = Object.fromEntries(expectedGateways.map(g => [g, caps.filter(c => c.gateway === g).length]));
console.log(JSON.stringify({ok:true,total:caps.length,counts}, null, 2));
