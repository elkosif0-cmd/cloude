import {describe,expect,it} from 'vitest';
import {buildScaleBarcode,code128SvgData,decodeScaleBarcode} from './label-engine';

describe('scale labels',()=>{
  it('preserves legacy weight barcode structure',()=>{
    const code=buildScaleBarcode({unitPriceIncVat:95.9,weightKg:1.45});
    expect(code).toBe('20009501450');
    expect(decodeScaleBarcode(code)).toEqual({unitPriceWhole:95,weightKg:1.45});
  });
  it('builds deterministic Code128 bars',()=>{
    const result=code128SvgData('20009501450');
    expect(result.value).toBe('20009501450');
    expect(result.rects.length).toBeGreaterThan(20);
    expect(result.width).toBeGreaterThan(100);
  });
});
