import {describe,expect,it} from 'vitest';
import {
  assessRecognition,
  classifyAccountingChange,
  reviewPresentation,
  reviewDisclosureStructure,
  reviewCashFlowPresentation
} from './accounting-guidance-engine';

describe('accounting application guidance',()=>{
  it('requires control and probable benefits for an asset',()=>{
    expect(assessRecognition({kind:'asset',pastEvent:true,measurableReliably:true,controlledResource:true,probableFutureBenefit:true}).decision).toBe('recognize');
    expect(assessRecognition({kind:'asset',pastEvent:true,measurableReliably:true,controlledResource:false,probableFutureBenefit:true}).decision).toBe('do-not-recognize');
  });

  it('requires a present obligation and probable outflow for a liability',()=>{
    expect(assessRecognition({kind:'liability',pastEvent:true,measurableReliably:true,presentObligation:true,legalOrConstructiveObligation:true,probableOutflow:true}).decision).toBe('recognize');
  });

  it('separates policy, estimate and prior-period error',()=>{
    expect(classifyAccountingChange({newInformationOrNewExperience:true,changedMeasurementTechniqueOrAssumption:true}).treatment).toBe('prospective');
    expect(classifyAccountingChange({failureOrMisuseOfReliableInformation:true,material:true,retrospectivePracticable:true}).category).toBe('prior-period-error');
    expect(classifyAccountingChange({voluntaryPolicyChange:true,retrospectivePracticable:true}).treatment).toBe('retrospective');
    expect(classifyAccountingChange({requiredByNewStandard:true,transitionSpecified:true}).treatment).toBe('transition-provisions');
  });

  it('flags presentation and note-architecture gaps',()=>{
    const p=reviewPresentation({
      hasComparatives:false,presentationConsistent:true,currentNoncurrentApplied:true,
      materialItemsSeparated:true,unsupportedOffsetting:false,statementLinesCrossReferencedToNotes:false
    });
    expect(p.valid).toBe(false);
    expect(p.checks.some(x=>x.id==='comparatives'&&x.status==='fail')).toBe(true);

    const d=reviewDisclosureStructure({
      entityInfo:true,complianceStatementHumanApproved:true,measurementBases:true,materialPolicies:true,
      statementSupportNotes:true,otherDisclosures:true,judgementsSeparatedFromEstimates:true,
      estimationUncertaintyDisclosed:false,unrecognizedItemsReviewed:true
    });
    expect(d.valid).toBe(false);
  });

  it('encodes the KSA SME cash-flow review points without auto-approving judgement',()=>{
    const r=reviewCashFlowPresentation({
      framework:'SME',country:'SA',zakatPaid:1200,cashEquivalentsMaturityMonths:2,
      overdraftRepayableOnDemandAndIntegralToCashManagement:true,nonCashTransactionsPresent:true
    });
    expect(r.checks.find(x=>x.id==='zakat')?.detail).toContain('التشغيلية');
    expect(r.checks.find(x=>x.id==='noncash')?.status).toBe('review');
  });
});
