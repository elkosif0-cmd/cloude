import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const shell=fs.readFileSync(new URL('../ui/layouts/shell.js',import.meta.url),'utf8');
const tokens=fs.readFileSync(new URL('../ui/ds/tokens.css',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../ui/ds/shell.css',import.meta.url),'utf8');
function vars(id){
 const m=tokens.match(new RegExp(':root\\[data-look="'+id+'"\\]'+(id==='copper-night'?'':'')+'\\s*\\{([^}]+)\\}'));
 assert.ok(m,id+' tokens not found');return Object.fromEntries([...m[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{6})/gi)].map(x=>[x[1],x[2]]));
}
function val(hex){assert.match(hex,/^#[a-f0-9]{6}$/i);return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
function contrast(a,b){const x=val(a),y=val(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
test('daylight office identity remains the exact default',()=>{assert.match(shell,/look:"kosif",density:"cozy",lastLight:"kosif"/);assert.match(shell,/\["kosif","دفتر KOSIF"/)});
test('two distinct copper themes are in the picker and night map',()=>{assert.match(shell,/\["copper","كحلي ونحاس"/);assert.match(shell,/\["copper-night","كحلي ونحاس ليلي"/);assert.match(shell,/DARK=new Set\([^\n]+"copper-night"/);assert.match(shell,/copper:"copper-night"/)});
test('light copper has accessible body, rail and primary CTA contrast',()=>{
 const v=vars('copper');for(const [a,b] of [['--sk-ink','--sk-bg'],['--sk-rail-ink','--sk-rail'],['--sk-on-brand','--sk-brand']])assert.ok(contrast(v[a],v[b])>=4.5,a+' contrast: '+contrast(v[a],v[b]));
});
test('night copper keeps readable body, rail and primary CTA contrast',()=>{
 const m=tokens.match(/:root\[data-look="copper"\]\[data-theme="dark"\]\s*\{([^}]+)\}/);
 assert.ok(m);const v=Object.fromEntries([...m[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{6})/gi)].map(x=>[x[1],x[2]]));
 for(const [a,b] of [['--sk-ink','--sk-bg'],['--sk-rail-ink','--sk-rail'],['--sk-on-brand','--sk-brand']])assert.ok(contrast(v[a],v[b])>=4.5,a+' contrast: '+contrast(v[a],v[b]));
});
test('responsive/reduced-motion copper CSS uses only opt-in look selectors',()=>{assert.match(css,/data-look="copper"/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);assert.doesNotMatch(css,/data-look="copper".*animation:infinite/)});
