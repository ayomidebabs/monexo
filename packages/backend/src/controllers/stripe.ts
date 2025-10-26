import { Request, Response, NextFunction } from 'express';
import { matchedData } from 'express-validator';
import Stripe from 'stripe';
import { stripe } from '../app.js';
import { Queue } from 'bullmq';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { validatePaymentIntentCreation } from '../inputValidation/payment/stripe/paymentIntentCreation.js';
import WebhookEvents from '../models/WebhookEvents.js';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { v4 as uuid } from 'uuid';
import dotEnv from 'dotenv';
import { validateUseSavedmethod } from '../inputValidation/payment/stripe/useSavedMethod.js';
import {
  validateMethodId,
  validateMethodIdParam,
} from '../inputValidation/payment/stripe/method_Id.js';

dotEnv.config();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const webhookQueue = new Queue('stripe-webhook-queue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

export const createPaymentIntent = [
  ...validatePaymentIntentCreation,
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      products,
      email,
      savePayment,
    }: {
      products: { pId: string; quantity: number }[];
      email: string;
      savePayment: boolean;
    } = matchedData(req);
    const { appUser } = res.locals;

    try {
      let stripeCustomerId: string | undefined;

      if (appUser?.id && savePayment) {
        const user = await User.findById(appUser.id);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
            statusCode: 404,
          });
        }
        stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({ email });
          stripeCustomerId = customer.id;
          await User.updateOne({ _id: appUser.id }, { stripeCustomerId });
        }
      }

      const productIds = products.map((item) => item.pId);
      const foundProducts = await Product.find({
        _id: { $in: productIds },
      }).lean();

      if (foundProducts.length !== products.length) {
        const missingIds = productIds.filter(
          (id) => !foundProducts.some((p) => p._id.toString() === id)
        );
        return res
          .status(400)
          .send({ message: `Products not found: ${missingIds.join(', ')}` });
      }

      const validatedItems = foundProducts.map((product) => {
        const item = products.find((i) => i.pId === product._id.toString());
        if (!item || product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`);
        }
        return {
          pId: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        };
      });

      const total = validatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(total * 100),
          currency: 'usd',
          ...(stripeCustomerId &&
            savePayment && {
              customer: stripeCustomerId,
              setup_future_usage: 'off_session',
            }),
          metadata: {
            userId: appUser?.id as string,
            email,
            products: JSON.stringify(validatedItems),
            total,
          },
        },
        { idempotencyKey: uuid() }
      );

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      next(new AppError((error as Error).message, 500));
    }
  },
];

export const chargeSavedPaymentMethod = [
  ...validateUseSavedmethod,
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      products,
      email,
      paymentMethodId,
    }: {
      products: { pId: string; quantity: number }[];
      email: string;
      paymentMethodId: string;
    } = matchedData(req);
    const { appUser } = res.locals;

    try {
      if (!appUser?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated',
          statusCode: 401,
        });
      }

      const user = await User.findById(appUser.id);
      if (!user?.stripeCustomerId) {
        return res.status(404).json({
          success: false,
          error: 'No saved payment method found',
          statusCode: 404,
        });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      if (!paymentMethods.data.length) {
        return res.status(404).json({
          success: false,
          error: 'No saved payment methods available',
          statusCode: 404,
        });
      }

      const validMethod = paymentMethods.data.find(
        (method) => method.id === paymentMethodId
      );

      if (!validMethod) {
        return res.status(404).json({
          success: false,
          error: 'Invalid payment method',
          statusCode: 404,
        });
      }

      const productIds = products.map((item) => item.pId);
      const foundProducts = await Product.find({
        _id: { $in: productIds },
      }).lean();

      if (foundProducts.length !== products.length) {
        const missingIds = productIds.filter(
          (id) => !foundProducts.some((p) => p._id.toString() === id)
        );
        return res
          .status(400)
          .send({ message: `Products not found: ${missingIds.join(', ')}` });
      }

      const validatedItems = foundProducts.map((product) => {
        const item = products.find((i) => i.pId === product._id.toString());
        if (!item || product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`);
        }
        return {
          pId: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        };
      });

      const total = validatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(total * 100),
          currency: 'usd',
          customer: user.stripeCustomerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
          metadata: {
            userId: appUser.id as string,
            email,
            products: JSON.stringify(validatedItems),
            total,
          },
          return_url: `${process.env.BASE_URL}/api/stripe/callback`,
        },
        { idempotencyKey: uuid() }
      );

      return res.status(200).json({
        success: paymentIntent.status === 'succeeded',
        data: {
          paymentIntentStatus: paymentIntent.status,
          paymentIntentId: paymentIntent.id,
          ...(paymentIntent.status !== 'succeeded' && {
            paymentIntentClientSecret: paymentIntent.client_secret,
          }),
        },
      });
    } catch (error) {
      next(new AppError((error as Error).message, 500));
    }
  },
];

