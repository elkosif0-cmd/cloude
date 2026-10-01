import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(process.argv[2]||'think-mcp/worker.js','utf8');
assert.equal(/cleanapis|cleanApis|Clean APIs|CLEANAPIS/.test(source),false,'removed provider must have no executable/config/catalog references');
const mod=await import('data:text/javascript;base64,'+Buffer.from(source+'\nexport {FRONTIER_AGENTS,runAgentTool,aggregateCouncilTool,selfTestTool};').toString('base64'));
const models=[];let fetchCalls=0;globalThis.fetch=()=>{fetchCalls++;throw Error('external transport forbidden');};
const env={AI:{run:async(model,args)=>{models.push(model);assert(args.messages);return {response:JSON.stringify({answer:'42',recommendationId:'correct',evidence:['17+25=42'],assumptions:[],risks:[],objections:[],confidence:1})};}}};
const artifacts=[];
for(const agent of mod.FRONTIER_AGENTS){const r=await mod.runAgentTool(env,{agent:agent.id,question:'17+25',options:{correct:'42',wrong:'43'}});assert.equal(r.artifact.source,'cloudflare');assert.equal(r.fallback,null);artifacts.push(r.artifact);}
assert.equal(models.length,5);assert.equal(new Set(models).size,5);assert.equal(fetchCalls,0);
const council=mod.aggregateCouncilTool({question:'17+25',options:{correct:'42',wrong:'43'},artifacts});assert.equal(council.coverage.missing.length,0);assert.equal(council.coverage.primaryPresent.length,5);assert.equal(council.coverage.provenanceGroups.length,5);
assert.throws(()=>mod.aggregateCouncilTool({question:'x',artifacts:[artifacts[0],artifacts[0]]}),/DUPLICATE_AGENT_ID/);
const missing=mod.aggregateCouncilTool({question:'x',artifacts:artifacts.slice(0,4)});assert.equal(missing.preJevGate.passed,false);
console.log(JSON.stringify({passed:true,models,externalFetchCalls:fetchCalls,council:council.council,missingRejected:true,duplicateRejected:true}));
