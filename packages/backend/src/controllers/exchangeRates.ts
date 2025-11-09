import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import axios, { AxiosError } from 'axios';
import { redis } from '../config/db.js';
import dns from 'dns/promises';

type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'ZAR' | 'GHS';
type ExchangeRateResponse = {
  success: boolean;
  base: string;
  rates: Partial<Record<Currency, number>>;
};

const CACHE_KEY = 'fx_rates:usd';
const CACHE_EXPIRY = 3600;

const SUPPORTED_CURRENCIES: Currency[] = [
  'USD',
  'EUR',
  'GBP',
  'NGN',
  'ZAR',
  'GHS',
];

const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.9,
  GBP: 0.76,
  NGN: 1600,
  ZAR: 17.5,
  GHS: 15.5,
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function resolveApiHost(): Promise<string> {
  try {
    const addresses = await dns.resolve('api.exchangerate.host');
    return addresses[0] || 'api.exchangerate.host';
  } catch (err) {
    console.error('DNS resolution failed:', err);
    dns.setDefaultResultOrder('ipv4first');
    return 'api.exchangerate.host';
  }
}

export async function getExchangeRates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cachedRate = await redis.get(CACHE_KEY).catch((err) => {
      console.error('Redis get error:', err);
      return null;
    });

    if (cachedRate) {
      try {
        return res.status(200).json(JSON.parse(cachedRate));
      } catch (err) {
        console.error('Redis cache parse error:', err);
      }
    }

    let lastError: AxiosError | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get<ExchangeRateResponse>(
          'https://api.exchangerate.host/latest',
          {
            params: { base: 'USD' },
            timeout: 5000,
          }
        );

        const { success, rates } = response.data;

        if (!success || !rates) {
          throw new AppError('Invalid exchange rate API response', 502);
        }

        const filteredRates: Record<Currency, number> =
          SUPPORTED_CURRENCIES.reduce((acc, currency) => {
            if (rates[currency]) {
              acc[currency] = rates[currency];
            }
            return acc;
          }, {} as Record<Currency, number>);

        const missingCurrencies = SUPPORTED_CURRENCIES.filter(
          (currency) => !filteredRates[currency]
        );
        if (missingCurrencies.length > 0) {
          console.warn('Missing exchange rates for:', missingCurrencies);
          throw new AppError(
            `Exchange rates unavailable for: ${missingCurrencies.join(', ')}`,
            502
          );
        }

        await redis
          .set(CACHE_KEY, JSON.stringify(filteredRates), 'EX', CACHE_EXPIRY)
          .catch((err) => {
            console.error('Redis set error:', err);
          });

        return res.status(200).json(filteredRates);
      } catch (err) {
        lastError = err as AxiosError;
        if (err instanceof AxiosError && err.code === 'EAI_AGAIN') {
          console.warn(`Attempt ${attempt} failed with EAI_AGAIN, retrying...`);
          if (attempt < MAX_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            continue;
          }
        }
        break;
      }
    }

    if (lastError) {
      console.error('All retry attempts failed:', lastError);
      await redis
        .set(CACHE_KEY, JSON.stringify(FALLBACK_RATES), 'EX', CACHE_EXPIRY)
        .catch((err) => {
          console.error('Redis set fallback error:', err);
        });
      console.warn('Using fallback exchange rates');
      return res.status(200).json(FALLBACK_RATES); // Return fallback rates
    }
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    const err = error as Error;
    next(
      new AppError(
        `Failed to fetch exchange rates: ${err.message || 'Unknown error'}`,
        502
      )
    );
  }
}
