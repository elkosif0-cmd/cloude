export type CouncilVote={
  provider:string;
  optionId:string;
  confidence:number;
  rationale?:string;
};

export type CouncilResult={
  winningOptionId:string|null;
  confidence:number;
  agreementPercent:number;
  votes:CouncilVote[];
  tied:boolean;
};

export function resolveCouncil(votes:CouncilVote[]):CouncilResult{
  if(votes.length===0)return {winningOptionId:null,confidence:0,agreementPercent:0,votes:[],tied:false};

  const scores=new Map<string,{count:number;weighted:number;confidence:number}>();
  for(const vote of votes){
    const confidence=Math.min(1,Math.max(0,vote.confidence));
    const row=scores.get(vote.optionId)??{count:0,weighted:0,confidence:0};
    row.count+=1;
    row.weighted+=confidence;
    row.confidence+=confidence;
    scores.set(vote.optionId,row);
  }

  const ranked=[...scores.entries()].sort((a,b)=>b[1].weighted-a[1].weighted || b[1].count-a[1].count || a[0].localeCompare(b[0]));
  const first=ranked[0];
  const second=ranked[1];
  const tied=Boolean(second && Math.abs(first[1].weighted-second[1].weighted)<1e-9 && first[1].count===second[1].count);
  const agreement=(first[1].count/votes.length)*100;
  const confidence=first[1].count===0?0:first[1].confidence/first[1].count;

  return {
    winningOptionId:tied?null:first[0],
    confidence:Math.round(confidence*10000)/10000,
    agreementPercent:Math.round(agreement*100)/100,
    votes,
    tied,
  };
}
