import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {harness} from './output_focus_fixture.mjs';
export function shortcuts({palette=true,keys=true,assistant=true}={}){
 const h=harness({coreDialogs:true}),{SK}=h.context;h.document.readyState='loading';
 Object.assign(SK,{$:(selector,root=h.document)=>root.querySelector(selector),load:(_key,fallback)=>fallback,save(){},icons:{search:'Search'},icon:()=>'',caps:{all:()=>[],get:()=>null,path:()=>'',groups:()=>[]},perm:{can:()=>true,role:()=> 'admin'},store:{backup:async()=>{}},errors:{report:e=>{throw e}}});
 h.host.SKosifCore={view:()=> 'reports',catalog:()=>({items:[]}),go(){},act(){}};h.context.innerWidth=1180;
 const root=process.env.SQC_OUTPUT_ROOT||new URL('..',import.meta.url).pathname;
 const load=(file,globalName)=>{vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),h.context,{filename:file});h.context[globalName]=h.host[globalName]};
 if(palette)load('ui/components/palette.js','SKosifCommand');if(keys)load('ui/components/keys.js','SKosifKeys');if(assistant)load('ui/features/assistant.js','SKosifAssistant');
 return h;
}
