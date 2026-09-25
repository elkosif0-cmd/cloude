export type ReceivingInspection={
  id:string;
  purchaseOrderId?:string;
  supplierId?:string;
  date:string;
  invoicedKg:number;
  actualKg:number;
  temperatureC?:number;
  maxTemperatureC:number;
  tolerancePercent:number;
  notes?:string;
};

export type ReceivingInspectionResult={
  discrepancyKg:number;
  discrepancyPercent:number;
  weightStatus:'OK'|'REVIEW';
  temperatureStatus:'OK'|'REVIEW'|'NOT_RECORDED';
  overallStatus:'OK'|'REVIEW';
};

function round(value:number,digits=2){
  const factor=10**digits;
  return Math.round((value+Number.EPSILON)*factor)/factor;
}

export function inspectReceiving(input:ReceivingInspection):ReceivingInspectionResult{
  const invoiced=Math.max(0,input.invoicedKg);
  const actual=Math.max(0,input.actualKg);
  const discrepancyKg=round(invoiced-actual,3);
  const discrepancyPercent=invoiced===0?0:round((Math.abs(discrepancyKg)/invoiced)*100);
  const weightStatus=discrepancyPercent>Math.max(0,input.tolerancePercent)?'REVIEW':'OK';
  const temperatureStatus=input.temperatureC===undefined?'NOT_RECORDED':input.temperatureC>input.maxTemperatureC?'REVIEW':'OK';
  return {
    discrepancyKg,
    discrepancyPercent,
    weightStatus,
    temperatureStatus,
    overallStatus:weightStatus==='REVIEW'||temperatureStatus==='REVIEW'?'REVIEW':'OK',
  };
}

export function validateReceivingInspection(input:ReceivingInspection){
  const issues:string[]=[];
  if(input.invoicedKg<=0)issues.push('INVOICED_WEIGHT_REQUIRED');
  if(input.actualKg<=0)issues.push('ACTUAL_WEIGHT_REQUIRED');
  if(input.tolerancePercent<0)issues.push('INVALID_TOLERANCE');
  return {valid:issues.length===0,issues};
}
