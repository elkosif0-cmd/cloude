import {describe,expect,it} from 'vitest';
import {transitionWorkpaper,workpaperCompletion,type Workpaper} from './workpapers-engine';

const row:Workpaper={id:'W1',reference:'A-1',title:'Cash',area:'Cash',objective:'Existence',procedure:'Bank confirmation',conclusion:'No exceptions',riskIds:[],evidenceIds:[],issueIds:[],status:'DRAFT'};

describe('workpapers',()=>{
  it('requires content before prepared status',()=>{
    expect(transitionWorkpaper(row,'PREPARED','Mahmoud',new Date('2026-09-25T00:00:00Z'))).toEqual(expect.objectContaining({status:'PREPARED',preparer:'Mahmoud'}));
    expect(()=>transitionWorkpaper({...row,conclusion:''},'PREPARED')).toThrow('WORKPAPER_CONTENT_INCOMPLETE');
  });
  it('measures reviewed completion',()=>{
    expect(workpaperCompletion([{...row,status:'REVIEWED'},row])).toBe(50);
  });
});
