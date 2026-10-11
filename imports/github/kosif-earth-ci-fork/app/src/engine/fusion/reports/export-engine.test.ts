import {describe,expect,it} from 'vitest';
import {rowsToCsv,safeExportName} from './export-engine';

describe('report export engine',()=>{
  it('emits UTF-8 BOM and escapes commas and quotes',()=>{
    const csv=rowsToCsv([{name:'A, "B"',amount:10}],['name','amount']);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"A, ""B"""');
  });

  it('sanitizes unsafe file names',()=>{
    expect(safeExportName('ميزان/المراجعة: 2026')).toBe('ميزان-المراجعة-2026');
  });
});
