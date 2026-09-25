import {describe,expect,it} from 'vitest';
import {selectCompany,validatePeriod} from './company-context';

describe('company context',()=>{
  const companies=[{id:'c1',name:'شركة 1',country:'SA',currency:'SAR'}];
  const periods=[{id:'p1',companyId:'c1',startDate:'2026-01-01',endDate:'2026-12-31',label:'2026'}];
  it('selects a period only from the selected company',()=>{
    expect(selectCompany(companies,periods,'c1','p1').period?.id).toBe('p1');
    expect(selectCompany(companies,periods,'missing').company).toBeNull();
  });
  it('validates fiscal period dates',()=>{
    expect(validatePeriod(periods[0])).toBe(true);
  });
});