export const fetchSavedPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appUser } = res.locals;

  try {
    if (!appUser?.id) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
        statusCode: 401,
      });
    }

    const user = await User.findById(appUser.id);
    if (!user?.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        error: 'No Stripe customer ID found for user',
        statusCode: 404,
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    let defaultPaymentMethodId: string | null = null;
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    defaultPaymentMethodId = (customer as Stripe.Customer)
      .default_source as string;

    const formattedMethods = paymentMethods.data.map((method) => ({
      id: method.id,
      brand: method.card?.brand,
      last4: method.card?.last4,
      expMonth: method.card?.exp_month,
      expYear: method.card?.exp_year,
      created: method.created,
      isDefault: method.id === defaultPaymentMethodId,
    }));
    console.log(formattedMethods);
    return res.status(200).json(formattedMethods);
  } catch (error) {
    console.error('Fetch saved payment methods error:', error);
    next(new AppError((error as Error).message, 500));
  }
};

export const deletePaymentMethod = [
  ...validateMethodIdParam,
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentMethodId }: { paymentMethodId: string } = matchedData(req, {
      locations: ['params'],
    });
    const { appUser } = res.locals;

    try {
      if (!appUser?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated',
          statusCode: 401,
        });
      }

      const user = await User.findById(appUser.id);
      if (!user?.stripeCustomerId) {
        return res.status(404).json({
          success: false,
          error: 'No Stripe customer ID found for user',
          statusCode: 404,
        });
      }

      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentMethodId
      );
      if (paymentMethod.customer !== user.stripeCustomerId) {
        return res.status(403).json({
          success: false,
          error: 'Payment method does not belong to this user',
          statusCode: 403,
        });
      }

      await stripe.paymentMethods.detach(paymentMethodId);

      return res.status(200).json({
        message: 'Payment method deleted successfully',
      });
    } catch (error) {
      console.error('Delete payment method error:', error);
      next(new AppError((error as Error).message, 500));
    }
  },
];

export const setDefaultPaymentMethod = [
  ...validateMethodId,
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentMethodId }: { paymentMethodId: string } = matchedData(req);
    const { appUser } = res.locals;

    try {
      const user = await User.findById(appUser?.id);
      if (!user?.stripeCustomerId) {
        return res.status(404).json({
          message: 'No Stripe customer ID found for user',
        });
      }

      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentMethodId
      );
      if (paymentMethod.customer !== user.stripeCustomerId) {
        return res.status(403).json({
          message: 'Payment method does not belong to this user',
        });
      }
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return res.status(200).json({
        message: 'Default payment method updated successfully',
      });
    } catch (error) {
      console.error('Set default payment method error:', error);
      next(new AppError((error as Error).message, 500));
    }
  },
];

export const handleReturn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { payment_intent, payment_intent_client_secret } = req.query;

  if (!payment_intent || typeof payment_intent !== 'string') {
    console.error('Missing or invalid payment_intent in return URL');
    return res.redirect(
      `${
        process.env.FRONTEND_URL
      }/error?reason=missing_payment_intent&timestamp=${new Date().toISOString()}`
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent, {
      idempotencyKey: uuid(),
    });

    const { userId } = paymentIntent.metadata;

    switch (paymentIntent.status) {
      case 'succeeded':
        return res.redirect(
          `${process.env.FRONTEND_URL}/success?payment_intent=${paymentIntent.id}&user_id=${userId}`
        );

      case 'processing':
        return res.redirect(
          `${process.env.FRONTEND_URL}/processing?payment_intent=${paymentIntent.id}&user_id=${userId}`
        );

      case 'requires_payment_method':
        const errorMessage =
          paymentIntent.last_payment_error?.message || 'Payment method failed';
        return res.redirect(
          `${
            process.env.FRONTEND_URL
          }/error?reason=requires_payment_method&error=${encodeURIComponent(
            errorMessage
          )}&user_id=${userId}`
        );

      case 'requires_action':
        return res.redirect(
          `${
            process.env.FRONTEND_URL
          }/error?reason=requires_action&redirect_url=${encodeURIComponent(
            paymentIntent.next_action?.redirect_to_url?.url || ''
          )}&user_id=${userId}`
        );

      default:
        return res.redirect(
          `${
            process.env.FRONTEND_URL
          }/error?reason=unexpected_status&status=${encodeURIComponent(
            paymentIntent.status
          )}&user_id=${userId}`
        );
    }
  } catch (error) {
    return res.redirect(
      `${
        process.env.FRONTEND_URL
      }/error?reason=server_error&error=${encodeURIComponent(
        (error as Error).message
      )}`
    );
  }
};

export const stripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret!);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: 'Webhook signature verification failed',
      statusCode: 400,
    });
  }

  res.status(200).json({
    success: true,
    data: 'Event received',
    statusCode: 200,
  });

  try {
    const existingEvent = await WebhookEvents.findOne({ eventId: event.id });
    if (existingEvent) {
      console.log(`Duplicate webhook event ignored: ${event.id}`);
      return;
    }

    await webhookQueue.add(
      `stripe-event-${event.id}`,
      { event, signature },
      {
        jobId: event.id,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );
    console.log(`Event ${event.id} queued for processing`);
  } catch (error: any) {
    console.error(`Failed to queue event ${event.id}: ${error.message}`);
  }
};
