import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const text=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const source=text('../build.py'),front=text('../unlock.html'),manifest=JSON.parse(text('../manifest.webmanifest')),shell=text('../ui/ds/shell.css'),theme=text('../ui/ds/sqc.css');
test('PWA installs as KOSIF EARTH while retaining five navigation capabilities and offline scope',()=>{
 assert.equal(manifest.short_name,'KOSIF EARTH');
 assert.match(manifest.name,/^KOSIF EARTH/);
 assert.equal(manifest.start_url,'./');
 assert.equal(manifest.scope,'./');
 assert.equal(manifest.display,'standalone');
 assert.equal(manifest.shortcuts.length,5);
 assert.deepEqual(manifest.shortcuts.map(s=>s.url),[
  './?go=tbreview','./?go=auditdocs','./?go=auditreport','./?do=search','./?go=helperdesk'
 ]);
 assert.equal(manifest.icons[0].src,'icon-192.png');
 assert.equal(manifest.icons[1].src,'icon-512.png');
 assert.equal(manifest.icons[2].src,'art/brand/kosif-earth-icon.svg');
});
test('build output no longer restores old SQC visible title, description, favicon or brand heading',()=>{
 assert.match(source,/<title>KOSIF EARTH/);
 assert.match(source,/content="KOSIF EARTH"/);
 assert.match(source,/id="app-name">KOSIF EARTH/);
 assert.match(source,/KOSIF EARTH — منصة واحدة/);
 assert.match(source,/kosif-earth-icon\.svg/);
 assert.doesNotMatch(source,/id="app-name">SQC/);
 assert.doesNotMatch(source,/<title>SQC/);
 assert.doesNotMatch(source,/print\("Built SQC/);
});
test('canonical domain and door wordmark announce new product name without removing its route to existing app',()=>{
 assert.match(front,/rel="canonical" href="https:\/\/earth\.kosif\.pp\.ua\/"/);
 assert.match(front,/<title>KOSIF EARTH/);
 assert.match(front,/alt="KOSIF EARTH"/);
 assert.match(front,/id="login-title">KOSIF EARTH/);
 assert.doesNotMatch(front,/alt="SQC"/);
});
test('look variants do not override visible brand with old SQC in CSS',()=>{
 assert.doesNotMatch(shell,/content:"SQC"/);
 assert.doesNotMatch(theme,/content:"SQC"/);
 assert.match(shell,/content:"KOSIF EARTH"/);
 assert.match(theme,/content:"KOSIF EARTH"/);
});
test('generated phone assets and private-preview gate remain valid',()=>{
 const dir=new URL('../dist/',import.meta.url);
 const shipped=JSON.parse(fs.readFileSync(new URL('manifest.webmanifest',dir),'utf8'));
 assert.equal(shipped.short_name,'KOSIF EARTH');
 for(const icon of ['icon-192.png','icon-512.png','apple-touch-icon.png','art/brand/kosif-earth-icon.svg','art/brand/kosif-earth-wordmark.svg'])
   assert(fs.statSync(new URL(icon,dir)).size>500,icon+' must not be an empty or corrupt asset');
 const wordmark=fs.readFileSync(new URL('art/brand/kosif-earth-wordmark.svg',dir),'utf8');
 assert.match(wordmark,/^<svg\s/);
 assert.match(wordmark,/>KOSIF<\/text>/);
 assert.match(wordmark,/>EARTH<\/text>/);
 const app=fs.readFileSync(new URL('app-safe.html',dir),'utf8');
 assert.match(app,/id="app-name">KOSIF EARTH/);
 assert.match(app,/<title>KOSIF EARTH/);
 assert.doesNotMatch(app,/id="app-name">SQC/);
 assert(!fs.existsSync(new URL('secure/',dir)),'public preview must not include secure files');
});
