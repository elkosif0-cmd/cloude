import {describe,expect,it} from 'vitest';
import {addReviewerVote,closeReviewerRound,resolveReviewerCouncil,type ReviewerCouncilRound} from './reviewer-council-engine';

const round:ReviewerCouncilRound={id:'R1',title:'رأي في ملاحظة',options:['adjust','no-adjust'],votes:[],status:'OPEN',createdAt:'2026-09-25'};

describe('reviewer council',()=>{
  it('replaces a reviewer previous vote and resolves weighted consensus',()=>{
    let current=addReviewerVote(round,{reviewer:'Partner',optionId:'adjust',confidence:.9});
    current=addReviewerVote(current,{reviewer:'Manager',optionId:'adjust',confidence:.8});
    current=addReviewerVote(current,{reviewer:'Specialist',optionId:'no-adjust',confidence:.4});
    const result=resolveReviewerCouncil(current);
    expect(result.winningOptionId).toBe('adjust');
    expect(result.agreementPercent).toBe(66.67);
    expect(result.averageConfidence).toBe(85);
  });

  it('prevents closing without a usable consensus',()=>{
    const one=addReviewerVote(round,{reviewer:'A',optionId:'adjust',confidence:.5});
    const tied=addReviewerVote(one,{reviewer:'B',optionId:'no-adjust',confidence:.5});
    expect(()=>closeReviewerRound(tied)).toThrow('CONSENSUS_NOT_READY');
  });
});
