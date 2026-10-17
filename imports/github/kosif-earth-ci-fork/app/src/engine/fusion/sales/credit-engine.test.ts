import {describe,expect,it} from 'vitest';
import {applyCreditMovement,availableCredit,canExtendCredit,creditUtilization,type CreditAccount} from './credit-engine';

const account:CreditAccount={id:'C1',customerId:'customer-1',limit:1000,balance:400,terms:'30 days',status:'ACTIVE',movements:[]};

describe('B2B credit',()=>{
  it('calculates available credit and utilization',()=>{
    expect(availableCredit(account)).toBe(600);
    expect(creditUtilization(account)).toBe(40);
  });
  it('blocks sales above available limit',()=>{
    expect(canExtendCredit(account,700)).toEqual({allowed:false,reason:'LIMIT_EXCEEDED',available:600});
  });
  it('records sale and receipt movements',()=>{
    const sold=applyCreditMovement(account,{type:'SALE',amount:100,now:new Date('2026-09-25T00:00:00Z'),id:'M1'});
    expect(sold.balance).toBe(500);
    const paid=applyCreditMovement(sold,{type:'RECEIPT',amount:200,now:new Date('2026-09-25T01:00:00Z'),id:'M2'});
    expect(paid.balance).toBe(300);
  });
});
