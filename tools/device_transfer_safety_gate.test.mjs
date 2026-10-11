import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../ui/features/devices.js',import.meta.url),'utf8');
const store=fs.readFileSync(new URL('../ui/core/store.js',import.meta.url),'utf8');

test('device-wide transfer is never rendered in company browser until trusted server support exists',()=>{
 assert.match(source,/const DEVICE_WIDE_TRANSFER_PAUSED=true/);
 assert.match(source,/canOut=transferAllowed\(\)&&SK\.perm\.can/);
 assert.match(source,/canIn=transferAllowed\(\)&&SK\.perm\.can/);
 assert.match(source,/if\(!transferAllowed\(\)\)return '<section class="card"/);
 assert.match(source,/id="dv-transfer-locked"/);
});
test('every transfer trigger and the actual full export mechanism is fail closed',()=>{
 assert.match(source,/async function seal\(c\)\{\s*guardTransfer\(\)/);
 for(const name of ['send','deliver','openIncoming','apply']){
  assert.match(source,new RegExp('async function '+name+'\\([^)]*\\)\\{\\s*if\\(!transferAllowed\\(\\)\\)return blockedTransfer\\(\\)'));
 }
 assert.match(source,/\["send","share-now","download-now","open","apply","rollback","snap"\]/);
 assert.match(source,/DEVICE_WIDE_TRANSFER_REQUIRES_SERVER_AUTHORIZATION/);
 assert.match(source,/await SK\.store\.data\(\)/);
 assert.match(store,/SK\.store=Object\.freeze/);
});
test('no device backup or restore primitive was deleted; company export remains distinct',()=>{
 assert.match(store,/async function backup\(\)/);
 assert.match(store,/async function restore\(/);
 assert.match(store,/async function rollback\(\)/);
 const view=fs.readFileSync(new URL('../ui/features/workspace.js',import.meta.url),'utf8');
 assert.match(view,/SK\.legacyCompanyData\.snapshot\(\)/);
 assert.doesNotMatch(view,/SK\.store\.backup\(\)/);
});
