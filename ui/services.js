/* S.kosif Core Application Services Layer — Architectural Adapter
   Provides strict, pure application service contracts between presentation components
   and domain kernels. Eliminates business logic duplication in presentation views. */
(()=>{
  "use strict";

  // 1. تسعير واقتصاديات اللحوم (Pricing Service)
  const Pricing = {
    calculateUsableUnitCost(netCost, wastePercent, method="yield"){
      if(!Number.isFinite(netCost)||netCost<0)throw new Error("التكلفة غير صالحة");
      if(!Number.isFinite(wastePercent)||wastePercent<0)throw new Error("نسبة الهدر غير صالحة");
      if(wastePercent<=0)return netCost;
      if(wastePercent>=1)throw new Error("لا يمكن أن تكون نسبة الهدر 100% أو أكثر");
      return method==="yield"?netCost/(1-wastePercent):netCost*(1+wastePercent);
    },
    applyRoundingPolicy(price, policy="none", floorCost=0){
      if(!Number.isFinite(price)||!Number.isFinite(floorCost))throw new Error("قيمة التقريب غير صالحة");
      const target=Math.max(0,price,floorCost);
      if(policy==="none")return target;
      if(policy==="two_decimals")return Math.round((target+Number.EPSILON)*100)/100;
      if(policy==="whole_riyal_up")return Math.ceil(target);
      if(policy==="half_riyal_up")return Math.ceil(target*2)/2;
      if(policy==="ending_dot_90"){
        const base=Math.floor(target),c=base+.90;
        return c+Number.EPSILON>=target?c:c+1;
      }
      if(policy==="ending_9"){
        const ceil=Math.ceil(target-Number.EPSILON);
        let c=Math.floor(ceil/10)*10+9;
        if(c+Number.EPSILON<target)c+=10;
        return c;
      }
      return target;
    },
    nrvAllocate(jointCostNet, cuts){
      if(jointCostNet<0)throw new Error("التكلفة المشتركة لا يمكن أن تكون سالبة");
      const rows=cuts.map(c=>({
        ...c,
        nrv:Math.max(0,(Number(c.kg)||0)*(Number(c.pricePerKgNet||c.price)||0)-(Number(c.furtherCostNet)||0))
      }));
      const total=rows.reduce((s,r)=>s+r.nrv,0);
      return rows.map(r=>{
        const share=total>0?r.nrv/total:(rows.length?1/rows.length:0);
        const alloc=jointCostNet*share;
        const totalCost=alloc+(Number(r.furtherCostNet)||0);
        return {
          id:r.id||r.name,
          name:r.name,
          kg:Number(r.kg)||0,
          price:Number(r.pricePerKgNet||r.price)||0,
          yield:Number(r.yield)||0,
          nrv:Math.round(r.nrv*100)/100,
          share:share,
          allocatedJointCostNet:Math.round(alloc*100)/100,
          totalCostNet:Math.round(totalCost*100)/100,
          costKg:r.kg>0?Math.round((totalCost/r.kg)*100)/100:0
        };
      });
    }
  };

  // 2. هيئة الزكاة والضريبة والجمارك (ZATCA Service)
  const Zatca = {
    zatcaTLV(seller, vatNo, timestamp, total, vatAmount){
      const enc=new TextEncoder();
      const fields=[String(seller??""),String(vatNo??""),String(timestamp??""),String(total??""),String(vatAmount??"")];
      const bytes=[];
      fields.forEach((val,idx)=>{
        const b=enc.encode(val);
        bytes.push(idx+1,b.length,...b);
      });
      return btoa(String.fromCharCode(...bytes));
    },
    zatcaTLVDecode(base64TLV){
      try{
        const binary=atob(base64TLV);
        const bytes=new Uint8Array(binary.length);
        for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
        const dec=new TextDecoder("utf-8");
        let ptr=0;
        const tags={};
        while(ptr<bytes.length){
          const tag=bytes[ptr++];
          const len=bytes[ptr++];
          const val=dec.decode(bytes.subarray(ptr,ptr+len));
          ptr+=len;
          tags[tag]=val;
        }
        const totalGross=parseFloat(tags[4]||"0");
        const vatAmount=parseFloat(tags[5]||"0");
        const expectedVat=totalGross*(15/115);
        const mathCheck=Math.abs(vatAmount-expectedVat)<=0.05;
        return {
          seller:tags[1]||"",
          vatNo:tags[2]||"",
          timestamp:tags[3]||"",
          totalGross,
          vatAmount,
          mathCheck,
          isValid:!!(tags[1]&&tags[2]&&tags[3]&&tags[4]&&tags[5])
        };
      }catch(e){
        return {isValid:false,error:e.message};
      }
    }
  };

  // 3. نقاط البيع والمدفوعات المتعددة (POS Service)
  const POS = {
    computeSplitPayments(totalDue, splits){
      const cash=Math.max(0,Number(splits.cash)||0);
      const mada=Math.max(0,Number(splits.mada)||0);
      const transfer=Math.max(0,Number(splits.transfer)||0);
      const credit=Math.max(0,Number(splits.credit)||0);
      const totalPaid=cash+mada+transfer+credit;
      const balanceRemaining=Math.max(0,totalDue-totalPaid);
      const excessCash=Math.max(0,totalPaid-totalDue);
      const cashChange=cash>0?Math.min(cash,excessCash):0;
      return {
        totalDue,
        totalPaid:Math.round(totalPaid*100)/100,
        balanceRemaining:Math.round(balanceRemaining*100)/100,
        cashChange:Math.round(cashChange*100)/100,
        isFullySettled:totalPaid>=totalDue
      };
    }
  };

  // 4. غرف تعتيق اللحوم (Aging Service)
  const Aging = {
    calculateLoss(initialKg, currentKg, pellicleTrimKg=0, initialCost=0){
      const initial=Math.max(0,Number(initialKg)||0);
      const current=Math.max(0,Number(currentKg)||0);
      const trim=Math.max(0,Number(pellicleTrimKg)||0);
      const cost=Math.max(0,Number(initialCost)||0);

      const moistureLossKg=Math.max(0,initial-current);
      const moistureLossPct=initial>0?(moistureLossKg/initial)*100:0;
      const usableKg=Math.max(0,current-trim);
      const totalLossKg=initial-usableKg;
      const totalLossPct=initial>0?(totalLossKg/initial)*100:0;
      const realCostPerKg=usableKg>0?cost/usableKg:0;

      return {
        initialKg:initial,
        currentKg:current,
        moistureLossKg:Math.round(moistureLossKg*100)/100,
        moistureLossPct:Math.round(moistureLossPct*10)/10,
        usableKg:Math.round(usableKg*100)/100,
        totalLossKg:Math.round(totalLossKg*100)/100,
        totalLossPct:Math.round(totalLossPct*10)/10,
        realCostPerKg:Math.round(realCostPerKg*100)/100
      };
    }
  };

  // 5. رادار الصلاحية FIFO وتخطيط المخزون (Freshness & Inventory Service)
  const Inventory = {
    evaluateFreshness(slaughterDateStr, storageType="chilled"){
      const slDate=new Date(slaughterDateStr);
      if(isNaN(slDate.getTime()))return {daysElapsed:0,daysRemaining:0,risk:"unknown"};
      const now=new Date();
      const diffMs=now.getTime()-slDate.getTime();
      const elapsedDays=Math.max(0,Math.floor(diffMs/(1000*60*60*24)));
      const maxDays=storageType==="frozen"?180:(storageType==="vacuum"?21:7);
      const remainingDays=maxDays-elapsedDays;

      let risk="good";
      if(remainingDays<=0)risk="expired";
      else if(remainingDays<=1)risk="critical";
      else if(remainingDays<=3)risk="warning";

      return {
        elapsedDays,
        remainingDays,
        maxDays,
        risk
      };
    },
    evaluateExpiry(expiryDateStr){
      const today=new Date(); today.setHours(0,0,0,0);
      const exp=new Date(expiryDateStr); exp.setHours(0,0,0,0);
      const diffDays=isNaN(exp.getTime())?0:Math.ceil((exp.getTime()-today.getTime())/(1000*60*60*24));
      let status="good", label="طازج وصالح", action="بيع روتيني طبيعي";
      if(diffDays<0){ status="bad"; label="منتهي الصلاحية"; action="استبعاد وإتلاف فوري"; }
      else if(diffDays<=1){ status="bad"; label="حرج جداً (ينتهي اليوم/غداً)"; action="أولوية بيع قصوى، تتبيل، أو تجميد فوري"; }
      else if(diffDays<=3){ status="warn"; label="قريب الانتهاء (2-3 أيام)"; action="تطبيق مبدأ FIFO وعرض ترويجي"; }
      return {diffDays,status,label,action};
    },
    calculateReorder({ stock=0, daily=0, lead=2, safety=2, cycle=7 }={}){
      const st=Math.max(0,Number(stock)||0);
      const d=Math.max(0,Number(daily)||0);
      const l=Math.max(0,Number(lead)||0);
      const sf=Math.max(0,Number(safety)||0);
      const cy=Math.max(0,Number(cycle)||0);
      if(d<=0)return {error:"أدخل متوسط بيع يومي أكبر من صفر."};
      const cover=st/d;
      const reorderPoint=d*(l+sf);
      const targetStock=d*(l+sf+cy);
      const suggested=Math.max(0,targetStock-st);
      const status=st<=reorderPoint?"إعادة طلب عاجلة":cover<=l+sf+Math.max(1,cy*.35)?"إعادة طلب قريبة":"المخزون آمن حالياً";
      return {
        stock:st, daily:d, lead:l, safety:sf, cycle:cy,
        cover:Math.round(cover*10)/10,
        reorderPoint:Math.round(reorderPoint*100)/100,
        targetStock:Math.round(targetStock*100)/100,
        suggested:Math.round(suggested*100)/100,
        status
      };
    }
  };

  // 6. تشغيل الذبائح والتصنيع (MeatOps Service)
  const MeatOps = {
    dressingPercentage(liveWeight, carcassWeight){
      const live=Number(liveWeight)||0;
      const car=Number(carcassWeight)||0;
      return live>0?(car/live)*100:0;
    },
    calculateBlend({ leanKg=0, fatKg=0, leanCost=0, fatCost=0, spicesCost=0, pkgCost=0, shrinkPct=0, pieceGrams=150, marginPct=25 }={}){
      const lKg=Math.max(0,Number(leanKg)||0);
      const fKg=Math.max(0,Number(fatKg)||0);
      const lCost=Math.max(0,Number(leanCost)||0);
      const fCost=Math.max(0,Number(fatCost)||0);
      const sCost=Math.max(0,Number(spicesCost)||0);
      const pCost=Math.max(0,Number(pkgCost)||0);
      const shrink=Math.max(0,Math.min(100,Number(shrinkPct)||0));
      const pGrams=Math.max(1,Number(pieceGrams)||150);
      const margin=Math.min(90,Math.max(5,Number(marginPct)||25))/100;

      const rawWeight=lKg+fKg;
      const netYield=rawWeight*(1-shrink/100);
      const totalCost=(lKg*lCost)+(fKg*fCost)+sCost+pCost;
      const costPerKg=netYield>0?totalCost/netYield:0;
      const pieces=pGrams>0?Math.floor((netYield*1000)/pGrams):0;
      const costPerPiece=pieces>0?totalCost/pieces:0;
      const pricePerKg=costPerKg/(1-margin);
      const pricePerPiece=costPerPiece/(1-margin);
      const totalRevenue=pieces*pricePerPiece;
      const totalProfit=totalRevenue-totalCost;
      const leanPct=rawWeight>0?(lKg/rawWeight)*100:80;
      const fatPct=rawWeight>0?(fKg/rawWeight)*100:20;

      return {
        rawWeight:Math.round(rawWeight*100)/100,
        netYield:Math.round(netYield*100)/100,
        totalCost:Math.round(totalCost*100)/100,
        costPerKg:Math.round(costPerKg*100)/100,
        pieces,
        costPerPiece:Math.round(costPerPiece*100)/100,
        pricePerKg:Math.round(pricePerKg*100)/100,
        pricePerPiece:Math.round(pricePerPiece*100)/100,
        totalRevenue:Math.round(totalRevenue*100)/100,
        totalProfit:Math.round(totalProfit*100)/100,
        leanPct:Math.round(leanPct*10)/10,
        fatPct:Math.round(fatPct*10)/10
      };
    }
  };

  // 7. المستودع الموحد للتخزين الآمن (Storage Repository)
  const Storage = {
    get(key, fallback=null){
      try{
        const v=localStorage.getItem(key);
        return v?JSON.parse(v):fallback;
      }catch{
        return fallback;
      }
    },
    set(key, val){
      try{
        localStorage.setItem(key,JSON.stringify(val));
        return true;
      }catch{
        return false;
      }
    }
  };

  // تسجيل الخدمات في كائن التطبيق الموحد
  window.SKServices=Object.freeze({
    pricing:Pricing,
    zatca:Zatca,
    pos:POS,
    aging:Aging,
    inventory:Inventory,
    meatops:MeatOps,
    storage:Storage
  });

  // window.SK is intentionally frozen by the shell; consumers use window.SKServices directly.
})();
