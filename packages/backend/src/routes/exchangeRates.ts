import { Router } from 'express';
import { getExchangeRate } from '../controllers/exchangeRates.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.route('/rates').get(getExchangeRate);

export default router;
