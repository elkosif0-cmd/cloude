import { buildCouncilRoundReport, serializeCouncilRoundCsv } from './council-round-export.js';

const find=(root,id)=>root.querySelector('#'+id);
const fileName=(id,extension)=>'KOSIF_Council_Rounds_'+String(id).replace(/[^A-Za-z0-9_-]/g,'_').slice(0,60)+'.'+extension;
function download(name,body,type){
  const url=URL.createObjectURL(new Blob([body],{type}));
  const node=document.createElement('a');
  node.download=name;node.href=url;node.style.display='none';
  document.body.appendChild(node);
  try{node.click()}finally{node.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
}
function activeScope(engagement){
  if(!engagement?.companyId||!engagement?.workspaceId)throw new Error('يلزم اختيار شركة ومساحة عمل لإتاحة التصدير.');
  const current=globalThis.SK?.company?.current?.()?.id||null;
  if(current&&current!==engagement.companyId)throw new Error('ملف المراجعة يخص شركة أخرى.');
  return {engagement,companyId:engagement.companyId,workspaceId:engagement.workspaceId};
}
export function installCouncilRoundExport({root,getEngagement}){
  if(!root||typeof getEngagement!=='function')return;
  const parent=find(root,'councilSummary');
  if(!parent)return;
  if(!find(root,'councilExportActions')){
    const controls=document.createElement('div');
    controls.id='councilExportActions';
    controls.className='council-export-actions';
    controls.innerHTML='<button type="button" class="secondary" id="exportCouncilRoundsCsv">تصدير الجولات Excel/CSV</button>'+
      '<button type="button" class="ghost" id="exportCouncilRoundsJson">تصدير الجولات JSON</button>'+
      '<small id="councilExportStatus" role="status" aria-live="polite">سجل استشاري محلي؛ غير معتمد مهنيًا ولا يثبت تشغيل AI حيًا.</small>';
    parent.before(controls);
  }
  for(const format of ['csv','json']){
    const button=find(root,format==='csv'?'exportCouncilRoundsCsv':'exportCouncilRoundsJson');
    button.onclick=async()=>{
      const label=find(root,'councilExportStatus'),start=getEngagement();
      button.disabled=true;
      try{
        label.textContent='فحص نطاق الشركة وسلامة إيصالات الجولات…';
        const report=await buildCouncilRoundReport(activeScope(start));
        if(getEngagement()!==start)throw new Error('تغير ملف المراجعة أثناء التصدير.');
        activeScope(start);
        const payload=format==='csv'?serializeCouncilRoundCsv(report):JSON.stringify(report,null,2);
        download(fileName(start.id,format),payload,format==='csv'?'text/csv;charset=utf-8':'application/json;charset=utf-8');
        label.textContent='تم إعداد نسخة استشارية محلية؛ دون اعتماد بشري أو تحقق خادم.';
      }catch(error){label.textContent='توقف التصدير: '+String(error?.message||error)}
      finally{refreshCouncilExport({root,engagement:getEngagement()})}
    };
  }
}
export function refreshCouncilExport({root,engagement}){
  const active=Boolean(engagement?.companyId&&engagement?.workspaceId&&engagement?.councilRounds?.length);
  for(const id of ['exportCouncilRoundsCsv','exportCouncilRoundsJson']){
    const btn=find(root,id);if(!btn)continue;
    btn.disabled=!active;
    btn.title=active?'تصدير معلومات استشارية للشركة الحالية':'يلزم ربط الشركة ومساحة العمل وتسجيل جولة';
  }
}
