export type NrvCut={
  id:string;
  name:string;
  kg:number;
  pricePerKgNet:number;
  furtherCostNet?:number;
};

export type NrvAllocation={
  id:string;
  name:string;
  kg:number;
  nrv:number;
  share:number;
  allocatedJointCostNet:number;
  furtherCostNet:number;
  totalCostNet:number;
  costPerKgNet:number;
};

function round(value:number,digits=2){
  const factor=10**digits;
  return Math.round((value+Number.EPSILON)*factor)/factor;
}

export function allocateNrv(jointCostNet:number,cuts:NrvCut[]):NrvAllocation[]{
  if(jointCostNet<0)throw new Error('JOINT_COST_NEGATIVE');
  const rows=cuts.map(cut=>({
    ...cut,
    kg:Math.max(0,cut.kg),
    pricePerKgNet:Math.max(0,cut.pricePerKgNet),
    furtherCostNet:Math.max(0,cut.furtherCostNet??0),
  })).map(cut=>({...cut,nrv:Math.max(0,cut.kg*cut.pricePerKgNet-cut.furtherCostNet)}));

  const totalNrv=rows.reduce((sum,row)=>sum+row.nrv,0);
  return rows.map(row=>{
    const share=totalNrv>0?row.nrv/totalNrv:(rows.length?1/rows.length:0);
    const allocatedJointCostNet=jointCostNet*share;
    const totalCostNet=allocatedJointCostNet+row.furtherCostNet;
    return {
      id:row.id,
      name:row.name,
      kg:round(row.kg,3),
      nrv:round(row.nrv),
      share:round(share,8),
      allocatedJointCostNet:round(allocatedJointCostNet),
      furtherCostNet:round(row.furtherCostNet),
      totalCostNet:round(totalCostNet),
      costPerKgNet:row.kg>0?round(totalCostNet/row.kg):0,
    };
  });
}

export function nrvAllocationCheck(jointCostNet:number,allocations:NrvAllocation[]){
  const allocated=round(allocations.reduce((sum,row)=>sum+row.allocatedJointCostNet,0));
  return {allocated,difference:round(jointCostNet-allocated),balanced:Math.abs(jointCostNet-allocated)<=0.02};
}
