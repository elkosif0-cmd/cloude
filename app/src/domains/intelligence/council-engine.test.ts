import {describe,expect,it} from 'vitest';
import {resolveCouncil} from './council-engine';

describe('AI council',()=>{
  it('selects the weighted consensus option',()=>{
    const result=resolveCouncil([
      {provider:'openai',optionId:'A',confidence:0.9},
      {provider:'gemini',optionId:'A',confidence:0.8},
      {provider:'claude',optionId:'B',confidence:0.7},
    ]);
    expect(result.winningOptionId).toBe('A');
    expect(result.agreementPercent).toBe(66.67);
  });
  it('returns no winner on a true tie',()=>{
    const result=resolveCouncil([
      {provider:'p1',optionId:'A',confidence:0.5},
      {provider:'p2',optionId:'B',confidence:0.5},
    ]);
    expect(result.tied).toBe(true);
    expect(result.winningOptionId).toBeNull();
  });
});
