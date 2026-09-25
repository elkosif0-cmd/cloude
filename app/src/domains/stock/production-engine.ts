export type ButcherShift={
  id:string;
  butcher:string;
  carcassTag:string;
  hangingKg:number;
  primeKg:number;
  boneKg:number;
  fatKg:number;
  wasteKg:number;
  date:string;
};

export type AgingType='dry'|'umai'|'wet';
export type AgingPiece={
  id:string;
  tag:string;
  cut:string;
  type:AgingType;
  rawKg:number;
  rawCostKg:number;
  entryDate:string;
  targetDays:number;
  marginPercent:number;
  status:'ACTIVE'|'DONE';
  finalUsableKg?:number;
  finishDate?:string;
};

function money(v:number){return Math.round((v+Number.EPSILON)*100)/100;}

export function butcherYield(shift:ButcherShift){
  const hanging=Math.max(0,shift.hangingKg);
  const accounted=Math.max(0,shift.primeKg)+Math.max(0,shift.boneKg)+Math.max(0,shift.fatKg)+Math.max(0,shift.wasteKg);
  const yieldPercent=hanging===0?0:(Math.max(0,shift.primeKg)/hanging)*100;
  const unaccounted=money(hanging-accounted);
  return {
    yieldPercent:money(yieldPercent),
    accountedKg:money(accounted),
    unaccountedKg:unaccounted,
    balanced:Math.abs(unaccounted)<=0.05,
  };
}

export function agingEconomics(piece:AgingPiece,asOf=new Date()){
  const entry=Date.parse(piece.entryDate+'T00:00:00Z');
  const now=Date.parse(asOf.toISOString().slice(0,10)+'T00:00:00Z');
  const daysElapsed=Math.max(0,Math.floor((now-entry)/86_400_000));
  const targetDays=Math.max(1,piece.targetDays);
  const progress=Math.min(100,Math.round((daysElapsed/targetDays)*10000)/100);

  let moisturePct=0,trimPct=0;
  if(piece.type==='dry'){
    moisturePct=Math.min(26,4+daysElapsed*0.35);
    trimPct=Math.min(15,8+daysElapsed*0.15);
  }else if(piece.type==='umai'){
    moisturePct=Math.min(20,3+daysElapsed*0.28);
    trimPct=Math.min(10,5+daysElapsed*0.10);
  }else{
    moisturePct=Math.min(5,1+daysElapsed*0.06);
    trimPct=Math.min(4,1+daysElapsed*0.04);
  }

  const totalLossPercent=Math.min(95,moisturePct+trimPct);
  const estimatedUsableKg=Math.max(0,piece.rawKg*(1-totalLossPercent/100));
  const usableKg=piece.status==='DONE'&&piece.finalUsableKg!==undefined?Math.max(0,piece.finalUsableKg):estimatedUsableKg;
  const totalRawCost=Math.max(0,piece.rawKg)*Math.max(0,piece.rawCostKg);
  const realCostPerKg=usableKg===0?0:totalRawCost/usableKg;
  const margin=Math.min(0.9,Math.max(0,piece.marginPercent/100));
  const suggestedPriceKg=margin>=1?0:realCostPerKg/(1-margin);
  return {
    daysElapsed,targetDays,progress,
    totalLossPercent:money(totalLossPercent),
    usableKg:money(usableKg),
    totalRawCost:money(totalRawCost),
    realCostPerKg:money(realCostPerKg),
    suggestedPriceKg:money(suggestedPriceKg),
  };
}
