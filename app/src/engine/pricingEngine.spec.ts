import { test, expect } from 'vitest';
import { runPricingEngineTests } from './pricingEngine.test';

test('pricing engine self-tests', () => {
  const { results } = runPricingEngineTests();
  const failed = results.filter((r) => !r.passed);
  expect(results.length).toBeGreaterThan(0);
  expect(failed).toEqual([]);
});
