import {describe,expect,it} from 'vitest';
import {createSupplier,inspectSuppliers} from './suppliers-engine';

describe('supplier master',()=>{
  it('normalizes supplier data',()=>{
    expect(createSupplier({code:' S-1 ',name:' مورد ',taxNumber:' 123 ',email:'X@EXAMPLE.COM'})).toEqual({
      id:'supplier-s-1',code:'S-1',name:'مورد',taxNumber:'123',email:'x@example.com',active:true
    });
  });

  it('detects duplicate supplier code',()=>{
    const issues=inspectSuppliers([
      createSupplier({code:'S1',name:'أ'}),
      createSupplier({code:'s1',name:'ب'}),
    ]);
    expect(issues.map(x=>x.code)).toContain('DUPLICATE_CODE');
  });
});
