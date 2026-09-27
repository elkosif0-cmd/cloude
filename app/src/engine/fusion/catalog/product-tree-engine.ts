/* The product tree — what every product is made of, what it costs, who supplies it and who buys it.
   Raw materials carry their purchase cost and waste (the usable share is 1 − waste); a product (a box, a
   manufactured item, a dish) is made of materials and of other products, each with a quantity, plus its own
   overheads (packing, labour). The cost of a product rolls up through the tree: a material costs
   cost ÷ (1 − waste) per usable unit, a sub-product costs its own rolled-up cost.
   Links around the tree: suppliers → materials (who sells it, at what price — the cheapest current price can
   replace the material's cost), products → customers (who buys it).
   The same data is shown three ways by the helper screen: a table, a tree (product → components → materials →
   suppliers) and a node-and-arrow canvas; graph() gives the canvas its layered layout
   (suppliers | materials | products | customers). */

export type Material = { id: string; name: string; unit: string; cost: number; waste: number; price?: number | null; category?: string };
export type Component = { ref: string; kind: 'material' | 'product'; qty: number };
export type Product = { id: string; name: string; price?: number | null; category?: string; components: Component[]; overhead: number };
export type SupplierLink = { supplier: string; materialId: string; price: number; unit?: string };
export type CustomerLink = { customer: string; productId: string; qty?: number; amount?: number; source: 'manual' | 'orders' };
export type Tree = { materials: Material[]; products: Product[]; suppliers: SupplierLink[]; customers: CustomerLink[];
  /** suppliers and customers placed on the canvas before they are linked */ people?: { suppliers?: string[]; customers?: string[] };
  /** where the user dragged each node on the canvas */ pos?: Record<string, { x: number; y: number }> };

export const emptyTree = (): Tree => ({ materials: [], products: [], suppliers: [], customers: [] });
const r2 = (x: number) => Math.round(x * 100) / 100;

/** A material's cost per usable unit: purchase cost grossed up for waste (the cheapest supplier price when asked). */
export function materialUnitCost(m: Material, opts: { suppliers?: SupplierLink[]; bestSupplier?: boolean } = {}): number {
  let base = m.cost;
  if (opts.bestSupplier && opts.suppliers) {
    const prices = opts.suppliers.filter((s) => s.materialId === m.id && s.price > 0).map((s) => s.price);
    if (prices.length) base = Math.min(...prices);
  }
  const usable = 1 - Math.min(Math.max(m.waste, 0), 95) / 100;
  return usable > 0 ? base / usable : base;
}

/** Products that (directly or through sub-products) contain themselves — a tree must not loop. */
export function cycles(t: Tree): string[] {
  const byId = new Map(t.products.map((p) => [p.id, p])), bad = new Set<string>();
  const walk = (id: string, stack: string[]) => {
    if (stack.includes(id)) { stack.slice(stack.indexOf(id)).forEach((x) => bad.add(x)); return; }
    const p = byId.get(id); if (!p) return;
    for (const c of p.components) if (c.kind === 'product') walk(c.ref, [...stack, id]);
  };
  for (const p of t.products) walk(p.id, []);
  return [...bad];
}

export type CostLine = { ref: string; kind: 'material' | 'product'; name: string; qty: number; unitCost: number; amount: number; share: number };
export type ProductCost = { id: string; name: string; lines: CostLine[]; materials: number; overhead: number; total: number; price: number | null; profit: number | null; margin: number | null; missing: string[] };

