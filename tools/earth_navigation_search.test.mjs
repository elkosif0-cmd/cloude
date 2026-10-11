import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const shell=read('ui/layouts/shell.js');
const css=read('ui/ds/shell.css');
test('Search Enter dispatches the real tab-aware action',()=>{
 const part=shell.split('if(e.key==="Enter"){')[1].split('nav.addEventListener("click"')[0];
 assert.ok(part.includes('b.click()'));
 assert.ok(!part.includes('core().go(b.dataset.v)'));
 assert.ok(part.includes('e.preventDefault()'));
});
test('Search matches target capability and tab link',()=>{
 assert.ok(shell.includes('const target=SK.caps.get(b.dataset.v)'));
 assert.ok(shell.includes('(b.dataset.tab||"")'));
 assert.ok(shell.includes('(b.textContent||"")'));
});
test('Search result count is announced and hidden when idle',()=>{
 assert.ok(shell.includes('id="skn-search-status" aria-live="polite"'));
 assert.ok(shell.includes('status.hidden=!q'));
 assert.ok(css.includes('.skn-search-status[hidden]{display:none}'));
});
