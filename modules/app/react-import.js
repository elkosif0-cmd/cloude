/* أغنام الوادي — v33: إكمال استيراد نسخ منصة React/TypeScript v19.10
   يكمل ما يسقطه مستورد v25:
   - المصروفات: percentage_of_cost → نسبة من تكلفة المكونات، per_unit → لكل كجم (كانت تُستورد مبلغاً ثابتاً)
   - البوكسات المتداخلة (subBoxes) → مكونات من نوع بوكس
   - البوكسات المؤرشفة → حالة «مؤرشف»
   يمر عبر نفس مسار الاستيراد الأصلي (تحقق + تأكيد + لقطة + تراجع).
   يُدرج داخل نطاق التطبيق عند البناء (build.py) قبل ربط v25 بمسار الاستيراد. */
v25FromReact = (function(orig){
  const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

  return function(o){
    const base = orig(o);
    const src = v25Unwrap(o);
    const rBoxes = Array.isArray(src.boxItems) ? src.boxItems : [];
    const rExps = Array.isArray(src.expenses) ? src.expenses : [];

    /* نفس ترتيب ومعرّفات v25: العنصر i في المصدر ↔ العنصر i في الناتج */
    const bid = new Map();
    rBoxes.forEach((b, i) => { if (base.boxes[i]) bid.set(String(b.id), base.boxes[i].id); });

    rExps.forEach((e, i) => {
      const x = base.exps[i];
      if (!x) return;
      if (e.type === 'percentage_of_cost') {
        /* React يخزن النسبة كسراً (0.03)، والتطبيق يخزنها نسبة مئوية (3) */
        x.method = 'pct';
        x.amt = Math.round(num(e.amount) * 100 * 10000) / 10000;
        x.vat = 'none';
      } else if (e.type === 'per_unit') {
        x.method = 'kg';
      }
    });

    rBoxes.forEach((b, i) => {
      const x = base.boxes[i];
      if (!x) return;
      const subs = Array.isArray(b.subBoxes) ? b.subBoxes : [];
      subs.forEach(s => {
        const id = bid.get(String(s.subBoxId));
        if (!id || id === x.id) return;
        x.comps.push({ t: 'box', id, q: num(s.quantity) });
      });
      if (b.archived) x.status = 'archived';
    });

    base.meta = Object.assign({}, base.meta || {}, { reactImport: 'v33' });
    return base;
  };
})(v25FromReact);
