/* Read-only management report dialog. No review import, posting, storage writes or legacy output wrapper. */
(()=>{
"use strict";
let active=null,sequence=0;
const can=action=>!!(SK.perm&&SK.perm.can("ledger")&&SK.perm.can("ledger",action));
const live=s=>active===s&&!s.closed&&s.dialog.isConnected;
const control=(s,name)=>s.dialog.querySelector('[data-mr="'+name+'"]');
const message=(s,text)=>{if(live(s))control(s,"status").textContent=text};
const focusables=s=>[...s.dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(n=>!n.hidden&&n.getClientRects().length);
function trapFocus(s,e){
  if(e.key!=="Tab"||!live(s))return;
  const items=focusables(s);if(!items.length){e.preventDefault();s.dialog.focus({preventScroll:true});return}
  const first=items[0],last=items[items.length-1],active=document.activeElement;
  if(e.shiftKey&&(active===first||!s.dialog.contains(active))){e.preventDefault();last.focus({preventScroll:true})}
  else if(!e.shiftKey&&(active===last||!s.dialog.contains(active))){e.preventDefault();first.focus({preventScroll:true})}
}
function buttons(s){if(!live(s))return;control(s,"confirm").disabled=s.busy||!s.capture;control(s,"refresh").disabled=s.busy;for(const b of s.dialog.querySelectorAll('[data-mr-output]'))b.disabled=s.busy||!s.snapshot||!can("export")}
function invalidate(s,text){s.snapshot=null;control(s,"attest").checked=false;control(s,"preview").replaceChildren();message(s,text);buttons(s)}
function close(s=active){
  if(!s||s.closed)return;s.closed=true;if(active===s)active=null;
  for(const cancel of [...s.cancellers])cancel();s.frame?.remove();s.frame=null;
  try{s.dialog.close()}catch{}s.dialog.remove();
  const opener=s.opener?.isConnected?s.opener:document.querySelector('[data-l="management-report"]');opener?.focus();
}
function bounded(s,promise){
  return new Promise((resolve,reject)=>{let done=false;const finish=(fn,v)=>{if(done)return;done=true;clearTimeout(timer);s.cancellers.delete(cancel);fn(v)};
    const cancel=()=>finish(reject,new Error("CLOSED"));const timer=setTimeout(()=>finish(reject,new Error("PRINT_TIMEOUT")),10000);s.cancellers.add(cancel);
    Promise.resolve(promise).then(v=>finish(resolve,v),e=>finish(reject,e));
  });
}
async function fresh(s,expected,action="view"){
  if(!live(s))return false;
  if(!can(action)){invalidate(s,"تعذر المتابعة: صلاحية الوصول أو التصدير غير متاحة.");return false;}
  const result=await window.SKosifManagementSource.checkFresh(expected);
  if(!live(s))return false;
  if(!can(action)){invalidate(s,"تعذر المتابعة: صلاحية الوصول أو التصدير غير متاحة.");return false}
  if(!result.fresh){invalidate(s,"تغيرت البيانات أو النطاق أو ملاحظات الاكتمال. أعد الالتقاط وأكّد النطاق مجددًا.");return false}
  return true;
}
async function capture(s){
  if(!live(s)||!can("view"))return;s.busy=true;s.capture=null;control(s,"context").textContent="";invalidate(s,"جارٍ قراءة نسخة من الدفاتر دون تغييرها…");buttons(s);
  try{
    const result=await window.SKosifManagementSource.capture();if(!live(s))return;
    if(!can("view")){message(s,"تعذر المتابعة: صلاحية الوصول غير متاحة.");return}
    if(!result.ok){message(s,result.issues?.[0]?.code==="SCOPE_UNAVAILABLE"?"تعذر إنشاء التقرير: نطاق الشركة غير جاهز في جلسة العمل الحالية. لم تتغير الدفاتر.":"تعذر إنشاء التقرير من البيانات الحالية. تحقق من سلامة الدفاتر واختيار المستخدم والشركة والفترة، ثم أعد الالتقاط.");return}
    s.capture=result;const c=result.input.context;
    control(s,"context").textContent=c.entityName+" · "+c.start+" — "+c.end+" · "+c.currency;
    message(s,"أكد الشركة والفترة والعملة لهذه النسخة. التأكيد لا يثبت ملكية الدفاتر ولا يمثل تأكيدًا مهنيًا.");
  }catch{message(s,"تعذر قراءة البيانات. لم يُنشأ تقرير ولم تتغير الدفاتر.")}
  finally{if(live(s)){s.busy=false;buttons(s)}}
}
async function confirm(s){
  if(!live(s)||s.busy||!s.capture||!control(s,"attest").checked)return;
  const captured=s.capture;s.busy=true;buttons(s);
  try{
    if(!await fresh(s,captured))return;
    const built=window.SKosifManagementModel.build(captured.input);
    if(!built.ok){invalidate(s,"تعذر إنشاء الأرصدة: توجد بيانات ناقصة أو قيود غير صالحة. عالجها في الدفاتر ثم أعد الالتقاط.");return}
    const snapshot=await window.SKosifManagementOutput.prepare({...captured,model:built.model,attestation:{kind:"user-attested",inputHash:captured.inputHash,contextHash:captured.contextHash,confirmedAt:new Date().toISOString()}});
    if(!live(s))return;
    const html=await window.SKosifManagementOutput.html(snapshot);if(!live(s)||!await fresh(s,captured))return;
    const main=new DOMParser().parseFromString(html,"text/html").querySelector(".sqc-management-report");if(!main)throw new Error("REPORT_MARKUP_INVALID");
    control(s,"preview").replaceChildren(document.importNode(main,true));s.snapshot=snapshot;
    message(s,"مسودة إدارية · نطاق التقرير أكده المستخدم. اكتمال المصادر موضح داخل التقرير.");
  }catch{if(live(s))invalidate(s,"تعذر إعداد المسودة. لم يحدث إصدار أو تغيير للدفاتر.")}
  finally{if(live(s)){s.busy=false;buttons(s)}}
}
async function print(s,html,snapshot){
  const frame=document.createElement("iframe");frame.className="sqc-mr-print-frame";frame.setAttribute("title","نسخة الطباعة الإدارية");frame.setAttribute("aria-hidden","true");s.frame?.remove();s.frame=frame;
  try{
    const loaded=new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=()=>reject(new Error("PRINT_LOAD_FAILED"))});
    frame.srcdoc=html;s.dialog.append(frame);await bounded(s,loaded);if(!live(s))return;
    const fontsReady=frame.contentDocument?.fonts?.ready;if(fontsReady)await bounded(s,fontsReady);
    if(!live(s)||!await fresh(s,snapshot,"export"))return;
    if(!frame.contentWindow||typeof frame.contentWindow.print!=="function")throw new Error("PRINT_UNAVAILABLE");
    frame.contentWindow.addEventListener("afterprint",()=>{frame.remove();if(s.frame===frame)s.frame=null},{once:true});
    frame.contentWindow.focus();frame.contentWindow.print();message(s,"طُلِبت معاينة الطباعة. راجع حوار المتصفح؛ لا يُعد ذلك إصدارًا للتقرير.");
  }catch{if(live(s))message(s,"تعذر فتح الطباعة أو تجهيز الخط. لم يُؤكد أي إخراج.")}
  finally{frame.remove();if(s.frame===frame)s.frame=null}
}
async function output(s,format){
  if(!live(s)||s.busy||!s.snapshot||!can("export"))return;
  const snapshot=s.snapshot;s.busy=true;buttons(s);
  try{
    const text=await window.SKosifManagementOutput[format==="print"?"html":format](snapshot);
    if(!live(s))return;
    if(format==="print"){await print(s,text,snapshot);return}
    if(!await fresh(s,snapshot,"export"))return;
    const mime={csv:"text/csv;charset=utf-8",json:"application/json;charset=utf-8",html:"text/html;charset=utf-8"}[format];
    const blob=new Blob([text],{type:mime}),url=URL.createObjectURL(blob),link=document.createElement("a");
    try{link.href=url;link.download="SQC-management-"+snapshot.snapshotHash.slice(0,12)+"."+format;s.dialog.append(link);link.click();message(s,"طُلِب تنزيل المسودة. تحقق من الملف في تنزيلات المتصفح.")}
    finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)}
  }catch{message(s,"تعذر تجهيز أو طلب التنزيل. لم يُؤكد حفظ الملف.")}
  finally{if(live(s)){s.busy=false;buttons(s)}}
}
async function open({opener=document.activeElement}={}){
  if(!can("view")){SK.toast?.("صلاحية عرض الدفاتر غير متاحة.","warn");return}
  close();const dialog=document.createElement("dialog");dialog.className="sqc-mr-dialog";dialog.setAttribute("aria-labelledby","sqc-mr-title");
  dialog.innerHTML='<header class="sqc-mr-toolbar"><h2 id="sqc-mr-title">تقرير إداري بالأرصدة</h2><button type="button" class="btn" data-mr="close">إغلاق</button></header><div class="sqc-mr-controls"><p data-mr="context"></p><label class="sqc-mr-attest"><input type="checkbox" data-mr="attest"> أؤكد الشركة والفترة والعملة الظاهرة لهذه النسخة، دون تغيير الدفاتر.</label><div class="sk-actions"><button type="button" class="btn" data-mr="confirm">تأكيد وإعداد المسودة</button><button type="button" class="btn" data-mr="refresh">إعادة الالتقاط</button></div><p class="sqc-mr-status" role="status" aria-live="polite" data-mr="status"></p><div class="sk-actions"><button type="button" class="btn" data-mr-output data-mr="html">تنزيل HTML</button><button type="button" class="btn" data-mr-output data-mr="csv">تنزيل CSV</button><button type="button" class="btn" data-mr-output data-mr="json">تنزيل JSON</button><button type="button" class="btn" data-mr-output data-mr="print">طباعة / PDF</button></div></div><div data-mr="preview"></div>';
  const s={id:++sequence,dialog,opener,closed:false,busy:false,capture:null,snapshot:null,cancellers:new Set(),frame:null};active=s;
  dialog.addEventListener("cancel",e=>{e.preventDefault();close(s)});dialog.addEventListener("close",()=>close(s));dialog.addEventListener("keydown",e=>trapFocus(s,e));
  dialog.addEventListener("click",async e=>{const button=e.target.closest('[data-mr]');if(!button)return;const action=button.dataset.mr;if(action==="close")close(s);else if(action==="refresh"&&!s.busy)await capture(s);else if(action==="confirm")await confirm(s);else if(["csv","json","html","print"].includes(action))await output(s,action)});
  document.body.append(dialog);
  try{dialog.showModal();control(s,"close").focus();await capture(s)}catch{close(s);SK.toast?.("تعذر فتح معاينة التقرير.","bad")}
}
SK.bus?.on("nav",()=>close());
window.SKosifManagementReport=Object.freeze({open,close});
})();
