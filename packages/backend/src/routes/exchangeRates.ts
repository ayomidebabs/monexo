import { Router } from 'express';
import { getExchangeRates } from '../controllers/exchangeRates.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.route('/rates').get(getExchangeRates);

export default router;
