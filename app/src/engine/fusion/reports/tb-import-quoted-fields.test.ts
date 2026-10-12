import { describe, expect, it } from 'vitest';
import { parseTrialBalance } from './tb-import-engine';

describe('multi-line and correctly escaped trial balance imports', () => {
  it('reads an account name containing a quoted comma and newline', () => {
    const csv = 'code,name,debit,credit\n1100,"Cash,\nBank on hand",100,\n3100,Capital,,100';
    const tb = parseTrialBalance(csv);
    expect(tb.errors).toEqual([]);
    expect(tb.ok && tb.balanced).toBe(true);
    expect(tb.rows).toHaveLength(2);
    expect(tb.rows[0]).toMatchObject({ code: '1100', name: 'Cash,\nBank on hand', line: 2 });
    expect(tb.rows[1]).toMatchObject({ code: '3100', line: 4 });
  });

  it('correctly decodes escaped double quotes', () => {
    const tb = parseTrialBalance('code,name,debit,credit\n1100,"Cash ""on hand""",12,\n3100,Capital,,12');
    expect(tb.ok && tb.balanced).toBe(true);
    expect(tb.rows[0].name).toBe('Cash "on hand"');
  });

  it('rejects unterminated quoted data without returning partially imported rows', () => {
    const tb = parseTrialBalance('code,name,debit,credit\n1100,"Unexpected line\n3100,Capital,,100');
    expect(tb.ok).toBe(false);
    expect(tb.balanced).toBe(false);
    expect(tb.rows).toHaveLength(0);
    expect(tb.errors).toMatchObject([{ code: 'UNCLOSED_QUOTED_FIELD', line: 2 }]);
  });
});
