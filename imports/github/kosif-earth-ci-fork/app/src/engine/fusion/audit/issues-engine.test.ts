import {describe,expect,it} from 'vitest';
import {canTransitionIssue,transitionIssue} from './issues-engine';

describe('audit issues',()=>{
  it('allows response and clearing flow',()=>{
    expect(canTransitionIssue('OPEN','MANAGEMENT_RESPONSE')).toBe(true);
    expect(transitionIssue({id:'1',title:'x',severity:'HIGH',status:'MANAGEMENT_RESPONSE'},'CLEARED').status).toBe('CLEARED');
  });
  it('prevents reopening a final issue',()=>{
    expect(canTransitionIssue('FINAL','OPEN')).toBe(false);
  });
});
