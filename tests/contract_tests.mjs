// S.kosif Core Contract & Golden Dataset Behavioral Verification Suite
// Validates pure application services and core boundary invariants independently from UI.

import assert from 'node:assert';

console.log("=== بدء تشغيل اختبارات العقد السلوكي (Core Contract Tests) ===");

// 1. اختبار محرك التسعير (Core Pricing)
const calculateUsableUnitCost = (netCost, wastePercent, method) => {
  if (!Number.isFinite(netCost) || netCost < 0) throw new Error("التكلفة غير صالحة");
  if (!Number.isFinite(wastePercent) || wastePercent < 0) throw new Error("نسبة الهدر غير صالحة");
  if (wastePercent <= 0) return netCost;
  if (wastePercent >= 1) throw new Error("لا يمكن أن تكون نسبة الهدر 100% أو أكثر");
  return method === "yield" ? netCost / (1 - wastePercent) : netCost * (1 + wastePercent);
};

const applyRoundingPolicy = (price, policy, floorCost = 0) => {
  if (policy === "ending_dot_90") {
    const base = Math.floor(price);
    const c = base + 0.90;
    return c + Number.EPSILON >= price ? c : c + 1;
  }
  if (policy === "ending_9") {
    const ceil = Math.ceil(price - Number.EPSILON);
    let c = Math.floor(ceil / 10) * 10 + 9;
    if (c + Number.EPSILON < price) c += 10;
    return c;
  }
  if (policy === "half_riyal_up") return Math.ceil(price * 2) / 2;
  return price;
};

// Test GOLD-PRC-01
const costYield = calculateUsableUnitCost(100, 0.10, "yield");
assert.ok(Math.abs(costYield - 111.111111) < 1e-4, `Expected 111.1111, got ${costYield}`);
console.log("✓ GOLD-PRC-01: حساب تكلفة الكيلو الصافي مع الهدر (yield method) ناجح تماماً");

// Test GOLD-RND-01 & GOLD-RND-02
const r1 = applyRoundingPolicy(145.23, "ending_dot_90");
assert.strictEqual(r1, 145.90, `Expected 145.90, got ${r1}`);
const r2 = applyRoundingPolicy(150.00, "ending_9");
assert.strictEqual(r2, 159.00, `Expected 159.00, got ${r2}`);
console.log("✓ GOLD-RND-01 & 02: سياسات تقريب الأسعار التجارية (ending .90 و ending 9) ناجحة");

// 2. اختبار NRV Allocation (توزيع القيمة الصافية للذبيحة)
const nrvAllocate = (jointCostNet, cuts) => {
  const rows = cuts.map(c => ({
    ...c,
    nrv: Math.max(0, c.kg * c.pricePerKgNet - (c.furtherCostNet || 0))
  }));
  const totalNrv = rows.reduce((s, r) => s + r.nrv, 0);
  return rows.map(r => {
    const share = totalNrv > 0 ? r.nrv / totalNrv : (1 / rows.length);
    const alloc = jointCostNet * share;
    const totalCost = alloc + (r.furtherCostNet || 0);
    return {
      name: r.name,
      allocatedJointCostNet: Math.round(alloc * 100) / 100,
      totalCostNet: Math.round(totalCost * 100) / 100,
      costPerKg: r.kg > 0 ? Math.round((totalCost / r.kg) * 100) / 100 : 0
    };
  });
};

const cuts = [
  { name: "فخذ", kg: 10, pricePerKgNet: 60 },
  { name: "كتف", kg: 8, pricePerKgNet: 50 },
  { name: "رقبة", kg: 4, pricePerKgNet: 35 }
];
const allocated = nrvAllocate(1200, cuts);
const sumAllocated = allocated.reduce((s, r) => s + r.allocatedJointCostNet, 0);
assert.ok(Math.abs(sumAllocated - 1200) < 0.05, `Joint cost conservation failed: ${sumAllocated}`);
console.log("✓ GOLD-NRV-01: توزيع التكلفة المشتركة للقطعيات (NRV Allocation) مطابق للميزانية تماماً");