/** The rolled-up cost of a product, line by line. */
export function productCost(t: Tree, productId: string, opts: { bestSupplier?: boolean } = {}, seen: string[] = []): ProductCost {
  const p = t.products.find((x) => x.id === productId);
  if (!p) return { id: productId, name: '', lines: [], materials: 0, overhead: 0, total: 0, price: null, profit: null, margin: null, missing: [productId] };
  const mats = new Map(t.materials.map((m) => [m.id, m])), lines: CostLine[] = [], missing: string[] = [];
  for (const c of p.components) {
    if (c.kind === 'material') {
      const m = mats.get(c.ref);
      if (!m) { missing.push(c.ref); continue; }
      const u = materialUnitCost(m, { suppliers: t.suppliers, bestSupplier: opts.bestSupplier });
      lines.push({ ref: c.ref, kind: 'material', name: m.name, qty: c.qty, unitCost: r2(u), amount: r2(u * c.qty), share: 0 });
    } else {
      if (seen.includes(c.ref) || c.ref === p.id) { missing.push(c.ref); continue; }
      const sub = productCost(t, c.ref, opts, [...seen, p.id]);
      if (!sub.name) { missing.push(c.ref); continue; }
      lines.push({ ref: c.ref, kind: 'product', name: sub.name, qty: c.qty, unitCost: sub.total, amount: r2(sub.total * c.qty), share: 0 });
      missing.push(...sub.missing);
    }
  }
  const materials = r2(lines.reduce((s, l) => s + l.amount, 0)), overhead = r2(p.overhead || 0), total = r2(materials + overhead);
  lines.forEach((l) => { l.share = total ? Math.round((l.amount / total) * 1000) / 10 : 0; });
  const price = p.price ?? null, profit = price != null ? r2(price - total) : null;
  return { id: p.id, name: p.name, lines, materials, overhead, total, price, profit, margin: price ? Math.round(((price - total) / price) * 1000) / 10 : null, missing };
}

/** Where a material is used, and how much of each product's cost it carries. */
export function whereUsed(t: Tree, materialId: string) {
  return t.products.map((p) => {
    const c = productCost(t, p.id), l = c.lines.find((x) => x.kind === 'material' && x.ref === materialId);
    return l ? { productId: p.id, product: p.name, qty: l.qty, amount: l.amount, share: l.share } : null;
  }).filter((x): x is NonNullable<typeof x> => !!x);
}

/** What happens to every product when a material's cost moves by `pct` %. */
export function priceShock(t: Tree, materialId: string, pct: number) {
  const shocked: Tree = { ...t, materials: t.materials.map((m) => (m.id === materialId ? { ...m, cost: m.cost * (1 + pct / 100) } : m)) };
  return t.products.map((p) => { const a = productCost(t, p.id), b = productCost(shocked, p.id);
    return { productId: p.id, product: p.name, before: a.total, after: b.total, change: r2(b.total - a.total), marginBefore: a.margin, marginAfter: b.margin }; })
    .filter((x) => x.change !== 0);
}

/* ---------- the pricing workbook's items and boxes as a tree ---------- */
type LegacyRaw = { id: string; name: string; buy?: number; waste?: number; price?: number; cat?: string };
type LegacyBox = { id: string; name: string; price?: number; cat?: string; comps?: { t: string; id: string; q?: number; kg?: number }[]; ohs?: { amt?: number }[] };
export function fromWorkbook(raws: LegacyRaw[], boxes: LegacyBox[]): Tree {
  const t = emptyTree();
  t.materials = raws.map((r) => ({ id: 'm-' + r.id, name: String(r.name || ''), unit: 'كجم', cost: Number(r.buy) || 0, waste: Number(r.waste) || 0, price: r.price ?? null, category: r.cat }));
  const rawIds = new Set(raws.map((r) => r.id)), boxIds = new Set(boxes.map((b) => b.id));
  t.products = boxes.map((b) => ({ id: 'p-' + b.id, name: String(b.name || ''), price: b.price ?? null, category: b.cat, overhead: (b.ohs || []).reduce((s, o) => s + (Number(o.amt) || 0), 0),
    components: (b.comps || []).filter((c) => (c.t === 'raw' && rawIds.has(c.id)) || (c.t === 'box' && boxIds.has(c.id)))
      .map((c) => ({ ref: (c.t === 'box' ? 'p-' : 'm-') + c.id, kind: c.t === 'box' ? 'product' as const : 'material' as const, qty: Number(c.q ?? c.kg) || 0 })) }));
  return t;
}
/** Merge the workbook's items into a tree without losing what the user drew (their materials, links and products stay). */
export function mergeWorkbook(t: Tree, w: Tree): Tree {
  const have = new Set([...t.materials.map((m) => m.id), ...t.products.map((p) => p.id)]);
  return { ...t, materials: [...t.materials, ...w.materials.filter((m) => !have.has(m.id))], products: [...t.products, ...w.products.filter((p) => !have.has(p.id))] };
}

