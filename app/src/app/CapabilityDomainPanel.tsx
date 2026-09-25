import {coreCapabilities} from './capability-registry';
import type {ProductDomain} from './capability-types';
import './capability-domain.css';

const decisionLabel={
  KEEP_LOGIC:'منطق مثبت',
  MERGE:'صهر ودمج',
  REBUILD:'إعادة بناء',
  DROP:'مستبعد',
} as const;

export function CapabilityDomainPanel({domain}:{domain:ProductDomain}){
  const rows=coreCapabilities.filter((item)=>item.domain===domain);
  return <section className="capability-panel">
    <div className="capability-panel__intro sk-surface">
      <span className="eyebrow">خريطة القدرات الفعلية</span>
      <h1 className="sk-display">قدرات المجال</h1>
      <p>هذه الوحدات جزء من المنتج الواحد وليست تطبيقات فرعية. كل وحدة يتم ربطها بخدمة وبيانات واختبارات مستقلة قبل اعتبارها مكتملة.</p>
    </div>
    <div className="capability-list">
      {rows.map((item)=><article className="capability-card sk-surface" key={item.id}>
        <div>
          <strong>{item.label}</strong>
          <small>{item.route}</small>
        </div>
        <span data-decision={item.decision}>{decisionLabel[item.decision ?? 'REBUILD']}</span>
      </article>)}
      {rows.length===0?<div className="empty-state sk-surface">لا توجد وحدات مسجلة لهذا المجال حتى الآن.</div>:null}
    </div>
  </section>;
}
