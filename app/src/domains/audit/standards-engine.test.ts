import {describe,expect,it} from 'vitest';
import {createStandard,searchStandards} from './standards-engine';

describe('standards library',()=>{
  it('normalizes code title and unique tags',()=>{
    expect(createStandard({code:' IFRS-18 ',title:' Presentation ',framework:'IFRS',tags:['FS','FS']})).toEqual(
      expect.objectContaining({id:'standard-ifrs-18',code:'IFRS-18',title:'Presentation',tags:['FS'],active:true})
    );
  });
  it('searches by framework title and tags',()=>{
    const rows=[
      createStandard({code:'IFRS-18',title:'Presentation',framework:'IFRS',tags:['statements']}),
      createStandard({code:'ETH-1',title:'Ethics',framework:'ETHICS',tags:['independence']}),
    ];
    expect(searchStandards(rows,'independence').map(x=>x.code)).toEqual(['ETH-1']);
  });
});
