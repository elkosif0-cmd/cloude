import fs from 'node:fs';

const file = JSON.parse(fs.readFileSync(new URL('../ui/core/capabilities.json', import.meta.url), 'utf8'));
const allowed = new Set(['accounting_core','reporting_assistant','audit','tools','shared']);
const ids = new Set();
const failures = [];

for (const cap of file.capabilities || []) {
  if (!cap.id) failures.push('capability without id');
  if (ids.has(cap.id)) failures.push(`duplicate capability id: ${cap.id}`);
  ids.add(cap.id);
  if (!allowed.has(cap.targetPortal)) failures.push(`${cap.id}: invalid/missing targetPortal ${cap.targetPortal}`);
}

for (const required of ['accounting_core','reporting_assistant','audit','tools']) {
  const count = (file.capabilities || []).filter(c => c.targetPortal === required).length;
  if (!count) failures.push(`portal has no capabilities: ${required}`);
}

if (failures.length) {
  console.error('Four-portal contract failed:\n' + failures.map(x => '- ' + x).join('\n'));
  process.exit(1);
}

const counts = Object.fromEntries([...allowed].map(p => [p, (file.capabilities || []).filter(c => c.targetPortal === p).length]));
console.log(JSON.stringify({ok:true,total:(file.capabilities || []).length,counts}, null, 2));
