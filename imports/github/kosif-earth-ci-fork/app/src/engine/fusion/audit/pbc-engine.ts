export type PbcStatus='OPEN'|'PARTIAL'|'RECEIVED'|'REJECTED'|'CLOSED';

export type PbcRequest={
  id:string;
  title:string;
  owner?:string;
  dueDate?:string;
  requiredItems:number;
  receivedItems:number;
  rejectedItems?:number;
  round:number;
};

export function derivePbcStatus(request:PbcRequest):PbcStatus{
  const required=Math.max(0,request.requiredItems);
  const received=Math.max(0,request.receivedItems);
  const rejected=Math.max(0,request.rejectedItems??0);
  if(required===0)return 'CLOSED';
  if(rejected>0 && received===0)return 'REJECTED';
  if(received>=required && rejected===0)return 'RECEIVED';
  if(received>0 || rejected>0)return 'PARTIAL';
  return 'OPEN';
}

export function pbcCompletionPercent(requests:PbcRequest[]){
  const required=requests.reduce((sum,r)=>sum+Math.max(0,r.requiredItems),0);
  const received=requests.reduce((sum,r)=>sum+Math.min(Math.max(0,r.receivedItems),Math.max(0,r.requiredItems)),0);
  return required===0?100:Math.round((received/required)*10000)/100;
}
