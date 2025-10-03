import { Schema, Document, model, Model } from 'mongoose';
import { WebhookEvent } from '../types/webhookEvents.js';

interface IWebhookEvent extends WebhookEvent, Document {}
export interface IWebhookEventModel extends Model<IWebhookEvent> {}

const WebhookEventSchema = new Schema<IWebhookEvent>({
  eventId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  receivedAt: { type: Date, default: Date.now },
  signature: { type: String, required: true },
  processed: { type: Boolean, default: false },
  processingError: { type: String },
  source: { type: String, enum: ['stripe', 'paystack'] },
});

export default model<IWebhookEvent, IWebhookEventModel>(
  'WebhookEvent',
  WebhookEventSchema
);
