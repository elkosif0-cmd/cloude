import { describe, expect, it } from 'vitest';
import { addMaterial, addProduct, connect, customersFromOrders, cycles, emptyTree, fromWorkbook, graph, linkSupplier, materialUnitCost, mergeWorkbook, priceShock, productCost, removeNode, whereUsed } from './product-tree-engine';

const raws = [{ id: 'r1', name: 'نعيمي طازج', buy: 52, waste: 8, price: 69 }, { id: 'r8', name: 'أرز بسمتي', buy: 9, waste: 0 }];
const boxes = [{ id: 'b1', name: 'بوكس النعيمي العائلي', price: 329, comps: [{ t: 'raw', id: 'r1', q: 4 }, { t: 'raw', id: 'r8', q: 0.5 }], ohs: [{ amt: 12 }] }];

describe('the product tree', () => {
  const t = fromWorkbook(raws, boxes);
  it('takes the pricing workbook\'s items and boxes as materials and products', () => {
    expect(t.materials.map((m) => m.id)).toEqual(['m-r1', 'm-r8']);
    expect(t.products[0].components).toEqual([{ ref: 'm-r1', kind: 'material', qty: 4 }, { ref: 'm-r8', kind: 'material', qty: 0.5 }]);
    expect(t.products[0].overhead).toBe(12);
  });
  it('rolls cost up through the tree, grossing materials up for waste', () => {
    expect(materialUnitCost(t.materials[0])).toBeCloseTo(52 / 0.92, 6);
    const c = productCost(t, 'p-b1');
    expect(c.total).toBeCloseTo(52 / 0.92 * 4 + 4.5 + 12, 1);
    expect(c.profit).toBeCloseTo(329 - c.total, 2);
    expect(c.lines.reduce((s, l) => s + l.share, 0)).toBeGreaterThan(90);
  });
  it('nests products inside products and refuses a loop', () => {
    let x = addProduct(t, { id: 'p-gift', name: 'سلة هدايا', price: 800, components: [], overhead: 20 });
    x = connect(x, 'p-gift', 'p-b1', 'product', 2);
    expect(productCost(x, 'p-gift').total).toBeCloseTo(productCost(t, 'p-b1').total * 2 + 20, 1);
    expect(() => connect(x, 'p-b1', 'p-gift', 'product', 1)).toThrow('LOOP');
    expect(cycles(x)).toEqual([]);
  });
  it('lets the cheapest supplier price replace the purchase cost, and shows what a price shock does', () => {
    const x = linkSupplier(linkSupplier(t, { supplier: 'المراعي', materialId: 'm-r1', price: 50 }), { supplier: 'النخبة', materialId: 'm-r1', price: 55 });
    expect(materialUnitCost(x.materials[0], { suppliers: x.suppliers, bestSupplier: true })).toBeCloseTo(50 / 0.92, 6);
    expect(productCost(x, 'p-b1', { bestSupplier: true }).total).toBeLessThan(productCost(x, 'p-b1').total);
    expect(priceShock(t, 'm-r1', 10)[0].change).toBeCloseTo(52 / 0.92 * 4 * 0.1, 1);
    expect(whereUsed(t, 'm-r8')[0].product).toBe('بوكس النعيمي العائلي');
  });
  it('finds the customers of each product in the orders, and lays out the arrows canvas', () => {
    const cs = customersFromOrders(t, [{ product: 'بوكس النعيمي العائلي', customer: 'مطعم الريف', qty: 3, amount: 987 }, { product: 'نعيمي طازج', customer: 'أحمد', qty: 2, amount: 138 }]);
    expect(cs).toEqual([{ customer: 'مطعم الريف', productId: 'p-b1', qty: 3, amount: 987, source: 'orders' }]);
    const g = graph({ ...linkSupplier(t, { supplier: 'المراعي', materialId: 'm-r1', price: 50 }), customers: cs });
    expect(g.nodes.map((n) => n.kind)).toEqual(['supplier', 'material', 'material', 'product', 'customer']);
    expect(g.edges.map((e) => e.kind).sort()).toEqual(['component', 'component', 'sale', 'supply']);
    expect(graph({ ...t, customers: cs }, { focus: 'm-r8' }).nodes.map((n) => n.id)).toContain('c:مطعم الريف');
  });
  it('merges the workbook without losing the user\'s drawing, and removes a node with its arrows', () => {
    let x = addMaterial(emptyTree(), { id: 'm-pack', name: 'علبة تغليف', unit: 'حبة', cost: 3, waste: 0 });
    x = mergeWorkbook(x, t);
    expect(x.materials.map((m) => m.id)).toEqual(['m-pack', 'm-r1', 'm-r8']);
    const y = removeNode(x, 'm-r8');
    expect(y.products[0].components.map((c) => c.ref)).toEqual(['m-r1']);
  });
});
