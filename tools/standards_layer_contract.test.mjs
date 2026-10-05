import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const service=fs.readFileSync(new URL('../ui/core/standards.js',import.meta.url),'utf8');
const company=fs.readFileSync(new URL('../ui/core/company-platform.js',import.meta.url),'utf8');
const master=fs.readFileSync(new URL('../ui/features/master-data.js',import.meta.url),'utf8');
const assistant=fs.readFileSync(new URL('../ui/features/assistant.js',import.meta.url),'utf8');
const build=fs.readFileSync(new URL('../build.py',import.meta.url),'utf8');

test('company profile carries an explicit reporting framework',()=>{
  assert.match(company,/framework:\(cur\(\)\.country==="EG"\?"EAS":"IFRS"\)/);
  assert.match(company,/\["IFRS","SME","EAS"\]/);
  assert.match(master,/data-md-profile="framework"/);
  for(const code of ['IFRS','SME','EAS'])assert.match(master,new RegExp('value="'+code+'"'));
});

test('standards layer reads deterministic codex and never approves automatically',()=>{
  assert.match(service,/SKEngines\.audit&&SKEngines\.audit\.codex/);
  assert.match(service,/searchCodex/);
  assert.match(service,/REGISTRY_DATE/);
  assert.match(service,/inFramework/);
  assert.match(service,/approved=false/);
  assert.doesNotMatch(service,/approved:true/);
  assert.match(service,/window\.SKosifStandards=Object\.freeze/);
});

test('assistant routes standards questions through the shared standards service',()=>{
  assert.match(assistant,/name:"standards_search"/);
  assert.match(assistant,/SKosifStandards/);
  assert.match(assistant,/IFRS\/IAS\/ISA\/SOCPA\/ZATCA\/EAS/);
  assert.match(assistant,/standards_search/);
});

test('standards service is wired before feature modules',()=>{
  const i=build.indexOf('"core/standards.js"');
  const a=build.indexOf('"features/assistant.js"');
  assert.ok(i>0,'standards core must be in build');
  assert.ok(a>i,'assistant must load after standards core');
});
