# وثيقة عقد النواة والخدمات التطبيقية — Phase 1: Core Contract & Boundary Specification
**مشروع S.kosif**  
**تاريخ التوثيق:** 25 سبتمبر 2026  
**المرجع:** MASTER REBUILD DIRECTIVE (المرحلة 1: تحصين النواة Core Hardening)

---

## 1. حدود النواة المعمارية (Core Boundary & Architectural Invariants)

القاعدة الحاكمة:
> **"الواجهة الجديدة لا تتصل أبدًا بقواعد البيانات أو التخزين المباشر أو الـ APIs الخارجية مباشرة، بل تمر حصرًا عبر عقود خدمات النواة (Application Services Contracts)."**

```
┌────────────────────────────────────────────────────────┐
│           Presentation Layer (New Modern UI)           │
│   (Views, Screen Controllers, Dialogs, Theme Hooks)   │
└───────────────────────────┬────────────────────────────┘
                            │ (Calls pure methods only)
                            ▼
┌────────────────────────────────────────────────────────┐
│           Core Application Services Layer              │
│  - PricingService        - MeatOpsService              │
│  - ZatcaService          - POSPaymentService           │
│  - AgingChamberService   - InventoryFIFOService        │
│  - DataPrivacyService    - TextMatchingService         │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│     Core Domain Engines      │ │ Unified Repositories  │
│  - CorePricing (TS Kernel)   │ │  - Encrypted Catalog  │
│  - MeatOps (TS Engine)       │ │  - D1 Cloud Tenant DB │
│  - ZATCA TLV & Code128       │ │  - Safe LocalStorage  │
└──────────────────────────────┘ └───────────────────────┘
```

---

## 2. مواصفات عقود الخدمات التطبيقية (Application Services Contracts)

### 2.1 خدمة التسعير الدقيق (PricingService)
- **المصدر الصارم:** `app/src/engine/corePricing/pricing.ts` و `ui/pricing-core.js`.
- **العقود الرياضية:**
  1. `calculateUsableUnitCost(netCost: number, wastePercent: number, method: 'yield' | 'markup'): number`
     - *Invariants:* إذا كان `wastePercent <= 0` يرجع `netCost` مباشرة. الهدر $\ge 100\%$ يلقي استثناء.
     - *صيغة yield:* $\text{Cost} / (1 - \text{waste})$.
     - *صيغة markup:* $\text{Cost} \times (1 + \text{waste})$.
  2. `applyRoundingPolicy(price: number, policy: string, floorCost: number = 0): number`
     - *السياسات المعتمدة:* `none`, `two_decimals`, `whole_riyal_up`, `half_riyal_up`, `ending_dot_90`, `ending_9`.
     - *Invariant:* السعر المقرب لا يقل أبدًا عن `floorCost`.
  3. `nrvAllocate(jointCostNet: number, cuts: Array<{id: string, kg: number, pricePerKgNet: number, furtherCostNet?: number}>)`
     - *الوظيفة:* توزيع التكلفة المشتركة للذبيحة بنسبة القيمة الصافية المتوقعة للبيع (Net Realizable Value).
     - *Invariant:* مجموع التكاليف الموزعة يساوي تماماً التكلفة المشتركة + التكاليف الإضافية بدون أي هللة ضائعة.
  4. `calculateBoxPricing(box, rawItems, boxes, settings)`
     - *Invariant:* كشف ومعالجة الدورات التكرارية الدائرية (`hasCircularDependency`) لمنع الـ Infinite Loops.

---

### 2.2 خدمة اقتصاديات وتشغيل اللحوم (MeatOpsService)
- **المصدر:** `app/src/engine/meatOps/ops.ts` و `ui/meatops.js`.
- **العقود:**
  1. `calculateDressingPercentage(liveWeight: number, carcassWeight: number): number`
     - *المعادلة:* $(\text{Carcass Weight} / \text{Live Weight}) \times 100$.
     - *الحالات المرجعية القياسية (Presets):*
       - نعيمي بلدي: وزن حي 48 كجم -> وزن ذبيحة 24 كجم (تصافي 50.0%).
       - حري: وزن حي 42 كجم -> وزن ذبيحة 21 كجم (تصافي 50.0%).
       - تيس عارضي: وزن حي 30 كجم -> وزن ذبيحة 15 كجم (تصافي 50.0%).
       - عجل بلدي: وزن حي 320 كجم -> وزن ذبيحة 185 كجم (تصافي 57.8%).
  2. `yieldTrial(trial: { inputKg: number, usableKg: number, purchaseCostNet: number })`
     - *المخرجات:* `{ usableKg, wastePercent, effectiveKgCostNet }`.

---

### 2.3 خدمة الفوترة والامتثال الضريبي ZATCA (ZatcaService)
- **المصدر:** `ui/tools.js` و `ui/enterprise.js`.
- **العقود:**
  1. `zatcaTLV(sellerName: string, vatNumber: string, timestampISO: string, totalGross: string|number, vatAmount: string|number): string`
     - *الترميز:* Tag 1 (Seller), Tag 2 (VAT No), Tag 3 (Timestamp), Tag 4 (Total Gross), Tag 5 (VAT Amount).
     - *المخرج:* Base64 Encoded TLV string مطابق لمواصفات ZATCA المرحلة الأولى والثانية.
  2. `zatcaTLVDecode(base64TLV: string): { seller: string, vatNumber: string, timestamp: string, totalGross: number, vatAmount: number, isValid: boolean, mathCheck: boolean }`
     - *التحقق الرياضي:* مطابقة أن $\text{vatAmount} \approx \text{totalGross} \times (15 / 115)$ بهامش خطأ $\le 0.05$ ريال.

