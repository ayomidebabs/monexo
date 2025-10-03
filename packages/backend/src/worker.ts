import { tryCatch, Worker } from 'bullmq';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import WebhookEvents from './models/WebhookEvents.js';
import Order from './models/Order.js';
import Product from './models/Product.js';

const redisConnection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const stripeWebhookWorker = new Worker(
  'stripe-webhook-queue',
  async (job) => {
    const { event, signature } = job.data as {
      event: Stripe.Event;
      signature: string;
    };
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existing = await WebhookEvents.findOne({
        eventId: event.id,
      }).session(session);
      if (existing) {
        await session.abortTransaction();
        console.log(`Duplicate webhook event ignored in queue: ${event.id}`);
        return;
      }

      const record = new WebhookEvents({
        eventId: event.id,
        type: event.type,
        payload: event.data,
        signature,
        source: 'stripe',
      });
      await record.save({ session });

      if (event.type.startsWith('payment_intent.')) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        switch (event.type) {
          case 'payment_intent.succeeded':
            const {
              userId,
              email,
              products: productsString,
              total,
            } = paymentIntent.metadata;
            const products = JSON.parse(productsString);

            const existingOrder = await Order.findOne({
              'paymentDetails.transactionId': paymentIntent.id,
            }).session(session);
            if (existingOrder) {
              await session.abortTransaction();
              console.log(
                `Duplicate order ignored for payment intent: ${paymentIntent.id}`
              );
              return;
            }

            const order = new Order({
              user: userId,
              email,
              products,
              total,
              currency: paymentIntent.currency,
              status: 'Processing',
              paymentDetails: {
                method: 'stripe',
                transactionId: paymentIntent.id,
              },
            });
            await order.save({ session });

            for (const item of products) {
              const product = await Product.findById(item.id).session(session);
              if (!product || product.stock < item.quantity) {
                throw new Error(`Stock issue for product ${item.id}`);
              }
              product.stock -= item.quantity;
              await product.save({ session });
            }
            break;

          case 'payment_intent.payment_failed':
          case 'payment_intent.processing':
          case 'payment_intent.requires_action':
            console.log(`Payment intent event: ${event.type} for ${event.id}`);
            break;

          default:
            console.log(
              `Unhandled payment intent event: ${event.type} ${event.id}`
            );
        }
      }

      await session.commitTransaction();
      console.log(`Successfully processed webhook event: ${event.id}`);
    } catch (error: any) {
      await session.abortTransaction();
      console.error(
        `Error processing webhook event ${event.id}: ${error.message}`
      );
      throw error;
    } finally {
      session.endSession();
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

const paystackWebhookWorker = new Worker(
  'paystack-webhook-queue',
  async (job) => {
    const { event, signature } = job.data as { event: any; signature: string }; // Adjust event type based on Paystack SDK or raw payload
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existing = await WebhookEvents.findOne({
        eventId: event.id,
      }).session(session);
      if (existing) {
        await session.abortTransaction();
        console.log(`Duplicate Paystack webhook event ignored: ${event.id}`);
        return;
      }

      const record = new WebhookEvents({
        eventId: event.id,
        type: event.event,
        payload: event.data,
        signature,
        source: 'paystack',
      });
      await record.save({ session });

      if (event.event.startsWith('charge.')) {
        const paymentData = event.data;

        switch (event.event) {
          case 'charge.success':
            const { customer, reference, amount, metadata, currency } =
              paymentData;
            const { userId, products: productsString } = metadata;
            const products = JSON.parse(productsString);

            const existingOrder = await Order.findOne({
              'paymentDetails.transactionId': reference,
            }).session(session);
            if (existingOrder) {
              await session.abortTransaction();
              console.log(
                `Duplicate order ignored for Paystack reference: ${reference}`
              );
              return;
            }

            const order = new Order({
              user: userId,
              email: customer.email,
              products,
              total: amount,
              currency,
              status: 'Processing',
              paymentDetails: {
                method: 'paystack',
                transactionId: reference,
              },
            });
            await order.save();

            for (const item of products) {
              const product = await Product.findById(item.id).session(session);
              if (!product || product.stock < item.quantity) {
                throw new Error(`Stock issue for product ${item.id}`);
              }
              product.stock -= item.quantity;
              await product.save({ session });
            }
            break;

          case 'charge.failed':
          case 'charge.pending':
            console.log(
              `Paystack event: ${event.event} for ${event.data.reference}`
            );
            break;

          default:
            console.log(
              `Unhandled Paystack event: ${event.event} ${event.data.reference}`
            );
        }
      }

      await session.commitTransaction();
      console.log(
        `Successfully processed Paystack webhook event: ${
          event.data.id || event.data.reference
        }`
      );
    } catch (error: any) {
      await session.abortTransaction();
      console.error(
        `Error processing Paystack webhook event ${
          event.data.id || event.data.reference
        }: ${error.message}`
      );
      throw error;
    } finally {
      session.endSession();
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

stripeWebhookWorker.on('failed', (job, error) => {
  console.error(
    `Job ${job?.id} failed after ${job?.attemptsMade} attempts: ${error.message}`
  );
});

paystackWebhookWorker.on('failed', (job, error) => {
  console.error(
    `Paystack job ${job?.id} failed after ${job?.attemptsMade} attempts: ${error.message}`
  );
});

process.on('SIGTERM', async () => {
  try {
    await Promise.all([
      stripeWebhookWorker.close(),
      paystackWebhookWorker.close(),
    ]);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

console.log('Webhook worker started');
