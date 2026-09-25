const n=(v:unknown)=>{const x=Number(v);return Number.isFinite(x)?x:0};

export function zatcaTLV(seller:string,vatNo:string,timestamp:string,total:number,vat:number){
 const encode=(tag:number,value:string)=>{const bytes=new TextEncoder().encode(value||'');return new Uint8Array([tag,bytes.length,...bytes])};
 const parts=[encode(1,seller),encode(2,vatNo),encode(3,timestamp),encode(4,total.toFixed(2)),encode(5,vat.toFixed(2))];
 const len=parts.reduce((a,p)=>a+p.length,0),out=new Uint8Array(len);let off=0;parts.forEach(p=>{out.set(p,off);off+=p.length});
 let bin='';out.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin);
}
const CODE128_PATTERNS=[
'212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212','112232','122132','122231','113222','123122','123221','223211','221132','221231','213212','223112','312131','311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321','112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121','313121','211331','231131','213113','213311','213131','311123','311321','331121','312113','312311','332111','314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114','122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212','124112','124211','411212','421112','421211','212141','214121','412121','111143','111341','131141','114113','114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'];
export function code128SVG(text:string,height=32){
 const str=String(text||'').replace(/[^A-Za-z0-9_-]/g,'')||'SKOSIF',START_B=104,codes=[START_B];let checksum=START_B;
 for(let i=0;i<str.length;i++){const code=str.charCodeAt(i)-32,c=code>=0&&code<=95?code:0;codes.push(c);checksum+=c*(i+1)}codes.push(checksum%103,106);
 let pattern='';codes.forEach(c=>pattern+=CODE128_PATTERNS[c]||'');let x=6,rects='';
 for(let i=0;i<pattern.length;i++){const w=parseInt(pattern[i],10);if(i%2===0)rects+='<rect x="'+x+'" y="0" width="'+w+'" height="'+height+'" fill="#000"/>';x+=w}
 const safe=str.replace(/[<>&"']/g,'');return '<svg viewBox="0 0 '+(x+6)+' '+(height+14)+'" xmlns="http://www.w3.org/2000/svg">'+rects+'<text x="'+((x+6)/2)+'" y="'+(height+11)+'" text-anchor="middle" font-family="monospace" font-size="10">'+safe+'</text></svg>';
}
export interface BlendInput{leanKg:number;leanCost:number;fatKg:number;fatCost:number;spicesCost:number;pkgCost:number;pieceGrams:number;shrink:number;margin:number}
export function blendCalc(v:BlendInput){
 const rawWeight=n(v.leanKg)+n(v.fatKg),netYield=rawWeight*(1-Math.max(0,Math.min(90,n(v.shrink)))/100);
 const totalCost=n(v.leanKg)*n(v.leanCost)+n(v.fatKg)*n(v.fatCost)+n(v.spicesCost)+n(v.pkgCost),costPerKg=netYield?totalCost/netYield:0;
 const pieces=n(v.pieceGrams)>0?Math.floor(netYield*1000/n(v.pieceGrams)):0,costPerPiece=pieces?totalCost/pieces:0,margin=Math.max(0.01,Math.min(.9,n(v.margin)/100));
 return{rawWeight,netYield,totalCost,costPerKg,pieces,costPerPiece,pricePerKg:costPerKg/(1-margin),pricePerPiece:costPerPiece/(1-margin),leanPct:rawWeight?n(v.leanKg)/rawWeight:0,fatPct:rawWeight?n(v.fatKg)/rawWeight:0}
}
export function agingCalc(p:any,now=new Date()){
 const entry=new Date(p.entryDate||now),daysElapsed=Math.max(0,Math.floor((now.getTime()-entry.getTime())/86400000)),targetDays=Math.max(1,n(p.targetDays)||30),progress=Math.min(100,Math.round(daysElapsed/targetDays*100));
 let moisturePct=0,trimPct=0;if(p.type==='dry'){moisturePct=Math.min(26,4+daysElapsed*.35);trimPct=Math.min(15,8+daysElapsed*.15)}else if(p.type==='umai'){moisturePct=Math.min(20,3+daysElapsed*.28);trimPct=Math.min(10,5+daysElapsed*.10)}else{moisturePct=Math.min(5,1+daysElapsed*.06);trimPct=Math.min(4,1+daysElapsed*.04)}
 const totalLossPct=moisturePct+trimPct,rawKg=Math.max(.1,n(p.rawKg)),usableKg=Math.max(.05,rawKg*(1-totalLossPct/100)),totalRawCost=rawKg*n(p.rawCostKg),costPerUsableKg=totalRawCost/usableKg,margin=Math.max(.05,Math.min(.9,n(p.margin||38)/100)),suggestedPriceKg=costPerUsableKg/(1-margin);
 return{daysElapsed,targetDays,progress,moisturePct,trimPct,totalLossPct,rawKg,usableKg,totalRawCost,costPerUsableKg,suggestedPriceKg,ready:daysElapsed>=targetDays}
}
export function cateringCalc(input:{guests:number;gramsPerGuest:number;meatCostKg:number;marginPct:number;extras?:number}){
 const guests=Math.max(1,n(input.guests)),kg=guests*Math.max(100,n(input.gramsPerGuest))/1000,cost=kg*n(input.meatCostKg)+n(input.extras),margin=Math.max(.05,Math.min(.9,n(input.marginPct)/100)),price=cost/(1-margin);
 return{guests,kg,cost,price,perGuest:price/guests,profit:price-cost}
}
