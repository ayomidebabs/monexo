import { Router } from 'express';
import { getUserOrders } from '../controllers/orders.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.get('/myorders', authMiddleware, getUserOrders);

export default router;
