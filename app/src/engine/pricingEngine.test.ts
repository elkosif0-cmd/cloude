import {
  roundPrice,
  computeWasteFactor,
  computeRawItem,
  computeBoxItem,
  hasCircularDependency,
  simulatePricing,
} from './pricingEngine';
import { RawItem, BoxItem, ExpenseItem } from '../types/pricing';
import { AppSettings } from '../types/settings';

const mockSettings: AppSettings = {
  companyName: 'أغنام الوادي',
  vatNumber: '300012345600003',
  commercialRegister: '1010987654',
  phone: '0501234567',
  address: 'الرياض، المملكة العربية السعودية',
  reportPreparerName: 'مدير العمليات والتسعير',
  defaultVatRate: 0.15,
  targetProfitMargin: 0.22,
  excellentThreshold: 0.25,
  goodThreshold: 0.15,
  wasteMethod: 'yield',
  marginBasis: 'net',
  costDisplayMethod: 'net',
  roundingMethod: 'point90',
  purchaseVatReviewActive: true,
  suppliers: [],
  currencies: [],
  activeCurrencyCode: 'SAR',
};

export interface TestResult {
  title: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export function runPricingEngineTests(): { allPassed: boolean; results: TestResult[] } {
  const results: TestResult[] = [];

  function assert(title: string, passed: boolean, expected: string, actual: string) {
    results.push({ title, passed, expected, actual });
  }

  // 1. Waste Factor: Yield Method (1 / (1 - w))
  const yieldFactor = computeWasteFactor(0.20, 'yield');
  assert(
    'Waste factor (Yield Method 20%)',
    Math.abs(yieldFactor - 1.25) < 0.001,
    '1.25',
    yieldFactor.toFixed(4)
  );

  // 2. Waste Factor: Markup Method (1 + w)
  const markupFactor = computeWasteFactor(0.20, 'markup');
  assert(
    'Waste factor (Markup Method 20%)',
    Math.abs(markupFactor - 1.20) < 0.001,
    '1.20',
    markupFactor.toFixed(4)
  );

  // 3. Rounding .90
  const r90 = roundPrice(145.23, 'point90');
  assert('Rounding to .90 (145.23 -> 145.90)', r90 === 145.90, '145.90', r90.toString());

  // 4. Rounding Ceil
  const rCeil = roundPrice(145.23, 'ceil');
  assert('Rounding Ceil (145.23 -> 146)', rCeil === 146, '146', rCeil.toString());

  // 5. Rounding Half
  const rHalf = roundPrice(145.23, 'half');
  assert('Rounding Half (145.23 -> 145.5)', rHalf === 145.5, '145.5', rHalf.toString());

  // 6. Rounding Two Decimals
  const rTwo = roundPrice(145.236, 'twoDecimals');
  assert('Rounding Two Decimals (145.236 -> 145.24)', rTwo === 145.24, '145.24', rTwo.toString());

  // 7. Raw Item - VAT included & reclaimable
  const rawItem1: RawItem = {
    id: 'raw-1',
    code: 'RW-01',
    name: 'لحم حري طازج',
    category: 'لحوم بلدي',
    unit: 'كجم',
    purchasePriceGross: 115, // Net should be 100 with 15% VAT
    purchaseVatRate: 0.15,
    isPurchaseVatReclaimable: true,
    wastePercent: 0,
    sellingPriceGross: 138, // Net sales = 120
  };
  const comp1 = computeRawItem(rawItem1, mockSettings);
  assert(
    'Raw Item Net Purchase Price (reclaimable VAT)',
    Math.abs(comp1.purchasePriceNet - 100) < 0.01,
    '100.00',
    comp1.purchasePriceNet.toFixed(2)
  );
  assert(
    'Raw Item Net Sales Price (138 gross / 1.15)',
    Math.abs(comp1.sellingPriceNet - 120) < 0.01,
    '120.00',
    comp1.sellingPriceNet.toFixed(2)
  );
  assert(
    'Raw Item Net Profit (120 - 100)',
    Math.abs(comp1.netProfit - 20) < 0.01,
    '20.00',
    comp1.netProfit.toFixed(2)
  );

  // 8. Raw Item - Margin Net Basis
  // Profit = 20, Net Sales = 120 -> Margin = 20 / 120 = 16.67%
  assert(
    'Margin on Net Basis (20 / 120)',
    Math.abs(comp1.profitMarginNetBasis - 0.16667) < 0.001,
    '16.67%',
    (comp1.profitMarginNetBasis * 100).toFixed(2) + '%'
  );

  // 9. Raw Item - Margin Gross Basis
  // Profit = 20, Gross Selling = 138 -> Margin = 20 / 138 = 14.49%
  assert(
    'Margin on Gross Basis (20 / 138)',
    Math.abs(comp1.profitMarginGrossBasis - 0.1449) < 0.001,
    '14.49%',
    (comp1.profitMarginGrossBasis * 100).toFixed(2) + '%'
  );

  // 10. Raw Item with Waste (Yield 10%)
  const rawWithWaste: RawItem = {
    ...rawItem1,
    wastePercent: 0.10, // factor = 1 / 0.9 = 1.1111 -> usable cost = 111.11
  };
  const compWaste = computeRawItem(rawWithWaste, mockSettings);
  assert(
    'Usable kg cost with 10% yield waste (100 / 0.9)',
    Math.abs(compWaste.usableKgCost - 111.11) < 0.02,
    '111.11',
    compWaste.usableKgCost.toFixed(2)
  );

  // 11. Packaging & Dish Cost calculation
  // dishCostGrossEach = 2.30 -> Net dish cost each = 2.30 / 1.15 = 2.00
  // numberOfDishes = 3 -> total dishes cost net = 6.00
  const boxWithDishes: BoxItem = {
    id: 'box-1',
    code: 'BX-01',
    name: 'بوكس مشكل',
    category: 'بوكسات',
    sellingPriceGross: 230,
    ingredients: [{ rawItemId: 'raw-1', quantity: 1, applyWaste: false }],
    numberOfDishes: 3,
    dishCostEachGross: 2.30,
    linkedExpenseIds: [],
  };
  const compBox = computeBoxItem(boxWithDishes, [rawItem1], [], [], mockSettings);
  assert(
    'Dishes Cost Net calculation (3 dishes @ 2.30 gross = 6.00 net)',
    Math.abs(compBox.costBreakdown.dishesCostNet - 6.00) < 0.01,
    '6.00',
    compBox.costBreakdown.dishesCostNet.toFixed(2)
  );
  assert(
    'Total Box Cost Net (100 raw + 6 dishes = 106)',
    Math.abs(compBox.totalCostNet - 106.00) < 0.01,
    '106.00',
    compBox.totalCostNet.toFixed(2)
  );

  // 12. Expenses: Fixed and Percentage
  const fixedExpense: ExpenseItem = {
    id: 'exp-1',
    name: 'توصيل مبرد',
    type: 'fixed_amount',
    amount: 23, // 23 gross / 1.15 = 20 net
    applyToAll: true,
    vatRate: 0.15,
  };
  const compBoxWithExp = computeBoxItem(boxWithDishes, [rawItem1], [], [fixedExpense], mockSettings);
  assert(
    'Box with Fixed Expense (106 + 20 net exp = 126)',
    Math.abs(compBoxWithExp.totalCostNet - 126.00) < 0.01,
    '126.00',
    compBoxWithExp.totalCostNet.toFixed(2)
  );

  // 13. Nested Box
  const parentBox: BoxItem = {
    id: 'box-parent',
    code: 'BX-PARENT',
    name: 'بوكس الضيافة المزدوج',
    category: 'بوكسات',
    sellingPriceGross: 500,
    ingredients: [],
    subBoxes: [{ subBoxId: 'box-1', quantity: 2 }],
    numberOfDishes: 1,
    dishCostEachGross: 2.30, // 2.00 net
    linkedExpenseIds: [],
  };
  const compParent = computeBoxItem(parentBox, [rawItem1], [boxWithDishes], [], mockSettings);
  // Box-1 cost = 106. 2 of Box-1 = 212. + 1 dish (2.00) = 214.
  assert(
    'Nested Box Cost (2 * 106 + 2.00 = 214)',
    Math.abs(compParent.totalCostNet - 214.00) < 0.01,
    '214.00',
    compParent.totalCostNet.toFixed(2)
  );

  // 14. Circular Dependency Detection
  const circularBoxA: BoxItem = {
    id: 'circ-A',
    code: 'CA',
    name: 'A',
    category: 'test',
    sellingPriceGross: 100,
    ingredients: [],
    subBoxes: [{ subBoxId: 'circ-B', quantity: 1 }],
    numberOfDishes: 0,
    dishCostEachGross: 0,
    linkedExpenseIds: [],
  };
  const circularBoxB: BoxItem = {
    id: 'circ-B',
    code: 'CB',
    name: 'B',
    category: 'test',
    sellingPriceGross: 100,
    ingredients: [],
    subBoxes: [{ subBoxId: 'circ-A', quantity: 1 }],
    numberOfDishes: 0,
    dishCostEachGross: 0,
    linkedExpenseIds: [],
  };
  const isCircular = hasCircularDependency('circ-A', 'circ-B', [circularBoxA, circularBoxB]);
  assert('Circular Dependency Detected', isCircular === true, 'true', isCircular.toString());

  // 15. Break-Even Gross Calculation
  // totalCostNet = 100, vatRate = 0.15 -> breakEvenGross = 115
  assert(
    'Break-even Gross (cost 100 -> 115 gross)',
    Math.abs(comp1.breakEvenGross - 115.00) < 0.01,
    '115.00',
    comp1.breakEvenGross.toFixed(2)
  );

  // 16. Target Margin calculation in Simulator
  const sim = simulatePricing(100, 138, 0.25, mockSettings);
  // At 25% target margin on net basis: net required = 100 / (1 - 0.25) = 133.33 -> gross = 133.33 * 1.15 = 153.33
  // With .90 rounding -> 153.90
  assert(
    'Simulator Target Price .90 rounded',
    sim.targetSimulator.roundedRequiredGross === 153.90,
    '153.90',
    sim.targetSimulator.roundedRequiredGross.toString()
  );

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}
