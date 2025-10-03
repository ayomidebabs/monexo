import { getExchangeRate } from "./exchangeRates.js";

export async function getAmountForStripe(totalUSD: number, currency: string): Promise<number> {
  const rate = await getExchangeRate(currency); // Get one USD equivlent of currency
  const totalCurrency = totalUSD * rate; 

  const zeroDecimalCurrencies = new Set<string>([
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga',
    'pyg', 'rwf', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'
  ]);

  const threeDecimalCurrencies = new Set<string>([
    'bhd', 'jod', 'kwd', 'omr', 'tnd'
  ]);

  if (zeroDecimalCurrencies.has(currency)) {
    return Math.round(totalCurrency); // 1 unit = 1 major currency unit e.g., 500 yen → 500
  }

  if (threeDecimalCurrencies.has(currency)) {
    return Math.round(totalCurrency * 1000); // 3 decimal places e.g., 10.123 BHD → 10123
  }

  return Math.round(totalCurrency * 100); // 2 decimal places e.g., 10.99 USD → 1099
}

export async function getAmount(totalUSD: number, currency: string): Promise<number> {
  const rate = await getExchangeRate(currency);
  return  totalUSD * rate;
}