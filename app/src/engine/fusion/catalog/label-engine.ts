const CODE128_PATTERNS=[
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112'
] as const;

export type ScaleLabel={
  id:string;
  barcode:string;
  itemId:string;
  itemName:string;
  lot?:string;
  weightKg:number;
  unitPriceIncVat:number;
  totalIncVat:number;
  packDate:string;
  expiryDate:string;
  origin?:string;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function buildScaleBarcode(input:{unitPriceIncVat:number;weightKg:number}){
  const price=Math.max(0,Math.floor(input.unitPriceIncVat));
  const grams=Math.max(0,Math.floor(input.weightKg*1000));
  return '20'+String(price).padStart(4,'0').slice(-4)+String(grams).padStart(5,'0').slice(-5);
}

export function decodeScaleBarcode(value:string){
  const clean=value.replace(/\D/g,'');
  if(!/^20\d{9}$/.test(clean))return null;
  return {
    unitPriceWhole:Number(clean.slice(2,6)),
    weightKg:Number(clean.slice(6,11))/1000,
  };
}

export function createScaleLabel(input:Omit<ScaleLabel,'id'|'barcode'|'totalIncVat'>):ScaleLabel{
  if(!input.itemId||!input.itemName.trim())throw new Error('ITEM_REQUIRED');
  if(input.weightKg<=0)throw new Error('WEIGHT_REQUIRED');
  if(input.unitPriceIncVat<0)throw new Error('PRICE_INVALID');
  if(!input.packDate||!input.expiryDate)throw new Error('DATES_REQUIRED');
  return {
    ...input,
    id:crypto.randomUUID(),
    barcode:buildScaleBarcode(input),
    totalIncVat:money(input.weightKg*input.unitPriceIncVat),
  };
}

export function code128SvgData(text:string,height=32){
  const value=String(text||'').replace(/[^A-Za-z0-9_-]/g,'');
  const startB=104;
  const codes=[startB];
  let checksum=startB;
  for(let i=0;i<value.length;i+=1){
    const raw=value.charCodeAt(i)-32;
    const code=raw>=0&&raw<=95?raw:0;
    codes.push(code);
    checksum+=code*(i+1);
  }
  codes.push(checksum%103,106);

  const pattern=codes.map(code=>CODE128_PATTERNS[code]??'').join('');
  let x=6;
  const rects:{x:number;width:number}[]=[];
  for(let i=0;i<pattern.length;i+=1){
    const width=Number(pattern[i]);
    if(i%2===0)rects.push({x,width});
    x+=width;
  }
  return {value,height,width:x+6,rects};
}

export function scaleLabelPrintHtml(label:ScaleLabel,brand='SQC'){
  const barcode=code128SvgData(label.barcode,30);
  const rects=barcode.rects.map(rect=>'<rect x="'+rect.x+'" y="0" width="'+rect.width+'" height="'+barcode.height+'" fill="#000"/>').join('');
  const svg='<svg viewBox="0 0 '+barcode.width+' '+(barcode.height+13)+'" xmlns="http://www.w3.org/2000/svg">'+rects+'<text x="'+(barcode.width/2)+'" y="'+(barcode.height+10)+'" text-anchor="middle" font-family="monospace" font-size="9">'+barcode.value+'</text></svg>';
  return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>@page{size:60mm 40mm;margin:0}body{margin:0;font-family:Arial,sans-serif}.label{width:60mm;height:40mm;padding:3mm;box-sizing:border-box;display:grid;gap:1.2mm}.brand{display:flex;justify-content:space-between;font-size:8px}.name{font-size:14px;font-weight:800}.grid{display:grid;grid-template-columns:1fr 1fr;gap:1mm;font-size:8px}.grid b{display:block;font-size:12px}.total{font-size:15px;font-weight:900}.barcode svg{width:100%;height:10mm}.foot{display:flex;justify-content:space-between;font-size:7px}</style></head><body><div class="label"><div class="brand"><b>'+brand+'</b><span>'+(label.lot||'')+'</span></div><div class="name">'+label.itemName+'</div><div class="grid"><div>الوزن<b>'+label.weightKg.toFixed(3)+' كجم</b></div><div>سعر الكيلو<b>'+label.unitPriceIncVat.toFixed(2)+'</b></div></div><div class="total">الإجمالي '+label.totalIncVat.toFixed(2)+' ر.س</div><div class="barcode">'+svg+'</div><div class="foot"><span>تعبئة '+label.packDate+'</span><span>انتهاء '+label.expiryDate+'</span></div></div><script>window.onload=()=>window.print()<\/script></body></html>';
}
