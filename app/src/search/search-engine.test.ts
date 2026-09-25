import {describe,expect,it} from 'vitest';
import {searchItems,type SearchItem} from './search-engine';

const items:SearchItem[]=[
  {id:'1',domain:'sales',kind:'customer',title:'شركة أغنام الوادي',subtitle:'جدة'},
  {id:'2',domain:'finance',kind:'account',title:'حساب البنك الأهلي',keywords:['نقدية','بنك']},
  {id:'3',domain:'catalog',kind:'item',title:'نعيمي فاخر',subtitle:'LAMB-1'},
];

describe('global search',()=>{
  it('normalizes common Arabic variants',()=>{
    expect(searchItems(items,'اغنام')[0]?.id).toBe('1');
  });
  it('finds keyword matches across domains',()=>{
    expect(searchItems(items,'نقديه')[0]?.id).toBe('2');
  });
  it('ranks title matches above subtitles',()=>{
    expect(searchItems(items,'نعيمي')[0]?.id).toBe('3');
  });
});
