import raw from './prices.json';

export type Currency = 'eur' | 'usd';

export interface Model {
  id: string;
  label: string;
  /** USD per million input tokens. */
  inPerM: number;
  /** USD per million output tokens. */
  outPerM: number;
}

export interface Prices {
  /** True until the list prices and the rate are checked against official sources. */
  toVerify: boolean;
  verifyNote: string;
  /** ISO date (YYYY-MM-DD) of the prices and of the fixed rate. */
  asOf: string;
  usdToEur: number;
  currencies: Currency[];
  models: Model[];
}

export const prices = raw as Prices;

const [firstModel] = prices.models;
if (!firstModel) throw new Error('prices.json needs at least one model');
export const defaultModel: Model = firstModel;
