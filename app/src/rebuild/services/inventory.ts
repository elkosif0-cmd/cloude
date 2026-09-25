import {repos,appendAudit} from '../data/repositories';
const n=(v:unknown)=>{const x=Number(v);return Number.isFinite(x)?x:0};
const id=(p:string)=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
export function inventoryRows(){
 const state=repos.inventory(),products=[...repos.raws().map(x=>({id:x.id,name:x.name,unit:x.unit||'كجم'})),...repos.boxes().map(x=>({id:x.id,name:x.name,unit:'وحدة'}))];
 return products.map(p=>{const stock=n(state.stock[p.id]),reorder=n(state.reorder[p.id]);return{...p,stock,reorder,status:reorder>0&&stock<=reorder?'low':stock<=0?'zero':'ok'}})
}
export function addMovement(input:{itemId:string;type:'in'|'out'|'adjust';qty:number;note?:string;date?:string}){
 const s=repos.inventory(),before=n(s.stock[input.itemId]),q=Math.max(0,n(input.qty));if(!q)throw new Error('الكمية يجب أن تكون أكبر من صفر');
 const after=input.type==='in'?before+q:input.type==='out'?Math.max(0,before-q):q;
 s.stock[input.itemId]=after;s.moves.unshift({id:id('mov'),itemId:input.itemId,type:input.type,qty:q,before,after,note:input.note||'',date:input.date||new Date().toISOString().slice(0,10),at:new Date().toISOString()});s.moves=s.moves.slice(0,3000);repos.saveInventory(s);
 appendAudit({group:'catalog',itemId:input.itemId,field:'inventory_balance',previousValue:before,newValue:after,source:'manual',notes:'حركة مخزون '+input.type});return{before,after};
}
export function saveReorder(itemId:string,value:number){const s=repos.inventory();s.reorder[itemId]=Math.max(0,n(value));repos.saveInventory(s)}
export function approveCount(lines:{itemId:string;physical:number}[],note='جرد فعلي'){
 const s=repos.inventory(),detail=lines.filter(x=>Number.isFinite(Number(x.physical))).map(x=>{const book=n(s.stock[x.itemId]),physical=Math.max(0,n(x.physical)),variance=physical-book;s.stock[x.itemId]=physical;s.moves.unshift({id:id('mov'),itemId:x.itemId,type:'count-adjustment',qty:variance,before:book,after:physical,note,date:new Date().toISOString().slice(0,10),at:new Date().toISOString()});return{itemId:x.itemId,book,physical,variance}});
 if(!detail.length)throw new Error('أدخل نتيجة جرد واحدة على الأقل');const count={id:id('count'),date:new Date().toISOString().slice(0,10),at:new Date().toISOString(),lines:detail,note,totalVariance:detail.reduce((a,x)=>a+x.variance,0)};s.counts.unshift(count);s.counts=s.counts.slice(0,500);repos.saveInventory(s);
 appendAudit({group:'catalog',field:'inventory_count',previousValue:null,newValue:detail.length,source:'manual',notes:'اعتماد جرد فعلي'});return count;
}
export function expiryStatus(dateExp:string){const end=new Date(dateExp+'T12:00:00'),today=new Date();today.setHours(12,0,0,0);const days=Math.ceil((end.getTime()-today.getTime())/86400000);return{days,status:days<0?'expired':days<=1?'critical':days<=3?'warning':'ok'}}
