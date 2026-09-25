export type StorageMode='chilled'|'frozen'|'vacuum';

export type TraceabilityBatch={
  id:string;
  lotCode:string;
  itemId:string;
  supplierId?:string;
  origin?:string;
  receivedDate:string;
  slaughterDate?:string;
  expiryDate:string;
  storageMode:StorageMode;
  quantity:number;
  unit:string;
};

export type TemperatureEvent={
  id:string;
  batchId:string;
  recordedAt:string;
  celsius:number;
};

export type BatchRisk='GOOD'|'WARNING'|'CRITICAL'|'EXPIRED';

function utcDate(iso:string){
  const value=Date.parse(iso.slice(0,10)+'T00:00:00Z');
  return Number.isFinite(value)?value:0;
}

export function daysToExpiry(expiryDate:string,asOfDate:string){
  const expiry=utcDate(expiryDate),asOf=utcDate(asOfDate);
  if(!expiry||!asOf)return 0;
  return Math.ceil((expiry-asOf)/86_400_000);
}

export function batchRisk(batch:TraceabilityBatch,asOfDate:string):BatchRisk{
  const days=daysToExpiry(batch.expiryDate,asOfDate);
  if(days<0)return 'EXPIRED';
  if(days<=1)return 'CRITICAL';
  if(days<=3)return 'WARNING';
  return 'GOOD';
}

export function allowedTemperature(mode:StorageMode){
  if(mode==='frozen')return {min:-30,max:-18};
  return {min:0,max:4};
}

export function temperatureExcursions(batch:TraceabilityBatch,events:TemperatureEvent[]){
  const range=allowedTemperature(batch.storageMode);
  return events.filter(event=>event.batchId===batch.id&&(event.celsius<range.min||event.celsius>range.max));
}

export function traceabilitySummary(batches:TraceabilityBatch[],events:TemperatureEvent[],asOfDate:string){
  const risks={GOOD:0,WARNING:0,CRITICAL:0,EXPIRED:0};
  let excursions=0;
  for(const batch of batches){
    risks[batchRisk(batch,asOfDate)]+=1;
    excursions+=temperatureExcursions(batch,events).length;
  }
  return {batches:batches.length,quantity:batches.reduce((sum,b)=>sum+Math.max(0,b.quantity),0),risks,excursions};
}
