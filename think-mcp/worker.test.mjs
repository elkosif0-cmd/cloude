import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './worker.js';

const HOST='https://kosif-think-mcp.example.workers.dev';
let seq=0;
const ip=()=>`203.0.113.${(++seq%240)+10}`;
const calls={ai:0,secure:0};

function env(extra={}){
  return {
    AI:{run:async()=>{calls.ai++;return {response:JSON.stringify({answer:'stub',confidence:0.8})};}},
    SECURE_EXECUTOR:{fetch:async()=>{calls.secure++;return Response.json({ok:false,error:'SHOULD_NOT_RUN'},{status:500});}},
    ...extra
  };
}
function req(path,{method='POST',body,headers={},addr}={}){
  const h={'content-type':'application/json','cf-connecting-ip':addr||ip(),...headers};
  const init={method,headers:h};
  if(body!==undefined)init.body=body;
  else if(method==='POST')init.body=JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'});
  return new Request(HOST+path,init);
}
const call=(name,args={})=>JSON.stringify({jsonrpc:'2.0',id:7,method:'tools/call',params:{name,arguments:args}});
async function json(res){return JSON.parse(await res.text());}

test('public health is minimal and reports runtime 0.17.13',async()=>{
  const r=await worker.fetch(req('/health',{method:'GET'}),env());
  assert.equal(r.status,200);
  const b=await json(r);
  assert.deepEqual(Object.keys(b).sort(),['ok','service','version']);
  assert.equal(b.version,'0.17.13');
  assert.equal(r.headers.get('cache-control'),'no-store');
  assert.equal(r.headers.get('x-content-type-options'),'nosniff');
});

test('/mcp accepts POST/OPTIONS only and versioned discovery endpoint exists',async()=>{
  const e=env();
  for(const path of ['/mcp','/mcp/v0.17.13','/mcp/v0.17.12','/mcp/v0.17.11','/mcp/v0.17.10','/mcp/v0.9.3']){
    assert.equal((await worker.fetch(req(path,{method:'GET'}),e)).status,405);
    assert.equal((await worker.fetch(req(path,{method:'OPTIONS'}),e)).status,204);
    assert.equal((await worker.fetch(req(path),e)).status,200);
  }
  assert.equal((await worker.fetch(req('/missing',{method:'GET'}),e)).status,404);
});

test('tools/list is public discovery and exposes current KOSIF contracts',async()=>{
  const b=await json(await worker.fetch(req('/mcp'),env()));
  const tools=b.result.tools;
  const names=tools.map(t=>t.name);
  for(const name of ['kosif_full_pro_execute','kosif_think','kosif_agent','kosif_council','kosif_route','kosif_think_status']){
    assert.ok(names.includes(name),name);
  }
  const secure=tools.find(t=>t.name==='kosif_secure_image_execute');
  assert.ok(secure);
  assert.equal(secure.securitySchemes?.[0]?.type,'oauth2');
  const thinkTool=tools.find(t=>t.name==='kosif_think');
  assert.ok(thinkTool);
  assert.doesNotMatch(thinkTool.description,/five Cloudflare role agents/i);
  assert.doesNotMatch(JSON.stringify(tools),/mythos|clean apis|cleanapis/i);
});

test('protected secure execution fails closed without auth and never touches executor',async()=>{
  const e=env();
  const before=calls.secure;
  const r=await worker.fetch(req('/mcp',{body:call('kosif_secure_image_execute',{request_id:'x',scene_spec:{}})}),e);
  const txt=await r.text();
  assert.equal(calls.secure,before);
  assert.match(txt,/authentication_required|Authentication required|mcp\/www_authenticate/i);
});

test('foreign browser origins are rejected; allow-listed origin is echoed',async()=>{
  const bad=await worker.fetch(req('/mcp',{headers:{origin:'https://evil.example'}}),env());
  assert.equal(bad.status,403);
  assert.equal(bad.headers.get('access-control-allow-origin'),null);
  const e=env({THINK_ALLOWED_ORIGINS:'https://allowed.example'});
  const pre=await worker.fetch(req('/mcp',{method:'OPTIONS',headers:{origin:'https://allowed.example'}}),e);
  assert.equal(pre.status,204);
  assert.equal(pre.headers.get('access-control-allow-origin'),'https://allowed.example');
  assert.equal(pre.headers.get('vary'),'Origin');
});

test('JSON body limits and JSON-RPC validation remain fail closed',async()=>{
  const e=env({THINK_MAX_BODY_BYTES:'2048'});
  const big=call('kosif_route',{task:'x'.repeat(6000),availableTools:[]});
  assert.equal((await worker.fetch(req('/mcp',{body:big}),e)).status,413);
  const wrong=await worker.fetch(req('/mcp',{headers:{'content-type':'text/plain'},body:'{}'}),e);
  assert.equal(wrong.status,415);
  for(const body of ['[{"jsonrpc":"2.0","id":1,"method":"tools/list"}]','{"jsonrpc":"2.0","id":1}','null']){
    const b=await json(await worker.fetch(req('/mcp',{body}),e));
    assert.equal(b.error.code,-32600);
  }
  const parse=await json(await worker.fetch(req('/mcp',{body:'{not json'}),e));
  assert.equal(parse.error.code,-32700);
});

