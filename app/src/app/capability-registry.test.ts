import { describe, expect, it } from 'vitest';
import * as registry from './capability-registry';

const requiredFinanceCapabilities = [
  'finance.accounts',
  'finance.journals',
  'finance.general-ledger',
  'finance.trial-balance',
] as const;

describe('grand fusion finance capability registry', () => {
  it('declares the four accounting foundation capabilities as rebuild targets', () => {
    const entries = (registry as unknown as { coreCapabilities?: Array<{ id: string; decision?: string }> }).coreCapabilities;

    expect(entries).toBeDefined();
    for (const id of requiredFinanceCapabilities) {
      expect(entries).toContainEqual(expect.objectContaining({ id, decision: 'REBUILD' }));
    }
  });
});
