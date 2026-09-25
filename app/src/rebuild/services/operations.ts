const n=(v:unknown)=>{const x=Number(v);return Number.isFinite(x)?x:0};

export interface ReceivingInput{invoicedKg:number;actualKg:number;temp:number}
export function receivingAudit(v:ReceivingInput){
 const invoicedKg=Math.max(0,n(v.invoicedKg)),actualKg=Math.max(0,n(v.actualKg)),temp=n(v.temp);
 const discrepancyKg=Math.max(0,invoicedKg-actualKg),discrepancyPct=invoicedKg>0?discrepancyKg/invoicedKg*100:0;
 const temperatureOk=temp<=4,weightOk=discrepancyKg<=8;
 return{invoicedKg,actualKg,temp,discrepancyKg,discrepancyPct,temperatureOk,weightOk,status:temperatureOk&&weightOk?'ok':'bad' as 'ok'|'bad'};
}

export interface ButcherYieldInput{hangingKg:number;primeKg:number;boneKg?:number;fatKg?:number;wasteKg?:number}
export function butcherYield(v:ButcherYieldInput){
 const hangingKg=Math.max(0,n(v.hangingKg)),primeKg=Math.max(0,n(v.primeKg)),boneKg=Math.max(0,n(v.boneKg)),fatKg=Math.max(0,n(v.fatKg)),wasteKg=Math.max(0,n(v.wasteKg));
 const yieldPct=hangingKg>0?primeKg/hangingKg*100:0,accountedKg=primeKg+boneKg+fatKg+wasteKg,unaccountedKg=Math.max(0,hangingKg-accountedKg);
 const tier=yieldPct>=65?'excellent':yieldPct>=60?'good':'review';
 return{hangingKg,primeKg,boneKg,fatKg,wasteKg,yieldPct,accountedKg,unaccountedKg,tier};
}

export function whatsappPhone(raw:string){
 let p=String(raw||'').replace(/\D/g,'');if(p.startsWith('05'))p='966'+p.slice(1);else if(p.startsWith('5')&&p.length===9)p='966'+p;return p;
}

export interface CulinaryCut{cat:'bbq'|'steak'|'traditional'|'minced';name:string;tenderness:number;marbling:number;temp:string;time:string;bestFor:string;tips:string}
export const CULINARY_GUIDE:CulinaryCut[]=[
 {cat:'bbq',name:'ريش غنم / كستليتة',tenderness:4,marbling:4,temp:'63°C ثم راحة 3 دقائق',time:'8 - 12 دقيقة',bestFor:'شواية فحم أو جريل ساخن',tips:'جفف السطح قبل الشواء وتجنب الضغط على القطعة أثناء الطهي.'},
 {cat:'bbq',name:'ضلوع بقر / شورت ريب',tenderness:3,marbling:5,temp:'88°C - 95°C للطهي البطيء',time:'4 - 6 ساعات',bestFor:'تدخين بطيء أو فرن منخفض الحرارة',tips:'أزل الغشاء الخلفي لتتوزع النكهة والدخان بشكل أفضل.'},
 {cat:'steak',name:'ريب آي',tenderness:5,marbling:5,temp:'Medium-Rare: 54°C - 57°C',time:'6 - 8 دقائق',bestFor:'فحم قوي أو مقلاة حديد زهر',tips:'اترك الستيك يرتاح 5 إلى 7 دقائق قبل التقطيع.'},
 {cat:'steak',name:'تندرلوين / فيليه',tenderness:5,marbling:2,temp:'Rare: 50°C - 52°C | Medium-Rare: 55°C',time:'5 - 7 دقائق',bestFor:'تحمير سريع مع زبدة وأعشاب',tips:'قطعة شديدة الطراوة؛ الإفراط في الطهي يقلل العصارة.'},
 {cat:'traditional',name:'فخذ غنم كامل بالعظم',tenderness:4,marbling:3,temp:'75°C - 85°C',time:'2.5 - 3.5 ساعات',bestFor:'المفطح، الكبسة، المندي، والفرن',tips:'اعمل شقوقًا خفيفة لتوزيع التتبيلة داخل القطعة.'},
 {cat:'minced',name:'مفروم رقبة وصدر',tenderness:4,marbling:4,temp:'71°C للبرجر | 75°C للكباب',time:'4 - 8 دقائق',bestFor:'برجر وكباب ومشويات مفرومة',tips:'حافظ على برودة اللحم والدهن أثناء الفرم للحصول على قوام أفضل.'}
];
