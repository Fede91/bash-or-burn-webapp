import { prices } from './prices';

describe('prices.json', () => {
  it('is flagged to verify on launch day', () => {
    expect(prices.toVerify).toBe(true);
    expect(prices.verifyNote).toMatch(/TO VERIFY ON LAUNCH DAY/);
  });

  it('carries a date, a rate, both currencies and at least one model', () => {
    expect(prices.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(prices.usdToEur).toBeGreaterThan(0);
    expect(prices.currencies).toEqual(['eur', 'usd']);
    expect(prices.models.length).toBeGreaterThan(0);
  });
});