/* ---------- customers from the orders ---------- */
const norm = (s: string) => String(s || '').trim().replace(/\s+/g, ' ').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
/** Who bought each product, from order lines (product name → customer), strongest buyers first. */
export function customersFromOrders(t: Tree, lines: { product: string; customer: string; qty?: number; amount?: number }[], top = 8): CustomerLink[] {
  const byName = new Map(t.products.map((p) => [norm(p.name), p.id]));
  t.materials.forEach((m) => { if (!byName.has(norm(m.name))) byName.set(norm(m.name), 'mat:' + m.id); });
  const agg = new Map<string, CustomerLink>();
  for (const l of lines) {
    const id = byName.get(norm(l.product)); if (!id || id.startsWith('mat:') || !l.customer) continue;
    const k = id + '|' + l.customer, a = agg.get(k) ?? { customer: l.customer, productId: id, qty: 0, amount: 0, source: 'orders' as const };
    a.qty = (a.qty ?? 0) + (l.qty ?? 0); a.amount = r2((a.amount ?? 0) + (l.amount ?? 0)); agg.set(k, a);
  }
  const out: CustomerLink[] = [];
  for (const p of t.products) out.push(...[...agg.values()].filter((a) => a.productId === p.id).sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)).slice(0, top));
  return out;
}

/* ---------- the canvas: layered layout ---------- */
export type GNode = { id: string; kind: 'supplier' | 'material' | 'product' | 'customer'; label: string; sub: string; x: number; y: number };
export type GEdge = { from: string; to: string; label: string; kind: 'supply' | 'component' | 'sale' };
export function graph(t: Tree, opts: { focus?: string; width?: number } = {}): { nodes: GNode[]; edges: GEdge[]; width: number; height: number } {
  const W = opts.width ?? 1200, cols = { supplier: 0.1, material: 0.36, product: 0.64, customer: 0.9 };
  const suppliers = [...new Set([...t.suppliers.map((s) => s.supplier), ...(t.people?.suppliers ?? [])])];
  const custs = [...new Set([...t.customers.map((c) => c.customer), ...(t.people?.customers ?? [])])];
  const col = <T,>(kind: GNode['kind'], items: T[], id: (x: T) => string, label: (x: T) => string, sub: (x: T) => string): GNode[] =>
    items.map((x, i) => ({ id: id(x), kind, label: label(x), sub: sub(x), x: Math.round(W * cols[kind]), y: 60 + i * 74 }));
  const nodes = [
    ...col('supplier', suppliers, (s) => 's:' + s, (s) => s, (s) => t.suppliers.filter((x) => x.supplier === s).length + ' مادة'),
    ...col('material', t.materials, (m) => m.id, (m) => m.name, (m) => r2(materialUnitCost(m)) + ' / ' + m.unit + (m.waste ? ' · هدر ' + m.waste + '%' : '')),
    ...col('product', t.products, (p) => p.id, (p) => p.name, (p) => { const c = productCost(t, p.id); return 'تكلفة ' + c.total + (c.margin != null ? ' · هامش ' + c.margin + '%' : ''); }),
    ...col('customer', custs, (c) => 'c:' + c, (c) => c, (c) => t.customers.filter((x) => x.customer === c).length + ' منتج'),
  ];
  const edges: GEdge[] = [
    ...t.suppliers.map((s) => ({ from: 's:' + s.supplier, to: s.materialId, label: String(s.price), kind: 'supply' as const })),
    ...t.products.flatMap((p) => p.components.map((c) => ({ from: c.ref, to: p.id, label: '× ' + c.qty, kind: 'component' as const }))),
    ...t.customers.map((c) => ({ from: c.productId, to: 'c:' + c.customer, label: c.qty ? String(c.qty) : '', kind: 'sale' as const })),
  ].filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to));
  let keep = nodes;
  if (opts.focus) {
    const near = new Set([opts.focus]);
    for (let i = 0; i < 3; i++) for (const e of edges) { if (near.has(e.from)) near.add(e.to); if (near.has(e.to)) near.add(e.from); }
    keep = nodes.filter((n) => near.has(n.id));
    const byKind: Record<string, number> = {};
    keep = keep.map((n) => ({ ...n, y: 60 + (byKind[n.kind] = (byKind[n.kind] ?? -1) + 1) * 74 }));
  }
  if (t.pos && !opts.focus) keep = keep.map((n) => (t.pos![n.id] ? { ...n, x: t.pos![n.id].x, y: t.pos![n.id].y } : n));
  const ids = new Set(keep.map((n) => n.id));
  const height = Math.max(240, ...keep.map((n) => n.y + 60));
  return { nodes: keep, edges: edges.filter((e) => ids.has(e.from) && ids.has(e.to)), width: W, height };
}