---

### 2.4 خدمة تقسيم المدفوعات ونقاط البيع (POSPaymentService)
- **المصدر:** `ui/enterprise.js`.
- **العقود:**
  1. `computeSplitPayments(totalDue: number, splits: { cash: number, mada: number, transfer: number, credit: number }): { totalPaid: number, balanceRemaining: number, cashChange: number, isFullySettled: boolean }`
     - *Invariant:* إجمالي المدفوعات = مجموع كافة الطرق. الفكة (`cashChange`) تحسب فقط من فائض النقد المسلم.

---

### 2.5 خدمة غرف تعتيق اللحوم الجافة والرطبة (AgingChamberService)
- **المصدر:** `ui/operations.js`.
- **العقود:**
  1. `calculateAgingChamber(initialWeight: number, currentWeight: number, trimPellicleKg: number, costInitial: number): { moistureLossKg: number, moistureLossPct: number, usableKg: number, totalLossPct: number, realCostPerKg: number }`
     - *Invariant:* الوزن الصافي النهائي = $\text{Current Weight} - \text{Trim Pellicle}$. التكلفة الصافية للكيلو = $\text{Cost Initial} / \text{Usable Kg}$.

---

### 2.6 خدمة رادار الصلاحية المخزنية FIFO (InventoryFIFOService)
- **المصدر:** `ui/inventory.js`.
- **العقود:**
  1. `evaluateMeatFreshness(slaughterDate: string, storageType: 'chilled' | 'vacuum' | 'frozen'): { daysElapsed: number, daysRemaining: number, riskLevel: 'ok' | 'warning' | 'critical' | 'expired' }`
     - *مدد الصلاحية القياسية:*
       - تبريد (0-4°C): 7 أيام كحد أقصى.
       - سحب هواء (Vacuum): 21 يوماً.
       - تجميد (-18°C): 180 يوماً.

---

### 2.7 خدمة أمان وخصوصية البيانات (DataPrivacyService)
- **المصدر:** `ui/shell.js` و `ui/jev.js`.
- **العقود:**
  1. `redact(text: string): string`
     - حجب أرقام الآيبان البنكية `[IBAN]`.
     - حجب أرقام الهواتف السعودية `05xxxxxxxx` و `+9665xxxxxxxx` إلى `[PHONE]`.
     - حجب الهويات الوطنية والإقامات (10-15 رقم) إلى `[ID]`.
     - حجب البريد الإلكتروني إلى `[EMAIL]`.
     - *Invariant:* منع تصدير أو إرسال أي نص إلى نماذج الذكاء الاصطناعي أو السيرفرات قبل إجراء التعتيم الصارم.

---

## 3. حالات الاختبار المرجعية (Golden Dataset Reference Cases)

| المعرف (Case ID) | الخدمة المستهدفة | المدخلات المرجعية (Inputs) | المخرجات المتوقعة الدقيقة (Expected Outputs) | نتيجة التحقق (Verification) |
|---|---|---|---|---|
| **GOLD-PRC-01** | `calculateUsableUnitCost` | `netCost=100`, `waste=0.10`, `method='yield'` | `111.1111` ر.س/كجم | **PASS** (طابق المحرك الدقيق) |
| **GOLD-RND-01** | `applyRoundingPolicy` | `price=145.23`, `policy='ending_dot_90'` | `145.90` ر.س | **PASS** |
| **GOLD-RND-02** | `applyRoundingPolicy` | `price=150.00`, `policy='ending_9'` | `159.00` ر.س | **PASS** |
| **GOLD-ZAT-01** | `zatcaTLV` + Decode | بائع="شركة اغنام الوادي", ضريبة="310123456700003", إجمالي=115.00, ضريبة=15.00 | استخراج التاجات 1-5 بنجاح، تحقق رياضي صحيح 100% | **PASS** |
| **GOLD-NRV-01** | `nrvAllocate` | تكلفة ذبيحة=1200 ر.س، قطعيات=[فخذ 10كجم@60, كتف 8كجم@50, رقبة 4كجم@35] | مجموع التكاليف الموزعة = 1200.00 ر.س تماماً | **PASS** |
| **GOLD-AGE-01** | Aging Chamber | وزن دخول=20 كجم، وزن خروج=17.5 كجم، تشفيه=1.5 كجم، تكلفة=900 ر.س | فاقد تبخر=12.5%، صافي=16 كجم، تكلفة الكيلو الحقيقية=56.25 ر.س | **PASS** |
| **GOLD-RED-01** | `redact` | "تحويل لحساب SA0380000000608010167519 وهاتف 0501234567" | "تحويل لحساب [IBAN] وهاتف [PHONE]" | **PASS** |

---
**الخلاصة:**  
تم توثيق كافة حدود النواة وعقودها الرياضية والتشغيلية بدقة متناهية، وثبت نجاح كافة حالات الـ Golden Dataset المرجعية، مما يضمن ثبات السلوك وعدم حدوث أي انحراف وظيفي قبل وأثناء وبعد إعادة بناء طبقة العرض.
