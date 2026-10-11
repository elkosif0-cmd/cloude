import {describe,expect,it} from 'vitest';
import {selectCompany,validatePeriod} from './company-context';

describe('company context',()=>{
  const companies=[{id:'c1',name:'شركة 1',country:'SA',currency:'SAR'}];
  const periods=[{id:'p1',companyId:'c1',startDate:'2026-01-01',endDate:'2026-12-31',label:'2026'}];
  it('selects a period only from the selected company',()=>{
    expect(selectCompany(companies,periods,'c1','p1').period?.id).toBe('p1');
    expect(selectCompany(companies,periods,'missing').company).toBeNull();
  });
  it('keeps an omitted period id as the explicit all-periods state',()=>{
    expect(selectCompany(companies,periods,'c1').period).toBeNull();
  });
  it('never borrows a period owned by another company',()=>{
    const mixed=[...periods,{id:'p2',companyId:'c2',startDate:'2026-01-01',endDate:'2026-12-31',label:'Other 2026'}];
    expect(selectCompany(companies,mixed,'c1','p2').period).toBeNull();
  });
  it('validates fiscal period dates',()=>{
    expect(validatePeriod(periods[0])).toBe(true);
  });
});
