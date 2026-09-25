import {describe,expect,it} from 'vitest';
import {inspectLegacyDataset,parseLegacyBackup} from './legacy-migration';

describe('legacy migration',()=>{
  it('parses the legacy S.kosif backup shape',()=>{
    const data=parseLegacyBackup(JSON.stringify({
      format:'skosif-backup',version:2,createdAt:'2026-09-25T00:00:00Z',
      local:{'skosif_v31_supplier_batches':'[]'},
      idb:{customers:[{id:1}]},
    }));
    expect(data?.source).toBe('backup-file');
    expect(data?.idb.customers).toHaveLength(1);
  });

  it('counts legacy capability datasets before writing',()=>{
    const report=inspectLegacyDataset({
      source:'backup-file',
      local:{
        'aghnam-pricing-v3':JSON.stringify({raws:[{id:'A'},{id:'B'}]}),
        'skosif_v31_supplier_batches':JSON.stringify([{supplier:'S1'},{supplier:'S1'},{supplier:'S2'}]),
        'aghnam_v29_inventory':JSON.stringify([{item:'A'}]),
        'skosif_v32_offers':JSON.stringify({A:0.1}),
        'skosif_v38_ledger':JSON.stringify([{name:'C1'}]),
      },
      idb:{orders:[{id:1}],order_items:[{id:2}]},
    });
    expect(report.catalogItems).toBe(2);
    expect(report.suppliers).toBe(2);
    expect(report.supplierBatches).toBe(3);
    expect(report.legacyCommerceRows).toBe(2);
  });
});
