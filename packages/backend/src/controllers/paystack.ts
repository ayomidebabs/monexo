import { Request, Response, NextFunction } from 'express';
import { matchedData } from 'express-validator';
import { AppError } from '../middleware/GlobalErrorHandler.js';
import { validateInitializeTransaction } from '../inputValidation/payment/paystack/initializeTransaction.js';
import { validateAddPaymentMethod } from '../inputValidation/payment/paystack/addPaymentMethod.js';
import { validateUseSavedmethod } from '../inputValidation/payment/paystack/useSavedMethod.js';
import { validateReference } from '../inputValidation/payment/paystack/referenceValidation.js';
import {
  validateMethodId,
  validateMethodIdParam,
} from '../inputValidation/payment/paystack/method_Id.js';
import { Queue } from 'bullmq';
import Product from '../models/Product.js';
import axios, { AxiosError } from 'axios';
import User from '../models/User.js';
import crypto from 'crypto';
import WebhookEvents from '../models/WebhookEvents.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

const WebhookQueue = new Queue('paystack-webhook-queue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

export const initializeTransaction = [
  ...validateInitializeTransaction,
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      products,
      email,
      currency,
    }: {
      products: { pId: string; quantity: number }[];
      email: string;
      currency: string;
    } = matchedData(req);
    const { appUser } = res.locals;

    try {
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

      const multipliers: { [key: string]: number } = {
        NGN: 100,
        GHS: 100,
        ZAR: 100,
      };

      const formatTotal = (total: number, currency: string) => {
        const multiplier = multipliers[currency.toUpperCase()];
        if (!multiplier)
          throw new AppError(`Unsupported currency: ${currency}`);
        return total * multiplier;
      };

      const transaction = (
        await axios.post(
          'https://api.paystack.co/transaction/initialize',
          {
            email,
            amount: Math.round(formatTotal(total, currency)),
            currency,
            metadata: {
              userId: appUser?.id as string,
              products: JSON.stringify(validatedItems),
              total,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
          }
        )
      ).data.data;

      res.send({ reference: transaction.reference, total });
    } catch (error) {
      if (error instanceof AxiosError) {
        return next(
          new AppError(
            `Failed to initialize transaction: ${
              error.response?.data?.message || error.message
            }`
          )
        );
      }
      next(
        error instanceof AppError
          ? error
          : new AppError((error as Error).message)
      );
    }
  },
];

export const verifyTransaction = [
  ...validateReference,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference } = req.params;
      const transaction = (
        await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
          }
        )
      ).data.data;

      res.send({ transaction });
    } catch (error) {
      next(
        new AppError(
          `Failed to verify transaction: ${(error as Error).message}`
        )
      );
    }
  },
];

