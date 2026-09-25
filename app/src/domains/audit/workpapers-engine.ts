export type WorkpaperStatus='DRAFT'|'PREPARED'|'REVIEWED'|'LOCKED';

export type Workpaper={
  id:string;
  reference:string;
  title:string;
  area:string;
  objective:string;
  procedure:string;
  conclusion:string;
  preparer?:string;
  reviewer?:string;
  riskIds:string[];
  evidenceIds:string[];
  issueIds:string[];
  status:WorkpaperStatus;
  preparedAt?:string;
  reviewedAt?:string;
};

const transitions:Record<WorkpaperStatus,WorkpaperStatus[]>={
  DRAFT:['PREPARED'],
  PREPARED:['DRAFT','REVIEWED'],
  REVIEWED:['PREPARED','LOCKED'],
  LOCKED:[],
};

export function canTransitionWorkpaper(from:WorkpaperStatus,to:WorkpaperStatus){
  return transitions[from].includes(to);
}

export function transitionWorkpaper(workpaper:Workpaper,to:WorkpaperStatus,actor?:string,now=new Date()):Workpaper{
  if(!canTransitionWorkpaper(workpaper.status,to))throw new Error('INVALID_WORKPAPER_TRANSITION');
  const iso=now.toISOString();
  if(to==='PREPARED'){
    if(!workpaper.objective.trim()||!workpaper.procedure.trim()||!workpaper.conclusion.trim())throw new Error('WORKPAPER_CONTENT_INCOMPLETE');
    return {...workpaper,status:to,preparer:actor?.trim()||workpaper.preparer,preparedAt:iso};
  }
  if(to==='REVIEWED')return {...workpaper,status:to,reviewer:actor?.trim()||workpaper.reviewer,reviewedAt:iso};
  return {...workpaper,status:to};
}

export function workpaperCompletion(workpapers:Workpaper[]){
  if(workpapers.length===0)return 0;
  const reviewed=workpapers.filter(row=>row.status==='REVIEWED'||row.status==='LOCKED').length;
  return Math.round((reviewed/workpapers.length)*10000)/100;
}
