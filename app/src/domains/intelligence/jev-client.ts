export type JevDecisionType='noul'|'choice'|'score';

export type JevChoiceRequest={
  type:'choice';
  state:unknown;
  instructions:string;
  criteria:Record<string,string|null>;
};

export type JevNoulRequest={
  type:'noul';
  state:unknown;
  instructions:string;
  true_criteria?:string;
  false_criteria?:string;
};

export type JevScoreRequest={
  type:'score';
  state:unknown;
  instructions:string;
  criteria:string[];
};

export type JevRequest=JevChoiceRequest|JevNoulRequest|JevScoreRequest;

export type JevSession={
  token:string;
  expiresAt:number;
};

export const JEV_API='https://aghnam-jev-api.kosif199022.workers.dev';
export const JEV_SESSION_KEY='skosif.v1.jev.session';

export function readJevSession(storage:Storage){
  const raw=storage.getItem(JEV_SESSION_KEY);
  if(!raw)return null;
  try{
    const session=JSON.parse(raw) as JevSession;
    if(!session.token||!Number.isFinite(session.expiresAt)||session.expiresAt<=Date.now()){
      storage.removeItem(JEV_SESSION_KEY);
      return null;
    }
    return session;
  }catch{
    storage.removeItem(JEV_SESSION_KEY);
    return null;
  }
}

export function saveJevSession(storage:Storage,token:string,expiresInSeconds:number){
  const session:JevSession={token,expiresAt:Date.now()+Math.max(0,expiresInSeconds)*1000};
  storage.setItem(JEV_SESSION_KEY,JSON.stringify(session));
  return session;
}

export function clearJevSession(storage:Storage){
  storage.removeItem(JEV_SESSION_KEY);
}

export function remainingSessionMinutes(session:JevSession|null){
  if(!session)return 0;
  return Math.max(0,Math.ceil((session.expiresAt-Date.now())/60000));
}

export async function createJevSession(password:string,fetcher:typeof fetch=fetch){
  const response=await fetcher(JEV_API+'/session',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({password}),
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data?.ok||!data?.token)throw new Error(data?.error||'تعذر إنشاء جلسة Jev');
  return {token:String(data.token),expiresIn:Number(data.expires_in)||0};
}

export async function runJev(request:JevRequest,session:JevSession,fetcher:typeof fetch=fetch){
  const response=await fetcher(JEV_API+'/api/jev',{
    method:'POST',
    headers:{'content-type':'application/json','authorization':'Bearer '+session.token},
    body:JSON.stringify(request),
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data?.ok)throw new Error(data?.error||'تعذر تشغيل Jev');
  return data.result;
}

export async function jevHealth(fetcher:typeof fetch=fetch){
  const response=await fetcher(JEV_API+'/health',{cache:'no-store'});
  if(!response.ok)return {ok:false};
  return response.json().catch(()=>({ok:false}));
}
