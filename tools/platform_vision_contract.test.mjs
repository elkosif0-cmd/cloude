import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const caps=json('ui/core/capabilities.json');
const contract=json('docs/product/KOSIF_PLATFORM_CONTRACT.json');
const sourceRegistry=json('docs/product/capability-source-registry.json');
const byId=Object.fromEntries(caps.capabilities.map(c=>[c.id,c]));

test('the product has exactly four user-facing gateways and required anchor capabilities',()=>{
  const expected=['accounting','reporting','audit','tools'];
  assert.deepEqual(caps.gateways.map(g=>g.id),expected);
  assert.deepEqual(contract.gateways.map(g=>g.id),expected);
  for(const gateway of contract.gateways)for(const id of gateway.required_capabilities){
    assert.ok(byId[id],id+' must remain registered');
    assert.equal(byId[id].gateway,gateway.id,id+' must remain in '+gateway.id);
  }
});

test('front door protects Taseef and preview build strips private unlock material',()=>{
  const unlock=read('unlock.html'),build=read('build.py');
  assert.match(unlock,/data-locked-name="تصيف"/);
  assert.match(unlock,/type="password"/);
  assert.match(unlock,/sqc_private_space/);
  assert.match(build,/SQC_PRIVATE_COMPANY_NAME/);
  assert.match(build,/SQC:LOCKED:START/);
  assert.match(build,/SQC:AUTH:START/);
  assert.match(build,/mode=="preview"/);
});

test('company capabilities are shared while company state and documents remain scoped',()=>{
  const company=read('ui/core/company-platform.js'),spaces=read('ui/core/helper-space.js');
  assert.match(company,/companyId:id/);
  assert.match(company,/x\.companyId===cur\(\)\.id/);
  assert.match(company,/skosif_company_platform_v1/);
  assert.match(spaces,/skosif_company_platform_v1/);
  assert.match(company,/installedTools/);
  assert.match(company,/setTool/);
});

test('accounting, reporting, audit and tools preserve their authority boundaries',()=>{
  const ledger=read('ui/features/ledger.js');
  const reporting=read('ui/features/reporting-intake.js');
  const inbox=read('ui/features/audit-inbox.js');
  const tools=read('ui/features/helper-center.js');
  assert.match(ledger,/validateJournalEntry/);
  assert.match(ledger,/اقتراح لا يرحّل ولا يعتمد/);
  assert.match(reporting,/tbImport\.parseTrialBalance/);
  assert.match(reporting,/statements\.buildStatements/);
  assert.match(reporting,/requestAuditHandoff/);
  assert.match(inbox,/الاستلام لا يعني قبول الدليل/);
  assert.match(tools,/مستقلة عن ملف المراجعة/);
});

test('standards, lineage, search and AI exceptions are cross-cutting shared layers',()=>{
  const company=read('ui/core/company-platform.js'),standards=read('ui/core/standards.js'),assistant=read('ui/features/assistant.js');
  assert.match(company,/addLineage/);
  assert.match(company,/addStandardTrace/);
  assert.match(company,/addAIException/);
  assert.match(company,/authoritative:false/);
  assert.match(company,/requiresHumanDecision:true/);
  assert.match(company,/function searchCompany/);
  assert.match(standards,/searchCodex/);
  assert.match(assistant,/name:"company_search"/);
  assert.match(assistant,/name:"standards_search"/);
});

test('all 17 current GitHub repositories are registered and external research stays proposal-only',()=>{
  const expected=['-','100-superskills','CLOUDFLARE_API_TOKEN','cloude','kosif-atlas','kosif-atlas-private','kosif-audit-pro','kosif-audit-studio','kosif-omni','mafateeh-al-tharwa','mafateeh-al-tharwa2','moon','new','see','smart-trial-balance-review','think','whatsapp-personal-bridge'].sort();
  assert.deepEqual(sourceRegistry.repositories.map(r=>r.repo).sort(),expected);
  assert.equal(new Set(sourceRegistry.repositories.map(r=>r.repo)).size,17);
  assert.equal(sourceRegistry.external_backlog?.status,'proposal-only');
  assert.ok(sourceRegistry.external_backlog?.file?.includes('EXTERNAL_CAPABILITY_BACKLOG'));
});

test('platform contract covers all thirteen pillars of the approved product vision',()=>{
  assert.equal(contract.requirements.length,13);
  for(const row of contract.requirements){
    assert.ok(row.id&&row.status);
    assert.ok(Array.isArray(row.artifacts)&&row.artifacts.length);
  }
  assert.ok(contract.authority_boundaries.some(x=>/non-authoritative/i.test(x)));
});
