import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mcp=fs.readFileSync(new URL('../workers/mcp/index.js',import.meta.url),'utf8');
const bridge=fs.readFileSync(new URL('../src/index.ts',import.meta.url),'utf8');

test('MCP preserves transport-accepted vs provider-delivered/read truth',()=>{
  assert.match(mcp,/accepted means WhatsApp transport accepted the message; delivered\/read require provider receipt evidence/);
  assert.match(mcp,/enum: \["all","scheduled","sending","accepted","delivered","read","partial","failed","cancelled"\]/);
  assert.match(mcp,/data\.status = accepted \? 'accepted'/);
  assert.match(mcp,/delivery\/read are not yet confirmed/);
  assert.match(bridge,/type DeliveryState = 'accepted' \| 'delivered' \| 'read' \| 'failed'/);
});

test('non-destructive bridge diagnostics remain exposed behind the current owner auth gate',()=>{
  assert.match(mcp,/name: "diagnose_whatsapp_bridge"/);
  assert.match(mcp,/callBridge\(env, "\/diagnostics", a\.key\)/);
  assert.match(bridge,/path === '\/diagnostics'/);
  assert.match(mcp,/const auth = await authorize\(req, url, env\)/);
});
