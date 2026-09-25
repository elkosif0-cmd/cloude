const readiness=[
  {title:'البيانات التشغيلية',status:'في انتظار الربط'},
  {title:'المالية والمحاسبة',status:'في مرحلة إعادة البناء'},
  {title:'المراجعة والتأكيد',status:'في مرحلة إعادة البناء'},
  {title:'Jev والذكاء',status:'في مرحلة إعادة البناء'}
];

export function CommandCenter(){
  return <div className="dashboard-grid">
    <section className="hero-panel sk-surface">
      <div><span className="eyebrow">S.kosif · المشروع الأكبر</span><h1 className="sk-display">مركز القيادة الجديد</h1><p>لن نعرض أرقامًا تجريبية كأنها حقيقية. المؤشرات تظهر فقط بعد ربط مصدر بيانات موثوق وترحيله بنجاح.</p></div>
      <div className="hero-orb" aria-hidden="true" />
    </section>
    <section className="readiness-grid">{readiness.map((item)=><article className="readiness-card sk-surface" key={item.title}><span>{item.title}</span><strong>{item.status}</strong><small>مصدر البيانات: غير متصل بعد</small></article>)}</section>
    <section className="sk-surface roadmap-card"><div><span className="eyebrow">المرحلة الحالية</span><h3>تأسيس النواة قبل نقل أي قدرة</h3></div><ol><li>نظام التصميم والثيمات الخمسة</li><li>خريطة القدرات الموحدة</li><li>عقود البيانات والهجرة</li><li>المالية والمراجعة والتشغيل كمسارات أصلية</li></ol></section>
  </div>;
}
