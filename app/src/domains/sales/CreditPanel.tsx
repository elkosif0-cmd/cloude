import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {applyCreditMovement,availableCredit,creditUtilization,type CreditAccount,type CreditMovementType} from './credit-engine';
import type {Customer} from './customers-engine';

export function CreditPanel(){
  const scope=useMemo(()=>readActiveScope(window.localStorage),[]);
  const customerRepo=useMemo(()=>new JsonStorageRepository<Customer>(window.localStorage,makeScopedKey('sales.customers',scope)),[scope]);
  const creditRepo=useMemo(()=>new JsonStorageRepository<CreditAccount>(window.localStorage,makeScopedKey('sales.credit-ledger',scope)),[scope]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [accounts,setAccounts]=useState<CreditAccount[]>([]);
  const [customerId,setCustomerId]=useState('');
  const [limit,setLimit]=useState('');
  const [terms,setTerms]=useState('30 يوم');
  const [movementAccountId,setMovementAccountId]=useState('');
  const [movementType,setMovementType]=useState<CreditMovementType>('SALE');
  const [movementAmount,setMovementAmount]=useState('');
  const [note,setNote]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{void Promise.all([customerRepo.list(),creditRepo.list()]).then(([c,a])=>{setCustomers(c);setAccounts(a);});},[customerRepo,creditRepo]);

  const totalExposure=accounts.reduce((sum,a)=>sum+Math.max(0,a.balance),0);
  const totalLimit=accounts.reduce((sum,a)=>sum+Math.max(0,a.limit),0);
  const onHold=accounts.filter(a=>(a.status??'ACTIVE')==='HOLD').length;

  async function saveAccount(){
    const value=Number(limit);
    if(!customerId||!Number.isFinite(value)||value<0){setMessage('اختر العميل وأدخل حدًا ائتمانيًا صحيحًا.');return;}
    const existing=accounts.find(a=>a.customerId===customerId);
    const account:CreditAccount={
      id:existing?.id??('credit-'+customerId),
      customerId,
      limit:value,
      balance:existing?.balance??0,
      terms:terms.trim(),
      status:existing?.status??'ACTIVE',
      movements:existing?.movements??[],
    };
    await creditRepo.put(account);setAccounts(await creditRepo.list());
    setMessage('تم حفظ إعداد الائتمان.');
  }

  async function addMovement(){
    const account=accounts.find(a=>a.id===movementAccountId);
    const amount=Number(movementAmount);
    if(!account||!Number.isFinite(amount)||amount<=0){setMessage('اختر حسابًا ومبلغًا صحيحًا.');return;}
    try{
      await creditRepo.put(applyCreditMovement({...account,status:account.status??'ACTIVE',movements:account.movements??[]},{type:movementType,amount,note}));
      setAccounts(await creditRepo.list());setMovementAmount('');setNote('');setMessage('تم تسجيل حركة الائتمان.');
    }catch(error){setMessage(String(error));}
  }

  async function toggleHold(account:CreditAccount){
    await creditRepo.put({...account,status:(account.status??'ACTIVE')==='HOLD'?'ACTIVE':'HOLD',movements:account.movements??[]});
    setAccounts(await creditRepo.list());
  }

  return <section className="sales-credit sk-surface">
    <div className="sales-credit__head"><div><span className="eyebrow">B2B Credit Control</span><h3>الائتمان وحدود العملاء</h3></div><strong className="sk-number">{totalExposure.toLocaleString('en-US')}</strong></div>
    <div className="sales-credit__kpis"><span>إجمالي الحدود <b className="sk-number">{totalLimit.toLocaleString('en-US')}</b></span><span>التعرض الحالي <b className="sk-number">{totalExposure.toLocaleString('en-US')}</b></span><span>حسابات موقوفة <b>{onHold}</b></span></div>
    <div className="sales-credit__forms">
      <div>
        <select value={customerId} onChange={(e)=>setCustomerId(e.target.value)}><option value="">اختر العميل</option>{customers.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select>
        <input inputMode="decimal" value={limit} onChange={(e)=>setLimit(e.target.value)} placeholder="الحد الائتماني"/>
        <input value={terms} onChange={(e)=>setTerms(e.target.value)} placeholder="الشروط"/>
        <button onClick={()=>void saveAccount()}>حفظ حد الائتمان</button>
      </div>
      <div>
        <select value={movementAccountId} onChange={(e)=>setMovementAccountId(e.target.value)}><option value="">اختر حساب ائتمان</option>{accounts.map(a=><option key={a.id} value={a.id}>{customers.find(c=>c.id===a.customerId)?.name??a.customerId}</option>)}</select>
        <select value={movementType} onChange={(e)=>setMovementType(e.target.value as CreditMovementType)}><option value="SALE">بيع آجل</option><option value="RECEIPT">تحصيل</option><option value="ADJUSTMENT">تسوية</option></select>
        <input inputMode="decimal" value={movementAmount} onChange={(e)=>setMovementAmount(e.target.value)} placeholder="المبلغ"/>
        <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="ملاحظة"/>
        <button onClick={()=>void addMovement()}>تسجيل حركة</button>
      </div>
    </div>
    {message?<p className="sales-message">{message}</p>:null}
    {accounts.length===0?<p className="sales-empty">لا توجد حسابات ائتمان B2B بعد.</p>:<div className="sales-table"><table><thead><tr><th>العميل</th><th>الحد</th><th>الرصيد</th><th>المتاح</th><th>الاستخدام</th><th>الحالة</th></tr></thead><tbody>{accounts.map(account=><tr key={account.id}><td>{customers.find(c=>c.id===account.customerId)?.name??account.customerId}</td><td className="sk-number">{account.limit.toLocaleString('en-US')}</td><td className="sk-number">{account.balance.toLocaleString('en-US')}</td><td className="sk-number">{availableCredit({...account,status:account.status??'ACTIVE',movements:account.movements??[]}).toLocaleString('en-US')}</td><td>{creditUtilization({...account,status:account.status??'ACTIVE',movements:account.movements??[]})}%</td><td><button className={(account.status??'ACTIVE')==='HOLD'?'danger':'secondary'} onClick={()=>void toggleHold(account)}>{(account.status??'ACTIVE')==='HOLD'?'موقوف':'نشط'}</button></td></tr>)}</tbody></table></div>}
  </section>;
}
