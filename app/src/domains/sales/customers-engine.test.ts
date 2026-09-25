import {describe,expect,it} from 'vitest';
import {createCustomer,inspectCustomers} from './customers-engine';

describe('customer master',()=>{
  it('normalizes customer values',()=>{
    expect(createCustomer({code:' C-001 ',name:' عميل تجريبي ',phone:' 0555 123 456 ',email:'A@EXAMPLE.COM',city:' جدة '})).toEqual({
      id:'customer-c-001',
      code:'C-001',
      name:'عميل تجريبي',
      phone:'0555 123 456',
      email:'a@example.com',
      city:'جدة',
      active:true,
    });
  });

  it('detects duplicate code and duplicate normalized phone',()=>{
    const issues=inspectCustomers([
      createCustomer({code:'C1',name:'أ',phone:'0555123456'}),
      createCustomer({code:'c1',name:'ب',phone:'+966 555 123 456'}),
    ]);
    expect(issues.map(x=>x.code)).toContain('DUPLICATE_CODE');
  });
});