/* ---------- edits ---------- */
const slug = (p: string) => p + '-' + Math.random().toString(36).slice(2, 8);
export function addMaterial(t: Tree, m: Omit<Material, 'id'> & { id?: string }): Tree { return { ...t, materials: [...t.materials, { ...m, id: m.id ?? slug('m') }] }; }
export function addProduct(t: Tree, p: Omit<Product, 'id'> & { id?: string }): Tree { return { ...t, products: [...t.products, { ...p, id: p.id ?? slug('p') }] }; }
/** Connect a component to a product (a material or a sub-product) — refused when it would make a loop. */
export function connect(t: Tree, productId: string, ref: string, kind: Component['kind'], qty: number): Tree {
  const next: Tree = { ...t, products: t.products.map((p) => (p.id !== productId ? p : { ...p, components: [...p.components.filter((c) => c.ref !== ref), { ref, kind, qty }] })) };
  if (cycles(next).length) throw new Error('LOOP');
  return next;
}
export function disconnect(t: Tree, productId: string, ref: string): Tree {
  return { ...t, products: t.products.map((p) => (p.id !== productId ? p : { ...p, components: p.components.filter((c) => c.ref !== ref) })) };
}
export function linkSupplier(t: Tree, s: SupplierLink): Tree { return { ...t, suppliers: [...t.suppliers.filter((x) => !(x.supplier === s.supplier && x.materialId === s.materialId)), s] }; }
export function linkCustomer(t: Tree, c: CustomerLink): Tree { return { ...t, customers: [...t.customers.filter((x) => !(x.customer === c.customer && x.productId === c.productId)), c] }; }
export function removeNode(t: Tree, id: string): Tree {
  const people = { suppliers: (t.people?.suppliers ?? []).filter((x) => 's:' + x !== id), customers: (t.people?.customers ?? []).filter((x) => 'c:' + x !== id) };
  return { people, pos: t.pos, materials: t.materials.filter((m) => m.id !== id), products: t.products.filter((p) => p.id !== id).map((p) => ({ ...p, components: p.components.filter((c) => c.ref !== id) })),
    suppliers: t.suppliers.filter((s) => s.materialId !== id && 's:' + s.supplier !== id), customers: t.customers.filter((c) => c.productId !== id && 'c:' + c.customer !== id) };
}
