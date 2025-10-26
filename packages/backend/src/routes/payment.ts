import Express, { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import {
  fetchSavedPaymentMethods,
  initializeTransaction,
  paystackWebhook,
  verifyTransaction,
  addPaymentMethod,
  chargeSavedPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
} from '../controllers/paystack.js';
import {
  createPaymentIntent,
  fetchSavedPaymentMethods as fetchStripeSavedPaymentMethods,
  chargeSavedPaymentMethod as chargeStripeSavedPaymentMethod,
  stripeWebhook,
  handleReturn,
  setDefaultPaymentMethod as setStripeDefaultPaymentMethod,
  deletePaymentMethod as deleteStripePaymentMethod,
} from '../controllers/stripe.js';

const router = Router();

router.post('/stripe/payment-intent', authMiddleware, createPaymentIntent);
router.post(
  '/stripe/payment-methods/set-default',
  authMiddleware,
  setStripeDefaultPaymentMethod
);
router.post('/stripe/pay', authMiddleware, chargeStripeSavedPaymentMethod);
router.get(
  '/stripe/payment-methods',
  authMiddleware,
  fetchStripeSavedPaymentMethods
);
router.get('/stripe/callback', handleReturn);
router.get(
  '/stripe/webhook',
  Express.raw({ type: 'application/json' }),
  stripeWebhook
);
router.delete(
  '/stripe/payment-methods/:paymentMethodId',
  authMiddleware,
  deleteStripePaymentMethod
);

router.post('/paystack/transaction/initialize', initializeTransaction);
router.post(
  '/paystack/payment-methods/set-default',
  authMiddleware,
  setDefaultPaymentMethod
);
router.post('/paystack/pay', authMiddleware, chargeSavedPaymentMethod);
router.post('/paystack/save-payment-method', authMiddleware, addPaymentMethod);
router.get('/paystack/verify-payment/:reference', verifyTransaction);
router.get(
  '/paystack/payment-methods',
  authMiddleware,
  fetchSavedPaymentMethods
);
router.get(
  '/paystack/webhook',
  Express.raw({ type: 'application/json' }),
  paystackWebhook
);
router.delete(
  '/paystack/payment-methods/:paymentMethodId',
  authMiddleware,
  deletePaymentMethod
);

export default router;
