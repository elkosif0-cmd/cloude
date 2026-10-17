import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {parseHTML}=require('linkedom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function harness(){
 const {document,Event}=parseHTML('<html><body><main id="root"></main></body></html>'),views={},store=new Map(),messages=[],toasts=[];
 const SK={esc:s=>String(s??''),$:q=>document.querySelector(q),$$:q=>[...document.querySelectorAll(q)],num:Number,money:String,icon:()=>'',toast:(...x)=>toasts.push(x),
 load:(k,d)=>structuredClone(store.has(k)?store.get(k):d),save:(k,v)=>{store.set(k,structuredClone(v));return true},
 company:{current:()=>({id:'synthetic',name:'Synthetic',country:'SA',currency:'SAR'}),updateMeta:()=>true},
 icons:{},ui:{uid:()=> 'synthetic',state:{empty:()=>''}},caps:{get:()=>null},audit:{log(){}},bus:{on(){},emit(){}},view:(id,v)=>views[id]=v};
 const c=vm.createContext({document,console,TextEncoder,TextDecoder,Uint8Array,btoa,atob,SK,setTimeout(){},navigator:{userAgent:''}});c.window=c;
 for(const f of ['ui/core/engines.js','ui/core/company-platform.js','ui/features/master-data.js','ui/features/enterprise.js'])vm.runInContext(read(f),c,{filename:f});
 SK.vatRate=()=>c.SKosifCompanyPlatform.vatPolicy().rate;SK.vatPct=()=>SK.vatRate()*100+'%';
 c.open=url=>messages.push(decodeURIComponent(url.split('text=')[1]));c.QRCode=class{static CorrectLevel={M:0};constructor(box,o){box.dataset.tlv=o.text}};
 const root=document.querySelector('#root'),click=q=>document.querySelector(q).dispatchEvent(new Event('click',{bubbles:true}));
 return {c,SK,document,views,root,click,messages,toasts,store,cp:c.SKosifCompanyPlatform};
}
for(const pct of [0,0.5,1,5,15])for(const registered of [true,false])test(`percent field ${pct}% registered=${registered}`,async()=>{
 const h=harness();h.views.masterdata.render(h.root);
 h.document.querySelector('[data-md-profile="vatRate"]').value=String(pct);
 Object.defineProperty(h.document.querySelector('[data-md-profile="vatRegistered"]'),'value',{value:registered?'yes':'no'});
 h.click('[data-md-profile-save]');await Promise.resolve();
 assert.equal(h.cp.profile().vatRate,pct/100);assert.equal(h.cp.vatPolicy().rate,registered?pct/100:0);
 assert.equal(h.document.querySelector('[data-md-profile="vatRate"]').value,String(pct));
});
for(const invalid of ['-1','101','NaN','Infinity','abc'])test(`invalid UI percent ${invalid} saves nothing`,async()=>{
 const h=harness();h.cp.setProfile({vatRate:0.05});h.views.masterdata.render(h.root);const before=JSON.stringify([...h.store]);
 h.document.querySelector('[data-md-profile="vatRate"]').value=invalid;h.click('[data-md-profile-save]');await Promise.resolve();
 assert.equal(JSON.stringify([...h.store]),before);assert.equal(h.toasts.at(-1)[1],'bad');
});
test('blank UI percent restores country default; API fraction semantics stay intact',()=>{
 const h=harness();h.cp.setProfile({vatRate:0.005});h.views.masterdata.render(h.root);h.document.querySelector('[data-md-profile="vatRate"]').value=' ';h.click('[data-md-profile-save]');
 assert.equal(h.cp.profile().vatRate,null);assert.equal(h.cp.vatPolicy().rate,0.15);h.cp.setProfile({vatRate:1});assert.equal(h.cp.profile().vatRate,1);
});
for(const pct of [0,0.5,1,5,15])for(const registered of [true,false])for(const amount of [100,12.345,1.005,2.675,0.035])test(`receipt/QR/check/message agree ${pct}% registered=${registered} amount=${amount}`,()=>{
 const h=harness();h.cp.setProfile({vatRate:pct/100,vatRegistered:registered});
 h.store.set('aghnam-pricing-v3',{settings:{biz:'Synthetic seller',vatNo:'300000000000003'}});
 h.store.set('skosif_v32_cart',{test:{name:'Synthetic item',qty:1,price:amount}});h.views.zatca.render(h.root);h.click('#sk38-cart-import');
 const vat=Number((amount*(registered?pct/100:0)).toFixed(2)),net=Number(amount.toFixed(2)),total=(net+vat).toFixed(2);
 const qr=h.document.querySelector('#sk38-qrcode-box').dataset.tlv;
 const bytes=Buffer.from(qr,'base64'),tags={};for(let i=0;i<bytes.length;){const tag=bytes[i++],len=bytes[i++];tags[tag]=bytes.subarray(i,i+len).toString();i+=len}
 assert.equal(tags[4],total);assert.equal(tags[5],vat.toFixed(2));
 assert.ok(h.document.querySelector('#sk38-receipt-printable').textContent.includes(total));
 h.click('#sk38-tlv-load-cur');assert.equal(h.document.querySelector('#sk38-tlv-input').value,qr);assert.match(h.document.querySelector('#sk38-tlv-out').textContent,/دقيقة/);
 h.click('#sk38-wa-rcpt');assert.ok(h.messages[0].includes('*الإجمالي المستحق:* '+total));assert.ok(h.messages[0].includes(vat.toFixed(2)+' ر.س'));
});
