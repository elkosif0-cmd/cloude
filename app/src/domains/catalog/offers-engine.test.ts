import {describe,expect,it} from 'vitest';
import {offerMargin,transitionOffer,validateOffer,type Offer} from './offers-engine';

const offer:Offer={id:'O1',itemId:'I1',discountRate:0.1,startDate:'2026-09-25',endDate:'2026-09-30',status:'DRAFT'};

describe('offers engine',()=>{
  it('calculates discounted margin',()=>{
    expect(offerMargin({basePrice:100,discountRate:0.1,cost:70})).toEqual({price:90,profit:20,marginPercent:22.22,belowCost:false});
  });
  it('enforces approval transitions',()=>{
    expect(transitionOffer(offer,'PENDING').status).toBe('PENDING');
    expect(()=>transitionOffer(offer,'APPROVED')).toThrow('INVALID_OFFER_TRANSITION');
  });
  it('validates date range and discount',()=>{
    expect(validateOffer(offer).valid).toBe(true);
    expect(validateOffer({...offer,discountRate:1.2}).issues).toContain('DISCOUNT_OUT_OF_RANGE');
  });
});
