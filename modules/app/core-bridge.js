/* S.kosif V31: نافذة قراءة فقط على بيانات التطبيق للوحدات الخارجية.
   الكتالوج يبقى في الذاكرة حتى أول تعديل، فلا يكفي localStorage على جهاز جديد.
   تُرجع نسخاً، فلا يمكن للوحدات تعديل الحالة. يُدرج داخل نطاق التطبيق عند البناء. */
window.SKosifCore = Object.freeze({
  raws: () => JSON.parse(JSON.stringify((S && Array.isArray(S.raws)) ? S.raws : [])),
  /* الأصناف والبوكسات بأرقام محرك التسعير نفسه (لا حساب مكرر خارج التطبيق) */
  catalog: () => {
    if (!S) return { vat: 0.15, netBase: true, yieldMethod: true, items: [] };
    const C = Engine.compute(S), out = [];
    const fin = x => (typeof x === 'number' && isFinite(x)) ? x : null;
    for (const [id, c] of C.R) {
      const r = c.r;
      out.push({ id, kind: 'raw', name: String(r.name || ''), cat: String(r.cat || ''), status: r.status || 'active',
        byProduct: r.kind === 'by', price: fin(c.price), cost: fin(c.cost), profit: fin(c.profit), margin: fin(c.margin),
        band: c.band, pricePerKg: fin(c.price), target: fin(c.target) });
    }
    for (const [id, c] of C.B) {
      const b = c.b;
      out.push({ id, kind: 'box', name: String(b.name || ''), cat: String(b.cat || ''), status: b.status || 'active',
        byProduct: false, price: fin(c.price), cost: fin(c.total), profit: fin(c.profit), margin: fin(c.margin),
        band: c.band, pricePerKg: fin(c.pricePerKg), weight: fin(c.weight), target: fin(c.target) });
    }
    return { vat: C.v, netBase: C.netBase, yieldMethod: C.yieldM, items: out };
  },
});
