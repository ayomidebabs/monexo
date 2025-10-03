import { Router } from 'express';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import categoryRoutes from './categories.js';
import reviewRoutes from './reviews.js';
import adminRoutes from './admin.js';
import themeRoutes from './theme.js';
import recentlyViewedRoutes from './recentlyViewed.js';
import newsletterRoutes from './newsletter.js';
import cartRoutes from './cart.js';
import wishlistRoutes from './wishlist.js';
import authRoutes from './auth.js';
import paymentRoutes from './payment.js';
import exchangeRatesRoute from './exchangeRates.js';
// import catchAllRoutes from './catchall.js';

const router = Router();

router.use('/', authRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/products', productRoutes);
router.use(
  '/api',
  reviewRoutes,
  wishlistRoutes,
  newsletterRoutes,
  paymentRoutes,
  exchangeRatesRoute
);
router.use('/api/orders', orderRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/user', themeRoutes, recentlyViewedRoutes);
router.use('/api/cart', cartRoutes);
// router.use('*', catchAllRoutes);

export default router;
