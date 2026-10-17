export type DecisionCriterion={id:string;label:string;weight:number};
export type DecisionOption={id:string;label:string;scores:Record<string,number>};

export type DecisionCase={
  id:string;
  title:string;
  criteria:DecisionCriterion[];
  options:DecisionOption[];
  createdAt:string;
};

export type DecisionResult={
  optionId:string;
  label:string;
  weightedScore:number;
  coveragePercent:number;
};

function round(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function evaluateDecision(decision:DecisionCase):DecisionResult[]{
  const active=decision.criteria.filter(c=>c.weight>0);
  const totalWeight=active.reduce((sum,c)=>sum+c.weight,0);
  return decision.options.map(option=>{
    let weighted=0,covered=0;
    for(const criterion of active){
      const raw=option.scores[criterion.id];
      if(Number.isFinite(raw)){
        const score=Math.min(100,Math.max(0,raw));
        weighted+=score*criterion.weight;
        covered+=criterion.weight;
      }
    }
    return {
      optionId:option.id,
      label:option.label,
      weightedScore:totalWeight===0?0:round(weighted/totalWeight),
      coveragePercent:totalWeight===0?0:round((covered/totalWeight)*100),
    };
  }).sort((a,b)=>b.weightedScore-a.weightedScore||b.coveragePercent-a.coveragePercent||a.label.localeCompare(b.label,'ar'));
}

export function validateDecision(decision:DecisionCase){
  const issues:string[]=[];
  if(!decision.title.trim())issues.push('TITLE_REQUIRED');
  if(decision.options.length<2)issues.push('TWO_OPTIONS_REQUIRED');
  if(decision.criteria.length<1)issues.push('CRITERION_REQUIRED');
  if(decision.criteria.some(c=>!c.label.trim()||c.weight<=0))issues.push('INVALID_CRITERION');
  if(decision.options.some(o=>!o.label.trim()))issues.push('INVALID_OPTION');
  return {valid:issues.length===0,issues};
}
