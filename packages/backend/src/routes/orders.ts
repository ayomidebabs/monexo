import { Router } from 'express';
import { getUserOrders } from '../controllers/orders.js';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/myorders', authMiddleware, getUserOrders);

export default router;
