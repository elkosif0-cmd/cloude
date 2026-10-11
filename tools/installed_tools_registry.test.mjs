import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const src=readFileSync(new URL('ui/core/registry.js',root),'utf8');
const raw=JSON.parse(readFileSync(new URL('ui/core/capabilities.json',root),'utf8'));
function mock(){
 let company='account-a';
 const installed={'account-a':['salesintel'],'account-b':[],'account-c':['productflow']};
 const SK={company:{current:()=>({id:company,sector:'trade',ownerScope:'FULL_ACCOUNTING'})}};
 const global={SK,__SK_CAPS__:raw};global.window=global;
 global.SKosifCompanyPlatform={state:()=>({companyId:company,installedTools:installed[company]||[]})};
 vm.runInNewContext(src,global,{filename:'registry.js'});
 return{caps:SK.caps,setCompany:id=>company=id};
}
const has=(menu,id)=>menu?.some(section=>section.hubs.some(h=>h.id===id))||false;
test('installed Tools hub becomes a single accounting menu item in owning company only',()=>{
 const x=mock(),c=x.caps;
 assert.equal(c.inGatewayOf(c.get('salesintel'),'accounting'),true);
 assert.equal(has(c.menu('accounting'),'salesintel'),true);
 assert.equal(has(c.menu('audit'),'salesintel'),false);
 const list=c.menu('accounting').flatMap(s=>s.hubs).filter(h=>h.id==='salesintel');
 assert.equal(list.length,1,'same tool must not repeat in multiple menu sections');
 x.setCompany('account-b');
 assert.equal(c.inGatewayOf(c.get('salesintel'),'accounting'),false);
 assert.equal(has(c.menu('accounting'),'salesintel'),false);
 assert.equal(c.inGatewayOf(c.get('salesintel'),'tools'),true,'independent Tools catalog unaffected');
 x.setCompany('account-a');
 assert.equal(c.inGatewayOf(c.get('salesintel'),'accounting'),true);
 assert.equal(has(c.menu('accounting'),'salesintel'),true);
});
test('new company has only its explicitly installed tool, not other company tools',()=>{
 const x=mock(),c=x.caps;
 x.setCompany('account-c');
 assert.equal(c.inGatewayOf(c.get('productflow'),'accounting'),true);
 assert.equal(c.inGatewayOf(c.get('salesintel'),'accounting'),false);
 assert.equal(has(c.menu('accounting'),'productflow'),true);
 assert.equal(has(c.menu('accounting'),'salesintel'),false);
});
test('unrelated audit and accounting core screens do not change owner gate',()=>{
 const x=mock(),c=x.caps;
 assert.equal(c.inGatewayOf(c.get('tbreview'),'audit'),true);
 assert.equal(c.inGatewayOf(c.get('tbreview'),'accounting'),false);
 assert.equal(c.inGatewayOf(c.get('ledger'),'accounting'),true);
 assert.equal(c.inGatewayOf(c.get('ledger'),'audit'),false);
});
