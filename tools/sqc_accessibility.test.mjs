import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness,focusable} from './tests/sqc-ui-harness.mjs';
test('all screen body tokens and editable fields have a 16px floor',()=>{
 const css=fs.readFileSync('ui/ds/tokens.css','utf8')+fs.readFileSync('ui/ds/shell.css','utf8');
 for(const m of css.matchAll(/--sk-fs:([\d.]+)px/g))assert.ok(+m[1]>=16,`body token ${m[1]}px`);
 assert.match(fs.readFileSync('ui/ds/sqc.css','utf8'),/font-size:max\(16px,var\(--sk-fs\)\)/);
});
test('named motion tokens use approved durations and reduced-motion covers pseudo-elements',()=>{
 const css=fs.readFileSync('ui/ds/tokens.css','utf8');
 assert.match(css,/--sk-motion-fast:160ms/);assert.match(css,/--sk-motion-panel:210ms/);
 assert.match(fs.readFileSync('ui/ds/sqc.css','utf8'),/\*::before,\*::after/);
});
test('shared modal cycles focus both ways and restores the actual invoker once',()=>{
 const h=harness();h.load('ui/core/sk.js');assert.equal(typeof h.ctx.SK.modalFocus,'function');
 const inv=focusable(h.doc,'invoker'),a=focusable(h.doc,'first'),b=focusable(h.doc,'last');inv.focus();
 const root={querySelectorAll:()=>[a,b],contains:e=>[a,b].includes(e),setAttribute(){},focus(){h.doc.activeElement=this}};
 const release=h.ctx.SK.modalFocus(root);b.focus();assert.equal(h.fire('Tab').prevented,true);assert.equal(h.doc.activeElement,a);
 h.fire('Tab',{shiftKey:true});assert.equal(h.doc.activeElement,b);release();assert.equal(h.doc.activeElement,inv);
 a.focus();release();assert.equal(h.doc.activeElement,a);
});
test('nested modal releases return to their own invoker and restore outer trapping',()=>{
 const h=harness();h.load('ui/core/sk.js');assert.equal(typeof h.ctx.SK.modalFocus,'function');
 const inv=focusable(h.doc,'invoker'),a=focusable(h.doc,'outer'),b=focusable(h.doc,'inner');inv.focus();
 const root=els=>({querySelectorAll:()=>els,contains:e=>els.includes(e),setAttribute(){}});
 const outer=h.ctx.SK.modalFocus(root([a]));a.focus();const inner=h.ctx.SK.modalFocus(root([b]));b.focus();
 h.fire('Tab');assert.equal(h.doc.activeElement,b);inner();assert.equal(h.doc.activeElement,a);
 h.fire('Tab');assert.equal(h.doc.activeElement,a);outer();assert.equal(h.doc.activeElement,inv);
});
test('dynamic states announce complete text, and errors expose retry',()=>{
 const h=harness();h.load('ui/components/states.js');
 for(const name of ['loading','empty','offline','denied','partial','success']){
  const html=h.ctx.SK.ui.state[name]();assert.match(html,/role="status"/);assert.match(html,/aria-atomic="true"/);
 }
 const error=h.ctx.SK.ui.state.error();assert.match(error,/role="alert"/);assert.match(error,/data-sks-retry/);
});
test('directional text helper escapes source content and isolates phone/amount strings',()=>{
 const h=harness();h.load('ui/core/a11y.js');assert.equal(typeof h.ctx.SK.a11y.bidi,'function');
 assert.equal(h.ctx.SK.a11y.bidi('+966 500 <123>','ltr'),'<bdi dir="ltr">+966 500 &lt;123></bdi>');
 assert.equal(h.ctx.SK.a11y.bidi('test','malicious"'),'<bdi dir="auto">test</bdi>');
});
test('form validation associates errors with fields and preserves existing hints',()=>{
 const h=harness();let error=null;const attrs=new Map([['aria-describedby','hint']]);const box={querySelector:()=>error,appendChild(el){error=el}};
 const input={id:'amount',value:'',dataset:{},hasAttribute:k=>k==='data-sk-required',getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k),closest:()=>box,focus(){h.doc.activeElement=this}};
 h.doc.createElement=()=>({setAttribute(){},remove(){error=null}});h.load('ui/components/states.js');
 assert.equal(h.ctx.SK.ui.validate({querySelectorAll:()=>[input]}),false);assert.equal(attrs.get('aria-invalid'),'true');
 assert.match(attrs.get('aria-describedby'),/hint .+/);assert.equal(h.doc.activeElement,input);
 input.value='3';assert.equal(h.ctx.SK.ui.validate({querySelectorAll:()=>[input]}),true);assert.equal(attrs.get('aria-describedby'),'hint');assert.equal(error,null);
});
