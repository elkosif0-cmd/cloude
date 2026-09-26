import {describe,expect,it} from 'vitest';
import {reportCompatibility,compatibilitySummary,reportIds} from './global-corpus-engine';

describe('49-report output compatibility',()=>{
  const generated=[
    'highlights','chair_letter','ceo_letter','strategy','mdna','principal_risks','sustainability','outlook',
    'liquidity','risk_management','viability','governance','audit_committee','directors_resp','icfr',
    'auditor_report','kam','materiality','income_statement','balance_sheet','cash_flow','notes','accounting_policies',
    'estimates','tax_note','ppe_note','intangibles_note','employee_benefits','leases_note','fin_instruments',
    'credit_risk','liquidity_risk','market_risk','capital_mgmt','provisions_note','revenue_note','related_parties',
    'segment_note','subsequent_events'
  ];

  it('scores every report in the extracted corpus',()=>{
    const rows=reportCompatibility(generated);
    expect(rows).toHaveLength(reportIds().length);
    expect(rows).toHaveLength(49);
    expect(rows.every(r=>r.total>0&&r.coveragePct>=0&&r.coveragePct<=100)).toBe(true);
    expect(rows.some(r=>r.id==='aramco-2025')).toBe(true);
  });

  it('reports gaps instead of pretending every company template is identical',()=>{
    const rows=reportCompatibility(generated);
    const amazon=rows.find(r=>r.id==='amazon-2023')!;
    expect(amazon.matched).toBeGreaterThan(0);
    expect(amazon.missingSections.length+amazon.matchedSections.length).toBe(amazon.total);
    expect(rows.some(r=>r.missingSections.length>0)).toBe(true);
  });

  it('summarises compatibility without selecting a single template as authoritative',()=>{
    const s=compatibilitySummary(generated);
    expect(s.reports).toBe(49);
    expect(s.averageCoveragePct).toBeGreaterThan(0);
    expect(s.best).toHaveLength(5);
    expect(s.weakest).toHaveLength(5);
  });
});
