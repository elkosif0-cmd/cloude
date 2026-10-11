import {describe,expect,it} from 'vitest';
import {advanceDelivery,monthlyRecurringRevenue,subscriptionAnnualValue,type MeatSubscription} from './subscription-engine';

const weekly:MeatSubscription={id:'S1',customerName:'A',planCode:'bbq',planName:'BBQ',cycle:'WEEKLY',price:240,status:'ACTIVE',nextDeliveryDate:'2026-09-25'};

describe('meat subscriptions',()=>{
  it('calculates normalized recurring revenue',()=>{
    expect(monthlyRecurringRevenue([weekly])).toBe(1040);
    expect(subscriptionAnnualValue(weekly)).toBe(12480);
  });
  it('advances weekly delivery schedule',()=>{
    expect(advanceDelivery(weekly,'2026-09-25').nextDeliveryDate).toBe('2026-10-02');
  });
});
