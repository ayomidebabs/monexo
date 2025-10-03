import { Router } from 'express';
import { subscribeNewsletter } from '../controllers/newsletter.js';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/newsletter/subscribe', subscribeNewsletter);

export default router;
