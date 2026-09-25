import {useEffect,useMemo,useState} from 'react';
import {JsonStorageRepository} from '../../data/json-storage-repository';
import {makeScopedKey,readActiveScope} from '../../data/scope-key';
import {ROLE_ACTIONS,type Action,type RoleId} from '../../security/permissions';
import {createUserAccess,type UserAccess} from '../../security/user-access';

const ROLE_LABELS:Record<RoleId,string>={
  admin:'مدير النظام',
  accountant:'المحاسبة',
  operations:'التشغيل',
  sales:'المبيعات',
  viewer:'مشاهدة فقط',
};

const ACTION_LABELS:Record<Action,string>={
  view:'عرض',
  create:'إنشاء',
  edit:'تعديل',
  approve:'اعتماد',
  export:'تصدير',
  import:'استيراد',
};

export function AccessPanel(){
  const [users,setUsers]=useState<UserAccess[]>([]);
  const [id,setId]=useState('');
  const [displayName,setDisplayName]=useState('');
  const [role,setRole]=useState<RoleId>('viewer');
  const [message,setMessage]=useState('');
  const key=useMemo(()=>makeScopedKey('system.user-access',readActiveScope(window.localStorage)),[]);
  const repo=useMemo(()=>new JsonStorageRepository<UserAccess>(window.localStorage,key),[key]);
  useEffect(()=>{void repo.list().then(setUsers);},[repo]);

  async function addUser(){
    try{
      const user=createUserAccess({id,displayName,role});
      await repo.put(user);
      setUsers(await repo.list());
      setId('');setDisplayName('');setMessage('تم حفظ صلاحية المستخدم.');
    }catch{
      setMessage('أدخل معرف المستخدم واسمه.');
    }
  }

  async function toggle(user:UserAccess){
    await repo.put({...user,active:!user.active});
    setUsers(await repo.list());
  }

  return <section className="system-access sk-surface">
    <span className="eyebrow">Roles & Permissions</span><h3>المستخدمون والصلاحيات</h3>
    <div className="system-access__form">
      <input value={id} onChange={(e)=>setId(e.target.value)} placeholder="معرف المستخدم"/>
      <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} placeholder="الاسم"/>
      <select value={role} onChange={(e)=>setRole(e.target.value as RoleId)}>{Object.entries(ROLE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
      <button onClick={()=>void addUser()}>إضافة/تحديث</button>
    </div>
    {message?<p className="system-message">{message}</p>:null}
    <div className="system-access__matrix">{(Object.keys(ROLE_LABELS) as RoleId[]).map(roleId=><article key={roleId}><b>{ROLE_LABELS[roleId]}</b><div>{(Object.keys(ACTION_LABELS) as Action[]).map(action=><span key={action} data-allowed={ROLE_ACTIONS[roleId].includes(action)}>{ACTION_LABELS[action]}</span>)}</div></article>)}</div>
    {users.length>0?<div className="system-users">{users.map(user=><article key={user.id}><div><b>{user.displayName}</b><small>{user.id}</small></div><span>{ROLE_LABELS[user.role]}</span><button className={user.active?'secondary':'danger'} onClick={()=>void toggle(user)}>{user.active?'تعطيل':'تفعيل'}</button></article>)}</div>:null}
  </section>;
}