test('public broker is rate limited by caller IP',async()=>{
  const addr='198.51.100.88';
  const e=env({THINK_RPM:'2'});
  const body=call('kosif_route',{task:'review app architecture',availableTools:[]});
  assert.equal((await worker.fetch(req('/mcp',{body,addr}),e)).status,200);
  assert.equal((await worker.fetch(req('/mcp',{body,addr}),e)).status,200);
  assert.equal((await worker.fetch(req('/mcp',{body,addr}),e)).status,429);
});

test('kosif_route is deterministic host-mediated routing and spends no model calls',async()=>{
  const e=env();
  const before=calls.ai;
  const body=call('kosif_route',{
    task:'review code and prepare a safe deploy plan',
    availableTools:[
      {name:'GitHub',connected:true,costClass:'existing_plan'},
      {name:'Cloudflare',connected:true,costClass:'existing_plan'}
    ]
  });
  const out=(await json(await worker.fetch(req('/mcp',{body}),e))).result.structuredContent;
  assert.equal(calls.ai,before);
  assert.equal(out.mode,'host-mediated');
  assert.equal(out.directPluginCalls,false);
  assert.ok(out.useNow.some(x=>x.name==='GitHub'));
  assert.ok(out.useNow.some(x=>x.name==='Cloudflare'));
  assert.match(String(out.hostContract?.truthfulness||''),/Never claim/i);
});


test('a relevant credits tool is approval-gated, not silently auto-used',async()=>{
  const e=env();
  const body=call('kosif_route',{
    task:'create and animate a promotional video',
    preferredTools:['Runway'],
    availableTools:[{name:'Runway',connected:true,costClass:'credits'}]
  });
  const out=(await json(await worker.fetch(req('/mcp',{body}),e))).result.structuredContent;
  assert.equal(out.useNow.some(x=>x.name==='Runway'),false);
  assert.ok(out.needsApproval.some(x=>x.name==='Runway'));
});

test('unknown host availability is not reported as a verified connection',async()=>{
  const e=env();
  const body=call('kosif_route',{
    task:'use a design tool',
    availableTools:[{name:'Figma',costClass:'existing_plan'}]
  });
  const out=(await json(await worker.fetch(req('/mcp',{body}),e))).result.structuredContent;
  assert.equal(out.useNow.some(x=>x.name==='Figma'),false);
  const pending=out.needsAvailabilityCheck.find(x=>x.name==='Figma');
  assert.ok(pending,'Figma must require a live host availability check');
  assert.equal(pending.authState,'unknown');
});

test('status truthfully reports current provider/runtime and no Mythos',async()=>{
  const e=env();
  const out=(await json(await worker.fetch(req('/mcp',{body:call('kosif_think_status',{})}),e))).result.structuredContent;
  assert.equal(out.version,'0.17.13');
  assert.equal(out.access?.authPolicyVersion,'public-broker-oauth-v2');
  assert.equal(out.access?.authFailLockout,'pre-verification-ip-window');
  assert.equal(out.access?.revisionClosureVersion,'revision-closure-v1');
  assert.equal(out.governanceContracts?.decisionSensitivity,'decision-sensitivity-v1');
  assert.equal(out.governanceContracts?.executionBinding,'execution-binding-v1');
  assert.equal(out.governanceContracts?.secureVisualQa,'vision_task_aware_v5');
  assert.ok(out.improvements.includes('decision-sensitivity-v1'));
  assert.equal(out.councilProvider,'cloudflare');
  assert.deepEqual(out.frontierAgents.map(x=>x.id),['gpt','claude','gemini','fable']);
  assert.match(out.routing.deep,/gpt, claude, gemini, fable/);
  assert.doesNotMatch(out.routing.deep,/five independent/i);
  assert.equal(out.hostToolRouting.directPluginCalls,false);
  assert.equal(out.hostToolRouting.routeToolHostExposure,'unknown-to-server');
  assert.equal(out.fullProGateway.failClosed,true);
  assert.equal(out.fullProGateway.executorPolicy,'KOSIF_SECURE_EXECUTOR_ONLY');
});

test('path token compatibility is off by default',async()=>{
  const e=env();
  assert.equal((await worker.fetch(req('/mcp/not-a-token'),e)).status,404);
  const enabled=env({THINK_ALLOW_PATH_TOKEN:'true'});
  const r=await worker.fetch(req('/mcp/not-a-token',{body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})}),enabled);
  assert.equal(r.status,200,'path transport may exist, but public tools/list does not imply authentication');
});

test('source contains no removed Mythos/Clean APIs provider or embedded credential',()=>{
  const source=readFileSync(new URL('./worker.js',import.meta.url),'utf8');
  assert.equal(/id:\s*"mythos"/i.test(source),false);
  assert.equal(/cleanapis|clean apis/i.test(source),false);
  assert.equal(/sk-[A-Za-z0-9_-]{20,}/.test(source),false);
  assert.ok(source.includes('execution_contract_digest'));
  assert.ok(source.includes('capability_truth'));
  assert.ok(source.includes('source_taint'));
});

test('current visual/governance regression suite is present',()=>{
  const source=readFileSync(new URL('./regression-01713.test.mjs',import.meta.url),'utf8');
  assert.ok(source.includes('execution-binding-v1'));
  assert.ok(source.includes('vision_task_aware_v5'));
});