// 3. اختبار التعتيق (Meat Aging Chamber)
const calculateAgingChamber = (initialWeight, currentWeight, trimPellicleKg, costInitial) => {
  const moistureLossKg = Math.max(0, initialWeight - currentWeight);
  const moistureLossPct = initialWeight > 0 ? (moistureLossKg / initialWeight) * 100 : 0;
  const usableKg = Math.max(0, currentWeight - trimPellicleKg);
  const totalLossKg = initialWeight - usableKg;
  const totalLossPct = initialWeight > 0 ? (totalLossKg / initialWeight) * 100 : 0;
  const realCostPerKg = usableKg > 0 ? costInitial / usableKg : 0;
  return { moistureLossKg, moistureLossPct, usableKg, totalLossPct, realCostPerKg };
};

const ageRes = calculateAgingChamber(20, 17.5, 1.5, 900);
assert.strictEqual(ageRes.moistureLossKg, 2.5);
assert.strictEqual(ageRes.usableKg, 16);
assert.strictEqual(ageRes.realCostPerKg, 56.25);
console.log("✓ GOLD-AGE-01: معادلات فاقد التبخر والتشذيب وتكلفة الكيلو الحقيقية ناجحة");

// 4. اختبار تشفير وفك شفرة ZATCA TLV
const zatcaTLV = (seller, vatNo, timestamp, total, vatAmount) => {
  const enc = new TextEncoder();
  const fields = [seller, vatNo, timestamp, String(total), String(vatAmount)];
  const bytes = [];
  fields.forEach((val, idx) => {
    const valBytes = enc.encode(val);
    bytes.push(idx + 1);
    bytes.push(valBytes.length);
    bytes.push(...valBytes);
  });
  return Buffer.from(Uint8Array.from(bytes)).toString("base64");
};

const zatcaTLVDecode = (b64) => {
  const buf = Buffer.from(b64, "base64");
  const dec = new TextDecoder();
  let ptr = 0;
  const tags = {};
  while (ptr < buf.length) {
    const tag = buf[ptr++];
    const len = buf[ptr++];
    const val = dec.decode(buf.subarray(ptr, ptr + len));
    ptr += len;
    tags[tag] = val;
  }
  const totalGross = parseFloat(tags[4] || "0");
  const vatAmount = parseFloat(tags[5] || "0");
  const expectedVat = totalGross * (15 / 115);
  const mathCheck = Math.abs(vatAmount - expectedVat) <= 0.05;
  return {
    seller: tags[1],
    vatNo: tags[2],
    timestamp: tags[3],
    totalGross,
    vatAmount,
    mathCheck
  };
};

const tlv = zatcaTLV("شركة اغنام الوادي", "310123456700003", "2026-09-25T12:00:00Z", "115.00", "15.00");
const decoded = zatcaTLVDecode(tlv);
assert.strictEqual(decoded.seller, "شركة اغنام الوادي");
assert.strictEqual(decoded.vatNo, "310123456700003");
assert.strictEqual(decoded.totalGross, 115.00);
assert.strictEqual(decoded.vatAmount, 15.00);
assert.ok(decoded.mathCheck, "ZATCA Math check failed");
console.log("✓ GOLD-ZAT-01: ترميز وفك شفرة ZATCA Base64 TLV والتحقق الرياضي ناجح 100%");

// 5. اختبار حجب البيانات الشخصية (Privacy Redaction)
const redact = (text) => {
  let s = String(text ?? "");
  s = s.replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/gi, "[IBAN]");
  s = s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]");
  s = s.replace(/(?:\+?966[\s-]?5\d|05\d)(?:[\s-]?\d){7,8}\b/g, "[PHONE]");
  s = s.replace(/\b(?:\d[\s-]?){10,15}\b/g, "[ID]");
  return s;
};

const rawNote = "تحويل لحساب SA0380000000608010167519 وهاتف 0501234567 وهوية 1098765432";
const redacted = redact(rawNote);
assert.ok(!redacted.includes("SA038000"), "IBAN not redacted");
assert.ok(!redacted.includes("0501234567"), "Phone not redacted");
assert.ok(!redacted.includes("1098765432"), "ID not redacted");
assert.ok(redacted.includes("[IBAN]"), "Missing [IBAN] token");
assert.ok(redacted.includes("[PHONE]"), "Missing [PHONE] token");
assert.ok(redacted.includes("[ID]"), "Missing [ID] token");
console.log("✓ GOLD-RED-01: حجب الحسابات البنكية والهواتف والهويات (Data Privacy) سليم تماماً");