export const addPaymentMethod = [
  ...validateAddPaymentMethod,
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      authorizationCode,
      customerCode,
      email,
      cardType,
      last4,
      expMonth,
      expYear,
    } = matchedData(req);
    const { appUser } = res.locals;

    if (!appUser?.id || !authorizationCode) {
      return res.status(400).send({ message: 'Missing required fields' });
    }
    const userId = appUser.id;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send({ message: 'User not found' });

      const existing = user.paystackPaymentMethods.find(
        (method) => method.last4 === last4 && method.userId === userId
      );
      if (existing) {
        return res
          .status(200)
          .send({ message: 'Payment method already saved' });
      }

      const isFirstMethod = user.paystackPaymentMethods.length === 0;
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            paystackPaymentMethods: {
              userId,
              authorizationCode,
              customerCode,
              email,
              cardType,
              last4,
              expMonth,
              expYear,
              isDefault: isFirstMethod, // Set as default if first method
            },
          },
        }
      );

      res.status(201).json({ message: 'Payment method saved successfully' });
    } catch (error) {
      next(
        new AppError(
          `Failed to add payment method: ${(error as Error).message}`
        )
      );
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
    const user = await User.findById(appUser?.id)
      .select('paystackPaymentMethods')
      .lean();
    if (!user || !user.paystackPaymentMethods) {
      return res.status(404).send({ message: 'No payment methods found' });
    }
    res.send(user.paystackPaymentMethods);
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch payment methods: ${(error as Error).message}`
      )
    );
  }
};

export const deletePaymentMethod = [
  ...validateMethodIdParam,
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentMethodId } = matchedData(req, { locations: ['params'] });
    const { appUser } = res.locals;

    try {
      const user = await User.findById(appUser?.id);
      if (!user) return res.status(404).send({ message: 'User not found' });

      const methodExists = user.paystackPaymentMethods.some(
        (method) => method._id.toString() === paymentMethodId
      );
      if (!methodExists) {
        return res.status(404).send({ message: 'Payment method not found' });
      }

      await User.updateOne(
        { _id: appUser?.id },
        { $pull: { paystackPaymentMethods: { _id: paymentMethodId } } }
      );

      // If deleted method was default, set another as default (if available)
      const updatedUser = await User.findById(appUser?.id).select(
        'paystackPaymentMethods'
      );
      if (updatedUser && updatedUser.paystackPaymentMethods.length > 0) {
        const wasDefault = updatedUser.paystackPaymentMethods.every(
          (method) => !method.isDefault
        );
        if (wasDefault) {
          await User.updateOne(
            {
              _id: appUser?.id,
              'paystackPaymentMethods._id':
                updatedUser.paystackPaymentMethods[0]._id,
            },
            { $set: { 'paystackPaymentMethods.$.isDefault': true } }
          );
        }
      }

      res.send({ message: 'Payment method deleted successfully' });
    } catch (error) {
      next(
        new AppError(
          `Failed to delete payment method: ${(error as Error).message}`
        )
      );
    }
  },
];

export const setDefaultPaymentMethod = [
  ...validateMethodId,
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentMethodId } = matchedData(req);
    const { appUser } = res.locals;

    try {
      const user = await User.findById(appUser?.id);
      if (!user) return res.status(404).send({ message: 'User not found' });

      const methodExists = user.paystackPaymentMethods.some(
        (method) => method._id.toString() === paymentMethodId
      );
      if (!methodExists) {
        return res.status(404).send({ message: 'Payment method not found' });
      }

      // Unset all isDefault flags
      await User.updateOne(
        { _id: appUser?.id },
        { $set: { 'paystackPaymentMethods.$[].isDefault': false } }
      );

      // Set the specified method as default
      await User.updateOne(
        { _id: appUser?.id, 'paystackPaymentMethods._id': paymentMethodId },
        { $set: { 'paystackPaymentMethods.$.isDefault': true } }
      );

      res.send({ message: 'Default payment method set successfully' });
    } catch (error) {
      next(
        new AppError(
          `Failed to set default payment method: ${(error as Error).message}`
        )
      );
    }
  },
];

export const chargeSavedPaymentMethod = [
  ...validateUseSavedmethod,
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      products,
      currency,
      paymentMethodId,
    }: {
      products: { pId: string; quantity: number }[];
      currency: string;
      paymentMethodId: string;
    } = matchedData(req);
    const { appUser } = res.locals;

    try {
      const user = await User.findById(appUser?.id)
        .select('paystackPaymentMethods')
        .lean();
      if (!user || !user.paystackPaymentMethods) {
        return res.status(404).send({ message: 'No payment methods found' });
      }

      const method = user.paystackPaymentMethods.find(
        (method) => method._id.toString() === paymentMethodId
      );
      if (!method) {
        return res.status(404).send({ message: 'Payment method not found' });
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

      const multipliers: { [key: string]: number } = {
        NGN: 100,
        GHS: 100,
        ZAR: 100,
      };

      const formatTotal = (total: number, currency: string) => {
        const multiplier = multipliers[currency.toUpperCase()];
        if (!multiplier)
          throw new AppError(`Unsupported currency: ${currency}`);
        return total * multiplier;
      };

      const transaction = (
        await axios.post(
          'https://api.paystack.co/transaction/charge_authorization',
          {
            authorization_code: method.authorizationCode,
            email: method.email,
            amount: Math.round(formatTotal(total, currency)),
            currency,
            metadata: {
              userId: appUser?.id,
              products: JSON.stringify(validatedItems),
            },
          },
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
          }
        )
      ).data.data;

      if (transaction.status === 'success') {
        return res.send({ success: true, transaction });
      } else if (transaction.paused) {
        return res.send({
          paused: true,
          authorizationUrl: transaction.authorization_url,
          reference: transaction.reference,
          total,
        });
      } else {
        return res.send({ success: false, message: transaction.message });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return error.response?.status === 401
          ? res.send({
              success: false,
              message: 'Authorization invalid. Please add a new method.',
            })
          : next(
              new AppError(
                `Failed to charge payment method: ${
                  error.response?.data?.message || error.message
                }`
              )
            );
      }
      next(
        error instanceof AppError
          ? error
          : new AppError((error as Error).message)
      );
    }
  },
];

export const paystackWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-paystack-signature'] as string;
  const event = req.body;

  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      throw new AppError('Invalid webhook signature', 400);
    }

    const existingEvent = await WebhookEvents.findOne({
      eventId: event.data.id,
    });
    if (existingEvent) {
      console.log(`Duplicate Paystack webhook event ignored: ${event.data.id}`);
      return res.status(200).json({
        success: true,
        data: 'Event already processed',
        statusCode: 200,
      });
    }

    await WebhookQueue.add(
      `paystack-event-${event.data.id}`,
      { event, signature },
      {
        jobId: event.data.id,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      }
    );

    res.status(200).json({
      success: true,
      data: 'Event received and queued',
      statusCode: 200,
    });
  } catch (error) {
    console.error(`Paystack webhook error: ${(error as Error).message}`);
    return res.status(400).json({
      success: false,
      error: (error as Error).message || 'Webhook processing failed',
      statusCode: 400,
    });
  }
};
