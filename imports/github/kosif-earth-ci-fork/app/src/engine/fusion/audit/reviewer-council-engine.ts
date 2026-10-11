export type ReviewerVote={
  id:string;
  reviewer:string;
  optionId:string;
  confidence:number;
  rationale?:string;
  at:string;
};

export type ReviewerCouncilRound={
  id:string;
  title:string;
  subject?:string;
  options:string[];
  votes:ReviewerVote[];
  status:'OPEN'|'RESOLVED';
  createdAt:string;
  resolvedAt?:string;
};

export type ReviewerCouncilResult={
  winningOptionId:string|null;
  agreementPercent:number;
  averageConfidence:number;
  tied:boolean;
  voteCount:number;
};

function rounded(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function resolveReviewerCouncil(round:ReviewerCouncilRound):ReviewerCouncilResult{
  if(round.votes.length===0)return {winningOptionId:null,agreementPercent:0,averageConfidence:0,tied:false,voteCount:0};
  const scores=new Map<string,{count:number;weighted:number;confidence:number}>();
  for(const vote of round.votes){
    const confidence=Math.min(1,Math.max(0,vote.confidence));
    const current=scores.get(vote.optionId)??{count:0,weighted:0,confidence:0};
    current.count+=1;
    current.weighted+=confidence;
    current.confidence+=confidence;
    scores.set(vote.optionId,current);
  }
  const ranked=[...scores.entries()].sort((a,b)=>b[1].weighted-a[1].weighted||b[1].count-a[1].count||a[0].localeCompare(b[0]));
  const first=ranked[0];
  const second=ranked[1];
  const tied=Boolean(second&&Math.abs(first[1].weighted-second[1].weighted)<1e-9&&first[1].count===second[1].count);
  return {
    winningOptionId:tied?null:first[0],
    agreementPercent:rounded((first[1].count/round.votes.length)*100),
    averageConfidence:rounded((first[1].confidence/first[1].count)*100),
    tied,
    voteCount:round.votes.length,
  };
}

export function addReviewerVote(round:ReviewerCouncilRound,input:Omit<ReviewerVote,'id'|'at'>):ReviewerCouncilRound{
  if(round.status==='RESOLVED')throw new Error('ROUND_ALREADY_RESOLVED');
  if(!round.options.includes(input.optionId))throw new Error('OPTION_NOT_FOUND');
  if(!input.reviewer.trim())throw new Error('REVIEWER_REQUIRED');
  const vote:ReviewerVote={...input,id:crypto.randomUUID(),at:new Date().toISOString(),reviewer:input.reviewer.trim(),confidence:Math.min(1,Math.max(0,input.confidence))};
  const votes=[...round.votes.filter(row=>row.reviewer.toLowerCase()!==vote.reviewer.toLowerCase()),vote];
  return {...round,votes};
}

export function closeReviewerRound(round:ReviewerCouncilRound,minimumAgreement=50):ReviewerCouncilRound{
  const result=resolveReviewerCouncil(round);
  if(!result.winningOptionId||result.agreementPercent<minimumAgreement)throw new Error('CONSENSUS_NOT_READY');
  return {...round,status:'RESOLVED',resolvedAt:new Date().toISOString()};
}

export function validateReviewerRound(round:ReviewerCouncilRound){
  const issues:string[]=[];
  if(!round.title.trim())issues.push('TITLE_REQUIRED');
  if(round.options.length<2)issues.push('TWO_OPTIONS_REQUIRED');
  if(new Set(round.options.map(x=>x.trim().toLowerCase())).size!==round.options.length)issues.push('DUPLICATE_OPTIONS');
  return {valid:issues.length===0,issues};
}