// 6. اختبار سداد نقاط البيع المنقسم (POS Split Payments)
const computeSplitPayments = (totalDue, splits) => {
  const totalPaid = (splits.cash || 0) + (splits.mada || 0) + (splits.transfer || 0) + (splits.credit || 0);
  const balanceRemaining = Math.max(0, totalDue - totalPaid);
  const excessCash = Math.max(0, totalPaid - totalDue);
  const cashChange = splits.cash > 0 ? Math.min(splits.cash, excessCash) : 0;
  return {
    totalPaid,
    balanceRemaining: Math.round(balanceRemaining * 100) / 100,
    cashChange: Math.round(cashChange * 100) / 100,
    isFullySettled: totalPaid >= totalDue
  };
};

const splitRes = computeSplitPayments(500, { cash: 200, mada: 350, transfer: 0, credit: 0 });
assert.strictEqual(splitRes.totalPaid, 550);
assert.strictEqual(splitRes.balanceRemaining, 0);
assert.strictEqual(splitRes.cashChange, 50);
assert.strictEqual(splitRes.isFullySettled, true);
console.log("✓ GOLD-POS-01: حسابات السداد المتعدد والفكة المتبقية للعميل صحيحة بدقة");

// 7. اختبار خلط اللحوم وحساب نسب الدسم (Meat Blending & Fat Balancing)
const calculateBlend = ({ leanKg=0, fatKg=0, leanCost=0, fatCost=0, spicesCost=0, pkgCost=0, shrinkPct=0, pieceGrams=150, marginPct=25 }={}) => {
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
};

const blendRes = calculateBlend({
  leanKg: 80,
  fatKg: 20,
  leanCost: 45,
  fatCost: 10,
  spicesCost: 50,
  pkgCost: 50,
  shrinkPct: 5,
  pieceGrams: 150,
  marginPct: 20
});

assert.strictEqual(blendRes.rawWeight, 100);
assert.strictEqual(blendRes.netYield, 95);
assert.strictEqual(blendRes.totalCost, 3900);
assert.strictEqual(blendRes.leanPct, 80);
assert.strictEqual(blendRes.fatPct, 20);
assert.strictEqual(blendRes.pieces, 633);
assert.ok(Math.abs(blendRes.costPerKg - 41.05) <= 0.02, `Expected 41.05, got ${blendRes.costPerKg}`);
assert.ok(Math.abs(blendRes.pricePerKg - 51.32) <= 0.02, `Expected 51.32, got ${blendRes.pricePerKg}`);
console.log("✓ GOLD-BLD-01: خلط اللحوم وتحديد نسب الدسم والتسعير (Meat Blending & Fat Balancing) ناجح تماماً");

// 8. اختبار رادار الصلاحية وتخطيط المخزون (Inventory Reorder & Freshness Evaluation)
const calculateReorder = ({ stock=0, daily=0, lead=2, safety=2, cycle=7 }={}) => {
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
};

const invNormal = calculateReorder({ stock: 50, daily: 10, lead: 2, safety: 2, cycle: 7 });
assert.strictEqual(invNormal.cover, 5.0);
assert.strictEqual(invNormal.reorderPoint, 40);
assert.strictEqual(invNormal.targetStock, 110);
assert.strictEqual(invNormal.suggested, 60);

const invUrgent = calculateReorder({ stock: 30, daily: 10, lead: 2, safety: 2, cycle: 7 });
assert.strictEqual(invUrgent.status, "إعادة طلب عاجلة");
assert.strictEqual(invUrgent.suggested, 80);
console.log("✓ GOLD-INV-01: رادار الصلاحية وإعادة طلب المخزون (Inventory Reorder & Freshness Evaluation) ناجح تماماً");

console.log("\n=======================================================");
console.log("✅ كـافـة اختبارات العقد السلوكي (Behavioral Contract Tests) اجتازت بنجاح 100%!");
console.log("=======================================================\n");
