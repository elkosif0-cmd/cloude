export type PopulationItem={id:string;amount:number};

export type SampleOptions={
  sampleSize:number;
  seed?:number;
  includeAllAbove?:number;
};

function seeded(seed:number){
  let x=(seed>>>0)||1;
  return ()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};
}

export function selectAuditSample(population:PopulationItem[],options:SampleOptions){
  const target=Math.max(0,Math.floor(options.sampleSize));
  const threshold=options.includeAllAbove ?? Number.POSITIVE_INFINITY;
  const mandatory=population.filter((item)=>Math.abs(item.amount)>=threshold);
  const mandatoryIds=new Set(mandatory.map((item)=>item.id));
  const remaining=population.filter((item)=>!mandatoryIds.has(item.id));
  const rand=seeded(options.seed ?? 20260925);

  for(let i=remaining.length-1;i>0;i-=1){
    const j=Math.floor(rand()*(i+1));
    [remaining[i],remaining[j]]=[remaining[j],remaining[i]];
  }

  const needed=Math.max(0,target-mandatory.length);
  return [...mandatory,...remaining.slice(0,needed)];
}
