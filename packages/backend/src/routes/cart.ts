import { Router } from 'express';
import { getCart, saveCart } from '../controllers/cart.js';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.route('/').get(authMiddleware, getCart).post(authMiddleware, saveCart);

export default router;
