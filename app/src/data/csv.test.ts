import {describe,expect,it} from 'vitest';
import {csvObjects,parseCsv} from './csv';

describe('CSV parser',()=>{
  it('parses quoted commas and escaped quotes',()=>{
    expect(parseCsv('name,amount\n"A, ""B""",10')).toEqual([['name','amount'],['A, "B"','10']]);
  });
  it('maps rows to objects',()=>{
    expect(csvObjects('id,name\n1,Test')).toEqual([{id:'1',name:'Test'}]);
  });
});
