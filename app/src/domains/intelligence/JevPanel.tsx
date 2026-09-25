import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {clearJevSession,createJevSession,jevHealth,readJevSession,remainingSessionMinutes,runJev,saveJevSession,type JevDecisionType,type JevRequest,type JevSession} from './jev-client';

type JevDecisionLog={
  id:string;
  at:string;
  type:JevDecisionType;
  question:string;
  result:unknown;
};

function records(base:string){
  const scope=readActiveScope(window.localStorage);
  const raw=window.localStorage.getItem(makeScopedKey(base,scope));
  if(!raw)return [] as any[];
  try{
    const parsed=JSON.parse(raw);
    return parsed?.version===1&&Array.isArray(parsed.records)?parsed.records:[];
  }catch{return [];}
}

function aggregateContext(){
  const customers=records('sales.customers');
  const suppliers=records('procurement.suppliers');
  const items=records('catalog.items');
  const orders=records('sales.orders');
  const purchaseOrders=records('procurement.orders');
  const stock=records('stock.movements');
  const issues=records('audit.issues');
  const pbc=records('audit.pbc');
  const invoices=records('sales.tax-invoices');
  return {
    source:'S.kosif canonical aggregates',
    customers:customers.length,
    suppliers:suppliers.length,
    items:items.length,
    salesOrders:orders.length,
    postedSalesOrders:orders.filter((x:any)=>x.status==='POSTED').length,
    purchaseOrders:purchaseOrders.length,
    stockMovements:stock.length,
    auditIssuesOpen:issues.filter((x:any)=>x.status!=='CLEARED'&&x.status!=='FINAL').length,
    pbcRequests:pbc.length,
    taxInvoices:invoices.length,
    paidTaxInvoices:invoices.filter((x:any)=>x.status==='PAID').length,
  };
}

export function JevPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const repo=useMemo(()=>new JsonStorageRepository<JevDecisionLog>(window.localStorage,makeScopedKey('intelligence.jev-decisions',scope)),[scope]);
  const [session,setSession]=useState<JevSession|null>(()=>readJevSession(window.localStorage));
  const [password,setPassword]=useState('');
  const [health,setHealth]=useState<'unknown'|'ok'|'down'>('unknown');
  const [type,setType]=useState<JevDecisionType>('choice');
  const [question,setQuestion]=useState('');
  const [criteria,setCriteria]=useState('الخيار A\nالخيار B');
  const [result,setResult]=useState<unknown>(null);
  const [logs,setLogs]=useState<JevDecisionLog[]>([]);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{void repo.list().then(setLogs);void jevHealth().then((x:any)=>setHealth(x?.ok?'ok':'down')).catch(()=>setHealth('down'));},[repo]);

  async function connect(){
    if(password.length<8){setMessage('أدخل كلمة المرور المعتمدة لجلسة Jev.');return;}
    setBusy(true);
    try{
      const created=await createJevSession(password);
      const saved=saveJevSession(window.localStorage,created.token,created.expiresIn);
      setSession(saved);setPassword('');setMessage('تم تفعيل Jev على هذا الجهاز حتى انتهاء الجلسة.');
    }catch(error){setMessage(String(error));}
    finally{setBusy(false);}
  }

  function disconnect(){
    clearJevSession(window.localStorage);setSession(null);setResult(null);setMessage('تم إنهاء جلسة Jev على هذا الجهاز.');
  }

  function buildRequest():JevRequest|null{
    const instructions=question.trim();
    if(!instructions){setMessage('اكتب السؤال أو القرار المطلوب.');return null;}
    const lines=criteria.split(/\n+/).map(x=>x.trim()).filter(Boolean);
    const state=aggregateContext();

    if(type==='noul'){
      return {
        type:'noul',state,instructions,
        true_criteria:lines[0]||'الأدلة تؤيد القرار',
        false_criteria:lines[1]||'الأدلة لا تؤيد القرار',
      };
    }
    if(type==='choice'){
      if(lines.length<2||lines.length>12){setMessage('أدخل من بديلين إلى 12 بديلًا، كل بديل في سطر.');return null;}
      return {type:'choice',state,instructions,criteria:Object.fromEntries(lines.map(line=>[line,null]))};
    }
    if(lines.length<2||lines.length>10){setMessage('أدخل من مستويين إلى 10 مستويات للتقييم.');return null;}
    return {type:'score',state,instructions,criteria:lines};
  }

  async function run(){
    const active=readJevSession(window.localStorage);
    if(!active){setSession(null);setMessage('جلسة Jev غير موجودة أو انتهت. أعد تفعيلها.');return;}
    const request=buildRequest();
    if(!request)return;
    setBusy(true);setMessage('');
    try{
      const answer=await runJev(request,active);
      setResult(answer);
      const log:JevDecisionLog={id:crypto.randomUUID(),at:new Date().toISOString(),type,question:question.trim(),result:answer};
      await repo.put(log);setLogs(await repo.list());
      setMessage('تمت معالجة القرار عبر Jev.');
    }catch(error){
      setMessage(String(error));
      if(String(error).includes('جلسة')){clearJevSession(window.localStorage);setSession(null);}
    }finally{setBusy(false);}
  }

  return <section className="jev-live sk-surface">
    <div className="jev-live__head">
      <div><span className="eyebrow">Jev Live Gateway</span><h3>مساعد القرار المتصل</h3><p>السياق المرسل أرقام مجمعة من البنية الجديدة؛ لا يتم وضع مفتاح Jev أو أسرار الخدمة داخل المتصفح.</p></div>
      <div className="jev-live__status"><span data-ok={health==='ok'}>{health==='ok'?'الخادم متاح':health==='down'?'الخادم غير متاح':'جارٍ الفحص'}</span><strong>{session?remainingSessionMinutes(session)+' دقيقة':'غير متصل'}</strong></div>
    </div>

    {!session?<div className="jev-session-form"><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="كلمة مرور جلسة Jev" autoComplete="current-password"/><button onClick={()=>void connect()} disabled={busy}>{busy?'جارٍ الاتصال…':'تفعيل Jev'}</button></div>:
    <div className="jev-session-active"><span>الجلسة محفوظة على هذا الجهاز حتى انتهاء صلاحيتها.</span><button className="secondary" onClick={disconnect}>إنهاء الجلسة</button></div>}

    <div className="jev-live__form">
      <select value={type} onChange={(e)=>setType(e.target.value as JevDecisionType)}><option value="noul">نعم / لا</option><option value="choice">اختيار بين بدائل</option><option value="score">تقييم</option></select>
      <textarea value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="مثال: أي بديل أفضل لتقليل الهدر مع الحفاظ على الهامش؟"/>
      <textarea value={criteria} onChange={(e)=>setCriteria(e.target.value)} placeholder="كل بديل أو مستوى في سطر"/>
      <button onClick={()=>void run()} disabled={busy||!session}>{busy?'Jev يحلل…':'اسأل Jev'}</button>
    </div>
    {message?<p className="intelligence-message">{message}</p>:null}
    {result?<div className="jev-result"><span>النتيجة الخام المنظمة</span><pre dir="ltr">{JSON.stringify(result,null,2)}</pre></div>:null}

    <div className="jev-history">
      <div><b>سجل القرارات</b><span>{logs.length}</span></div>
      {logs.slice().reverse().slice(0,12).map(log=><article key={log.id}><div><b>{log.question}</b><small>{log.type} · {new Date(log.at).toLocaleString('ar-SA')}</small></div><code>{JSON.stringify(log.result).slice(0,180)}</code></article>)}
    </div>
  </section>;
}
