/* S.kosif Pricing Core V35 — browser runtime mirror of strict TS engine.
   Pure calculation functions; only the final export touches window. */
(()=>{
  "use strict";
  const VERSION="35.0";
  const roundToPrecision=(num,decimals=4)=>{
    if(!Number.isFinite(num))throw new Error("القيمة الحسابية غير صالحة");
    const factor=10**decimals;
    return Math.round((num+Number.EPSILON)*factor)/factor;
  };
  const toHalalas=sar=>Math.round(roundToPrecision(sar,4)*100);
  const fromHalalas=h=>h/100;
  const extractNetPrice=(amount,isVatInclusive,vatRate)=>{
    if(!Number.isFinite(amount)||amount<0)throw new Error("السعر يجب أن يكون رقماً موجباً");
    return !isVatInclusive||vatRate<=0?amount:amount/(1+vatRate);
  };
  const calculateUsableUnitCost=(netCost,wastePercent,method)=>{
    if(!Number.isFinite(netCost)||netCost<0)throw new Error("التكلفة غير صالحة");
    if(!Number.isFinite(wastePercent)||wastePercent<0)throw new Error("نسبة الهدر غير صالحة");
    if(wastePercent<=0)return netCost;
    if(wastePercent>=1)throw new Error("لا يمكن أن تكون نسبة الهدر 100% أو أكثر");
    return method==="yield"?netCost/(1-wastePercent):netCost*(1+wastePercent);
  };
  const roundCandidate=(price,policy)=>{
    if(policy==="none")return roundToPrecision(price,4);
    if(policy==="two_decimals")return Math.round((price+Number.EPSILON)*100)/100;
    if(policy==="whole_riyal_up")return Math.ceil(price);
    if(policy==="half_riyal_up")return Math.ceil(price*2)/2;
    if(policy==="ending_dot_90"){const base=Math.floor(price),c=base+.90;return c+Number.EPSILON>=price?c:c+1}
    if(policy==="ending_9"){const ceil=Math.ceil(price-Number.EPSILON);let c=Math.floor(ceil/10)*10+9;if(c+Number.EPSILON<price)c+=10;return c}
    throw new Error("سياسة تقريب غير معروفة");
  };
  const applyRoundingPolicy=(price,policy,floorCost=0)=>{
    if(!Number.isFinite(price)||!Number.isFinite(floorCost))throw new Error("قيمة التقريب غير صالحة");
    const target=Math.max(0,price,floorCost);
    let rounded=roundCandidate(target,policy),guard=0;
    while(rounded+1e-9<floorCost&&guard++<1000)rounded=roundCandidate(Math.max(target,rounded+.01),policy);
    return roundToPrecision(rounded,4);
  };
  const marginGrade=(margin,thresholds)=>margin>=thresholds.excellent?"excellent":margin>=thresholds.good?"good":"weak";
  const solveTargetNet=(costNet,targetMargin,settings)=>{
    if(targetMargin<0||targetMargin>=1)throw new Error("الهامش المستهدف يجب أن يكون بين 0 و100%");
    if(settings.marginMode==="net")return costNet/(1-targetMargin);
    const denominator=1-targetMargin*(1+settings.defaultVatRate);
    if(denominator<=0)throw new Error("الهامش المستهدف غير ممكن على أساس gross_excel");
    return costNet/denominator;
  };
  const evaluatePrice=(costNet,sellingPriceGross,targetMargin,settings)=>{
    if(costNet<0||sellingPriceGross<0)throw new Error("التكلفة والسعر لا يمكن أن يكونا سالبين");
    const vat=Math.max(0,settings.defaultVatRate),sellingPriceNet=sellingPriceGross/(1+vat),profitNet=sellingPriceNet-costNet;
    const marginPercent=settings.marginMode==="net"?(sellingPriceNet>0?profitNet/sellingPriceNet:0):(sellingPriceGross>0?profitNet/sellingPriceGross:0);
    const rawTargetNet=solveTargetNet(costNet,targetMargin,settings),rawTargetGross=rawTargetNet*(1+vat);
    const targetPriceGross=applyRoundingPolicy(rawTargetGross,settings.roundingPolicy,costNet*(1+vat));
    return Object.freeze({
      costNet:roundToPrecision(costNet),sellingPriceNet:roundToPrecision(sellingPriceNet),sellingPriceGross:roundToPrecision(sellingPriceGross),
      profitNet:roundToPrecision(profitNet),marginPercent:roundToPrecision(marginPercent,6),
      breakEvenPriceNet:roundToPrecision(costNet),breakEvenPriceGross:roundToPrecision(costNet*(1+vat)),
      targetPriceNet:roundToPrecision(targetPriceGross/(1+vat)),targetPriceGross:roundToPrecision(targetPriceGross),
      marginGrade:marginGrade(marginPercent,settings.marginThresholds)
    });
  };
  const calculateRawPricing=(item,settings,targetMargin=settings.marginThresholds.excellent)=>{
    const purchaseNet=extractNetPrice(item.purchasePrice,item.isVatInclusive,settings.defaultVatRate);
    const usableCost=calculateUsableUnitCost(purchaseNet,item.wastePercent,settings.wasteMethod);
    const sellingGross=item.sellingPriceNet*(1+settings.defaultVatRate),ev=evaluatePrice(usableCost,sellingGross,targetMargin,settings);
    return Object.freeze({id:item.id,name:item.name,totalCostNet:roundToPrecision(usableCost),sellingPriceNet:roundToPrecision(item.sellingPriceNet),sellingPriceGross:roundToPrecision(sellingGross),profitNet:roundToPrecision(item.sellingPriceNet-usableCost),marginPercent:ev.marginPercent,breakEvenPriceNet:roundToPrecision(usableCost),targetPriceNet:ev.targetPriceNet,marginGrade:ev.marginGrade,breakdown:Object.freeze({rawComponentsCostNet:roundToPrecision(usableCost),totalWeightKg:item.unit==="kg"?1:0,dishesCount:0,packagingCostNet:0,expensesCostNet:0,totalCostNet:roundToPrecision(usableCost)})});
  };
  const linkedExpenseCost=(exp,boxId,base,totalWeightKg,dishesCount,vatRate)=>{
    if(exp.appliesToBoxIds&&exp.appliesToBoxIds.length&&!exp.appliesToBoxIds.includes(boxId))return 0;
    if(exp.method==="percent_of_component_cost")return base*exp.value;
    const v=extractNetPrice(exp.value,!!exp.isVatInclusive,vatRate);
    if(exp.method==="fixed")return v;
    if(exp.method==="per_kg")return v*totalWeightKg;
    if(exp.method==="per_dish")return v*dishesCount;
    throw new Error("طريقة مصروف غير معروفة");
  };
  const calculateBoxBreakdown=(box,rawItems,boxes,settings,stack=[])=>{
    if(stack.includes(box.id))throw new Error("PricingCycleError: "+[...stack,box.id].join(" -> "));
    const next=[...stack,box.id],rawMap=new Map(rawItems.map(x=>[x.id,x])),boxMap=new Map(boxes.map(x=>[x.id,x]));
    let rawComponentsCostNet=0,totalWeightKg=0,dishesCount=0;
    for(const c of box.components||[]){
      if(c.quantity<0)throw new Error("كمية المكون لا يمكن أن تكون سالبة");
      if(c.type==="raw"){
        const raw=rawMap.get(c.itemId);if(!raw)throw new Error("PricingReferenceError: "+c.itemId);
        const purchaseNet=extractNetPrice(raw.purchasePrice,raw.isVatInclusive,settings.defaultVatRate);
        const unit=c.applyWaste?calculateUsableUnitCost(purchaseNet,raw.wastePercent,settings.wasteMethod):purchaseNet;
        rawComponentsCostNet+=unit*c.quantity;if(raw.unit==="kg")totalWeightKg+=c.quantity;
      }else{
        const nested=boxMap.get(c.boxId);if(!nested)throw new Error("PricingReferenceError: "+c.boxId);
        const b=calculateBoxBreakdown(nested,rawItems,boxes,settings,next);
        rawComponentsCostNet+=b.totalCostNet*c.quantity;totalWeightKg+=b.totalWeightKg*c.quantity;dishesCount+=b.dishesCount*c.quantity;
      }
    }
    let packagingCostNet=0;
    for(const p of box.packaging||[]){if(p.count<0||p.unitCostNet<0)throw new Error("بيانات التغليف غير صالحة");packagingCostNet+=p.count*p.unitCostNet;dishesCount+=p.count}
    let expensesCostNet=0;
    for(const exp of box.linkedExpenses||[])expensesCostNet+=linkedExpenseCost(exp,box.id,rawComponentsCostNet,totalWeightKg,dishesCount,settings.defaultVatRate);
    const totalCostNet=rawComponentsCostNet+packagingCostNet+expensesCostNet;
    return Object.freeze({rawComponentsCostNet:roundToPrecision(rawComponentsCostNet),totalWeightKg:roundToPrecision(totalWeightKg),dishesCount:roundToPrecision(dishesCount),packagingCostNet:roundToPrecision(packagingCostNet),expensesCostNet:roundToPrecision(expensesCostNet),totalCostNet:roundToPrecision(totalCostNet)});
  };
  const calculateBoxPricing=(box,rawItems,boxes,settings)=>{
    const breakdown=calculateBoxBreakdown(box,rawItems,boxes,settings),target=box.targetMargin??settings.marginThresholds.excellent,sellingNet=Math.max(0,box.sellingPriceNet??0),ev=evaluatePrice(breakdown.totalCostNet,sellingNet*(1+settings.defaultVatRate),target,settings);
    return Object.freeze({id:box.id,name:box.name,totalCostNet:breakdown.totalCostNet,sellingPriceNet:roundToPrecision(sellingNet),sellingPriceGross:roundToPrecision(sellingNet*(1+settings.defaultVatRate)),profitNet:roundToPrecision(sellingNet-breakdown.totalCostNet),marginPercent:ev.marginPercent,breakEvenPriceNet:breakdown.totalCostNet,targetPriceNet:ev.targetPriceNet,marginGrade:ev.marginGrade,breakdown});
  };
  const hasCircularDependency=(targetBoxId,candidateBoxId,boxes)=>{
    const map=new Map(boxes.map(x=>[x.id,x])),seen=new Set();
    const visit=id=>{if(id===targetBoxId)return true;if(seen.has(id))return false;seen.add(id);const box=map.get(id);if(!box)return false;return (box.components||[]).some(c=>c.type==="box"&&visit(c.boxId))};
    return visit(candidateBoxId);
  };
  const nrvAllocate=(jointCostNet,cuts)=>{
    if(jointCostNet<0)throw new Error("التكلفة المشتركة لا يمكن أن تكون سالبة");
    const rows=cuts.map(c=>({...c,nrv:Math.max(0,Math.max(0,c.kg)*Math.max(0,c.pricePerKgNet)-Math.max(0,c.furtherCostNet??0))})),total=rows.reduce((s,r)=>s+r.nrv,0);
    return rows.map(r=>{const share=total>0?r.nrv/total:(rows.length?1/rows.length:0),alloc=jointCostNet*share,totalCost=alloc+Math.max(0,r.furtherCostNet??0);return Object.freeze({id:r.id,nrv:roundToPrecision(r.nrv),share:roundToPrecision(share,8),allocatedJointCostNet:roundToPrecision(alloc),totalCostNet:roundToPrecision(totalCost),costPerKgNet:r.kg>0?roundToPrecision(totalCost/r.kg):0})});
  };
  const yieldTrial=trial=>{
    if(trial.inputKg<=0)throw new Error("وزن الإدخال يجب أن يكون أكبر من صفر");
    if(trial.usableKg<0||trial.usableKg>trial.inputKg)throw new Error("الوزن الصالح غير منطقي");
    return Object.freeze({usableKg:roundToPrecision(trial.usableKg),wastePercent:roundToPrecision(1-trial.usableKg/trial.inputKg,8),effectiveKgCostNet:trial.usableKg>0?roundToPrecision(trial.purchaseCostNet/trial.usableKg):0});
  };
  const selfTest=()=>{
    const s={defaultVatRate:.15,wasteMethod:"yield",marginMode:"net",roundingPolicy:"ending_dot_90",marginThresholds:{excellent:.25,good:.15}};
    const checks=[
      ["yield10",Math.abs(calculateUsableUnitCost(100,.1,"yield")-111.111111)<1e-5],
      ["halfUp",applyRoundingPolicy(145.23,"half_riyal_up")===145.5],
      ["end90",applyRoundingPolicy(145.23,"ending_dot_90")===145.9],
      ["end9",applyRoundingPolicy(150,"ending_9")===159],
      ["target25",evaluatePrice(100,138,.25,s).targetPriceGross===153.9],
      ["halalas",toHalalas(61.995)===6200]
    ];
    return Object.freeze({ok:checks.every(x=>x[1]),checks:Object.freeze(checks.map(x=>Object.freeze({name:x[0],ok:x[1]})))});
  };
  window.SKosifPricingCore=Object.freeze({version:VERSION,roundToPrecision,toHalalas,fromHalalas,extractNetPrice,calculateUsableUnitCost,applyRoundingPolicy,marginGrade,evaluatePrice,calculateRawPricing,calculateBoxBreakdown,calculateBoxPricing,hasCircularDependency,nrvAllocate,yieldTrial,selfTest});
})();