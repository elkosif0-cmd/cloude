import {describe,expect,it} from 'vitest';
import {auditCompletionGates,finalizeAuditReport} from './report-engine';

describe('audit report completion',()=>{
  it('blocks finalization when severe issues remain open',()=>{
    const gates=auditCompletionGates({
      evidence:[],
      pbc:[],
      workpapers:[],
      issues:[{id:'I1',title:'x',severity:'HIGH',status:'OPEN'}],
    });
    expect(gates.find(g=>g.code==='SEVERE_ISSUES')?.passed).toBe(false);
  });

  it('finalizes only with selected opinion and passed gates',()=>{
    const gates=auditCompletionGates({evidence:[],issues:[],pbc:[],workpapers:[]});
    const final=finalizeAuditReport({
      id:'R1',title:'Report',entityName:'Entity',period:'2026',opinionType:'UNMODIFIED',
      opinionText:'Opinion',basisText:'Basis',keyAuditMatters:'',otherInformation:'',responsibilities:'',auditorResponsibilities:'',status:'DRAFT'
    },gates);
    expect(final.status).toBe('FINAL');
  });
});
